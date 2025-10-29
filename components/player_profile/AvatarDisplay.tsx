import React from 'react';
import type { AvatarConfig } from '../../types';

interface AvatarDisplayProps {
    config: AvatarConfig;
}

const Hair: React.FC<{style: AvatarConfig['hairstyle'], color: string}> = ({style, color}) => {
    const styles = {
        short: <path d="M 50 10 C 40 5, 60 5, 50 10 Q 30 25, 50 25 Q 70 25, 50 10 Z" />,
        buzz: <path d="M 50 15 C 40 12, 60 12, 50 15 Q 35 23, 50 23 Q 65 23, 50 15 Z" />,
        mohawk: <path d="M 50 5 L 45 15 H 55 L 50 5 Z M 48 15 L 52 15 L 52 25 L 48 25 Z" />,
        long: <path d="M 50 10 C 35 5, 65 5, 50 10 Q 25 30, 50 40 Q 75 30, 50 10 Z" />,
        ponytail: <path d="M 50 10 C 40 5, 60 5, 50 10 Q 30 25, 50 25 Q 70 25, 50 10 Z M 48 25 L 52 25 L 50 45 L 48 25 Z" />,
        bald: <></>,
    };
    return <g fill={color}>{styles[style]}</g>
}

const FacialHair: React.FC<{style: AvatarConfig['facialHair'], color: string}> = ({style, color}) => {
    if (style === 'none' || !style) return null;
    const styles = {
        moustache: <path d="M 45 36 Q 50 38, 55 36" stroke={color} strokeWidth="1" fill="none" />,
        beard: <path d="M 40 38 C 45 45, 55 45, 60 38 L 58 32 H 42 Z" fill={color} />,
    };
    return <g>{styles[style]!}</g>
}


const AvatarDisplay: React.FC<AvatarDisplayProps> = ({ config }) => {
    return (
        <div className="w-64 h-96 relative">
            <svg viewBox="0 0 100 150" className="w-full h-full">
                {/* Body */}
                <g id="body">
                    <rect x="35" y="50" width="30" height="40" rx="5" fill={config.jerseyColor} />
                    <rect x="35" y="88" width="13" height="25" rx="3" fill={config.shortsColor} />
                    <rect x="52" y="88" width="13" height="25" rx="3" fill={config.shortsColor} />
                    <path d="M 40 113 L 40 140 L 45 140 L 45 113 Z" fill={config.skinTone} />
                    <path d="M 55 113 L 55 140 L 60 140 L 60 113 Z" fill={config.skinTone} />
                    <path d="M 35 55 L 25 80 L 30 80 L 40 55 Z" fill={config.skinTone} />
                    <path d="M 65 55 L 75 80 L 70 80 L 60 55 Z" fill={config.skinTone} />
                    {/* Shoes */}
                    <rect x="38" y="138" width="10" height="5" rx="2" fill={config.shoeColor || '#444'} />
                    <rect x="52" y="138" width="10" height="5" rx="2" fill={config.shoeColor || '#444'} />
                </g>
                {/* Head */}
                <g id="head">
                    <circle cx="50" cy="30" r="15" fill={config.skinTone} />
                    {/* Eyes */}
                    <circle cx="45" cy="30" r="1.5" fill={config.eyeColor || '#333'} />
                    <circle cx="55" cy="30" r="1.5" fill={config.eyeColor || '#333'} />
                    <path d="M 47 38 A 5 2 0 0 0 53 38" stroke="#333" strokeWidth="1" fill="none"/>
                    {/* Facial Hair */}
                    <FacialHair style={config.facialHair} color={config.hairColor} />
                </g>
                 {/* Hair */}
                <Hair style={config.hairstyle} color={config.hairColor} />
            </svg>
             <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/50 pointer-events-none"></div>
        </div>
    );
};

export default AvatarDisplay;