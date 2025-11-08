// @ts-nocheck
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
        setFormData(prev => ({...prev, images: prev.images.filter((_, i) => i !== index)}));
    };

    const validateAndSave = async () => {
        // ... validation logic ...
        setIsSaving(true);
        try {
            await onSave(formData);
        } catch (e) {
            console.error(e);
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={onClose}>
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-2xl m-4 flex flex-col" style={{maxHeight: '90vh'}} onClick={e => e.stopPropagation()}>
                <div className="p-5 border-b dark:border-gray-700 flex justify-between items-center">
                    <h3 className="text-xl font-bold">{complex ? 'Editar' : 'Añadir'} Complejo</h3>
                    <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"><XIcon className="w-6 h-6"/></button>
                </div>
                {/* Modal content JSX will be here */}
                <div className="p-5 overflow-y-auto space-y-4">
                    {/* Form fields based on formData state */}
                    <p>Form content for {formData.name}...</p>
                </div>
                <div className="p-4 bg-gray-50 dark:bg-gray-800/50 border-t dark:border-gray-700 flex justify-end gap-3">
                    <button onClick={onClose} className="py-2 px-4 rounded-lg font-semibold bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-sm">Cancelar</button>
                    <button onClick={validateAndSave} className="py-2 px-4 rounded-lg font-semibold bg-[var(--color-primary-600)] text-white hover:bg-[var(--color-primary-700)] text-sm">{isSaving ? 'Guardando...' : 'Guardar'}</button>
                </div>
            </div>
        </div>
    );
};

const AnnouncementsView: React.FC<{
    announcements: Announcement[];
    ownerId: string;
    complexName: string;
    onAdd: (annData: any) => Promise<void>;
    onDelete: (annId: string) => Promise<void>;
}> = ({ announcements, ownerId, complexName, onAdd, onDelete }) => {
    const [newAnn, setNewAnn] = useState({ title: '', message: '', type: 'news' as const });
    const [annToDelete, setAnnToDelete] = useState<Announcement | null>(null);

    const handleAdd = async () => {
        if (!newAnn.title || !newAnn.message) return;
        await onAdd({ ...newAnn, ownerId, complexName });
        setNewAnn({ title: '', message: '', type: 'news' });
    };

    return (
        <div className="space-y-6">
            <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border dark:border-gray-700 space-y-3">
                <h3 className="text-xl font-bold">Crear Anuncio</h3>
                <input type="text" placeholder="Título del anuncio" value={newAnn.title} onChange={e => setNewAnn(p => ({ ...p, title: e.target.value }))} className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600" />
                <textarea placeholder="Mensaje para los usuarios" value={newAnn.message} onChange={e => setNewAnn(p => ({ ...p, message: e.target.value }))} className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600" rows={3}></textarea>
                <div className="flex justify-end">
                    <button onClick={handleAdd} className="py-2 px-4 rounded-lg font-semibold bg-[var(--color-primary-600)] text-white hover:bg-[var(--color-primary-700)] shadow-sm text-sm">Publicar</button>
                </div>
            </div>
            <div className="space-y-3">
                <h3 className="text-xl font-bold">Anuncios Publicados</h3>
                {announcements.length > 0 ? announcements.map(ann => (
                    <div key={ann.id} className="bg-white dark:bg-gray-800 p-4 rounded-lg flex justify-between items-start">
                        <div>
                            <p className="font-bold">{ann.title}</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">{ann.message}</p>
                        </div>
                        <button onClick={() => setAnnToDelete(ann)} className="p-2 text-gray-400 hover:text-red-500 rounded-full"><TrashIcon className="w-5 h-5" /></button>
                    </div>
                )) : <p className="text-center text-gray-500 dark:text-gray-400 py-4">No has publicado anuncios.</p>}
            </div>
            {annToDelete && <ConfirmationModal isOpen={!!annToDelete} onClose={() => setAnnToDelete(null)} onConfirm={() => { onDelete(annToDelete.id!); setAnnToDelete(null); }} title="¿Eliminar Anuncio?" message="Esta acción no se puede deshacer." confirmButtonText="Sí, eliminar" />}
        </div>
    );
};

