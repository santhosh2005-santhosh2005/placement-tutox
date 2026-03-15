import { motion } from 'framer-motion';
import { FileText, Brain, Mic, MessageSquare, BookOpen, TrendingUp } from 'lucide-react';

const features = [
  {
    icon: FileText,
    title: 'Upload Resume',
    description: 'Smart analysis of your skills, experience, and career trajectory.',
    color: 'primary',
  },
  {
    icon: Brain,
    title: 'Job Fit Analysis',
    description: 'AI-powered matching to find your perfect role and opportunities.',
    color: 'secondary',
  },
  {
    icon: Mic,
    title: 'Live AI Interview',
    description: 'Realistic mock interviews with natural conversation flow.',
    color: 'primary',
  },
  {
    icon: MessageSquare,
    title: 'Real Feedback',
    description: 'Detailed scoring and actionable insights to improve performance.',
    color: 'secondary',
  },
  {
    icon: BookOpen,
    title: 'Learning Roadmap',
    description: 'Personalized year-wise plan to achieve your career goals.',
    color: 'primary',
  },
  {
    icon: TrendingUp,
    title: 'Progress Tracking',
    description: 'Monitor your growth and celebrate milestones along the way.',
    color: 'secondary',
  },
];

export default function FeaturesSection() {
  return (
    <section className="relative py-24">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-6xl font-display font-bold mb-6">
            Everything You Need to <span className="text-gradient">Succeed</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Comprehensive tools and insights powered by cutting-edge AI technology.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            const glowClass = feature.color === 'primary' ? 'glow-primary' : 'glow-secondary';
            const textClass = feature.color === 'primary' ? 'text-primary' : 'text-secondary';
            
            return (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                whileHover={{ scale: 1.05, rotateY: 5 }}
                className={`glass p-6 rounded-2xl ${glowClass} hover:bg-card/50 transition-all duration-500 cursor-pointer`}
                style={{ transformStyle: 'preserve-3d' }}
              >
                <div className={`w-14 h-14 rounded-xl bg-${feature.color}/20 flex items-center justify-center mb-4 animate-float`}>
                  <Icon className={`w-7 h-7 ${textClass}`} />
                </div>
                <h3 className="text-xl font-display font-semibold mb-3">{feature.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
