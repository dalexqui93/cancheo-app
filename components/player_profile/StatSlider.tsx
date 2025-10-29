import React from 'react';

interface StatSliderProps {
    icon: React.ReactNode;
    label: string;
    value: number;
    onChange: (value: number) => void;
    max?: number;
}

const StatSlider: React.FC<StatSliderProps> = ({ icon, label, value, onChange, max = 100 }) => {
    const percentage = (value / max) * 100;

    return (
        <div>
            <div className="flex justify-between items-center mb-1">
                <label className="font-semibold text-sm flex items-center gap-2">
                    {icon}
                    {label}
                </label>
                <span className="text-sm font-bold text-[var(--color-primary-400)]">{value}</span>
            </div>
            <div className="relative h-3 bg-black/30 rounded-full">
                <div 
                    className="absolute top-0 left-0 h-3 rounded-full bg-[var(--color-primary-500)]"
                    style={{ 
                        width: `${percentage}%`,
                        boxShadow: `0 0 8px var(--color-primary-500)`
                    }}
                ></div>
                <input
                    type="range"
                    min="0"
                    max={max}
                    value={value}
                    onChange={(e) => onChange(parseInt(e.target.value))}
                    className="absolute w-full h-full opacity-0 cursor-pointer"
                />
            </div>
        </div>
    );
};

export default StatSlider;
