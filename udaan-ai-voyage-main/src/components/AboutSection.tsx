import { motion } from 'framer-motion';
import { Brain, Mic2, Zap } from 'lucide-react';

export default function AboutSection() {
  return (
    <section className="relative py-24 overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-radial opacity-30" />
      
      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-6xl font-display font-bold mb-6">
            Two Minds, <span className="text-gradient">One Mission</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Together, they guide you — from learning skills to acing interviews.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-8 md:gap-16 items-center max-w-6xl mx-auto">
          {/* AI Tutor */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="glass p-8 rounded-3xl glow-primary hover:scale-105 transition-transform duration-500"
          >
            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 rounded-2xl bg-primary/20 flex items-center justify-center animate-pulse-glow">
                <Brain className="w-8 h-8 text-primary" />
              </div>
              <div>
                <h3 className="text-2xl font-display font-bold text-primary">AI Tutor</h3>
                <p className="text-sm text-muted-foreground">The Mentor</p>
              </div>
            </div>
            <p className="text-muted-foreground leading-relaxed">
              Your personal learning companion that understands your goals, creates customized roadmaps, 
              and guides you through every step of your educational journey with intelligent insights.
            </p>
          </motion.div>

          {/* Udaan AI */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="glass p-8 rounded-3xl glow-secondary hover:scale-105 transition-transform duration-500"
          >
            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 rounded-2xl bg-secondary/20 flex items-center justify-center animate-pulse-glow">
                <Mic2 className="w-8 h-8 text-secondary" />
              </div>
              <div>
                <h3 className="text-2xl font-display font-bold text-secondary">Udaan AI</h3>
                <p className="text-sm text-muted-foreground">The Interviewer</p>
              </div>
            </div>
            <p className="text-muted-foreground leading-relaxed">
              Your AI-powered interview coach that analyzes your resume, conducts realistic mock interviews, 
              and provides detailed feedback to help you perform your best when it matters most.
            </p>
          </motion.div>
        </div>

        {/* Connecting element */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="mt-16 text-center"
        >
          <div className="inline-flex items-center gap-3 glass px-6 py-4 rounded-full">
            <Zap className="w-5 h-5 text-primary animate-pulse-glow" />
            <span className="font-semibold">Powered by Advanced AI Technology</span>
            <Zap className="w-5 h-5 text-secondary animate-pulse-glow" />
          </div>
        </motion.div>
      </div>
    </section>
  );
}
