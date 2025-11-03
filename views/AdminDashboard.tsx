
















import React, { useState, useMemo, useRef, useEffect } from 'react';
import type { SoccerField, ConfirmedBooking, Announcement, Notification, Service, User, FieldSize, OwnerApplication, OwnerStatus } from '../types';
import { DashboardIcon } from '../components/icons/DashboardIcon';
import { PitchIcon } from '../components/icons/PitchIcon';
import { ListBulletIcon } from '../components/icons/ListBulletIcon';
import { MegaphoneIcon } from '../components/icons/MegaphoneIcon';
import { CurrencyDollarIcon } from '../components/icons/CurrencyDollarIcon';
import { XIcon } from '../components/icons/XIcon';
import { PencilIcon } from '../components/icons/PencilIcon';
import { TrashIcon } from '../components/icons/TrashIcon';
import { PlusIcon } from '../components/icons/PlusIcon';
import { LocationIcon } from '../components/icons/LocationIcon';
import { LogoutIcon } from '../components/icons/LogoutIcon';
import ConfirmationModal from '../components/ConfirmationModal';
import { PhoneIcon } from '../components/icons/PhoneIcon';
import { WhatsappIcon } from '../components/icons/WhatsappIcon';
import { ChevronDownIcon } from '../components/icons/ChevronDownIcon';
import { IdentificationIcon } from '../components/icons/IdentificationIcon';
// Fix: Corrected import path from '../firebase' to '../database' to resolve module not found error.
import * as db from '../database';
import { SpinnerIcon } from '../components/icons/SpinnerIcon';
import { UserIcon } from '../components/icons/UserIcon';
import { TrophyIcon } from '../components/icons/TrophyIcon';


interface OwnerDashboardProps {
    user: User;
    fields: SoccerField[];
    setFields: React.Dispatch<React.SetStateAction<SoccerField[]>>;
    bookings: ConfirmedBooking[];
    setBookings: React.Dispatch<React.SetStateAction<ConfirmedBooking[]>>;
    announcements: Announcement[];
    setAnnouncements: React.Dispatch<React.SetStateAction<Announcement[]>>;
    addNotification: (notif: Omit<Notification, 'id' | 'timestamp'>) => void;
    onLogout: () => void;
    allUsers: User[];
    allFields: SoccerField[];
}

type OwnerView = 'dashboard' | 'fields' | 'bookings' | 'announcements';

// --- Sub-Views / Components ---

const StatCard: React.FC<{ title: string; value: string; icon: React.ReactNode }> = ({ title, value, icon }) => (
    <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border dark:border-gray-700 flex items-center gap-4">
        <div className="w-10 h-10 bg-[var(--color-primary-100)] dark:bg-[var(--color-primary-900)]/50 rounded-lg flex items-center justify-center text-[var(--color-primary-600)] dark:text-[var(--color-primary-400)]">
            {icon}
        </div>
        <div>
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{title}</p>
            <p className="text-xl font-bold text-gray-800 dark:text-gray-200">{value}</p>
        </div>
    </div>
);

const SimpleBarChart: React.FC<{ data: { label: string; value: number }[] }> = ({ data }) => {
    const maxValue = Math.max(...data.map(d => d.value), 1);
    return (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border dark:border-gray-700">
            <h3 className="font-bold text-lg mb-4 text-gray-800 dark:text-gray-100">Ingresos (Últimos 7 días)</h3>
            <div className="flex justify-around items-end h-40 gap-2">
                {data.map(({ label, value }) => (
                    <div key={label} className="flex flex-col items-center flex-1">
                        <div
                            className="w-full bg-[var(--color-primary-500)] hover:bg-[var(--color-primary-600)] rounded-t-md transition-all"
                            style={{ height: `${(value / maxValue) * 100}%` }}
                            title={`$${value.toLocaleString()}`}
                        />
                        <span className="text-xs text-gray-500 dark:text-gray-400 mt-2">{label}</span>
                    </div>
                ))}
            </div>
        </div>
    );
};

