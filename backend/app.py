"""
EnergyBae Solar Bill Analyzer - Flask Backend
Serves the React frontend build + API for bill extraction and Excel generation.
Deploy on Railway, Render, or any platform.
"""

import os
from dotenv import load_dotenv

# Load .env BEFORE importing extractor (it reads API keys at module level)
load_dotenv()

from flask import Flask, request, jsonify, send_file, send_from_directory
from flask_cors import CORS
from werkzeug.utils import secure_filename

from extractor import extract_bill_data
from excel_filler import fill_excel_template

# Determine frontend directory: prefer React build (dist), fallback to static
FRONTEND_DIR = os.path.join(os.path.dirname(__file__), 'dist')
if not os.path.exists(FRONTEND_DIR):
    FRONTEND_DIR = os.path.join(os.path.dirname(__file__), 'static')

app = Flask(__name__, static_folder=FRONTEND_DIR, static_url_path='')
CORS(app)

ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'pdf', 'webp', 'bmp'}
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # 16MB


def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS


# ─── API Endpoints (MUST be registered before catch-all) ──

@app.route('/api/health', methods=['GET'])
def health():
    return jsonify({"status": "healthy", "service": "EnergyBae Solar Bill Analyzer"})


@app.route('/api/extract', methods=['POST'])
def extract():
    """Upload bill image → Extract data via Gemini AI → Return JSON"""
    if 'file' not in request.files:
        return jsonify({"error": "No file uploaded"}), 400

    file = request.files['file']
    if file.filename == '':
        return jsonify({"error": "No file selected"}), 400

    if not allowed_file(file.filename):
        return jsonify({"error": f"Allowed types: {', '.join(ALLOWED_EXTENSIONS)}"}), 400

    try:
        file_bytes = file.read()
        filename = secure_filename(file.filename)
        file_ext = filename.rsplit('.', 1)[1].lower()

        mime_map = {
            'png': 'image/png', 'jpg': 'image/jpeg', 'jpeg': 'image/jpeg',
            'webp': 'image/webp', 'bmp': 'image/bmp', 'pdf': 'application/pdf'
        }
        mime_type = mime_map.get(file_ext, 'image/jpeg')

        extracted_data = extract_bill_data(file_bytes, mime_type)

        if "error" in extracted_data:
            return jsonify({"error": extracted_data["error"]}), 500

        return jsonify({"success": True, "data": extracted_data})

    except Exception as e:
        return jsonify({"error": f"Processing failed: {str(e)}"}), 500


@app.route('/api/generate-excel', methods=['POST'])
def generate_excel():
    """Receive extracted JSON → Fill Excel template → Return .xlsx file"""
    try:
        data = request.get_json()
        if not data:
            return jsonify({"error": "No data provided"}), 400

        excel_buffer = fill_excel_template(data)
        consumer_name = data.get('consumer_name', 'Customer').replace(' ', '_')

        return send_file(
            excel_buffer,
            mimetype='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            as_attachment=True,
            download_name=f'{consumer_name}_Solar_Analysis.xlsx'
        )

    except Exception as e:
        return jsonify({"error": f"Excel generation failed: {str(e)}"}), 500


# ─── Serve Frontend (catch-all AFTER API routes) ──────────

@app.route('/')
def serve_index():
    """Serve the main HTML page"""
    return send_from_directory(FRONTEND_DIR, 'index.html')


@app.route('/<path:path>')
def serve_frontend(path):
    """Serve static files or fallback to index.html for SPA routing"""
    file_path = os.path.join(FRONTEND_DIR, path)
    if os.path.isfile(file_path):
        return send_from_directory(FRONTEND_DIR, path)
    return send_from_directory(FRONTEND_DIR, 'index.html')


if __name__ == '__main__':
    port = int(os.getenv('PORT', 5000))
    debug = os.getenv('FLASK_ENV', 'production') == 'development'
    app.run(host='0.0.0.0', port=port, debug=debug)
