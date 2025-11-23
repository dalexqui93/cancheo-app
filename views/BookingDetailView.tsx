
import React, { useState } from 'react';
import type { ConfirmedBooking, User, WeatherData, Team } from '../types';
import { ChevronLeftIcon } from '../components/icons/ChevronLeftIcon';
import { CalendarIcon } from '../components/icons/CalendarIcon';
import { ClockIcon } from '../components/icons/ClockIcon';
import { LocationIcon } from '../components/icons/LocationIcon';
import { CurrencyDollarIcon } from '../components/icons/CurrencyDollarIcon';
import BookingWeatherStatus from '../components/weather/BookingWeatherStatus';
import ConfirmationModal from '../components/ConfirmationModal';
import ScorekeeperModal from '../components/ScorekeeperModal';
import { ScoreboardIcon } from '../components/icons/ScoreboardIcon';
import ScrollOnOverflow from '../components/ScrollOnOverflow';
import { CheckBadgeIcon } from '../components/icons/CheckBadgeIcon';

interface BookingDetailViewProps {
    booking: ConfirmedBooking;
    user: User;
    allTeams: Team[];
    onBack: () => void;
    onCancelBooking: (bookingId: string) => void;
    weatherData: WeatherData | null;
    onUpdateScore: (bookingId: string, scoreA: number, scoreB: number) => void;
    onFinalizeMatch: (bookingId: string, scoreA: number, scoreB: number) => void;
    currentTime: Date;
    onContractResponse?: (bookingId: string, action: 'confirm' | 'cancel') => void;
}

const TeamLogo: React.FC<{ logo?: string; name: string; size?: string }> = ({ logo, name, size = 'w-16 h-16' }) => {
    const containerClasses = `${size} rounded-full bg-gray-700 flex items-center justify-center border-2 border-gray-600 overflow-hidden`;
    if (logo) {
        return (
            <div className={containerClasses}>
                <img src={logo} alt={`${name} logo`} className="w-full h-full object-cover" />
            </div>
        );
    }
    return (
        <div className={containerClasses}>
            <span className="text-2xl font-bold text-white" style={{textShadow: '1px 1px 3px rgba(0,0,0,0.5)'}}>{name.charAt(0)}</span>
        </div>
    );
};

