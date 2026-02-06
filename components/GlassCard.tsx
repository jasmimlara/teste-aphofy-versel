
import React from 'react';

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  id?: string;
}

export const GlassCard: React.FC<GlassCardProps> = ({ children, className = '', onClick, id }) => {
  return (
    <div 
      id={id}
      onClick={onClick}
      className={`glass rounded-2xl p-4 transition-all duration-300 hover:bg-white/10 ${className} ${onClick ? 'cursor-pointer active:scale-95' : ''}`}
    >
      {children}
    </div>
  );
};
