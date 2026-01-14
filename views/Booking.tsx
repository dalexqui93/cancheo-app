import React, { useState, useMemo } from 'react';
import { ChevronLeftIcon } from '../components/icons/ChevronLeftIcon';
import type { SoccerField, User, PaymentMethod, ConfirmedBooking, CardPaymentMethod, WalletPaymentMethod, PsePaymentMethod, Team, FieldExtra } from '../types';
import { CreditCardIcon } from '../components/icons/CreditCardIcon';
import { CashIcon } from '../components/icons/CashIcon';
import { CardBrandIcon } from '../components/icons/CardBrandIcon';
import { NequiIcon } from '../components/icons/NequiIcon';
import { DaviplataIcon } from '../components/icons/DaviplataIcon';
import { PseIcon } from '../components/icons/PseIcon';

interface BookingProps {
    details: {
        field: SoccerField;
        time: string;
        date: Date;
    };
    user: User;
    allTeams: Team[];
    onConfirm: (bookingInfo: Omit<ConfirmedBooking, 'id' | 'status' | 'userId' | 'userName' | 'userPhone'>) => void;
    onBack: () => void;
    isBookingLoading: boolean;
}

const PaymentMethodItem: React.FC<{ method: PaymentMethod | { id: 'cash' }, selected: boolean, onSelect: () => void }> = ({ method, selected, onSelect }) => {
    const renderIcon = () => {
        if (!('type' in method)) {
            return <CashIcon className="h-8 w-8 text-textMuted" />;
        }
        switch (method.type) {
            case 'card': return <CardBrandIcon brand={method.brand} className="h-8 w-auto" />;
            case 'nequi': return <NequiIcon className="h-8 w-8" />;
            case 'daviplata': return <DaviplataIcon className="h-8 w-8" />;
            case 'pse': return <PseIcon className="h-8 w-8" />;
            default: return <CreditCardIcon className="h-8 w-8 text-textMuted" />;
        }
    };

    const renderLabel = () => {
        if (!('type' in method)) {
            return { title: 'Pagar en el sitio', subtitle: 'Efectivo o datáfono local' };
        }
        switch (method.type) {
            case 'card': return { title: `${method.brand} •••• ${method.last4}`, subtitle: `Vence ${method.expiryMonth}/${method.expiryYear}` };
            case 'nequi':
            case 'daviplata': return { title: method.type.charAt(0).toUpperCase() + method.type.slice(1), subtitle: `Cel: ***${method.phoneNumber.slice(-4)}` };
            case 'pse': return { title: 'PSE', subtitle: method.accountHolderName };
            default: return { title: 'Método desconocido', subtitle: '' };
        }
    };

    const { title, subtitle } = renderLabel();

    return (
        <div 
            onClick={onSelect}
            className={`p-5 rounded-3xl border-2 flex items-center gap-4 cursor-pointer transition-all active:scale-[0.98] ${
                selected 
                ? 'border-brand bg-primary-50 shadow-sm' 
                : 'border-bgMain bg-white hover:border-brand/20'
            }`}
        >
            <div className="flex-shrink-0">{renderIcon()}</div>
            <div className="flex-grow min-w-0">
                <p className={`font-bold text-sm truncate ${selected ? 'text-textMain' : 'text-textMain'}`}>{title}</p>
                <p className="text-xs text-textMuted truncate">{subtitle}</p>
            </div>
            <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${selected ? 'border-brand bg-brand' : 'border-gray-200'}`}>
                {selected && <div className="w-2 h-2 bg-white rounded-full"></div>}
            </div>
        </div>
    );
};


const Booking: React.FC<BookingProps> = ({ details, user, allTeams, onConfirm, onBack, isBookingLoading }) => {
    const [selectedExtras, setSelectedExtras] = useState<Record<string, number>>({});
    const defaultPaymentMethod = user.paymentMethods?.find(pm => pm.isDefault)?.id || 'cash';
    const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string>(defaultPaymentMethod);
    const [paymentInfo, setPaymentInfo] = useState({ cardNumber: '', expiry: '', cvc: '', name: '' });
    const [policiesAccepted, setPoliciesAccepted] = useState(false);
    const [useFreeTicket, setUseFreeTicket] = useState(false);
    const [teamName, setTeamName] = useState(() => {
        if (user.teamIds && user.teamIds.length > 0) {
            const userTeam = allTeams.find(team => team.id === user.teamIds[0]);
            return userTeam ? userTeam.name : '';
        }
        return '';
    });
    const [rivalName, setRivalName] = useState('');

    const fieldId = details.field.id;
    const freeTicketsForField = user.loyalty?.[fieldId]?.freeTickets || 0;
    const availableExtras = details.field.extras || [];

    const extrasCost = availableExtras.reduce((sum, extra) => {
        const quantity = selectedExtras[extra.id] || 0;
        return sum + (quantity * extra.price);
    }, 0);

    const totalPrice = useFreeTicket ? 0 : details.field.pricePerHour + extrasCost;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!policiesAccepted) return;
        
        const finalExtras = availableExtras
            .filter(extra => selectedExtras[extra.id] && selectedExtras[extra.id] > 0)
            .map(extra => ({
                extraId: extra.id,
                name: extra.name,
                price: extra.price,
                quantity: selectedExtras[extra.id]
            }));

        onConfirm({
            ...details,
            selectedExtras: finalExtras,
            totalPrice,
            paymentMethod: useFreeTicket ? 'ticket' : selectedPaymentMethod,
            isFree: useFreeTicket,
            loyaltyApplied: !!useFreeTicket,
            ...(teamName.trim() && { teamName: teamName.trim() }),
            ...(rivalName.trim() && { rivalName: rivalName.trim() }),
        });
    };

    return (
        <div className="bg-bgMain min-h-screen pb-40 animate-reveal">
            <div className="px-4 py-6">
                <button onClick={onBack} className="flex items-center gap-2 text-textMuted font-bold mb-6 active:scale-95 transition-transform">
                    <ChevronLeftIcon className="h-5 w-5" />
                    Volver
                </button>
                
                <h1 className="text-3xl font-black text-textMain tracking-tighter mb-8 px-1">Confirmación</h1>

                <div className="space-y-6">
                    {/* Summary Item Card */}
                    <div className="bg-white rounded-4xl p-5 shadow-premium border border-white flex gap-4 items-center">
                        <div className="w-20 h-20 rounded-3xl overflow-hidden flex-shrink-0">
                            <img src={details.field.images[0]} className="w-full h-full object-cover" />
                        </div>
                        <div className="flex-grow min-w-0">
                            <h3 className="font-bold text-textMain truncate">{details.field.name}</h3>
                            <p className="text-xs text-textMuted font-medium mt-1">
                                {details.date.toLocaleDateString('es-CO', { weekday: 'long', day: 'numeric', month: 'short' })} • {details.time}
                            </p>
                            <p className="text-brand font-black mt-1 text-sm">${details.field.pricePerHour.toLocaleString()}</p>
                        </div>
                    </div>

                    {/* Team Details (Optional) */}
                    <div className="bg-white rounded-4xl p-6 shadow-premium border border-white">
                        <h3 className="font-black text-sm uppercase tracking-widest text-textMuted mb-4">Ajustes del partido</h3>
                        <div className="space-y-4">
                            <div className="flex flex-col gap-1">
                                <label className="text-xs font-bold text-textMain ml-1">Tu equipo</label>
                                <input
                                    type="text"
                                    value={teamName}
                                    onChange={(e) => setTeamName(e.target.value)}
                                    placeholder="Ej: Los Galácticos"
                                    className="ios-input text-sm font-semibold"
                                />
                            </div>
                            <div className="flex flex-col gap-1">
                                <label className="text-xs font-bold text-textMain ml-1">Equipo Rival</label>
                                <input
                                    type="text"
                                    value={rivalName}
                                    onChange={(e) => setRivalName(e.target.value)}
                                    placeholder="Ej: Retadores FC"
                                    className="ios-input text-sm font-semibold"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Payment Methods */}
                    <div className="bg-white rounded-4xl p-6 shadow-premium border border-white">
                        <h3 className="font-black text-sm uppercase tracking-widest text-textMuted mb-4">Método de pago</h3>
                        <div className="space-y-3">
                            {user.paymentMethods?.map(method => (
                                <PaymentMethodItem key={method.id} method={method} selected={selectedPaymentMethod === method.id} onSelect={() => setSelectedPaymentMethod(method.id)} />
                            ))}
                            <PaymentMethodItem method={{id: 'cash'}} selected={selectedPaymentMethod === 'cash'} onSelect={() => setSelectedPaymentMethod('cash')} />
                        </div>
                    </div>

                    {/* Policy Acceptance */}
                    <div className="px-2">
                        <label className="flex items-start gap-3 cursor-pointer group">
                            <input 
                                type="checkbox" 
                                checked={policiesAccepted} 
                                onChange={(e) => setPoliciesAccepted(e.target.checked)}
                                className="w-5 h-5 rounded-lg border-gray-300 text-brand focus:ring-brand mt-0.5"
                            />
                            <span className="text-xs text-textMuted leading-snug group-active:opacity-70 transition-opacity">
                                Acepto las políticas de cancelación (hasta 6h antes del evento para reembolso completo).
                            </span>
                        </label>
                    </div>
                </div>
            </div>

            {/* Final CTA Bar */}
            <div className="fixed bottom-0 left-0 right-0 p-6 z-40">
                <div className="container mx-auto max-w-md glass-footer p-5 rounded-5xl shadow-2xl space-y-4">
                    <div className="flex justify-between items-end px-2">
                        <span className="text-xs font-bold text-textMuted uppercase tracking-widest">Total a pagar</span>
                        <span className="text-3xl font-black text-textMain tracking-tighter">${totalPrice.toLocaleString()}</span>
                    </div>
                    <button
                        onClick={handleSubmit}
                        disabled={!policiesAccepted || isBookingLoading}
                        className={`w-full py-5 rounded-3xl font-black text-sm uppercase tracking-widest transition-all shadow-button active:scale-95 flex items-center justify-center gap-3 ${
                            policiesAccepted && !isBookingLoading
                            ? 'bg-brand text-white' 
                            : 'bg-gray-200 text-gray-400 cursor-not-allowed shadow-none'
                        }`}
                    >
                        {isBookingLoading ? (
                            <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                        ) : 'PAGAR Y FINALIZAR'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Booking;