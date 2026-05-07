"""
Bill data extractor using multiple AI Vision APIs.
Tries: Gemini -> Groq -> OpenRouter (free models)
Extracts structured data from MSEDCL electricity bills.
"""

import os
import json
import base64
import requests as http_requests

# ─── API Keys (loaded from .env before import) ───
GEMINI_API_KEY = os.getenv('GEMINI_API_KEY')
GROK_API_KEY = os.getenv('GROK_API_KEY')  # Can be Groq (gsk_) or Grok (xai-)
OPENROUTER_API_KEY = os.getenv('OPENROUTER_API_KEY')

# ─── Shared Extraction Prompt ───
EXTRACTION_PROMPT = """You are an expert at reading Indian MSEDCL electricity bills.
Analyze this bill image very carefully and extract ALL data in this exact JSON format:

{
    "consumer_name": "Full name of the consumer",
    "consumer_no": "Consumer number (all digits)",
    "fixed_charges": <fixed charges as number>,
    "sanctioned_load_kw": <sanctioned load in KW as number>,
    "connection_type": "e.g. 90/LT I Res 1-Phase",
    "contract_demand_kva": <KVA or null>,
    "billing_unit": "e.g. E2",
    "monthly_data": [
        {"month": "February 2025", "units": <integer>, "bill_amount": <number or null>, "unit_cost": <number or null>}
    ]
}

CRITICAL RULES:
- monthly_data sorted chronologically (oldest first), include ALL months (12-13 typical)
- Units must be INTEGER values
- Read BOTH left and right consumption tables on the bill
- "sanctioned load" or "मंजूर भार" = Sanctioned Load in KW
- "युनिट" = Units consumed
- consumer_no = full consumer/account number
- Return ONLY valid JSON, no markdown, no backticks"""


def _clean_json_text(text):
    """Strip markdown fences and extract JSON."""
    text = text.strip()
    if text.startswith('```'):
        lines = text.split('\n')
        lines = [l for l in lines if not l.strip().startswith('```')]
        text = '\n'.join(lines)
    start = text.find('{')
    end = text.rfind('}')
    if start != -1 and end != -1:
        return text[start:end+1]
    return text


def _clean_extracted_data(data):
    """Validate and clean extracted data."""
    if not data.get('monthly_data'):
        return None

    cleaned = []
    for e in data['monthly_data']:
        cleaned.append({
            'month': e.get('month', 'Unknown'),
            'units': int(e.get('units', 0)) if e.get('units') is not None else 0,
            'bill_amount': float(e['bill_amount']) if e.get('bill_amount') else None,
            'unit_cost': float(e['unit_cost']) if e.get('unit_cost') else None,
        })

    data['monthly_data'] = cleaned
    data.setdefault('consumer_name', 'N/A')
    data.setdefault('consumer_no', 'N/A')
    data.setdefault('fixed_charges', 0)
    data.setdefault('sanctioned_load_kw', 1.0)
    data.setdefault('connection_type', 'Unknown')
    data.setdefault('contract_demand_kva', None)
    data.setdefault('billing_unit', 'E2')
    return data


# ═══════════════════════════════════════════════════════
#  1. GEMINI (via REST API — more reliable than SDK)
# ═══════════════════════════════════════════════════════

