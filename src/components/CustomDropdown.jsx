import React, { useState, useEffect, useRef } from 'react';
import { ChevronDown } from 'lucide-react';

export default function CustomDropdown({ options, value, onChange, style = {}, dropdownStyle = {} }) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Normalize options to always be an array of { value, label }
  const normalizedOptions = options.map(opt => {
    if (typeof opt === 'string') {
      return { value: opt, label: opt };
    }
    return opt;
  });

  const selectedOption = normalizedOptions.find(opt => opt.value === value) || normalizedOptions[0];

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (val) => {
    onChange(val);
    setIsOpen(false);
  };

  return (
    <div ref={dropdownRef} style={{ position: 'relative', width: '100%', ...style }}>
      {/* Toggle Button */}
      <div
        onClick={() => setIsOpen(!isOpen)}
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '0.75rem 1rem',
          border: '1px solid var(--border-color)',
          backgroundColor: 'var(--bg-card)',
          borderRadius: '8px',
          color: 'var(--text-primary)',
          cursor: 'pointer',
          fontSize: '0.875rem',
          userSelect: 'none',
          transition: 'all 0.2s ease',
          boxShadow: isOpen ? '0 0 0 2px rgba(99, 102, 241, 0.15)' : 'none',
          borderColor: isOpen ? 'var(--primary)' : 'var(--border-color)'
        }}
      >
        <span>{selectedOption ? selectedOption.label : 'Select...'}</span>
        <ChevronDown 
          size={16} 
          style={{ 
            color: 'var(--text-secondary)',
            transform: isOpen ? 'rotate(180deg)' : 'rotate(0)',
            transition: 'transform 0.2s ease'
          }} 
        />
      </div>

      {/* Options List Container */}
      {isOpen && (
        <div
          style={{
            position: 'absolute',
            top: 'calc(100% + 4px)',
            left: 0,
            width: '100%',
            backgroundColor: 'var(--bg-card)',
            border: '1px solid var(--border-color)',
            borderRadius: '8px',
            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.05), 0 4px 6px -2px rgba(0, 0, 0, 0.02)',
            zIndex: 100,
            maxHeight: '220px',
            overflowY: 'auto',
            padding: '4px',
            ...dropdownStyle
          }}
        >
          {normalizedOptions.map(opt => {
            const isSelected = opt.value === value;
            return (
              <div
                key={opt.value}
                onClick={() => handleSelect(opt.value)}
                style={{
                  padding: '0.6rem 0.8rem',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '0.85rem',
                  color: isSelected ? 'var(--primary)' : 'var(--text-primary)',
                  backgroundColor: isSelected ? 'rgba(99, 102, 241, 0.06)' : 'transparent',
                  fontWeight: isSelected ? '600' : '500',
                  transition: 'background-color 0.15s ease',
                  userSelect: 'none'
                }}
                onMouseEnter={(e) => {
                  if (!isSelected) {
                    e.currentTarget.style.backgroundColor = 'var(--bg-card-hover)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isSelected) {
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }
                }}
              >
                {opt.label}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
