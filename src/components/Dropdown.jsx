import { useState, useRef, useEffect } from 'react';
import { ChevronDown, Search, X } from 'lucide-react';

export default function Dropdown({ options, selected, onChange, placeholder = '-- Select --', icon: Icon, className = '' }) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
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

  // Reset search term when dropdown closes
  useEffect(() => {
    if (!isOpen) {
      setSearchTerm('');
    }
  }, [isOpen]);

  const filteredOptions = options.filter(option => 
    option.label.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
        <div className="absolute z-[100] w-full mt-1 bg-white border border-slate-200 rounded-xl shadow-xl overflow-hidden animate-in fade-in duration-200">
          {/* Search Input */}
          <div className="p-2 border-b border-slate-100 bg-slate-50/50 sticky top-0">
            <div className="relative">
              <Search size={14} className="absolute inset-y-0 left-2.5 my-auto text-slate-400" />
              <input
                type="text"
                className="w-full pl-8 pr-8 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all"
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                autoFocus
              />
              {searchTerm && (
                <button 
                  onClick={() => setSearchTerm('')}
                  className="absolute inset-y-0 right-2.5 my-auto text-slate-400 hover:text-slate-600"
                >
                  <X size={14} />
                </button>
              )}
            </div>
          </div>

          <div className="max-h-60 overflow-y-auto custom-scrollbar">
            {filteredOptions.length > 0 ? (
              <ul className="py-1">
                {filteredOptions.map((option) => (
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
            ) : (
              <div className="px-4 py-6 text-center text-slate-400 text-xs">
                No matching results
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
