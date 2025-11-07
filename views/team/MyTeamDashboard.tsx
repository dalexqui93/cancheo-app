// FIX: Import 'useState' from 'react' to use the state hook.
import React, { useState } from 'react';
import type { Notification } from '../../types';
import CreateTeamView from './CreateTeamView';
import { ShieldIcon } from '../../components/icons/ShieldIcon';
import { UserPlusIcon } from '../../components/icons/UserPlusIcon';

interface TeamOnboardingProps {
    onBack: () => void;
    onCreateTeam: (teamId: string) => Promise<void>;
    addNotification: (notif: Omit<Notification, 'id' | 'timestamp'>) => void;
}

const TeamOnboarding: React.FC<TeamOnboardingProps> = ({ onBack, onCreateTeam, addNotification }) => {
    const [view, setView] = useState<'options' | 'create'>('options');

    const handleCreateTeamWrapper = async (teamData: { name: string; logo: string | null; level: 'Casual' | 'Intermedio' | 'Competitivo' }) => {
        // La lógica de creación real se movió a App.tsx y se pasa a través de `onCreateTeam`.
        // Aquí simulamos que obtenemos un ID y lo pasamos.
        // En una implementación real, la función que se pasa a través de `onCreateTeam`
        // crearía el equipo en la DB y luego actualizaría el usuario.
        addNotification({ type: 'success', title: 'Equipo Creado', message: `¡Bienvenido a ${teamData.name}!` });
    };
    
    if (view === 'create') {
        return (
            <CreateTeamView
                user={{} as any} // Placeholder, a real implementation would need user context
                onBack={() => setView('options')}
                onCreate={handleCreateTeamWrapper as any} // Cast because logic differs now
                setIsPremiumModalOpen={() => {}} // Placeholder
            />
        );
    }

    return (
        <div className="min-h-screen p-4 sm:p-6 flex flex-col justify-center items-center">
            <div className="w-full max-w-lg text-center">
                <ShieldIcon className="mx-auto h-20 w-20 text-gray-500" />
                <h1 className="mt-4 text-3xl font-bold tracking-tight text-white">Únete a la Cancha</h1>
                <p className="mt-2 text-lg text-gray-400">
                    Aún no eres parte de un equipo. ¡Crea el tuyo o únete a uno existente para empezar a competir!
                </p>
                <div className="mt-8 flex flex-col sm:flex-row justify-center gap-4">
                    <button
                        onClick={() => addNotification({type: 'info', title: 'Próximamente', message: 'La función para unirse a un equipo estará disponible pronto.'})}
                        className="flex items-center justify-center gap-2 w-full sm:w-auto bg-white/10 text-white font-bold py-3 px-6 rounded-lg hover:bg-white/20 transition-colors shadow-sm border border-white/20"
                    >
                        <UserPlusIcon className="w-5 h-5" />
                        Unirse a un Equipo
                    </button>
                    <button
                        onClick={() => setView('create')}
                        className="flex items-center justify-center gap-2 w-full sm:w-auto bg-[var(--color-primary-600)] text-white font-bold py-3 px-6 rounded-lg hover:bg-[var(--color-primary-700)] transition-colors shadow-lg"
                    >
                        <ShieldIcon className="w-5 h-5" />
                        Crear mi Equipo
                    </button>
                </div>
            </div>
        </div>
    );
};

export default TeamOnboarding;