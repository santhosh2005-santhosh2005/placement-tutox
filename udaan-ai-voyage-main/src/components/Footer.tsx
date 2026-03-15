import { motion } from 'framer-motion';
import { Heart } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="relative py-12 overflow-hidden">
      {/* Gradient line */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-primary" />
      
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="glass p-8 rounded-3xl max-w-4xl mx-auto text-center"
        >
          <div className="flex items-center justify-center gap-2 mb-4">
            <Heart className="w-5 h-5 text-primary animate-pulse-glow" />
            <p className="text-lg font-medium">
              Built for students. Powered by AI. Guided by purpose.
            </p>
            <Heart className="w-5 h-5 text-secondary animate-pulse-glow" />
          </div>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6 text-sm text-muted-foreground">
            <span>© 2025 UdaanIQ</span>
            <span className="hidden sm:inline">•</span>
            <a href="#" className="hover:text-primary transition-colors">Privacy Policy</a>
            <span className="hidden sm:inline">•</span>
            <a href="#" className="hover:text-primary transition-colors">Terms of Service</a>
            <span className="hidden sm:inline">•</span>
            <a href="#" className="hover:text-primary transition-colors">Contact</a>
          </div>
        </motion.div>
      </div>
    </footer>
  );
}
