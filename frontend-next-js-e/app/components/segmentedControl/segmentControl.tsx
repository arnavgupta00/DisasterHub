import React, { useState } from 'react';

interface Segment {
  value: string;
  label: string;
}

interface SegmentedControlProps {
  name: string;
  callback: (value: string) => void;
  segments: Segment[];
}

const SegmentedControl: React.FC<SegmentedControlProps> = ({ name, callback, segments }) => {
  const [selectedValue, setSelectedValue] = useState(segments[0]?.value || '');

  const handleChange = (value: string): void => {
    setSelectedValue(value);
    callback(value);
  };

  return (
    <div className="flex flex-wrap rounded-2xl bg-transparent p-1 shadow-sm">
      {segments.map((segment) => (
        <button
          key={segment.value}
          className={`flex-1 px-2 py-1 md:px-4 md:py-2 m-1 text-sm font-medium transition-colors duration-200 ${
            selectedValue === segment.value
              ? 'bg-[#1C1C1E] text-white rounded-xl'
              : 'text-white hover:bg-gray-400 rounded-xl'
          }`}
          onClick={() => handleChange(segment.value)}
        >
          {segment.label}
        </button>
      ))}
    </div>
  );
};

export default SegmentedControl;
