import { motion } from 'framer-motion';
import {
  Shield, Clock, Cpu, IndianRupee, Leaf, CloudSun,
  BarChart3, FileCheck
} from 'lucide-react';
import './Benefits.css';

const benefits = [
  {
    icon: Cpu,
    title: 'Multi-AI Engine',
    desc: 'Gemini, Groq & OpenRouter — triple failover ensures 99.9% uptime.',
  },
  {
    icon: Clock,
    title: 'Instant Results',
    desc: 'Full analysis in under 30 seconds — no manual data entry needed.',
  },
  {
    icon: IndianRupee,
    title: 'Cost Savings',
    desc: 'Accurate solar sizing means right-sized investment, no oversizing.',
  },
  {
    icon: FileCheck,
    title: 'Professional Reports',
    desc: 'Excel reports ready to share with installers, clients, or banks.',
  },
  {
    icon: Shield,
    title: 'Secure Processing',
    desc: 'Bills are processed in-memory and never stored on our servers.',
  },
  {
    icon: CloudSun,
    title: 'MSEDCL Optimized',
    desc: 'Trained on Maharashtra electricity bills for best accuracy.',
  },
  {
    icon: BarChart3,
    title: '12-Month Analysis',
    desc: 'Reads all months from your bill for seasonal trend awareness.',
  },
  {
    icon: Leaf,
    title: 'Go Green',
    desc: 'Every solar panel installed reduces carbon footprint significantly.',
  },
];

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
};

const cardVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.45 } },
};

export default function Benefits() {
  return (
    <section className="benefits" id="benefits">
      <div className="benefits__container">
        <motion.div
          className="section-header"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <span className="section-header__tag">Why EnergyBae</span>
          <h2 className="section-header__title">
            Built for <span className="text-gradient">Solar Professionals</span>
          </h2>
          <p className="section-header__desc">
            The only tool you need to convert electricity bills into actionable solar proposals.
          </p>
        </motion.div>

        <motion.div
          className="benefits__grid"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-50px' }}
        >
          {benefits.map((b) => {
            const Icon = b.icon;
            return (
              <motion.div key={b.title} className="benefit-card" variants={cardVariants}>
                <div className="benefit-card__icon">
                  <Icon size={22} />
                </div>
                <h4 className="benefit-card__title">{b.title}</h4>
                <p className="benefit-card__desc">{b.desc}</p>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}