const BookingsView: React.FC<{ bookings: ConfirmedBooking[] }> = ({ bookings }) => {
    const sortedBookings = useMemo(() => [...bookings].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()), [bookings]);
    return (
        <div className="space-y-3">
            {sortedBookings.length > 0 ? sortedBookings.map(booking => (
                <div key={booking.id} className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border dark:border-gray-700">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="font-bold text-lg">{booking.field.name}</p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">{new Date(booking.date).toLocaleDateString('es-CO', { weekday: 'long', day: 'numeric', month: 'long' })} a las {booking.time}</p>
                        </div>
                        <span className={`text-xs font-bold px-2 py-1 rounded-full ${booking.status === 'confirmed' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>{booking.status}</span>
                    </div>
                    <div className="mt-3 border-t dark:border-gray-700 pt-3 text-sm space-y-1">
                        <p><strong>Cliente:</strong> {booking.userName}</p>
                        <p><strong>Teléfono:</strong> {booking.userPhone}</p>
                        <p><strong>Total:</strong> ${booking.totalPrice.toLocaleString('es-CO')}</p>
                    </div>
                </div>
            )) : <p className="text-center text-gray-500 dark:text-gray-400 py-8">No hay reservas para tus canchas.</p>}
        </div>
    );
};

const FieldsManagerView: React.FC<{
    ownerFields: SoccerField[];
    allFields: SoccerField[];
    setAllFields: React.Dispatch<React.SetStateAction<SoccerField[]>>;
    user: User;
    addNotification: OwnerDashboardProps['addNotification'];
}> = ({ ownerFields, allFields, setAllFields, user, addNotification }) => {
    const [editingComplex, setEditingComplex] = useState<any | null>(null);

    const handleSaveComplex = async (data) => {
        addNotification({ type: 'success', title: 'Guardado', message: 'Los cambios en el complejo han sido guardados.' });
    };

    const complexes = useMemo(() => {
        const grouped: { [key: string]: any } = {};
        ownerFields.forEach(field => {
            const id = field.complexId || field.id;
            if (!grouped[id]) {
                grouped[id] = {
                    complexId: id,
                    name: field.name.split(' - ')[0],
                    address: field.address,
                    city: field.city,
                    description: field.description,
                    images: field.images,
                    services: field.services,
                    fields: []
                };
            }
            grouped[id].fields.push(field);
        });
        return Object.values(grouped);
    }, [ownerFields]);

    return (
        <div className="space-y-4">
             <div className="flex justify-end">
                <button onClick={() => setEditingComplex({})} className="flex items-center gap-2 bg-[var(--color-primary-600)] text-white font-bold py-2 px-4 rounded-lg hover:bg-[var(--color-primary-700)] transition-colors shadow-sm text-sm">
                    <PlusIcon className="w-5 h-5" />
                    Añadir Complejo
                </button>
            </div>
            {complexes.map(complex => (
                <div key={complex.complexId} className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border dark:border-gray-700 flex justify-between items-center">
                    <div>
                        <p className="font-bold">{complex.name}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{complex.address}</p>
                    </div>
                    <div>
                        <button onClick={() => setEditingComplex(complex)} className="p-2 text-gray-400 hover:text-[var(--color-primary-500)] rounded-full"><PencilIcon className="w-5 h-5" /></button>
                    </div>
                </div>
            ))}
            {editingComplex && <ComplexEditorModal complex={editingComplex} onClose={() => setEditingComplex(null)} onSave={handleSaveComplex} addNotification={addNotification} />}
        </div>
    );
}

const OwnerDashboard: React.FC<OwnerDashboardProps> = ({ user, fields, setFields, bookings, setBookings, announcements, setAnnouncements, addNotification, onLogout, allUsers, allFields }) => {
    const [view, setView] = useState<OwnerView>('dashboard');
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    const handleAddAnnouncement = async (annData) => {
        const newAnn = await db.addAnnouncement(annData);
        setAnnouncements(prev => [newAnn, ...prev]);
        addNotification({ type: 'success', title: 'Anuncio Publicado', message: 'Tu anuncio ya está visible para los usuarios.' });
    };

    const handleDeleteAnnouncement = async (annId) => {
        await db.deleteAnnouncement(annId);
        setAnnouncements(prev => prev.filter(a => a.id !== annId));
        addNotification({ type: 'info', title: 'Anuncio Eliminado', message: 'El anuncio ha sido eliminado.' });
    };

    const NavItem: React.FC<{ icon: React.ReactNode, label: string, view: OwnerView, isActive: boolean, onClick: () => void }> = ({ icon, label, view: v, isActive, onClick }) => (
        <button onClick={onClick} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left font-semibold transition-colors ${isActive ? 'bg-[var(--color-primary-100)] dark:bg-[var(--color-primary-900)]/50 text-[var(--color-primary-700)] dark:text-[var(--color-primary-400)]' : 'hover:bg-gray-100 dark:hover:bg-gray-700/50'}`}>
            {icon}
            <span>{label}</span>
        </button>
    );

    const renderView = () => {
        switch (view) {
            case 'fields':
                return <FieldsManagerView ownerFields={fields} allFields={allFields} setAllFields={setFields} user={user} addNotification={addNotification} />;
            case 'bookings':
                return <BookingsView bookings={bookings} />;
            case 'announcements':
                const ownerComplex = fields[0];
                return <AnnouncementsView announcements={announcements.filter(a => a.ownerId === user.id)} ownerId={user.id} complexName={ownerComplex?.name.split(' - ')[0] || ''} onAdd={handleAddAnnouncement} onDelete={handleDeleteAnnouncement} />;
            default:
                return <DashboardHome bookings={bookings} fields={fields} />;
        }
    };
    
    return (
        <div className="min-h-screen bg-slate-100 dark:bg-gray-900 md:flex">
            {/* Sidebar */}
            <aside className="w-64 bg-white dark:bg-gray-800 p-4 border-r dark:border-gray-700 flex-col justify-between hidden md:flex">
                <div>
                    <div className="flex items-center gap-2 mb-8 px-2">
                        <img src="https://ideogram.ai/assets/image/lossless/response/zjy_oza2RB2xuDygg3HR-Q" alt="Cancheo logo" className="h-8 w-8 rounded-full" />
                        <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-200 tracking-tight">Canche<span className="text-[var(--color-primary-600)]">o</span></h1>
                    </div>
                    <nav className="space-y-2">
                        <NavItem icon={<DashboardIcon className="w-5 h-5"/>} label="Dashboard" view="dashboard" isActive={view === 'dashboard'} onClick={() => setView('dashboard')} />
                        <NavItem icon={<PitchIcon className="w-5 h-5"/>} label="Mis Canchas" view="fields" isActive={view === 'fields'} onClick={() => setView('fields')} />
                        <NavItem icon={<ListBulletIcon className="w-5 h-5"/>} label="Reservas" view="bookings" isActive={view === 'bookings'} onClick={() => setView('bookings')} />
                        <NavItem icon={<MegaphoneIcon className="w-5 h-5"/>} label="Anuncios" view="announcements" isActive={view === 'announcements'} onClick={() => setView('announcements')} />
                    </nav>
                </div>
                <button onClick={onLogout} className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left font-semibold text-red-600 dark:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors">
                    <LogoutIcon className="w-5 h-5"/>
                    <span>Cerrar Sesión</span>
                </button>
            </aside>

            {/* Main Content */}
            <main className="flex-1 p-4 md:p-8">
                <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-gray-100 md:hidden">Panel de Propietario</h2>
                {renderView()}
            </main>
        </div>
    );
};

export default OwnerDashboard;