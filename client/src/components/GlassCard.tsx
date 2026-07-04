import React from 'react';
import { motion } from 'framer-motion';

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  animate?: boolean;
  delay?: number;
  hoverable?: boolean;
  onClick?: ((event: React.MouseEvent<HTMLDivElement>) => void) | null;
  id?: string;
}

export default function GlassCard({ 
  children, 
  className = '', 
  animate = true, 
  delay = 0,
  hoverable = false,
  onClick = null,
  id = ''
}: GlassCardProps) {
  const baseClasses = `glass-panel rounded-2xl p-6 ${hoverable ? 'glass-panel-hover transition-all duration-300' : ''} ${className}`;
  
  if (!animate) {
    return (
      <div 
        id={id}
        className={baseClasses} 
        onClick={onClick as any}
        style={{ cursor: onClick ? 'pointer' : 'default' }}
      >
        {children}
      </div>
    );
  }

  return (
    <motion.div
      id={id}
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut', delay }}
      className={baseClasses}
      onClick={onClick as any}
      style={{ cursor: onClick ? 'pointer' : 'default' }}
    >
      {children}
    </motion.div>
  );
}