const BookingDetailView: React.FC<BookingDetailViewProps> = ({
    booking,
    user,
    allTeams,
    onBack,
    onCancelBooking,
    weatherData,
    onUpdateScore,
    onFinalizeMatch,
    currentTime,
    onContractResponse,
}) => {
    const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
    const [isScorekeeperOpen, setIsScorekeeperOpen] = useState(false);

    const bookingStartDateTime = new Date(booking.date);
    const [hours, minutes] = booking.time.split(':').map(Number);
    bookingStartDateTime.setHours(hours, minutes, 0, 0);

    const now = currentTime;
    const isMatchStarted = now >= bookingStartDateTime;
    const canCancel = now < bookingStartDateTime && booking.status === 'confirmed';

    const teamNameA = booking.teamName || booking.userName;
    const teamNameB = booking.rivalName || 'Rival';
    
    const teamA = allTeams.find(t => t.name.toLowerCase() === teamNameA.toLowerCase());
    const isAuthorized = user.id === booking.userId || (teamA && teamA.captainId === user.id);
    
    const canManageScore = isAuthorized && booking.status === 'confirmed';

    const hasScore = typeof booking.scoreA === 'number' && typeof booking.scoreB === 'number';

    const bookingDate = new Date(booking.date);
    const isToday = bookingDate.getDate() === currentTime.getDate() &&
                    bookingDate.getMonth() === currentTime.getMonth() &&
                    bookingDate.getFullYear() === currentTime.getFullYear();

    const showContractConfirmButton = !!booking.contractId && booking.confirmationStatus === 'pending';

    return (
        <div className="pb-24 md:pb-4">
            <button onClick={onBack} className="flex items-center gap-2 text-[var(--color-primary-600)] dark:text-[var(--color-primary-500)] font-semibold mb-6 hover:underline">
                <ChevronLeftIcon className="h-5 w-5" />
                Volver a Mis Reservas
            </button>

            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden border dark:border-gray-700">
                <div className="relative">
                    <img src={booking.field.images[0]} alt={booking.field.name} className="w-full h-48 object-cover"/>
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/40 to-transparent"></div>
                    <div className="absolute bottom-4 left-4 text-white">
                        <h1 className="text-3xl font-bold">{booking.field.name}</h1>
                        <p className="text-sm opacity-90">{booking.field.address}</p>
                    </div>
                </div>

                <div className="p-6 space-y-6">
                    {/* Match Score Display */}
                    <div className="bg-gray-900 text-white p-4 rounded-xl shadow-inner border border-white/10">
                        <div className="flex items-center justify-between">
                            <div className="flex flex-col items-center text-center flex-1 min-w-0">
                                <TeamLogo logo={teamA?.logo} name={teamNameA} size="w-14 h-14"/>
                                <ScrollOnOverflow className="font-bold mt-2 w-full text-center px-2 text-sm">{teamNameA}</ScrollOnOverflow>
                            </div>
                            <div className="text-center flex-shrink-0 mx-2">
                                {hasScore ? (
                                    <div className="text-5xl font-black flex items-center justify-center gap-4">
                                        <span>{booking.scoreA}</span>
                                        <span className="text-gray-500">-</span>
                                        <span>{booking.scoreB}</span>
                                    </div>
                                ) : (
                                    <div className="text-2xl font-black text-gray-500">VS</div>
                                )}
                            </div>
                            <div className="flex flex-col items-center text-center flex-1 min-w-0">
                                <TeamLogo logo={allTeams.find(t => t.name.toLowerCase() === teamNameB.toLowerCase())?.logo} name={teamNameB} size="w-14 h-14"/>
                                <ScrollOnOverflow className="font-bold mt-2 w-full text-center px-2 text-sm">{teamNameB}</ScrollOnOverflow>
                            </div>
                        </div>
                    </div>

                    {/* Details Section */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="flex items-center gap-3 bg-slate-50 dark:bg-gray-700/50 p-3 rounded-lg">
                            <CalendarIcon className="h-6 w-6 text-gray-500 dark:text-gray-400" />
                            <div>
                                <p className="text-xs text-gray-500 dark:text-gray-400">Fecha</p>
                                <p className="font-semibold">{new Date(booking.date).toLocaleDateString('es-CO', { weekday: 'long', day: 'numeric', month: 'long' })}</p>
                            </div>
                        </div>
                         <div className="flex items-center gap-3 bg-slate-50 dark:bg-gray-700/50 p-3 rounded-lg">
                            <ClockIcon className="h-6 w-6 text-gray-500 dark:text-gray-400" />
                            <div>
                                <p className="text-xs text-gray-500 dark:text-gray-400">Hora</p>
                                <p className="font-semibold">{booking.time}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3 bg-slate-50 dark:bg-gray-700/50 p-3 rounded-lg">
                            <CurrencyDollarIcon className="h-6 w-6 text-gray-500 dark:text-gray-400" />
                            <div>
                                <p className="text-xs text-gray-500 dark:text-gray-400">Total Pagado</p>
                                <p className="font-semibold">${booking.totalPrice.toLocaleString('es-CO')}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3 bg-slate-50 dark:bg-gray-700/50 p-3 rounded-lg">
                            <LocationIcon className="h-6 w-6 text-gray-500 dark:text-gray-400" />
                            <div>
                                <p className="text-xs text-gray-500 dark:text-gray-400">Ubicación</p>
                                <p className="font-semibold truncate">{booking.field.city}</p>
                            </div>
                        </div>
                    </div>

                    {/* Extras Breakdown */}
                    {booking.selectedExtras && booking.selectedExtras.length > 0 && (
                        <div className="bg-slate-50 dark:bg-gray-700/50 p-4 rounded-lg">
                            <h4 className="font-bold text-sm mb-2 text-gray-700 dark:text-gray-300">Servicios Adicionales</h4>
                            <ul className="space-y-1 text-sm">
                                {booking.selectedExtras.map((extra, i) => (
                                    <li key={i} className="flex justify-between">
                                        <span>{extra.name} (x{extra.quantity})</span>
                                        <span className="font-medium">${(extra.price * extra.quantity).toLocaleString('es-CO')}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}

                    <BookingWeatherStatus weatherData={weatherData} selectedDate={booking.date} selectedTime={booking.time} />
                    
                    {/* Actions */}
                    <div className="border-t dark:border-gray-700 pt-6 space-y-3">
                        {canManageScore && (
                            <div>
                                <button
                                    onClick={() => setIsScorekeeperOpen(true)}
                                    disabled={!isMatchStarted}
                                    className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors shadow-md disabled:bg-gray-500 disabled:cursor-not-allowed"
                                >
                                    <ScoreboardIcon className="w-6 h-6"/>
                                    Administrar Marcador
                                </button>
                                {!isMatchStarted && (
                                    <p className="text-xs text-center text-gray-500 dark:text-gray-400 mt-2">
                                        El marcador se habilitará a la hora del partido.
                                    </p>
                                )}
                            </div>
                        )}

                        {showContractConfirmButton && (
                            <div className="mb-3">
                                <button
                                    onClick={() => onContractResponse?.(booking.id, 'confirm')}
                                    disabled={!isToday}
                                    title={!isToday ? "Solo puedes confirmar la asistencia el día del partido." : ""}
                                    className={`w-full flex items-center justify-center gap-2 font-bold py-3 px-6 rounded-lg transition-colors shadow-md ${
                                        isToday 
                                            ? 'bg-green-600 text-white hover:bg-green-700' 
                                            : 'bg-gray-200 text-gray-500 dark:bg-gray-700 dark:text-gray-400 cursor-not-allowed opacity-60'
                                    }`}
                                >
                                    <CheckBadgeIcon className="w-5 h-5"/>
                                    {isToday ? 'Confirmar Asistencia' : 'Confirmar (Solo el día del partido)'}
                                </button>
                            </div>
                        )}

                       {canCancel && (
                            <button onClick={() => setIsCancelModalOpen(true)} className="w-full bg-red-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-red-700 transition-colors shadow-md">
                                Cancelar Reserva
                            </button>
                       )}
                       {booking.status === 'cancelled' && (
                           <p className="text-center font-bold text-red-500 py-3 bg-red-100 dark:bg-red-900/50 rounded-lg">RESERVA CANCELADA</p>
                       )}
                       {booking.status === 'completed' && (
                           <p className="text-center font-bold text-green-500 py-3 bg-green-100 dark:bg-green-900/50 rounded-lg">PARTIDO FINALIZADO</p>
                       )}
                    </div>
                </div>
            </div>

            {isCancelModalOpen && (
                <ConfirmationModal
                    isOpen={isCancelModalOpen}
                    onClose={() => setIsCancelModalOpen(false)}
                    onConfirm={() => onCancelBooking(booking.id)}
                    title="¿Cancelar Reserva?"
                    message="Esta acción no se puede deshacer. Por favor, revisa las políticas de cancelación antes de continuar."
                    confirmButtonText="Sí, Cancelar"
                />
            )}
            {isScorekeeperOpen && (
                <ScorekeeperModal
                    booking={booking}
                    onClose={() => setIsScorekeeperOpen(false)}
                    onUpdateScore={onUpdateScore}
                    onFinalizeMatch={onFinalizeMatch}
                    currentTime={currentTime}
                />
            )}
        </div>
    );
};

export default BookingDetailView;
