import { motion } from 'framer-motion';
import { Upload, Brain, BarChart3, FileSpreadsheet, ArrowRight } from 'lucide-react';
import './HowItWorks.css';

const steps = [
  {
    icon: Upload,
    number: '01',
    title: 'Upload Your Bill',
    description: 'Simply upload a photo or scan of your MSEDCL electricity bill. We support PNG, JPG, PDF, and WebP formats.',
    color: '#6abf2a',
  },
  {
    icon: Brain,
    number: '02',
    title: 'AI Extracts Data',
    description: 'Our multi-model AI engine (Gemini, Groq, OpenRouter) reads your bill and extracts 12+ months of consumption data instantly.',
    color: '#2a9d8f',
  },
  {
    icon: BarChart3,
    number: '03',
    title: 'Analyze & Calculate',
    description: 'We compute your average consumption, required solar capacity in KW, number of panels, and estimated savings.',
    color: '#3b82f6',
  },
  {
    icon: FileSpreadsheet,
    number: '04',
    title: 'Download Report',
    description: 'Get a professional Excel report with full solar load analysis — ready to share with installers or clients.',
    color: '#8b5cf6',
  },
];

const containerVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.15 },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } },
};

export default function HowItWorks() {
  return (
    <section className="how-it-works" id="how-it-works">
      <div className="how-it-works__container">
        {/* Section header */}
        <motion.div
          className="section-header"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <span className="section-header__tag">Process</span>
          <h2 className="section-header__title">
            How It <span className="text-gradient">Works</span>
          </h2>
          <p className="section-header__desc">
            From bill upload to solar analysis in under 30 seconds — powered by cutting-edge AI.
          </p>
        </motion.div>

        {/* Steps grid */}
        <motion.div
          className="how-it-works__grid"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-50px' }}
        >
          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <motion.div
                key={step.number}
                className="step-card"
                variants={cardVariants}
              >
                {/* Connector arrow (not on last card) */}
                {index < steps.length - 1 && (
                  <div className="step-card__arrow">
                    <ArrowRight size={18} />
                  </div>
                )}

                {/* Number tag */}
                <div
                  className="step-card__number"
                  style={{ color: step.color }}
                >
                  {step.number}
                </div>

                {/* Icon */}
                <div
                  className="step-card__icon"
                  style={{
                    background: `${step.color}12`,
                    border: `1px solid ${step.color}30`,
                  }}
                >
                  <Icon size={28} style={{ color: step.color }} />
                </div>

                <h3 className="step-card__title">{step.title}</h3>
                <p className="step-card__desc">{step.description}</p>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}
