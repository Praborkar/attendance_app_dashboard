import { useState, useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';

export default function Dropdown({ options, selected, onChange, placeholder = '-- Select --', icon: Icon, className = '' }) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const selectedOption = options.find(opt => opt.id === selected);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative w-full" ref={dropdownRef}>
      <button 
        type="button" 
        className={`w-full flex items-center justify-between input-field bg-white text-left ${className}`} 
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex items-center min-w-0 pr-2">
          {Icon && <div className="text-slate-400 mr-2 shrink-0"><Icon size={18} /></div>}
          <span className="truncate">{selectedOption ? selectedOption.label : placeholder}</span>
        </div>
        <ChevronDown size={18} className="text-slate-400 shrink-0" />
      </button>

      {isOpen && (
        <div className="absolute z-[100] w-full mt-1 bg-white border border-slate-200 rounded-xl shadow-lg max-h-60 overflow-y-auto">
          <ul className="py-1">
            {options.map((option) => (
              <li 
                key={option.id} 
                className={`px-4 py-2 cursor-pointer hover:bg-slate-50 transition-colors truncate text-sm ${selected === option.id ? 'bg-primary-50 text-primary-700 font-medium' : 'text-slate-700'}`} 
                onClick={() => { onChange(option.id); setIsOpen(false); }} 
                title={option.label}
              >
                {option.label}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