const TopCustomers: React.FC<{ topCustomers: [string, number][] }> = ({ topCustomers }) => (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border dark:border-gray-700">
        <h3 className="font-bold text-lg mb-4 text-gray-800 dark:text-gray-100">Top Clientes</h3>
        {topCustomers.length > 0 ? (
            <div className="space-y-3">
                {topCustomers.map(([name, count], index) => (
                    <div key={name} className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center font-bold text-white ${index === 0 ? 'bg-yellow-400' : index === 1 ? 'bg-gray-400' : 'bg-orange-400'}`}>
                            {index + 1}
                        </div>
                        <div className="flex-grow">
                            <p className="font-semibold text-gray-700 dark:text-gray-200">{name}</p>
                        </div>
                        <div className="font-bold text-gray-800 dark:text-gray-100">{count} <span className="text-sm font-normal text-gray-500 dark:text-gray-400">reservas</span></div>
                    </div>
                ))}
            </div>
        ) : (
            <p className="text-center text-sm text-gray-500 dark:text-gray-400 py-4">Aún no hay suficientes datos de reservas.</p>
        )}
    </div>
);


const DashboardHome: React.FC<{ bookings: ConfirmedBooking[], fields: SoccerField[] }> = ({ bookings, fields }) => {
    const { todayRevenue, upcomingBookingsCount } = useMemo(() => {
        const today = new Date();
        const todayStr = today.toISOString().split('T')[0];
        let todayRevenue = 0;
        let upcomingBookingsCount = 0;

        bookings.forEach(b => {
            const bookingDate = new Date(b.date);
            if (bookingDate.toISOString().split('T')[0] === todayStr) {
                todayRevenue += b.totalPrice;
            }
            if (bookingDate >= today && b.status === 'confirmed') {
                upcomingBookingsCount++;
            }
        });
        return { todayRevenue, upcomingBookingsCount };
    }, [bookings]);

     const chartData = useMemo(() => Array.from({ length: 7 }).map((_, i) => {
        const date = new Date();
        date.setDate(new Date().getDate() - (6 - i));
        const dateStr = date.toISOString().split('T')[0];
        const revenue = bookings
            .filter(b => new Date(b.date).toISOString().split('T')[0] === dateStr)
            .reduce((sum, b) => sum + b.totalPrice, 0);
        return { label: date.toLocaleDateString('es-CO', { weekday: 'short' }), value: revenue };
    }), [bookings]);

    const topCustomers = useMemo(() => {
        const customerCounts: { [key: string]: number } = bookings.reduce((acc, booking) => {
            if (booking.status === 'confirmed') {
                acc[booking.userName] = (acc[booking.userName] || 0) + 1;
            }
            return acc;
        }, {} as Record<string, number>);
        return Object.entries(customerCounts)
            .sort(([, a], [, b]) => b - a)
            .slice(0, 3); // Top 3
    }, [bookings]);

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
                <StatCard title="Ingresos Hoy" value={`$${todayRevenue.toLocaleString()}`} icon={<CurrencyDollarIcon className="w-6 h-6" />} />
                <StatCard title="Próximas" value={String(upcomingBookingsCount)} icon={<ListBulletIcon className="w-6 h-6" />} />
                <StatCard title="Ocupación" value="68%" icon={<PitchIcon className="w-6 h-6" />} />
                <StatCard title="Canchas" value={String(fields.length)} icon={<PitchIcon className="w-6 h-6" />} />
            </div>
            <SimpleBarChart data={chartData} />
            <TopCustomers topCustomers={topCustomers} />
        </div>
    );
};

const ComplexEditorModal: React.FC<{ 
    complex: {
        complexId: string;
        name: string;
        address: string;
        city: string;
        department?: string;
        description: string;
        images: string[];
        services: Service[];
        fields: SoccerField[];
    } | null; 
    onClose: () => void; 
    onSave: (data: any) => Promise<void>;
    addNotification: (notif: Omit<Notification, 'id' | 'timestamp'>) => void;
}> = ({ complex, onClose, onSave, addNotification }) => {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isSaving, setIsSaving] = useState(false);
    const [isLocating, setIsLocating] = useState(false);
    const [formData, setFormData] = useState({
        complexId: complex?.complexId || `complex-${Date.now()}`,
        name: complex?.name || '',
        address: complex?.address || '',
        city: complex?.city || '',
        department: complex?.department || '',
        description: complex?.description || '',
        images: complex?.images || [],
        services: complex?.services.map(s => s.name) || [],
        latitude: complex?.fields[0]?.latitude || null,
        longitude: complex?.fields[0]?.longitude || null,
        subFields: complex?.fields.map(f => ({
            id: f.id,
            name: f.name.includes(' - ') ? f.name.split(' - ').slice(1).join(' - ') : f.name,
            size: f.size,
            pricePerHour: f.pricePerHour,
            loyaltyEnabled: f.loyaltyEnabled,
            loyaltyGoal: f.loyaltyGoal,
            availableSlots: f.availableSlots || { mañana: [], tarde: [], noche: [] },
        })) || [],
    });
    const [formErrors, setFormErrors] = useState<{ name?: string; images?: string; subFields?: string; subFieldErrorIndex?: number | null; subFieldErrorField?: 'name' | 'price' | 'loyalty' | 'slots' | null }>({});
    const [openSubFieldIndex, setOpenSubFieldIndex] = useState<number | null>(0);
    const availableServices: Service[] = [
        { name: 'Arbitraje', icon: '🧑‍⚖️' },
        { name: 'Balones', icon: '⚽' },
        { name: 'Cafetería', icon: '☕' },
        { name: 'Escuela', icon: '🎓' },
        { name: 'Grabación', icon: '🎥' },
        { name: 'Graderías', icon: '🏟️' },
        { name: 'Parqueadero', icon: '🅿️' },
        { name: 'Tienda', icon: '🏪' },
        { name: 'Vestuarios', icon: '👕' },
    ];
    const allTimes = {
        mañana: ['08:00', '09:00', '10:00', '11:00'],
        tarde: ['12:00', '13:00', '14:00', '15:00', '16:00'],
        noche: ['17:00', '18:00', '19:00', '20:00', '21:00', '22:00'],
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubFieldChange = (index: number, e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        const newSubFields = [...formData.subFields];
        const field = newSubFields[index];
        if (type === 'checkbox') {
            (field as any)[name] = (e.target as HTMLInputElement).checked;
        } else if (type === 'number') {
            (field as any)[name] = Number(value);
        } else {
            (field as any)[name] = value;
        }
        setFormData(prev => ({ ...prev, subFields: newSubFields }));
    };

    const handleAddTimeSlot = (index: number, period: 'mañana' | 'tarde' | 'noche', time: string) => {
        const newSubFields = [...formData.subFields];
        const field = newSubFields[index];
        if (!field.availableSlots) field.availableSlots = { mañana: [], tarde: [], noche: [] };
        
        const currentSlots = field.availableSlots[period];
        if(currentSlots.includes(time)) {
            field.availableSlots[period] = currentSlots.filter(t => t !== time);
        } else {
            field.availableSlots[period] = [...currentSlots, time].sort();
        }
        setFormData(prev => ({ ...prev, subFields: newSubFields }));
    };

    const addSubField = () => {
        setFormData(prev => ({
            ...prev,
            subFields: [
                ...prev.subFields,
                { id: `new-${Date.now()}`, name: '', size: '5v5', pricePerHour: 0, loyaltyEnabled: false, loyaltyGoal: 7, availableSlots: { mañana: [], tarde: [], noche: [] } }
            ]
        }));
        setOpenSubFieldIndex(formData.subFields.length);
    };

    const removeSubField = (index: number) => {
        setFormData(prev => ({
            ...prev,
            subFields: prev.subFields.filter((_, i) => i !== index)
        }));
    };
    
    const toggleService = (serviceName: string) => {
        setFormData(prev => ({
            ...prev,
            services: prev.services.includes(serviceName)
                ? prev.services.filter(s => s !== serviceName)
                : [...prev.services, serviceName]
        }));
    };
    
    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        if(e.target.files && e.target.files.length > 0){
            const file = e.target.files[0];
            const reader = new FileReader();
            reader.onloadend = () => {
                setFormData(prev => ({ ...prev, images: [reader.result as string, ...prev.images].slice(0, 5) }));
            }
            reader.readAsDataURL(file);
        }
    };
    
    const removeImage = (index: number) => {
        setFormData(prev => ({ ...prev, images: prev.images.filter((_, i) => i !== index) }));
    };

    const findCoordinates = async () => {
        setIsLocating(true);
        try {
            const response = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(formData.address + ', ' + formData.city)}&format=json&limit=1`);
            const data = await response.json();
            if (data && data.length > 0) {
                setFormData(prev => ({ ...prev, latitude: parseFloat(data[0].lat), longitude: parseFloat(data[0].lon) }));
                addNotification({type: 'success', title: 'Ubicación Encontrada', message: 'Coordenadas actualizadas.'});
            } else {
                addNotification({type: 'error', title: 'Ubicación no Encontrada', message: 'No se pudo encontrar las coordenadas. Por favor, ingrésalas manualmente.'});
            }
        } catch (error) {
            addNotification({type: 'error', title: 'Error de Red', message: 'No se pudo conectar al servicio de geolocalización.'});
            console.error("Error al buscar coordenadas:", error);
        } finally {
            setIsLocating(false);
        }
    };

    const validateForm = () => {
        const errors: typeof formErrors = {};
        if (!formData.name.trim()) {
            errors.name = "El nombre del complejo es obligatorio.";
        }
        if (formData.images.length === 0) {
            errors.images = "Debes subir al menos una imagen.";
        }
        if (formData.subFields.length === 0) {
            errors.subFields = "Debes agregar al menos una cancha.";
        } else {
            formData.subFields.forEach((field, index) => {
                if (!field.name.trim()) {
                    errors.subFieldErrorIndex = index;
                    errors.subFieldErrorField = 'name';
                    errors.subFields = "El nombre de la cancha es obligatorio.";
                } else if (!field.pricePerHour || field.pricePerHour <= 0) {
                     errors.subFieldErrorIndex = index;
                    errors.subFieldErrorField = 'price';
                    errors.subFields = "El precio debe ser mayor a cero.";
                } else if (field.loyaltyEnabled && (!field.loyaltyGoal || field.loyaltyGoal <= 0)) {
                    errors.subFieldErrorIndex = index;
                    errors.subFieldErrorField = 'loyalty';
                    errors.subFields = "El objetivo de fidelidad debe ser mayor a cero.";
                }
            });
        }
        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleFormSubmit = async () => {
        if (!validateForm()) return;

        setIsSaving(true);
        await onSave(formData);
        setIsSaving(false);
        onClose();
    };


    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={onClose}>
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-2xl m-4 flex flex-col" style={{maxHeight: '90vh'}} onClick={e => e.stopPropagation()}>
                <div className="p-5 border-b dark:border-gray-700 flex justify-between items-center">
                    <h3 className="text-xl font-bold">{complex ? 'Editar' : 'Crear'} Complejo</h3>
                    <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"><XIcon className="w-6 h-6"/></button>
                </div>
                <div className="p-5 overflow-y-auto space-y-4 text-sm">
                   {/* ... form fields for complex details ... */}
                </div>
                <div className="p-4 bg-gray-50 dark:bg-gray-800/50 border-t dark:border-gray-700 flex justify-end gap-3">
                    <button onClick={onClose} className="py-2 px-4 rounded-lg font-semibold bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-sm">Cancelar</button>
                    <button onClick={handleFormSubmit} disabled={isSaving} className="py-2 px-4 rounded-lg font-semibold bg-[var(--color-primary-600)] text-white hover:bg-[var(--color-primary-700)] shadow-sm text-sm w-28 h-9 flex justify-center items-center">
                        {isSaving ? <SpinnerIcon className="w-5 h-5"/> : 'Guardar'}
                    </button>
                </div>
            </div>
        </div>
    );
};

// Placeholder for now
const FieldsManager: React.FC<OwnerDashboardProps> = (props) => {
    return <div>Fields Manager</div>
}
const BookingsManager: React.FC<OwnerDashboardProps> = (props) => {
    return <div>Bookings Manager</div>
}
const AnnouncementsManager: React.FC<OwnerDashboardProps> = (props) => {
    return <div>Announcements Manager</div>
}

const OwnerDashboard: React.FC<OwnerDashboardProps> = (props) => {
    const { user, onLogout, fields, bookings, announcements, addNotification } = props;
    const [view, setView] = useState<OwnerView>('dashboard');
    const [isComplexModalOpen, setIsComplexModalOpen] = useState(false);
    const [editingComplex, setEditingComplex] = useState<any>(null);


    const TABS: { id: OwnerView; label: string; icon: React.ReactNode }[] = [
        { id: 'dashboard', label: 'Dashboard', icon: <DashboardIcon className="w-6 h-6"/> },
        { id: 'fields', label: 'Canchas', icon: <PitchIcon className="w-6 h-6"/> },
        { id: 'bookings', label: 'Reservas', icon: <ListBulletIcon className="w-6 h-6"/> },
        { id: 'announcements', label: 'Anuncios', icon: <MegaphoneIcon className="w-6 h-6"/> },
    ];
    
    const currentTab = TABS.find(t => t.id === view);

    const renderContent = () => {
        switch (view) {
            case 'fields': return <FieldsManager {...props} />;
            case 'bookings': return <BookingsManager {...props} />;
            case 'announcements': return <AnnouncementsManager {...props} />;
            case 'dashboard':
            default:
                return <DashboardHome bookings={bookings} fields={fields} />;
        }
    };

    return (
        <div className="min-h-screen bg-slate-100 dark:bg-gray-900 text-gray-800 dark:text-gray-200">
            {/* Header */}
            <header className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-b dark:border-gray-700 sticky top-0 z-40 p-4 flex justify-between items-center">
                 <div className="w-8"></div> {/* Spacer */}
                 <h1 className="text-xl font-bold text-center">{currentTab?.label}</h1>
                 <button onClick={onLogout} title="Cerrar Sesión" className="p-2 text-gray-500 dark:text-gray-400 hover:text-red-500 dark:hover:text-red-400 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700">
                    <LogoutIcon className="w-6 h-6" />
                 </button>
            </header>

            {/* Main Content */}
            <main className="p-4 pb-28">
                {renderContent()}
            </main>

            {/* Bottom Nav */}
            <nav className="fixed bottom-0 left-0 right-0 h-20 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border-t border-gray-200 dark:border-gray-700 z-50 flex justify-around items-center">
                {TABS.map(tab => (
                    <button key={tab.id} onClick={() => setView(tab.id)} className={`flex flex-col items-center gap-1 transition-colors ${view === tab.id ? 'text-[var(--color-primary-600)] dark:text-[var(--color-primary-400)]' : 'text-gray-500 dark:text-gray-400'}`}>
                        {tab.icon}
                        <span className="text-xs font-bold">{tab.label}</span>
                    </button>
                ))}
            </nav>
        </div>
    );
};

export default OwnerDashboard;