def _extract_with_gemini(file_bytes, mime_type):
    """Gemini via direct REST API call (bypasses SDK issues)."""
    b64_data = base64.b64encode(file_bytes).decode('utf-8')
    models = ['gemini-2.0-flash', 'gemini-1.5-flash', 'gemini-1.5-flash-8b']
    last_error = None

    for model in models:
        try:
            print(f"[Gemini REST] Trying {model}...")
            # Try v1 first, fallback to v1beta
            api_versions = ['v1', 'v1beta']
            success = False
            
            for version in api_versions:
                url = f"https://generativelanguage.googleapis.com/{version}/models/{model}:generateContent?key={GEMINI_API_KEY}"
                payload = {
                    "contents": [{
                        "parts": [
                            {"text": EXTRACTION_PROMPT},
                            {"inline_data": {"mime_type": mime_type, "data": b64_data}}
                        ]
                    }],
                    "generationConfig": {"temperature": 0.1, "maxOutputTokens": 4096}
                }

                resp = http_requests.post(url, json=payload, timeout=60)
                
                if resp.status_code == 200:
                    result = resp.json()
                    text = result['candidates'][0]['content']['parts'][0]['text']
                    text = _clean_json_text(text)
                    data = json.loads(text)
                    cleaned = _clean_extracted_data(data)
                    if cleaned:
                        print(f"[Gemini REST] {model} ({version}) SUCCESS")
                        return cleaned
                    continue
                elif resp.status_code == 429:
                    last_error = f"{model}: Rate limited"
                    break # Don't try other versions if rate limited
                else:
                    last_error = f"{model} ({version}): HTTP {resp.status_code}"
                    print(f"[Gemini REST] {last_error}")

            result = resp.json()
            text = result['candidates'][0]['content']['parts'][0]['text']
            text = _clean_json_text(text)
            data = json.loads(text)
            cleaned = _clean_extracted_data(data)
            if cleaned:
                print(f"[Gemini REST] {model} SUCCESS")
                return cleaned
            last_error = f"{model}: No monthly data"

        except Exception as e:
            last_error = f"{model}: {str(e)[:200]}"
            print(f"[Gemini REST] {last_error}")

    return {"error": f"Gemini: {last_error}"}


# ═══════════════════════════════════════════════════════
#  2. GROQ (using current available vision models)
# ═══════════════════════════════════════════════════════

def _extract_with_groq(file_bytes, mime_type):
    """Groq API — try available vision/multimodal models."""
    from openai import OpenAI

    client = OpenAI(api_key=GROK_API_KEY, base_url="https://api.groq.com/openai/v1")
    b64_image = base64.b64encode(file_bytes).decode('utf-8')
    data_uri = f"data:{mime_type};base64,{b64_image}"

    # Current Groq models that may support vision
    # Current Groq models that support vision
    models = ['llama-3.2-11b-vision-preview', 'llama-3.2-90b-vision-preview']
    last_error = None

    for model_name in models:
        try:
            print(f"[Groq] Trying {model_name}...")

            # Try with vision format first
            try:
                response = client.chat.completions.create(
                    model=model_name,
                    messages=[{
                        "role": "user",
                        "content": [
                            {"type": "text", "text": EXTRACTION_PROMPT},
                            {"type": "image_url", "image_url": {"url": data_uri}}
                        ]
                    }],
                    temperature=0.1,
                    max_tokens=4096
                )
            except Exception:
                # If vision format fails, skip this model
                raise

            result_text = response.choices[0].message.content
            if not result_text:
                last_error = f"{model_name}: Empty response"
                continue

            text = _clean_json_text(result_text)
            data = json.loads(text)
            cleaned = _clean_extracted_data(data)
            if cleaned:
                print(f"[Groq] {model_name} SUCCESS")
                return cleaned
            last_error = f"{model_name}: No monthly data"

        except Exception as e:
            last_error = f"{model_name}: {str(e)[:200]}"
            print(f"[Groq] {last_error}")

    return {"error": f"Groq: {last_error}"}


# ═══════════════════════════════════════════════════════
#  3. OPENROUTER (free vision models — no key needed!)
# ═══════════════════════════════════════════════════════

