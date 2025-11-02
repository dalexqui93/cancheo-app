import React, { useState } from 'react';
import type { Team, TeamEvent, Notification } from '../../types';
import { ChevronLeftIcon } from '../../components/icons/ChevronLeftIcon';
import { PlusIcon } from '../../components/icons/PlusIcon';
import { XIcon } from '../../components/icons/XIcon';
import { SoccerBallIcon } from '../../components/icons/SoccerBallIcon';
import { ClipboardListIcon } from '../../components/icons/ClipboardListIcon';
import { UsersIcon } from '../../components/icons/UsersIcon';

interface ScheduleViewProps {
    team: Team;
    onBack: () => void;
    onUpdateTeam: (team: Team) => void;
    // FIX: The addNotification prop should omit 'id' and 'timestamp' to match the functions passed to it.
    addNotification: (notif: Omit<Notification, 'id' | 'timestamp'>) => void;
}

const getLocalISOStringForInput = (date: Date) => {
    const pad = (num: number) => String(num).padStart(2, '0');
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
};

const EventModal: React.FC<{
    onSave: (event: Omit<TeamEvent, 'id'>) => void;
    onClose: () => void;
}> = ({ onSave, onClose }) => {
    const [title, setTitle] = useState('');
    const [type, setType] = useState<'match' | 'training' | 'event'>('training');
    const [date, setDate] = useState(getLocalISOStringForInput(new Date()));
    const [location, setLocation] = useState('');

    const handleSave = () => {
        if (!title || !location) return;
        onSave({ title, type, date: new Date(date), location });
        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={onClose}>
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-md m-4 p-6" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-2xl font-bold">Nuevo Evento</h3>
                    <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"><XIcon className="w-6 h-6"/></button>
                </div>
                <div className="space-y-4">
                    <div>
                        <label className="font-semibold block mb-1">Título del Evento</label>
                        <input type="text" value={title} onChange={e => setTitle(e.target.value)} className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600"/>
                    </div>
                    <div>
                        <label className="font-semibold block mb-1">Tipo de Evento</label>
                        <select value={type} onChange={e => setType(e.target.value as any)} className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600">
                            <option value="training">Entrenamiento</option>
                            <option value="match">Partido</option>
                            <option value="event">Evento Social</option>
                        </select>
                    </div>
                     <div>
                        <label className="font-semibold block mb-1">Fecha y Hora</label>
                        <input type="datetime-local" value={date} onChange={e => setDate(e.target.value)} className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600"/>
                    </div>
                     <div>
                        <label className="font-semibold block mb-1">Ubicación</label>
                        <input type="text" value={location} onChange={e => setLocation(e.target.value)} className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600"/>
                    </div>
                </div>
                <div className="mt-6 flex justify-end gap-3">
                    <button onClick={onClose} className="py-2 px-5 rounded-lg font-semibold bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600">Cancelar</button>
                    <button onClick={handleSave} className="py-2 px-5 rounded-lg font-semibold bg-[var(--color-primary-600)] text-white hover:bg-[var(--color-primary-700)] shadow-sm">Guardar Evento</button>
                </div>
            </div>
        </div>
    );
};

const EventCard: React.FC<{ event: TeamEvent }> = ({ event }) => {
    const ICONS = {
        match: <SoccerBallIcon className="w-6 h-6" />,
        training: <ClipboardListIcon className="w-6 h-6" />,
        event: <UsersIcon className="w-6 h-6" />,
    };

    return (
        <div className="flex items-start gap-4">
            <div className="text-center w-20 flex-shrink-0">
                <p className="font-black text-4xl text-gray-800 dark:text-gray-200">{event.date.getDate()}</p>
                <p className="font-bold text-sm text-[var(--color-primary-600)] dark:text-[var(--color-primary-400)] uppercase">{event.date.toLocaleDateString('es-CO', {month: 'short'})}</p>
            </div>
            <div className="flex-grow bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border dark:border-gray-700">
                <div className="flex items-center gap-3">
                    <div className="text-gray-500 dark:text-gray-400">{ICONS[event.type]}</div>
                    <div>
                        <p className="font-bold text-lg text-gray-900 dark:text-gray-100">{event.title}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            {event.date.toLocaleDateString('es-CO', {weekday: 'long'})}, {event.date.toLocaleTimeString('es-CO', {hour:'2-digit', minute:'2-digit'})}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">@{event.location}</p>
                    </div>
                </div>
            </div>
        </div>
    );
};


const ScheduleView: React.FC<ScheduleViewProps> = ({ team, onBack, onUpdateTeam, addNotification }) => {
    const [isAddingEvent, setIsAddingEvent] = useState(false);
    
    const sortedSchedule = [...team.schedule].sort((a,b) => a.date.getTime() - b.date.getTime());

    const handleSaveEvent = (event: Omit<TeamEvent, 'id'>) => {
        const newEvent = { ...event, id: `ev-${Date.now()}` };
        const updatedSchedule = [...team.schedule, newEvent];
        onUpdateTeam({ ...team, schedule: updatedSchedule });
        // FIX: The addNotification prop should omit 'id' and 'timestamp'.
        addNotification({type: 'success', title: 'Evento Agregado', message: `Se ha añadido "${event.title}" al calendario.`})
    };

    return (
        <div className="pb-24 md:pb-4">
            <button onClick={onBack} className="flex items-center gap-2 text-[var(--color-primary-600)] dark:text-[var(--color-primary-500)] font-semibold mb-6 hover:underline">
                <ChevronLeftIcon className="h-5 w-5" />
                Volver al Panel
            </button>
            <div className="flex justify-between items-center mb-6 flex-wrap gap-4">
                <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-100">Calendario del Equipo</h1>
                <button onClick={() => setIsAddingEvent(true)} className="flex items-center gap-2 bg-[var(--color-primary-600)] text-white font-bold py-2 px-4 rounded-lg hover:bg-[var(--color-primary-700)] transition-colors shadow-sm text-sm">
                    <PlusIcon className="w-5 h-5" />
                    Añadir Evento
                </button>
            </div>
            
            {sortedSchedule.length > 0 ? (
                <div className="space-y-6">
                    {sortedSchedule.map(event => (
                        <EventCard key={event.id} event={event} />
                    ))}
                </div>
            ) : (
                <div className="text-center py-20 px-6 bg-white dark:bg-gray-800 rounded-2xl shadow-md border dark:border-gray-700">
                    <h2 className="mt-4 text-2xl font-bold tracking-tight text-gray-900 dark:text-gray-100">Calendario Vacío</h2>
                    <p className="mt-2 text-base text-gray-600 dark:text-gray-400">Añade tu primer entrenamiento o partido para empezar a planificar.</p>
                </div>
            )}

            {isAddingEvent && <EventModal onClose={() => setIsAddingEvent(false)} onSave={handleSaveEvent} />}
        </div>
    );
};

export default ScheduleView;