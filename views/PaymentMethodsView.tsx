
import React, { useState } from 'react';
import type { User, PaymentMethod, PaymentMethodType, CardBrand, CardPaymentMethod, WalletPaymentMethod, PsePaymentMethod } from '../types';
import { ChevronLeftIcon } from '../components/icons/ChevronLeftIcon';
import { CreditCardIcon } from '../components/icons/CreditCardIcon';
import { NequiIcon } from '../components/icons/NequiIcon';
import { DaviplataIcon } from '../components/icons/DaviplataIcon';
import { PseIcon } from '../components/icons/PseIcon';
import { CardBrandIcon } from '../components/icons/CardBrandIcon';
import { TrashIcon } from '../components/icons/TrashIcon';
import { PlusIcon } from '../components/icons/PlusIcon';
import { CheckBadgeIcon } from '../components/icons/CheckBadgeIcon';
import ConfirmationModal from '../components/ConfirmationModal';
import { XIcon } from '../components/icons/XIcon';

interface PaymentMethodsViewProps {
    user: User;
    onBack: () => void;
    onAddPaymentMethod: (method: Omit<PaymentMethod, 'id' | 'isDefault'>) => void;
    onDeletePaymentMethod: (methodId: string) => void;
    onSetDefaultPaymentMethod: (methodId: string) => void;
}