def _extract_with_openrouter(file_bytes, mime_type):
    """
    OpenRouter free models — uses models tagged :free.
    Works without API key for free models, or with key for higher limits.
    """
    b64_image = base64.b64encode(file_bytes).decode('utf-8')
    data_uri = f"data:{mime_type};base64,{b64_image}"

    headers = {
        "Content-Type": "application/json",
        "HTTP-Referer": "https://energybae.in",
        "X-Title": "EnergyBae Solar Bill Analyzer"
    }

    # Add API key if available for higher rate limits
    if OPENROUTER_API_KEY:
        headers["Authorization"] = f"Bearer {OPENROUTER_API_KEY}"

    # Free vision-capable models on OpenRouter
    # Free vision-capable models on OpenRouter
    models = [
        "google/gemini-2.0-flash-001:free",
        "google/gemini-2.0-flash-lite-preview-02-05:free",
        "qwen/qwen-2.5-vl-72b-instruct:free",
        "qwen/qwen-2-vl-7b-instruct:free",
        "deepseek/deepseek-chat:free", # Some non-vision models might still try to process text
        "openrouter/auto"
    ]
    last_error = None

    for model_name in models:
        try:
            print(f"[OpenRouter] Trying {model_name}...")

            payload = {
                "model": model_name,
                "messages": [{
                    "role": "user",
                    "content": [
                        {"type": "text", "text": EXTRACTION_PROMPT},
                        {"type": "image_url", "image_url": {"url": data_uri}}
                    ]
                }],
                "temperature": 0.1,
                "max_tokens": 4096
            }

            resp = http_requests.post(
                "https://openrouter.ai/api/v1/chat/completions",
                headers=headers,
                json=payload,
                timeout=90
            )

            if resp.status_code == 429:
                last_error = f"{model_name}: Rate limited"
                print(f"[OpenRouter] {last_error}")
                continue

            if resp.status_code != 200:
                error_body = resp.text[:300]
                last_error = f"{model_name}: HTTP {resp.status_code} - {error_body}"
                print(f"[OpenRouter] {last_error}")
                continue

            result = resp.json()

            if 'error' in result:
                last_error = f"{model_name}: {result['error'].get('message', 'Unknown error')[:200]}"
                print(f"[OpenRouter] {last_error}")
                continue

            result_text = result['choices'][0]['message']['content']
            if not result_text:
                last_error = f"{model_name}: Empty response"
                continue

            text = _clean_json_text(result_text)
            data = json.loads(text)
            cleaned = _clean_extracted_data(data)
            if cleaned:
                print(f"[OpenRouter] {model_name} SUCCESS")
                return cleaned
            last_error = f"{model_name}: No monthly data"

        except json.JSONDecodeError as e:
            last_error = f"{model_name}: JSON parse error"
            print(f"[OpenRouter] {last_error}")
        except Exception as e:
            last_error = f"{model_name}: {str(e)[:200]}"
            print(f"[OpenRouter] {last_error}")

    return {"error": f"OpenRouter: {last_error}"}


# ═══════════════════════════════════════════════════════
#  MAIN — Try all providers in order
# ═══════════════════════════════════════════════════════

def extract_bill_data(file_bytes: bytes, mime_type: str) -> dict:
    """
    Extract bill data trying all available AI providers.
    Order: Gemini -> Groq -> OpenRouter (free, always available)
    """
    errors = []

    # ─── 1. Gemini ───
    if GEMINI_API_KEY and GEMINI_API_KEY != 'your_gemini_api_key_here':
        try:
            result = _extract_with_gemini(file_bytes, mime_type)
            if "error" not in result:
                return result
            errors.append(result['error'])
            print("[Main] Gemini failed, trying next...")
        except Exception as e:
            errors.append(f"Gemini crash: {str(e)[:100]}")

    # ─── 2. Groq ───
    if GROK_API_KEY and GROK_API_KEY != 'your_grok_api_key_here' and GROK_API_KEY.startswith('gsk_'):
        try:
            result = _extract_with_groq(file_bytes, mime_type)
            if "error" not in result:
                return result
            errors.append(result['error'])
            print("[Main] Groq failed, trying next...")
        except Exception as e:
            errors.append(f"Groq crash: {str(e)[:100]}")

    # ─── 3. OpenRouter (FREE — always try as last resort) ───
    try:
        print("[Main] Trying OpenRouter free models...")
        result = _extract_with_openrouter(file_bytes, mime_type)
        if "error" not in result:
            return result
        errors.append(result['error'])
    except Exception as e:
        errors.append(f"OpenRouter crash: {str(e)[:100]}")

    return {"error": f"All providers failed: {' | '.join(errors)}"}
