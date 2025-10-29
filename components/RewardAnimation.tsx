
import React, { useState, useEffect } from 'react';
import type { SoccerField } from '../types';

interface RewardAnimationProps {
    field: SoccerField;
    onAnimationEnd: () => void;
}

const RewardAnimation: React.FC<RewardAnimationProps> = ({ field, onAnimationEnd }) => {
    const [step, setStep] = useState(0);

    useEffect(() => {
        const timers: ReturnType<typeof setTimeout>[] = [];
        timers.push(setTimeout(() => setStep(1), 100)); // Start animation
        timers.push(setTimeout(() => setStep(2), 800)); // Show text
        timers.push(setTimeout(() => setStep(3), 3500)); // Start fade out
        timers.push(setTimeout(onAnimationEnd, 4000)); // End component

        return () => timers.forEach(clearTimeout);
    }, [onAnimationEnd]);

    return (
        <div
            className={`fixed inset-0 z-[200] flex flex-col items-center justify-center bg-black/70 backdrop-blur-sm transition-opacity duration-500 ${step >= 3 ? 'opacity-0' : 'opacity-100'}`}
            style={{ animation: step > 0 ? 'reward-fade-in 0.3s ease-out' : '' }}
        >
            <div className="relative text-center">
                 {/* Sparkles */}
                {step >= 1 && Array.from({ length: 12 }).map((_, i) => {
                    const angle = (i / 12) * 360;
                    const radius = Math.random() * 50 + 100;
                    return (
                        <div
                            key={i}
                            className="absolute top-1/2 left-1/2 text-2xl"
                            style={{
                                transform: `rotate(${angle}deg) translateX(${radius}px) rotate(-${angle}deg)`,
                                animation: `reward-sparkle 0.8s ease-out ${i * 0.05}s forwards`,
                                animationDelay: '0.5s',
                                color: ['#FFD700', '#FFAC33', '#FFFFFF'][i % 3],
                            }}
                        >
                           ✨
                        </div>
                    );
                })}

                {/* Ticket */}
                <div
                    className={`transition-transform duration-500 ${step >= 1 ? 'opacity-100' : 'opacity-0'}`}
                    style={{ animation: step >= 1 ? 'reward-ticket-pop-in 0.8s cubic-bezier(0.25, 1.5, 0.5, 1) forwards' : '' }}
                >
                    <span className="text-[10rem] leading-none drop-shadow-lg">🎟️</span>
                </div>
                
                {/* Text */}
                <div className={`mt-8 text-white transition-opacity duration-500 ${step >= 2 ? 'opacity-100' : 'opacity-0'}`}>
                    <h2
                        className="text-5xl font-black tracking-tight"
                        style={{ animation: step >= 2 ? 'reward-text-slide-in 0.5s ease-out 0.2s both' : '' }}
                    >
                        ¡GANASTE!
                    </h2>
                    <p
                        className="text-2xl font-semibold mt-2 text-yellow-300"
                        style={{ animation: step >= 2 ? 'reward-text-slide-in 0.5s ease-out 0.4s both' : '' }}
                    >
                        Una cancha gratis en
                    </p>
                    <p
                        className="text-xl font-bold mt-1"
                         style={{ animation: step >= 2 ? 'reward-text-slide-in 0.5s ease-out 0.6s both' : '' }}
                    >
                        {field.name}
                    </p>
                </div>
            </div>
        </div>
    );
};

export default RewardAnimation;
