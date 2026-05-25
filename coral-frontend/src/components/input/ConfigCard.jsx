import React from 'react';
import { RotateCcw, Target, Cpu, Plus, Minus } from 'lucide-react';

const ConfigCard = ({ title, type, value, min, max, step, suffix, isToggle, description, onChange }) => {
  const getIcon = () => {
    switch(type) {
      case 'engine': return <RotateCcw className="w-5 h-5 text-coral-orange" />;
      case 'accuracy': return <Target className="w-5 h-5 text-coral-orange" />;
      case 'context': return <Cpu className="w-5 h-5 text-coral-orange" />;
      default: return null;
    }
  };

  return (
    <div className="bg-coral-sidebar-bg rounded-2xl p-6 flex flex-col justify-between shadow-sm border border-coral-border/50">
      <div className="flex justify-between items-start mb-6">
        {getIcon()}
        <span className="text-[10px] font-bold text-coral-text-secondary uppercase tracking-widest">{type}</span>
      </div>
      
      <div>
        <h3 className="text-sm font-medium text-coral-text-primary mb-3">{title}</h3>
        
        {isToggle ? (
          <div className="mt-1">
            <p className="text-xs text-coral-text-secondary mb-6 leading-relaxed">{description}</p>
            <div className="flex items-center justify-between">
              <span className={`text-[10px] font-bold uppercase tracking-wider ${value ? 'text-coral-orange' : 'text-coral-text-secondary'}`}>
                {value ? 'ENABLED' : 'DISABLED'}
              </span>
              <button 
                onClick={() => onChange(!value)}
                className={`w-10 h-5 rounded-full transition-colors relative ${value ? 'bg-[#E5D5C5]' : 'bg-coral-border'} focus:outline-none`}
              >
                <div className={`w-4 h-4 rounded-full bg-coral-orange absolute top-0.5 transition-transform ${value ? 'translate-x-5' : 'translate-x-1'}`}></div>
              </button>
            </div>
          </div>
        ) : type === 'engine' ? (
          // Stepper for Max Rounds
          <div className="mt-2">
            <div className="flex items-end space-x-2 mb-6">
              <span className="font-serif text-3xl font-bold text-coral-text-primary leading-none">{value}</span>
              <span className="text-[10px] font-bold text-coral-text-secondary tracking-widest mb-1">{suffix}</span>
            </div>
            <div className="flex items-center justify-between bg-white border border-coral-border rounded-lg p-1 mt-4">
              <button 
                onClick={() => onChange(Math.max(min, value - step))}
                disabled={value <= min}
                className="p-2 hover:bg-coral-sidebar-bg rounded-md disabled:opacity-30 transition-colors"
              >
                <Minus className="w-4 h-4 text-coral-text-primary" />
              </button>
              <span className="text-sm font-bold text-coral-text-primary">{value}</span>
              <button 
                onClick={() => onChange(Math.min(max, value + step))}
                disabled={value >= max}
                className="p-2 hover:bg-coral-sidebar-bg rounded-md disabled:opacity-30 transition-colors"
              >
                <Plus className="w-4 h-4 text-coral-text-primary" />
              </button>
            </div>
          </div>
        ) : (
          // Slider for Convergence Threshold
          <div>
            <div className="flex items-end space-x-2 mb-4">
              <span className="font-serif text-3xl font-bold text-coral-text-primary leading-none">{value.toFixed(2)}</span>
              <span className="text-[10px] font-bold text-coral-text-secondary tracking-widest mb-1">{suffix}</span>
            </div>
            
            <div className="relative w-full h-1 bg-coral-border rounded-full mt-6">
              <input 
                type="range" 
                min={min} 
                max={max} 
                step={step}
                value={value}
                onChange={(e) => onChange(parseFloat(e.target.value))}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
              />
              <div 
                className="absolute top-0 left-0 h-full bg-coral-orange rounded-full pointer-events-none"
                style={{ width: `${((value - min) / (max - min)) * 100}%` }}
              >
                <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-coral-orange rounded-full shadow-md translate-x-1/2"></div>
              </div>
            </div>
            <div className="flex justify-between mt-2 px-1">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="w-[18%] h-1 bg-coral-border rounded-full"></div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ConfigCard;
