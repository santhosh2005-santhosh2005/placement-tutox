import { motion } from 'framer-motion';
import { Mic, MessageCircle } from 'lucide-react';
import { Button } from './ui/button';

export default function DemoSection() {
  return (
    <section className="relative py-24 overflow-hidden">
      {/* Background glow */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/5 to-transparent" />
      
      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="max-w-4xl mx-auto"
        >
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-6xl font-display font-bold mb-6">
              Experience the <span className="text-gradient">AI Interview</span>
            </h2>
            <p className="text-xl text-muted-foreground">
              See how our AI conducts natural, insightful conversations.
            </p>
          </div>

          {/* Demo mockup */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="glass p-8 md:p-12 rounded-3xl glow-primary"
          >
            {/* Microphone animation */}
            <div className="flex justify-center mb-8">
              <motion.div
                animate={{
                  scale: [1, 1.2, 1],
                  opacity: [0.7, 1, 0.7],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                className="w-24 h-24 rounded-full bg-primary/20 flex items-center justify-center"
              >
                <Mic className="w-12 h-12 text-primary" />
              </motion.div>
            </div>

            {/* AI conversation bubble */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="bg-card/50 backdrop-blur-sm p-6 rounded-2xl border border-primary/20 mb-6"
            >
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                  <MessageCircle className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="font-semibold mb-2 text-primary">Udaan AI</p>
                  <p className="text-foreground">
                    "Hello! I've reviewed your resume and I'm excited to conduct your mock interview. 
                    Let's start with a question about your recent project experience. Can you tell me 
                    about a challenging problem you solved?"
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Waveform visualization */}
            <div className="flex items-center justify-center gap-1 mb-8">
              {[...Array(20)].map((_, i) => (
                <motion.div
                  key={i}
                  animate={{
                    height: [20, Math.random() * 40 + 20, 20],
                  }}
                  transition={{
                    duration: 0.5,
                    repeat: Infinity,
                    delay: i * 0.05,
                  }}
                  className="w-1 bg-gradient-primary rounded-full"
                  style={{ height: 20 }}
                />
              ))}
            </div>

            {/* CTA */}
            <div className="text-center">
              <Button 
                size="lg" 
                className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-6 text-lg font-semibold rounded-xl glow-primary"
              >
                Try Live Demo
              </Button>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
