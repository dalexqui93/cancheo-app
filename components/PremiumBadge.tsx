import React from 'react';
import { SparklesIcon } from './icons/SparklesIcon';

const PremiumBadge: React.FC = () => (
    <span className="ml-2 inline-flex items-center gap-1 rounded-full bg-yellow-100 dark:bg-yellow-900/50 px-2 py-0.5 text-xs font-bold text-yellow-800 dark:text-yellow-300">
        <SparklesIcon className="w-3 h-3" />
        Premium
    </span>
);

export default PremiumBadge;