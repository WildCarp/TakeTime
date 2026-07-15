import { useState, useRef, useEffect } from 'react';
import './CustomSelect.css';

interface CustomDateTimeProps {
  value: string; // 格式: YYYY-MM-DDTHH:mm
  onChange: (value: string) => void;
  placeholder?: string;
  timeOnly?: boolean; // 周期性任务只显示时间
}

export default function CustomDateTime({ value, onChange, placeholder, timeOnly }: CustomDateTimeProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // 解析 value
  const [year, setYear] = useState('');
  const [month, setMonth] = useState('');
  const [day, setDay] = useState('');
  const [hour, setHour] = useState('');
  const [minute, setMinute] = useState('');

  useEffect(() => {
    if (value) {
      const [d, t] = value.split('T');
      const [y, m, dd] = (d || '').split('-');
      setYear(y || '');
      setMonth(m || '');
      setDay(dd || '');
      const [h, min] = (t || '').split(':');
      setHour(h || '');
      setMinute(min || '');
    }
  }, [value]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const buildDate = (y: string, m: string, d: string) => `${y}-${m}-${d}`;

  const commitChange = (newYear: string, newMonth: string, newDay: string, newHour: string, newMinute: string) => {
    if (timeOnly) {
      if (newHour && newMinute) {
        const d = buildDate(newYear || year || '2026', newMonth || month || '01', newDay || day || '01');
        onChange(`${d}T${newHour.padStart(2, '0')}:${newMinute.padStart(2, '0')}`);
      }
    } else {
      if (newYear && newMonth && newDay && newHour && newMinute) {
        onChange(`${buildDate(newYear, newMonth, newDay)}T${newHour.padStart(2, '0')}:${newMinute.padStart(2, '0')}`);
      }
    }
  };

  // 年调整
  const adjustYear = (delta: number) => {
    const current = parseInt(year) || 2026;
    const next = Math.max(2020, Math.min(2099, current + delta));
    const str = String(next);
    setYear(str);
    commitChange(str, month, day, hour, minute);
  };

  // 月循环调整：12+1=1, 1-1=12
  const adjustMonth = (delta: number) => {
    const current = parseInt(month) || 1;
    const next = ((current - 1 + delta) % 12 + 12) % 12 + 1;
    const str = String(next).padStart(2, '0');
    setMonth(str);
    commitChange(year, str, day, hour, minute);
  };

  // 日循环调整：31+1=1, 1-1=31
  const adjustDay = (delta: number) => {
    const current = parseInt(day) || 1;
    const next = ((current - 1 + delta) % 31 + 31) % 31 + 1;
    const str = String(next).padStart(2, '0');
    setDay(str);
    commitChange(year, month, str, hour, minute);
  };

  // 时循环调整：23+1=0, 0-1=23
  const adjustHour = (delta: number) => {
    const current = parseInt(hour) || 0;
    const next = ((current + delta) % 24 + 24) % 24;
    const str = String(next).padStart(2, '0');
    setHour(str);
    commitChange(year, month, day, str, minute);
  };

  // 分循环调整：以15为步进
  const adjustMinute = (delta: number) => {
    const current = parseInt(minute) || 0;
    const next = ((current + delta) % 60 + 60) % 60;
    const str = String(next).padStart(2, '0');
    setMinute(str);
    commitChange(year, month, day, hour, str);
  };

  const handleInput = (field: 'year' | 'month' | 'day' | 'hour' | 'minute', v: string) => {
    const num = parseInt(v);
    if (isNaN(num) && v !== '') return;
    let str = v;
    switch (field) {
      case 'year': setYear(v); str = v; commitChange(v, month, day, hour, minute); break;
      case 'month': {
        const clamped = Math.max(1, Math.min(12, num || 1));
        str = String(clamped).padStart(2, '0');
        setMonth(str); commitChange(year, str, day, hour, minute); break;
      }
      case 'day': {
        const clamped = Math.max(1, Math.min(31, num || 1));
        str = String(clamped).padStart(2, '0');
        setDay(str); commitChange(year, month, str, hour, minute); break;
      }
      case 'hour': {
        const clamped = ((num % 24) + 24) % 24;
        str = String(clamped).padStart(2, '0');
        setHour(str); commitChange(year, month, day, str, minute); break;
      }
      case 'minute': {
        const clamped = ((num % 60) + 60) % 60;
        str = String(clamped).padStart(2, '0');
        setMinute(str); commitChange(year, month, day, hour, str); break;
      }
    }
  };

  // 显示格式化
  let displayValue: string;
  if (!value) {
    displayValue = placeholder || '选择时间';
  } else if (timeOnly) {
    displayValue = `${hour}:${minute}`;
  } else {
    displayValue = `${year}-${month}-${day} ${hour}:${minute}`;
  }

  // 计算面板弹出方向
  const [dropUp, setDropUp] = useState(false);
  useEffect(() => {
    if (open && ref.current) {
      const rect = ref.current.getBoundingClientRect();
      const panelHeight = timeOnly ? 100 : 180;
      const spaceBelow = window.innerHeight - rect.bottom;
      setDropUp(spaceBelow < panelHeight);
    }
  }, [open, timeOnly]);

  return (
    <div className={`custom-datetime ${open ? 'open' : ''}`} ref={ref}>
      <div className="custom-datetime-trigger" onClick={() => setOpen(!open)}>
        <span>{displayValue}</span>
        <span className="custom-datetime-icon">▾</span>
      </div>
      {open && (
        <div className={`custom-datetime-panel ${dropUp ? 'drop-up' : ''}`}>
          {!timeOnly && (
            <div className="custom-datetime-row time-row">
              <div className="custom-datetime-time-field">
                <label>年</label>
                <div className="time-spinner">
                  <button className="time-spinner-btn left" onClick={() => adjustYear(-1)}>◀</button>
                  <input
                    type="text"
                    className="spinner-input-wide"
                    value={year}
                    onChange={(e) => handleInput('year', e.target.value)}
                  />
                  <button className="time-spinner-btn right" onClick={() => adjustYear(1)}>▶</button>
                </div>
              </div>
              <div className="custom-datetime-time-field">
                <label>月</label>
                <div className="time-spinner">
                  <button className="time-spinner-btn left" onClick={() => adjustMonth(-1)}>◀</button>
                  <input
                    type="text"
                    value={month}
                    onChange={(e) => handleInput('month', e.target.value)}
                  />
                  <button className="time-spinner-btn right" onClick={() => adjustMonth(1)}>▶</button>
                </div>
              </div>
              <div className="custom-datetime-time-field">
                <label>日</label>
                <div className="time-spinner">
                  <button className="time-spinner-btn left" onClick={() => adjustDay(-1)}>◀</button>
                  <input
                    type="text"
                    value={day}
                    onChange={(e) => handleInput('day', e.target.value)}
                  />
                  <button className="time-spinner-btn right" onClick={() => adjustDay(1)}>▶</button>
                </div>
              </div>
            </div>
          )}
          <div className="custom-datetime-row time-row">
            <div className="custom-datetime-time-field">
              <label>时</label>
              <div className="time-spinner">
                <button className="time-spinner-btn left" onClick={() => adjustHour(-1)}>◀</button>
                <input
                  type="text"
                  value={hour}
                  onChange={(e) => handleInput('hour', e.target.value)}
                />
                <button className="time-spinner-btn right" onClick={() => adjustHour(1)}>▶</button>
              </div>
            </div>
            <span className="time-separator">:</span>
            <div className="custom-datetime-time-field">
              <label>分</label>
              <div className="time-spinner">
                <button className="time-spinner-btn left" onClick={() => adjustMinute(-15)}>◀</button>
                <input
                  type="text"
                  value={minute}
                  onChange={(e) => handleInput('minute', e.target.value)}
                />
                <button className="time-spinner-btn right" onClick={() => adjustMinute(15)}>▶</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
