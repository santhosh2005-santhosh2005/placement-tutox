import { Canvas } from '@react-three/fiber';
import { OrbitControls, Float, Sphere, MeshDistortMaterial } from '@react-three/drei';
import { motion } from 'framer-motion';
import { Sparkles, Brain, Mic } from 'lucide-react';
import { Button } from './ui/button';

function AIOrb() {
  return (
    <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
      {/* Outer glow ring - globe structure */}
      <Sphere args={[2, 32, 32]} position={[0, 0, 0]}>
        <meshBasicMaterial color="#9333ea" wireframe opacity={0.3} transparent />
      </Sphere>
    </Float>
  );
}

function FloatingIcon({ position, delay }: { position: [number, number, number]; delay: number }) {
  return (
    <Float speed={3} rotationIntensity={1} floatIntensity={2}>
      <mesh position={position}>
        <boxGeometry args={[0.3, 0.3, 0.3]} />
        <meshStandardMaterial color="#06b6d4" emissive="#06b6d4" emissiveIntensity={0.5} />
      </mesh>
    </Float>
  );
}

export default function Hero3D() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Animated gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-secondary/20" />
      
      {/* 3D Canvas Background */}
      <div className="absolute inset-0 opacity-80">
        <Canvas camera={{ position: [0, 0, 8], fov: 45 }}>
          <ambientLight intensity={0.5} />
          <pointLight position={[10, 10, 10]} intensity={1} color="#06b6d4" />
          <pointLight position={[-10, -10, -10]} intensity={0.5} color="#9333ea" />
          
          <AIOrb />
          <FloatingIcon position={[-3, 2, 0]} delay={0} />
          <FloatingIcon position={[3, -2, 0]} delay={0.5} />
          <FloatingIcon position={[0, 3, -2]} delay={1} />
          
          <OrbitControls
            enableZoom={false}
            enablePan={false}
            autoRotate
            autoRotateSpeed={0.5}
            maxPolarAngle={Math.PI / 2}
            minPolarAngle={Math.PI / 2}
          />
        </Canvas>
      </div>

      {/* Content overlay */}
      <div className="relative z-10 container mx-auto px-4 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="space-y-8"
        >
          {/* Floating badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 glass px-4 py-2 rounded-full mb-6"
          >
            <Sparkles className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium">The Future of Learning & Hiring</span>
          </motion.div>

          {/* Main headline */}
          <h1 className="text-5xl md:text-7xl font-display font-bold leading-tight">
            Meet your{' '}
            <span className="text-gradient">AI Mentor</span>
            <br />& Interviewer
          </h1>

          {/* Subheadline */}
          <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto">
            AI Tutor × Udaan AI — Your personal coach to learn, prepare, and succeed.
          </p>

          {/* Feature highlights */}
          <div className="flex flex-wrap justify-center gap-6 text-sm">
            <div className="flex items-center gap-2">
              <Brain className="w-5 h-5 text-primary" />
              <span>Smart Learning Paths</span>
            </div>
            <div className="flex items-center gap-2">
              <Mic className="w-5 h-5 text-secondary" />
              <span>Live AI Interviews</span>
            </div>
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-primary" />
              <span>Real-time Feedback</span>
            </div>
          </div>

          {/* CTA buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-8"
          >
            <Button size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground glow-primary px-8 py-6 text-lg font-semibold rounded-xl">
              🚀 Get Started
            </Button>
            <Button 
              size="lg" 
              variant="outline" 
              className="border-2 border-primary/50 hover:bg-primary/10 px-8 py-6 text-lg font-semibold rounded-xl backdrop-blur-sm"
            >
              🎙 Try Live Interview
            </Button>
          </motion.div>
        </motion.div>
      </div>

      {/* Decorative elements */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent" />
    </section>
  );
}
