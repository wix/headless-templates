import React from 'react';
import { motion } from 'framer-motion';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background text-foreground flex items-center justify-center p-8">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="text-center"
      >
        <h1 className="font-heading font-bold text-5xl lg:text-7xl xl:text-8xl leading-[0.9] tracking-tighter">
          HELLO:<br />
          <span className="text-primary">IT'S YOU.</span>
        </h1>
      </motion.div>
    </div>
  );
}