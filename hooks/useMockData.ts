
import { useState, useEffect } from 'react';
import type { SoccerField } from '../types';

export const mockFields: SoccerField[] = [];

export const useMockData = () => {
    const [fields, setFields] = useState<SoccerField[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const timer = setTimeout(() => {
            setFields([]);
            setLoading(false);
        }, 1000);

        return () => clearTimeout(timer);
    }, []);

    return { fields, loading };
};