const AddPaymentMethodForm: React.FC<{
    type: PaymentMethodType;
    onSave: (method: Omit<PaymentMethod, 'id' | 'isDefault'>) => void;
    onCancel: () => void;
}> = ({ type, onSave, onCancel }) => {
    const [cardData, setCardData] = useState({ number: '', name: '', expiry: '', cvc: '' });
    const [walletData, setWalletData] = useState({ phoneNumber: '' });
    
    const handleSave = () => {
        switch (type) {
            case 'card':
                // Basic validation
                if (cardData.number.length < 15 || cardData.name.trim() === '' || cardData.expiry.length < 5 || cardData.cvc.length < 3) return;
                const brand: CardBrand = cardData.number.startsWith('4') ? 'Visa' : cardData.number.startsWith('5') ? 'Mastercard' : 'Otro';
                const newCardMethod: Omit<CardPaymentMethod, 'id' | 'isDefault'> = {
                    type: 'card',
                    brand: brand,
                    last4: cardData.number.slice(-4),
                    expiryMonth: cardData.expiry.slice(0, 2),
                    expiryYear: cardData.expiry.slice(-2),
                };
                onSave(newCardMethod);
                break;
            case 'nequi':
            case 'daviplata':
                if (walletData.phoneNumber.length < 10) return;
                const newWalletMethod: Omit<WalletPaymentMethod, 'id' | 'isDefault'> = {
                    type,
                    phoneNumber: walletData.phoneNumber,
                };
                onSave(newWalletMethod);
                break;
            // PSE would be more complex, mocking it for now.
            case 'pse':
                const newPseMethod: Omit<PsePaymentMethod, 'id' | 'isDefault'> = {
                    type: 'pse',
                    accountHolderName: 'Usuario de Prueba',
                };
                onSave(newPseMethod);
                break;
        }
    };
    
    const renderForm = () => {
        switch (type) {
            case 'card':
                return (
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium">Nombre en la tarjeta</label>
                            <input type="text" value={cardData.name} onChange={e => setCardData(p => ({...p, name: e.target.value}))} className="mt-1 block w-full border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700"/>
                        </div>
                        <div>
                            <label className="block text-sm font-medium">Número de la tarjeta</label>
                            <input type="text" value={cardData.number} onChange={e => setCardData(p => ({...p, number: e.target.value}))} className="mt-1 block w-full border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700"/>
                        </div>
                        <div className="flex gap-4">
                            <div className="flex-1">
                                <label className="block text-sm font-medium">Vencimiento (MM/AA)</label>
                                <input type="text" value={cardData.expiry} onChange={e => setCardData(p => ({...p, expiry: e.target.value}))} className="mt-1 block w-full border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700"/>
                            </div>
                            <div className="flex-1">
                                <label className="block text-sm font-medium">CVC</label>
                                <input type="text" value={cardData.cvc} onChange={e => setCardData(p => ({...p, cvc: e.target.value}))} className="mt-1 block w-full border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700"/>
                            </div>
                        </div>
                    </div>
                );
             case 'nequi':
             case 'daviplata':
                return (
                    <div>
                        <label className="block text-sm font-medium">Número de celular</label>
                        <input type="tel" value={walletData.phoneNumber} onChange={e => {
                                const value = e.target.value;
                                if (value === '' || /^\d*$/.test(value)) {
                                    setWalletData(p => ({...p, phoneNumber: value}));
                                }
                            }} className="mt-1 block w-full border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700"/>
                    </div>
                );
            case 'pse': return <p>La vinculación de PSE se realizaría a través de su plataforma.</p>;
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={onCancel}>
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-md m-4 p-6" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-2xl font-bold">Agregar {type.charAt(0).toUpperCase() + type.slice(1)}</h3>
                    <button onClick={onCancel} className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"><XIcon className="w-6 h-6"/></button>
                </div>
                {renderForm()}
                <div className="mt-6 flex justify-end gap-3">
                    <button onClick={onCancel} className="py-2 px-5 rounded-lg font-semibold bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600">Cancelar</button>
                    <button onClick={handleSave} className="py-2 px-5 rounded-lg font-semibold bg-[var(--color-primary-600)] text-white hover:bg-[var(--color-primary-700)] shadow-sm">Guardar</button>
                </div>
            </div>
        </div>
    );
};


const PaymentMethodsView: React.FC<PaymentMethodsViewProps> = ({ user, onBack, onAddPaymentMethod, onDeletePaymentMethod, onSetDefaultPaymentMethod }) => {
    const [isAdding, setIsAdding] = useState<PaymentMethodType | null>(null);
    const [methodToDelete, setMethodToDelete] = useState<string | null>(null);
    
    const handleSaveNewMethod = (method: Omit<PaymentMethod, 'id' | 'isDefault'>) => {
        onAddPaymentMethod(method);
        setIsAdding(null);
    };

    return (
        <div className="space-y-8 pb-24 md:pb-4">
            <button onClick={onBack} className="flex items-center gap-2 text-[var(--color-primary-600)] dark:text-[var(--color-primary-500)] font-semibold hover:underline">
                <ChevronLeftIcon className="h-5 w-5" />
                Volver al Perfil
            </button>
            <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-100">Métodos de Pago</h1>
            
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border dark:border-gray-700 space-y-4">
                <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200">Mis Métodos</h2>
                {user.paymentMethods && user.paymentMethods.length > 0 ? (
                    user.paymentMethods.map(method => (
                        <div key={method.id} className="p-4 rounded-lg border dark:border-gray-700 flex items-center gap-4">
                            <div className="flex-shrink-0">
                                {method.type === 'card' && <CardBrandIcon brand={method.brand} className="h-8 w-auto"/>}
                                {method.type === 'nequi' && <NequiIcon className="h-8 w-8"/>}
                                {method.type === 'daviplata' && <DaviplataIcon className="h-8 w-8"/>}
                                {method.type === 'pse' && <PseIcon className="h-8 w-8"/>}
                            </div>
                            <div className="flex-grow">
                                <p className="font-semibold">
                                    {method.type === 'card' && `${method.brand} terminada en ${method.last4}`}
                                    {method.type === 'nequi' && `Nequi ***${method.phoneNumber.slice(-4)}`}
                                    {method.type === 'daviplata' && `Daviplata ***${method.phoneNumber.slice(-4)}`}
                                    {method.type === 'pse' && `PSE - ${method.accountHolderName}`}
                                </p>
                                {method.isDefault && <span className="text-xs font-bold text-green-600 dark:text-green-500 flex items-center gap-1"><CheckBadgeIcon className="w-4 h-4"/> Predeterminado</span>}
                            </div>
                            {!method.isDefault && (
                                <button onClick={() => onSetDefaultPaymentMethod(method.id)} className="text-sm font-semibold text-[var(--color-primary-600)] dark:text-[var(--color-primary-500)] hover:underline">Usar como principal</button>
                            )}
                             <button onClick={() => setMethodToDelete(method.id)} className="text-gray-400 hover:text-red-500 p-1 rounded-full"><TrashIcon className="w-5 h-5"/></button>
                        </div>
                    ))
                ) : (
                    <p className="text-gray-500 dark:text-gray-400 text-center py-8">No tienes métodos de pago guardados.</p>
                )}
            </div>

            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border dark:border-gray-700">
                <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200 mb-4">Agregar Nuevo Método</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <button onClick={() => setIsAdding('card')} className="flex flex-col items-center gap-2 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 border dark:border-transparent hover:border-[var(--color-primary-500)] transition-colors"><CreditCardIcon className="w-8 h-8"/> <span className="font-semibold">Tarjeta</span></button>
                    <button onClick={() => setIsAdding('nequi')} className="flex flex-col items-center gap-2 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 border dark:border-transparent hover:border-[var(--color-primary-500)] transition-colors"><NequiIcon className="w-8 h-8"/> <span className="font-semibold">Nequi</span></button>
                    <button onClick={() => setIsAdding('daviplata')} className="flex flex-col items-center gap-2 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 border dark:border-transparent hover:border-[var(--color-primary-500)] transition-colors"><DaviplataIcon className="w-8 h-8"/> <span className="font-semibold">Daviplata</span></button>
                    <button onClick={() => setIsAdding('pse')} className="flex flex-col items-center gap-2 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 border dark:border-transparent hover:border-[var(--color-primary-500)] transition-colors"><PseIcon className="w-8 h-8"/> <span className="font-semibold">PSE</span></button>
                </div>
            </div>

            {isAdding && <AddPaymentMethodForm type={isAdding} onSave={handleSaveNewMethod} onCancel={() => setIsAdding(null)} />}

            <ConfirmationModal
                isOpen={!!methodToDelete}
                onClose={() => setMethodToDelete(null)}
                onConfirm={() => { if(methodToDelete) onDeletePaymentMethod(methodToDelete); }}
                title="Eliminar método de pago"
                message="¿Estás seguro de que quieres eliminar este método de pago? Esta acción no se puede deshacer."
                confirmButtonText="Sí, eliminar"
            />
        </div>
    );
};

export default PaymentMethodsView;