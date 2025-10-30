

import React, { useState, useMemo } from 'react';
import { ChevronLeftIcon } from '../components/icons/ChevronLeftIcon';
import type { SoccerField, User, PaymentMethod, ConfirmedBooking, CardPaymentMethod, WalletPaymentMethod, PsePaymentMethod } from '../types';
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
    onConfirm: (bookingInfo: Omit<ConfirmedBooking, 'id' | 'status' | 'userId' | 'userName' | 'userPhone'>) => void;
    onBack: () => void;
    isBookingLoading: boolean;
}

const PaymentMethodItem: React.FC<{ method: PaymentMethod | { id: 'cash' }, selected: boolean, onSelect: () => void }> = ({ method, selected, onSelect }) => {
    // Fix: Use type guards to correctly handle different payment method types and avoid property access errors.
    const renderIcon = () => {
        if (!('type' in method)) { // Handles { id: 'cash' }
            return <CashIcon className="h-8 w-8 text-gray-600 dark:text-gray-300" />;
        }
        // It's a PaymentMethod
        switch (method.type) {
            case 'card':
                return <CardBrandIcon brand={method.brand} className="h-8 w-auto" />;
            case 'nequi':
                return <NequiIcon className="h-8 w-8" />;
            case 'daviplata':
                return <DaviplataIcon className="h-8 w-8" />;
            case 'pse':
                return <PseIcon className="h-8 w-8" />;
            default:
                return <CreditCardIcon className="h-8 w-8 text-gray-600 dark:text-gray-300" />;
        }
    };

    const renderLabel = () => {
        // Fix: Add a type guard for the 'cash' method to prevent runtime errors when accessing `method.type`.
        if (!('type' in method)) { // Handles { id: 'cash' }
            return { title: 'Pagar en el sitio', subtitle: 'Paga al llegar a la cancha' };
        }
        // It's a PaymentMethod
        switch (method.type) {
            case 'card':
                return { title: `${method.brand} **** ${method.last4}`, subtitle: `Vence ${method.expiryMonth}/${method.expiryYear}` };
            case 'nequi':
            case 'daviplata':
                return { title: method.type.charAt(0).toUpperCase() + method.type.slice(1), subtitle: `Celular ***${method.phoneNumber.slice(-4)}` };
            case 'pse':
                return { title: 'PSE', subtitle: method.accountHolderName };
            default:
                return { title: 'Método desconocido', subtitle: '' };
        }
    };

    const { title, subtitle } = renderLabel();

    return (
        <div 
            onClick={onSelect}
            className={`p-4 rounded-xl border-2 flex items-center gap-4 cursor-pointer transition-all ${selected ? 'border-[var(--color-primary-500)] bg-[var(--color-primary-50)] dark:bg-[var(--color-primary-900)]/50' : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700/50'}`}
        >
            <div className="flex-shrink-0">{renderIcon()}</div>
            <div className="flex-grow">
                <p className="font-semibold text-gray-800 dark:text-gray-200">{title}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">{subtitle}</p>
            </div>
            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${selected ? 'border-[var(--color-primary-600)]' : 'border-gray-300 dark:border-gray-500'}`}>
                {selected && <div className="w-2.5 h-2.5 bg-[var(--color-primary-600)] rounded-full"></div>}
            </div>
        </div>
    );
};


const Booking: React.FC<BookingProps> = ({ details, user, onConfirm, onBack, isBookingLoading }) => {
    const [extras, setExtras] = useState({ balls: 0, vests: 0 });
    const defaultPaymentMethod = user.paymentMethods?.find(pm => pm.isDefault)?.id || 'cash';
    const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string>(defaultPaymentMethod);
    const [paymentInfo, setPaymentInfo] = useState({ cardNumber: '', expiry: '', cvc: '', name: '' });
    const [policiesAccepted, setPoliciesAccepted] = useState(false);
    const [useFreeTicket, setUseFreeTicket] = useState(false);

    const fieldId = details.field.id;
    const freeTicketsForField = user.loyalty?.[fieldId]?.freeTickets || 0;

    const isCardFormValid = useMemo(() => {
        return paymentInfo.name.trim() !== '' &&
               paymentInfo.cardNumber.replace(/\s/g, '').length >= 14 &&
               paymentInfo.expiry.trim().match(/^(0[1-9]|1[0-2])\s?\/\s?\d{2}$/) &&
               paymentInfo.cvc.trim().length >= 3;
    }, [paymentInfo]);

    const ballPrice = 5000;
    const vestPrice = 10000;
    const totalExtras = (extras.balls * ballPrice) + (extras.vests * vestPrice);
    const totalPrice = useFreeTicket ? 0 : details.field.pricePerHour + totalExtras;
    
    // FIX: Sanitize input value to remove non-digit characters for numeric fields.
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        // FIX: Corrected object destructuring syntax from 'of' to '='.
        const { name, value } = e.target;
        if (name === 'cardNumber' || name === 'cvc') {
            const sanitizedValue = value.replace(/[^\d]/g, "");
            setPaymentInfo(prev => ({ ...prev, [name]: sanitizedValue }));
        } else {
            setPaymentInfo(prev => ({ ...prev, [name]: value }));
        }
    };
    
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const effectivePaymentMethod = useFreeTicket ? 'ticket' : selectedPaymentMethod;
        const isNewCardPayment = effectivePaymentMethod === 'new_card';

        if (!policiesAccepted || (isNewCardPayment && !isCardFormValid)) return;
        
        const confirmedDetails: Omit<ConfirmedBooking, 'id' | 'status' | 'userId' | 'userName' | 'userPhone'> = { 
            ...details, 
            extras, 
            totalPrice, 
            paymentMethod: effectivePaymentMethod,
            isFree: useFreeTicket,
            loyaltyApplied: useFreeTicket ? true : undefined,
        };
        onConfirm(confirmedDetails);
    };

    const isConfirmButtonDisabled = !policiesAccepted || (!useFreeTicket && selectedPaymentMethod === 'new_card' && !isCardFormValid) || isBookingLoading;

    return (
        <div>
            <button onClick={onBack} className="flex items-center gap-2 text-[var(--color-primary-600)] dark:text-[var(--color-primary-500)] font-semibold mb-6 hover:underline">
                <ChevronLeftIcon className="h-5 w-5" />
                Cambiar Selección
            </button>
            <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-8">Confirmar Reserva</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-12">
                {/* Payment & Extras */}
                <div className="lg:col-span-3">
                    <form onSubmit={handleSubmit} className="space-y-8">
                         <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg dark:border dark:border-gray-700">
                            <h3 className="text-xl font-bold mb-4">Servicios Adicionales</h3>
                            <div className="space-y-4">
                                <div className="flex justify-between items-center">
                                    <div>
                                        <p className="font-semibold">Balones Adicionales</p>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">${ballPrice.toLocaleString('es-CO')} c/u</p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <button type="button" onClick={() => setExtras(p => ({...p, balls: Math.max(0, p.balls - 1)}))} className="w-8 h-8 rounded-full border dark:border-gray-600 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600">-</button>
                                        <span className="w-8 text-center font-semibold">{extras.balls}</span>
                                        <button type="button" onClick={() => setExtras(p => ({...p, balls: p.balls + 1}))} className="w-8 h-8 rounded-full border dark:border-gray-600 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600">+</button>
                                    </div>
                                </div>
                                <div className="flex justify-between items-center">
                                    <div>
                                        <p className="font-semibold">Juego de Petos (10 und)</p>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">${vestPrice.toLocaleString('es-CO')} c/u</p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <button type="button" onClick={() => setExtras(p => ({...p, vests: Math.max(0, p.vests - 1)}))} className="w-8 h-8 rounded-full border dark:border-gray-600 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600">-</button>
                                        <span className="w-8 text-center font-semibold">{extras.vests}</span>
                                        <button type="button" onClick={() => setExtras(p => ({...p, vests: p.vests + 1}))} className="w-8 h-8 rounded-full border dark:border-gray-600 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600">+</button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {freeTicketsForField > 0 && details.field.loyaltyEnabled && (
                            <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg dark:border dark:border-gray-700">
                                <div className="flex justify-between items-center">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-lg bg-green-100 dark:bg-green-900/50 flex items-center justify-center text-green-600 dark:text-green-400">
                                            <span className="text-2xl">🎟️</span>
                                        </div>
                                        <div>
                                            <h3 className="font-bold">Tienes {freeTicketsForField} cancha{freeTicketsForField > 1 ? 's' : ''} gratis para {details.field.name}</h3>
                                            <p className="text-sm text-gray-500 dark:text-gray-400">¿Quieres usar un ticket para esta reserva?</p>
                                        </div>
                                    </div>
                                    <button
                                        type="button"
                                        className={`${
                                            useFreeTicket ? 'bg-green-600' : 'bg-gray-200 dark:bg-gray-600'
                                        } relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2`}
                                        role="switch"
                                        aria-checked={useFreeTicket}
                                        onClick={() => setUseFreeTicket(!useFreeTicket)}
                                    >
                                        <span className={`${
                                            useFreeTicket ? 'translate-x-5' : 'translate-x-0'
                                        } pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out`}
                                        />
                                    </button>
                                </div>
                            </div>
                        )}
                        
                        {!useFreeTicket && (
                            <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg dark:border dark:border-gray-700">
                                <h3 className="text-xl font-bold mb-4">Método de Pago</h3>
                                <div className="space-y-3">
                                    {user.paymentMethods?.map(method => (
                                        <PaymentMethodItem key={method.id} method={method} selected={selectedPaymentMethod === method.id} onSelect={() => setSelectedPaymentMethod(method.id)} />
                                    ))}
                                    <PaymentMethodItem method={{id: 'cash'}} selected={selectedPaymentMethod === 'cash'} onSelect={() => setSelectedPaymentMethod('cash')} />
                                    <div onClick={() => setSelectedPaymentMethod('new_card')} className={`p-4 rounded-xl border-2 flex items-center gap-4 cursor-pointer transition-all ${selectedPaymentMethod === 'new_card' ? 'border-[var(--color-primary-500)] bg-[var(--color-primary-50)] dark:bg-[var(--color-primary-900)]/50' : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700/50'}`}>
                                        <div className="flex-shrink-0"><CreditCardIcon className="h-8 w-8 text-gray-600 dark:text-gray-300" /></div>
                                        <div className="flex-grow"><p className="font-semibold text-gray-800 dark:text-gray-200">Pagar con nueva tarjeta</p></div>
                                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${selectedPaymentMethod === 'new_card' ? 'border-[var(--color-primary-600)]' : 'border-gray-300 dark:border-gray-500'}`}>
                                            {selectedPaymentMethod === 'new_card' && <div className="w-2.5 h-2.5 bg-[var(--color-primary-600)] rounded-full"></div>}
                                        </div>
                                    </div>
                                </div>

                                {selectedPaymentMethod === 'new_card' && (
                                    <div className="mt-6 space-y-4 border-t dark:border-gray-700 pt-6">
                                        <h4 className="font-semibold">Información de la nueva tarjeta</h4>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Nombre en la tarjeta</label>
                                            <input type="text" name="name" value={paymentInfo.name} onChange={handleInputChange} className="mt-1 block w-full border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-[var(--color-primary-500)] focus:border-[var(--color-primary-500)] bg-white dark:bg-gray-700" required/>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Número de la tarjeta</label>
                                            <input type="text" name="cardNumber" value={paymentInfo.cardNumber} onChange={handleInputChange} placeholder="0000 0000 0000 0000" className="mt-1 block w-full border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-[var(--color-primary-500)] focus:border-[var(--color-primary-500)] bg-white dark:bg-gray-700" required/>
                                        </div>
                                        <div className="flex gap-4">
                                            <div className="flex-1">
                                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Vencimiento</label>
                                                <input type="text" name="expiry" value={paymentInfo.expiry} onChange={handleInputChange} placeholder="MM / AA" className="mt-1 block w-full border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-[var(--color-primary-500)] focus:border-[var(--color-primary-500)] bg-white dark:bg-gray-700" required/>
                                            </div>
                                            <div className="flex-1">
                                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">CVC</label>
                                                <input type="text" name="cvc" value={paymentInfo.cvc} onChange={handleInputChange} placeholder="123" className="mt-1 block w-full border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-[var(--color-primary-500)] focus:border-[var(--color-primary-500)] bg-white dark:bg-gray-700" required/>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}


                        <div className="mt-6 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                            <div className="flex items-start">
                                <div className="flex h-5 items-center">
                                    <input id="policies" name="policies" type="checkbox" checked={policiesAccepted} onChange={(e) => setPoliciesAccepted(e.target.checked)} className="h-4 w-4 rounded border-gray-300 dark:border-gray-600 text-[var(--color-primary-600)] focus:ring-[var(--color-primary-500)] bg-white dark:bg-gray-700" />
                                </div>
                                <div className="ml-3 text-sm">
                                    <label htmlFor="policies" className="font-medium text-gray-700 dark:text-gray-300">He leído y acepto las políticas de cancelación y pago.</label>
                                    <p className="text-gray-500 dark:text-gray-400 mt-1">Solo puedes cancelar la reserva si faltan más de 6 horas para empezar.</p>
                                </div>
                            </div>
                        </div>

                        <button type="submit" disabled={isConfirmButtonDisabled} className="w-full bg-[var(--color-primary-600)] text-white font-bold py-3 rounded-lg hover:bg-[var(--color-primary-700)] transition-transform transform hover:scale-105 mt-8 disabled:bg-gray-400 disabled:cursor-not-allowed disabled:transform-none shadow-md hover:shadow-lg flex items-center justify-center">
                            {isBookingLoading ? (
                                <>
                                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Procesando...
                                </>
                            ) : (
                                useFreeTicket ? 'Confirmar con Ticket Gratis' : (selectedPaymentMethod === 'cash' ? 'Confirmar Reserva' : `Pagar ${totalPrice.toLocaleString('es-CO', {style: 'currency', currency: 'COP', minimumFractionDigits: 0})}`)
                            )}
                        </button>
                    </form>
                </div>
                {/* Order Summary */}
                <div className="lg:col-span-2">
                     <div className="sticky top-24 bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-lg dark:border dark:border-gray-700">
                        <h2 className="text-2xl font-bold border-b dark:border-gray-700 pb-4 mb-4">Resumen de tu Reserva</h2>
                        <div className="space-y-4">
                            <img src={details.field.images[0]} alt={details.field.name} className="rounded-lg w-full h-40 object-cover mb-4"/>
                            <div>
                                <p className="text-sm text-gray-500 dark:text-gray-400">Cancha</p>
                                <p className="font-semibold text-lg">{details.field.name}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500 dark:text-gray-400">Fecha y Hora</p>
                                <p className="font-semibold text-lg">{details.date.toLocaleDateString('es-CO', { weekday: 'long', day: 'numeric', month: 'long' })} a las {details.time}</p>
                            </div>
                            <div className="border-t dark:border-gray-700 pt-4 space-y-2">
                                <div className="flex justify-between">
                                    <p>Reserva de cancha (1 hora)</p>
                                    <p className={`font-medium ${useFreeTicket ? 'line-through' : ''}`}>${details.field.pricePerHour.toLocaleString('es-CO')}</p>
                                </div>
                                {extras.balls > 0 && <div className="flex justify-between text-gray-600 dark:text-gray-300">
                                    <p>Balones adicionales ({extras.balls})</p>
                                    <p className="font-medium">${(extras.balls * ballPrice).toLocaleString('es-CO')}</p>
                                </div>}
                                {extras.vests > 0 && <div className="flex justify-between text-gray-600 dark:text-gray-300">
                                    <p>Juego de petos ({extras.vests})</p>
                                    <p className="font-medium">${(extras.vests * vestPrice).toLocaleString('es-CO')}</p>
                                </div>}
                                {useFreeTicket && (
                                    <div className="flex justify-between text-green-600 dark:text-green-400">
                                        <p>Ticket de Fidelidad</p>
                                        <p className="font-medium">-${details.field.pricePerHour.toLocaleString('es-CO')}</p>
                                    </div>
                                )}
                            </div>
                            <div className="border-t-2 border-dashed dark:border-gray-600 pt-4 flex justify-between items-center">
                                <p className="text-xl font-bold">Total</p>
                                <p className="text-2xl font-bold text-[var(--color-primary-600)] dark:text-[var(--color-primary-500)]">${totalPrice.toLocaleString('es-CO')}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Booking;