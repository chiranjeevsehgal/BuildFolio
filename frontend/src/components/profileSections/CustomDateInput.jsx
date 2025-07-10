import React, { useState, useRef } from "react";
import { Calendar, ChevronDown } from "lucide-react";

const CustomDateInput = ({
  value,
  onChange,
  onBlur,
  placeholder,
  disabled = false,
  hasError = false,
  className = "",
  required = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const inputRef = useRef(null);

  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  const years = Array.from({ length: 50 }, (_, i) => currentYear - 25 + i);

  const formatDisplayValue = (value) => {
    if (!value) return "";
    const [year, month] = value.split("-");
    return `${months[parseInt(month) - 1]} ${year}`;
  };

  const handleMonthSelect = (year, monthIndex) => {
    const monthValue = String(monthIndex + 1).padStart(2, "0");
    const dateValue = `${year}-${monthValue}`;
    onChange({ target: { value: dateValue } });
    setIsOpen(false);
  };

  const handleInputClick = () => {
    if (!disabled) {
      setIsOpen(!isOpen);
    }
  };

  const handleBlur = (e) => {
    // Delay to allow for dropdown clicks
    setTimeout(() => {
      if (!inputRef.current?.contains(document.activeElement)) {
        setIsOpen(false);
        if (onBlur) onBlur(e);
      }
    }, 150);
  };

  return (
    <div className="relative" ref={inputRef}>
      <div
        onClick={handleInputClick}
        className={`px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent w-full transition-colors cursor-pointer flex items-center justify-between ${
          hasError ? "border-red-500" : "border-slate-300"
        } ${disabled ? "bg-slate-100 cursor-not-allowed opacity-60" : "hover:border-slate-400"} ${className}`}
        tabIndex={0}
        onBlur={handleBlur}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            handleInputClick();
          }
        }}
      >
        <div className="flex items-center space-x-2 flex-1">
          <Calendar className="w-4 h-4 text-slate-400 placeholder:!text-gray-500" />
          <span
            className={`${value ? "text-slate-900" : "text-slate-500"} text-sm`}
          >
            {value ? formatDisplayValue(value) : placeholder}
          </span>
          {required && !value && <span className="text-red-500">*</span>}
        </div>
        <ChevronDown
          className={`w-4 h-4 text-slate-400 transition-transform ${isOpen ? "rotate-180" : ""}`}
        />
      </div>

      {isOpen && !disabled && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-slate-200 rounded-lg shadow-lg z-50 max-h-64 overflow-y-auto">
          <div className="p-2">
            {/* Year selector */}
            <div className="mb-3">
              <select
                value={currentYear}
                onChange={(e) => setCurrentYear(parseInt(e.target.value))}
                className="w-full px-2 py-1 border border-slate-200 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                {years.map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
            </div>

            {/* Month grid */}
            <div className="grid grid-cols-3 gap-1">
              {months.map((month, index) => (
                <button
                  key={month}
                  onClick={() => handleMonthSelect(currentYear, index)}
                  className="px-2 py-1 text-xs hover:bg-blue-50 hover:text-blue-600 rounded transition-colors text-center"
                >
                  {month.slice(0, 3)}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomDateInput;
