import React from 'react';

interface LogoProps {
  className?: string;
  variant?: 'full' | 'shield' | 'white';
}

export const NobsaLogo: React.FC<LogoProps> = ({ className = 'h-14 w-auto', variant = 'full' }) => {
  return (
    <div className={`flex items-center gap-3 select-none ${variant === 'white' ? 'text-white' : 'text-slate-800'}`}>


      {variant !== 'shield' && (
        <div className="flex flex-col">
                    <span className="text-sm font-extrabold tracking-tight uppercase leading-none font-['Plus_Jakarta_Sans']">
            Alcaldía Municipal de Nobsa
          </span>
          
        </div>
      )}
    </div>
  );
};
