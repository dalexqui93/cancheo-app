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
    isCaptain: boolean;
    onBack: () => void;
    onUpdateTeam: (team: Team) => void;
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
            <div className="bg-gray-800 text-white rounded-2xl shadow-xl w-full max-w-md m-4 p-6" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-2xl font-bold">Nuevo Evento</h3>
                    <button onClick={onClose} className="p-1 rounded-full hover:bg-white/10"><XIcon className="w-6 h-6"/></button>
                </div>
                <div className="space-y-4">
                    <div>
                        <label className="font-semibold block mb-1">Título del Evento</label>
                        <input type="text" value={title} onChange={e => setTitle(e.target.value)} className="w-full p-2 border rounded-md bg-gray-700 border-gray-600"/>
                    </div>
                    <div>
                        <label className="font-semibold block mb-1">Tipo de Evento</label>
                        <select value={type} onChange={e => setType(e.target.value as any)} className="w-full p-2 border rounded-md bg-gray-700 border-gray-600">
                            <option value="training">Entrenamiento</option>
                            <option value="match">Partido</option>
                            <option value="event">Evento Social</option>
                        </select>
                    </div>
                     <div>
                        <label className="font-semibold block mb-1">Fecha y Hora</label>
                        <input type="datetime-local" value={date} onChange={e => setDate(e.target.value)} className="w-full p-2 border rounded-md bg-gray-700 border-gray-600"/>
                    </div>
                     <div>
                        <label className="font-semibold block mb-1">Ubicación</label>
                        <input type="text" value={location} onChange={e => setLocation(e.target.value)} className="w-full p-2 border rounded-md bg-gray-700 border-gray-600"/>
                    </div>
                </div>
                <div className="mt-6 flex justify-end gap-3">
                    <button onClick={onClose} className="py-2 px-5 rounded-lg font-semibold bg-white/10 hover:bg-white/20">Cancelar</button>
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
                <p className="font-black text-4xl text-white">{event.date.getDate()}</p>
                <p className="font-bold text-sm text-[var(--color-primary-400)] uppercase">{event.date.toLocaleDateString('es-CO', {month: 'short'})}</p>
            </div>
            <div className="flex-grow bg-black/20 backdrop-blur-md border border-white/10 p-4 rounded-xl">
                <div className="flex items-center gap-3">
                    <div className="text-gray-400">{ICONS[event.type]}</div>
                    <div>
                        <p className="font-bold text-lg text-white">{event.title}</p>
                        <p className="text-sm text-gray-400">
                            {event.date.toLocaleDateString('es-CO', {weekday: 'long'})}, {event.date.toLocaleTimeString('es-CO', {hour:'2-digit', minute:'2-digit'})}
                        </p>
                        <p className="text-sm text-gray-400">@{event.location}</p>
                    </div>
                </div>
            </div>
        </div>
    );
};


const ScheduleView: React.FC<ScheduleViewProps> = ({ team, isCaptain, onBack, onUpdateTeam, addNotification }) => {
    const [isAddingEvent, setIsAddingEvent] = useState(false);
    
    const sortedSchedule = [...team.schedule].sort((a,b) => a.date.getTime() - b.date.getTime());

    const handleSaveEvent = (event: Omit<TeamEvent, 'id'>) => {
        const newEvent = { ...event, id: `ev-${Date.now()}` };
        const updatedSchedule = [...team.schedule, newEvent];
        onUpdateTeam({ ...team, schedule: updatedSchedule });
        addNotification({type: 'success', title: 'Evento Agregado', message: `Se ha añadido "${event.title}" al calendario.`})
    };

    return (
        <div className="animate-fade-in">
            <div className="flex justify-between items-center mb-6 flex-wrap gap-4">
                <h1 className="text-3xl font-bold tracking-tight">Calendario del Equipo</h1>
                {isCaptain && (
                    <button onClick={() => setIsAddingEvent(true)} className="flex items-center gap-2 bg-white/10 text-white font-bold py-2 px-4 rounded-lg hover:bg-white/20 transition-colors shadow-sm text-sm border border-white/20">
                        <PlusIcon className="w-5 h-5" />
                        Añadir Evento
                    </button>
                )}
            </div>
            
            {sortedSchedule.length > 0 ? (
                <div className="space-y-6">
                    {sortedSchedule.map(event => (
                        <EventCard key={event.id} event={event} />
                    ))}
                </div>
            ) : (
                <div className="text-center py-20 px-6 bg-black/20 backdrop-blur-md border border-white/10 rounded-2xl">
                    <h2 className="mt-4 text-2xl font-bold tracking-tight">Calendario Vacío</h2>
                    <p className="mt-2 text-base text-gray-400">Añade tu primer entrenamiento o partido para empezar a planificar.</p>
                </div>
            )}

            {isAddingEvent && <EventModal onClose={() => setIsAddingEvent(false)} onSave={handleSaveEvent} />}
        </div>
    );
};

export default ScheduleView;