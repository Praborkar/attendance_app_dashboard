import { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';

const TimePicker = ({ value, onChange, name }) => {
  const [hour, setHour] = useState('08');
  const [minute, setMinute] = useState('00');
  const [meridiem, setMeridiem] = useState('AM');

  useEffect(() => {
    if (value) {
      const [h, m] = value.split(':');
      let hourNum = parseInt(h, 10);
      const isPm = hourNum >= 12;
      
      if (hourNum === 0) {
        hourNum = 12;
      } else if (hourNum > 12) {
        hourNum -= 12;
      }
      
      setHour(hourNum.toString().padStart(2, '0'));
      setMinute(m || '00');
      setMeridiem(isPm ? 'PM' : 'AM');
    }
  }, [value]);

  const handleTimeChange = (newHour, newMinute, newMeridiem) => {
    let h = parseInt(newHour, 10);
    if (newMeridiem === 'PM' && h < 12) h += 12;
    if (newMeridiem === 'AM' && h === 12) h = 0;
    
    const formattedHour = h.toString().padStart(2, '0');
    // Using a synthetic event object to maintain compatibility with standard handleChange
    onChange({ target: { name, value: `${formattedHour}:${newMinute}` } });
  };

  return (
    <div className="flex items-center gap-2 w-full">
      <div className="relative flex-[1.2]">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
          <Clock size={16} />
        </div>
        <select
          className="input-field pl-9 bg-white cursor-pointer"
          value={hour}
          onChange={(e) => {
            setHour(e.target.value);
            handleTimeChange(e.target.value, minute, meridiem);
          }}
        >
          {Array.from({ length: 12 }, (_, i) => {
            const val = (i + 1).toString().padStart(2, '0');
            return <option key={val} value={val}>{val}</option>;
          })}
        </select>
      </div>
      
      <span className="text-slate-400 font-bold -mx-1">:</span>
      
      <div className="flex-1">
        <select
          className="input-field bg-white text-center cursor-pointer px-1"
          value={minute}
          onChange={(e) => {
            setMinute(e.target.value);
            handleTimeChange(hour, e.target.value, meridiem);
          }}
        >
          {Array.from({ length: 12 }, (_, i) => {
            const val = (i * 5).toString().padStart(2, '0');
            return <option key={val} value={val}>{val}</option>;
          })}
        </select>
      </div>
      
      <div className="flex-1">
        <select
          className="input-field bg-white text-center font-medium cursor-pointer px-1"
          value={meridiem}
          onChange={(e) => {
            setMeridiem(e.target.value);
            handleTimeChange(hour, minute, e.target.value);
          }}
        >
          <option value="AM">AM</option>
          <option value="PM">PM</option>
        </select>
      </div>
    </div>
  );
};

export default TimePicker;
