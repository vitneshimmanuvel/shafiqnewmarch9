/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Smartphone, 
  Laptop, 
  Camera, 
  Battery, 
  Zap, 
  Droplets, 
  AlertCircle, 
  ChevronRight, 
  MapPin, 
  Phone, 
  Clock, 
  CheckCircle2, 
  History, 
  User, 
  Home, 
  Search,
  ArrowLeft,
  Upload,
  Star,
  MessageSquare,
  ShieldCheck,
  Settings,
  Bell,
  CreditCard,
  LogOut,
  Plus,
  LayoutDashboard,
  Users,
  TrendingUp,
  MoreVertical
} from 'lucide-react';
import { cn } from './lib/utils';
import { DeviceType, RepairRequest, RepairStatus, Technician } from './types';
import { MOCK_USER, MOCK_TECHNICIANS, MOCK_HISTORY } from './mockData';
import { analyzeIssueImage } from './services/aiService';

// --- Components ---

const Button = ({ 
  children, 
  className, 
  variant = 'primary', 
  ...props 
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary' | 'secondary' | 'outline' | 'ghost' }) => {
  const variants = {
    primary: 'bg-primary text-white shadow-lg shadow-primary/20 hover:bg-primary/90',
    secondary: 'bg-dark-gray text-white hover:bg-dark-gray/90',
    outline: 'border-2 border-primary text-primary hover:bg-primary/5',
    ghost: 'bg-transparent text-dark-gray hover:bg-black/5',
  };

  return (
    <button 
      className={cn(
        'px-6 py-4 rounded-2xl font-semibold transition-all active:scale-95 flex items-center justify-center gap-2 disabled:opacity-50',
        variants[variant],
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
};

const Card = ({ children, className, onClick }: { children: React.ReactNode; className?: string; onClick?: () => void }) => (
  <div 
    onClick={onClick}
    className={cn(
      'bg-white rounded-3xl p-6 shadow-sm border border-black/5 transition-all',
      onClick && 'active:scale-[0.98] cursor-pointer',
      className
    )}
  >
    {children}
  </div>
);

// --- Screens ---

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<'splash' | 'home' | 'upload' | 'estimate' | 'pickup' | 'tracking' | 'history' | 'profile' | 'admin'>('splash');
  const [activeTab, setActiveTab] = useState<'home' | 'tracking' | 'history' | 'profile'>('home');
  const [selectedDevice, setSelectedDevice] = useState<DeviceType | null>(null);
  const [repairRequest, setRepairRequest] = useState<Partial<RepairRequest>>({});
  const [allRequests, setAllRequests] = useState<RepairRequest[]>(MOCK_HISTORY);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    if (currentScreen === 'splash') {
      const timer = setTimeout(() => setCurrentScreen('home'), 2500);
      return () => clearTimeout(timer);
    }
  }, [currentScreen]);

  const handleDeviceSelect = (device: DeviceType) => {
    setSelectedDevice(device);
    setRepairRequest({ deviceType: device });
    setCurrentScreen('upload');
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsAnalyzing(true);
    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64 = reader.result as string;
      setRepairRequest(prev => ({ ...prev, photoUrl: base64 }));
      
      const analysis = await analyzeIssueImage(base64);
      if (analysis) {
        setRepairRequest(prev => ({
          ...prev,
          issue: analysis.issue,
          description: analysis.description,
          estimatedCost: analysis.estimatedCost,
          estimatedTime: analysis.estimatedTime,
        }));
      } else {
        // Fallback
        setRepairRequest(prev => ({
          ...prev,
          issue: 'Cracked Screen',
          description: 'Visible cracks on the display panel.',
          estimatedCost: 2500,
          estimatedTime: '2 Hours',
        }));
      }
      setIsAnalyzing(false);
      setCurrentScreen('estimate');
    };
    reader.readAsDataURL(file);
  };

  const confirmRepair = () => {
    setCurrentScreen('pickup');
  };

  const confirmPickup = (details: { address: string; phone: string; time: string }) => {
    const newRequest: RepairRequest = {
      id: `REQ-${Math.floor(Math.random() * 10000)}`,
      userId: MOCK_USER.id,
      deviceType: selectedDevice!,
      issue: repairRequest.issue!,
      description: repairRequest.description,
      photoUrl: repairRequest.photoUrl,
      estimatedCost: repairRequest.estimatedCost!,
      estimatedTime: repairRequest.estimatedTime!,
      status: 'Request Confirmed',
      pickupAddress: details.address,
      contactNumber: details.phone,
      pickupTime: details.time,
      technicianId: MOCK_TECHNICIANS[0].id,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setAllRequests([newRequest, ...allRequests]);
    setRepairRequest(newRequest);
    setCurrentScreen('tracking');
    setActiveTab('tracking');
  };

  const renderScreen = () => {
    switch (currentScreen) {
      case 'splash':
        return <SplashScreen />;
      case 'home':
        return <HomeScreen onSelectDevice={handleDeviceSelect} onAdminClick={() => setIsAdmin(true)} />;
      case 'upload':
        return <UploadScreen deviceType={selectedDevice!} onBack={() => setCurrentScreen('home')} onUpload={handleImageUpload} isAnalyzing={isAnalyzing} />;
      case 'estimate':
        return <EstimateScreen request={repairRequest} onBack={() => setCurrentScreen('upload')} onConfirm={confirmRepair} />;
      case 'pickup':
        return <PickupScreen onBack={() => setCurrentScreen('estimate')} onConfirm={confirmPickup} />;
      case 'tracking':
        return <TrackingScreen request={repairRequest as RepairRequest} />;
      case 'history':
        return <HistoryScreen requests={allRequests} onSelect={(req) => { setRepairRequest(req); setCurrentScreen('tracking'); }} />;
      case 'profile':
        return <ProfileScreen user={MOCK_USER} />;
      case 'admin':
        return <AdminDashboard requests={allRequests} onUpdateStatus={(id, status) => {
          setAllRequests(allRequests.map(r => r.id === id ? { ...r, status, updatedAt: new Date().toISOString() } : r));
        }} onBack={() => setIsAdmin(false)} />;
      default:
        return <HomeScreen onSelectDevice={handleDeviceSelect} onAdminClick={() => setIsAdmin(true)} />;
    }
  };

  if (isAdmin) {
    return <AdminDashboard requests={allRequests} onUpdateStatus={(id, status) => {
      setAllRequests(allRequests.map(r => r.id === id ? { ...r, status, updatedAt: new Date().toISOString() } : r));
    }} onBack={() => setIsAdmin(false)} />;
  }

  return (
    <div className="max-w-md mx-auto min-h-screen bg-soft-white relative pb-24">
      <AnimatePresence mode="wait">
        <motion.div
          key={currentScreen}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
          className="w-full"
        >
          {renderScreen()}
        </motion.div>
      </AnimatePresence>

      {currentScreen !== 'splash' && (
        <nav className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[90%] max-w-sm frosted-glass rounded-3xl p-2 flex items-center justify-around shadow-2xl z-50">
          <NavButton active={activeTab === 'home'} onClick={() => { setActiveTab('home'); setCurrentScreen('home'); }} icon={<Home size={24} />} label="Home" />
          <NavButton active={activeTab === 'tracking'} onClick={() => { setActiveTab('tracking'); setCurrentScreen('tracking'); }} icon={<Search size={24} />} label="Track" />
          <NavButton active={activeTab === 'history'} onClick={() => { setActiveTab('history'); setCurrentScreen('history'); }} icon={<History size={24} />} label="History" />
          <NavButton active={activeTab === 'profile'} onClick={() => { setActiveTab('profile'); setCurrentScreen('profile'); }} icon={<User size={24} />} label="Profile" />
        </nav>
      )}
    </div>
  );
}

const NavButton = ({ active, onClick, icon, label }: { active: boolean; onClick: () => void; icon: React.ReactNode; label: string }) => (
  <button 
    onClick={onClick}
    className={cn(
      'flex flex-col items-center gap-1 p-2 rounded-2xl transition-all duration-300',
      active ? 'text-primary scale-110' : 'text-gray-400'
    )}
  >
    {icon}
    <span className="text-[10px] font-bold uppercase tracking-wider">{label}</span>
  </button>
);

// --- Screen Components ---

const SplashScreen = () => (
  <div className="h-screen flex flex-col items-center justify-center bg-primary text-white p-8">
    <motion.div
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.8, ease: 'easeOut' }}
      className="flex flex-col items-center gap-6"
    >
      <div className="w-24 h-24 bg-white rounded-3xl flex items-center justify-center shadow-2xl">
        <AlertCircle size={48} className="text-primary" />
      </div>
      <div className="text-center">
        <h1 className="text-3xl font-extrabold tracking-tight mb-2">Electronic Hospital</h1>
        <p className="text-white/80 font-medium">Your Device’s Emergency Room</p>
      </div>
      <div className="mt-12">
        <div className="w-12 h-1.5 bg-white/20 rounded-full overflow-hidden">
          <motion.div 
            className="h-full bg-white"
            initial={{ width: 0 }}
            animate={{ width: '100%' }}
            transition={{ duration: 2, ease: 'easeInOut' }}
          />
        </div>
      </div>
    </motion.div>
  </div>
);

const HomeScreen = ({ onSelectDevice, onAdminClick }: { onSelectDevice: (d: DeviceType) => void; onAdminClick: () => void }) => (
  <div className="p-6 pt-12 space-y-8">
    <header className="flex justify-between items-start">
      <div>
        <h2 className="text-gray-500 font-semibold mb-1">Hello 👋</h2>
        <h1 className="text-2xl font-extrabold text-dark-gray leading-tight">
          How can we repair your<br />device today?
        </h1>
      </div>
      <button onClick={onAdminClick} className="p-3 bg-white rounded-2xl shadow-sm border border-black/5 text-gray-400">
        <Settings size={20} />
      </button>
    </header>

    <div className="grid grid-cols-2 gap-4">
      <Card 
        onClick={() => onSelectDevice('Mobile')}
        className="relative overflow-hidden group border-none bg-gradient-to-br from-blue-500 to-blue-600 text-white"
      >
        <div className="relative z-10 space-y-4">
          <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-md">
            <Smartphone size={28} />
          </div>
          <h3 className="text-lg font-bold">Mobile<br />Repair</h3>
        </div>
        <div className="absolute -right-4 -bottom-4 opacity-20 group-hover:scale-110 transition-transform">
          <Smartphone size={120} />
        </div>
      </Card>

      <Card 
        onClick={() => onSelectDevice('Laptop')}
        className="relative overflow-hidden group border-none bg-gradient-to-br from-indigo-500 to-indigo-600 text-white"
      >
        <div className="relative z-10 space-y-4">
          <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-md">
            <Laptop size={28} />
          </div>
          <h3 className="text-lg font-bold">Laptop<br />Repair</h3>
        </div>
        <div className="absolute -right-4 -bottom-4 opacity-20 group-hover:scale-110 transition-transform">
          <Laptop size={120} />
        </div>
      </Card>
    </div>

    <section className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-bold text-dark-gray">Quick Services</h3>
        <button className="text-primary text-sm font-bold">See All</button>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <QuickServiceItem icon={<Smartphone className="text-blue-500" />} title="Screen Repair" bg="bg-blue-50" />
        <QuickServiceItem icon={<Battery className="text-green-500" />} title="Battery" bg="bg-green-50" />
        <QuickServiceItem icon={<Zap className="text-yellow-500" />} title="Charging" bg="bg-yellow-50" />
        <QuickServiceItem icon={<Droplets className="text-cyan-500" />} title="Water Damage" bg="bg-cyan-50" />
      </div>
    </section>

    <Card className="bg-dark-gray text-white border-none relative overflow-hidden">
      <div className="relative z-10">
        <h3 className="text-xl font-bold mb-2">30% Off First Repair</h3>
        <p className="text-white/60 text-sm mb-4">Use code: FIRST30</p>
        <Button variant="primary" className="py-2 px-4 text-sm">Claim Now</Button>
      </div>
      <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 rounded-full -mr-16 -mt-16 blur-3xl" />
    </Card>
  </div>
);

const QuickServiceItem = ({ icon, title, bg }: { icon: React.ReactNode; title: string; bg: string }) => (
  <Card className={cn('flex flex-col items-center gap-3 text-center p-4', bg)}>
    <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm">
      {icon}
    </div>
    <span className="text-sm font-bold text-dark-gray">{title}</span>
  </Card>
);

const UploadScreen = ({ deviceType, onBack, onUpload, isAnalyzing }: { deviceType: DeviceType; onBack: () => void; onUpload: (e: React.ChangeEvent<HTMLInputElement>) => void; isAnalyzing: boolean }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="p-6 pt-12 space-y-8">
      <header className="flex items-center gap-4">
        <button onClick={onBack} className="p-3 bg-white rounded-2xl shadow-sm border border-black/5">
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-2xl font-extrabold text-dark-gray">Upload Issue</h1>
      </header>

      <div className="space-y-6">
        <div className="text-center space-y-2">
          <p className="text-gray-500 font-medium">Repairing your {deviceType}</p>
          <h2 className="text-xl font-bold">Show us the problem</h2>
        </div>

        <div 
          onClick={() => fileInputRef.current?.click()}
          className="aspect-square w-full rounded-3xl border-4 border-dashed border-gray-200 flex flex-col items-center justify-center gap-4 bg-white hover:bg-gray-50 transition-colors cursor-pointer relative overflow-hidden"
        >
          {isAnalyzing ? (
            <div className="flex flex-col items-center gap-4">
              <motion.div 
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full"
              />
              <p className="font-bold text-primary animate-pulse">AI is analyzing...</p>
            </div>
          ) : (
            <>
              <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center text-primary">
                <Camera size={40} />
              </div>
              <div className="text-center">
                <p className="font-bold text-lg">Upload Photo</p>
                <p className="text-gray-400 text-sm">Take a clear photo of the damage</p>
              </div>
            </>
          )}
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={onUpload} 
            className="hidden" 
            accept="image/*" 
          />
        </div>

        <div className="space-y-4">
          <h3 className="font-bold text-gray-500 uppercase text-xs tracking-widest">Common Issues</h3>
          <div className="flex flex-wrap gap-2">
            {['Cracked Screen', 'Battery Drain', 'Charging Port', 'Camera Blur', 'Water Damage'].map(issue => (
              <span key={issue} className="px-4 py-2 bg-white border border-black/5 rounded-full text-sm font-semibold text-gray-600">
                {issue}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

const EstimateScreen = ({ request, onBack, onConfirm }: { request: Partial<RepairRequest>; onBack: () => void; onConfirm: () => void }) => (
  <div className="p-6 pt-12 space-y-8">
    <header className="flex items-center gap-4">
      <button onClick={onBack} className="p-3 bg-white rounded-2xl shadow-sm border border-black/5">
        <ArrowLeft size={20} />
      </button>
      <h1 className="text-2xl font-extrabold text-dark-gray">Repair Estimate</h1>
    </header>

    <div className="space-y-6">
      <Card className="p-0 overflow-hidden border-none shadow-xl">
        <div className="bg-primary p-8 text-white">
          <div className="flex justify-between items-start mb-6">
            <div>
              <p className="text-white/60 text-sm font-bold uppercase tracking-wider mb-1">Detected Issue</p>
              <h2 className="text-2xl font-bold">{request.issue}</h2>
            </div>
            <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-md">
              <ShieldCheck size={24} />
            </div>
          </div>
          <p className="text-white/80 text-sm leading-relaxed">{request.description}</p>
        </div>
        <div className="p-8 bg-white space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-gray-400 text-xs font-bold uppercase tracking-widest mb-1">Estimated Cost</p>
              <p className="text-3xl font-extrabold text-dark-gray">₹{request.estimatedCost}</p>
            </div>
            <div className="text-right">
              <p className="text-gray-400 text-xs font-bold uppercase tracking-widest mb-1">Repair Time</p>
              <p className="text-lg font-bold text-dark-gray">{request.estimatedTime}</p>
            </div>
          </div>

          <div className="space-y-3 pt-4 border-t border-gray-100">
            <BenefitItem text="Genuine OEM Parts" />
            <BenefitItem text="30 Day Warranty" />
            <BenefitItem text="Certified Technician" />
          </div>
        </div>
      </Card>

      <div className="space-y-4">
        <Button onClick={onConfirm} className="w-full py-5">Confirm Repair</Button>
        <p className="text-center text-xs text-gray-400 px-8 leading-relaxed">
          By confirming, you agree to our terms of service and pickup policy.
        </p>
      </div>
    </div>
  </div>
);

const BenefitItem = ({ text }: { text: string }) => (
  <div className="flex items-center gap-3 text-sm font-semibold text-gray-600">
    <div className="w-5 h-5 bg-success/10 rounded-full flex items-center justify-center text-success">
      <CheckCircle2 size={14} />
    </div>
    {text}
  </div>
);

const PickupScreen = ({ onBack, onConfirm }: { onBack: () => void; onConfirm: (d: any) => void }) => {
  const [address, setAddress] = useState(MOCK_USER.address);
  const [phone, setPhone] = useState(MOCK_USER.phone);
  const [time, setTime] = useState('Today, 2:00 PM - 4:00 PM');

  return (
    <div className="p-6 pt-12 space-y-8">
      <header className="flex items-center gap-4">
        <button onClick={onBack} className="p-3 bg-white rounded-2xl shadow-sm border border-black/5">
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-2xl font-extrabold text-dark-gray">Pickup Details</h1>
      </header>

      <div className="space-y-6">
        <Card className="p-0 overflow-hidden border-none shadow-md">
          <div className="h-40 bg-gray-200 relative">
            <img 
              src="https://picsum.photos/seed/map/800/400" 
              alt="Map" 
              className="w-full h-full object-cover opacity-50 grayscale"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center text-white shadow-2xl animate-bounce">
                <MapPin size={24} />
              </div>
            </div>
          </div>
          <div className="p-6 space-y-4">
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Pickup Address</label>
              <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-2xl border border-black/5">
                <MapPin size={20} className="text-primary mt-0.5" />
                <textarea 
                  value={address} 
                  onChange={(e) => setAddress(e.target.value)}
                  className="bg-transparent w-full text-sm font-semibold text-dark-gray focus:outline-none resize-none h-16"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Phone Number</label>
                <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-2xl border border-black/5">
                  <Phone size={18} className="text-primary" />
                  <input 
                    type="text" 
                    value={phone} 
                    onChange={(e) => setPhone(e.target.value)}
                    className="bg-transparent w-full text-sm font-semibold text-dark-gray focus:outline-none"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Preferred Time</label>
                <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-2xl border border-black/5">
                  <Clock size={18} className="text-primary" />
                  <input 
                    type="text" 
                    value={time} 
                    onChange={(e) => setTime(e.target.value)}
                    className="bg-transparent w-full text-sm font-semibold text-dark-gray focus:outline-none"
                  />
                </div>
              </div>
            </div>
          </div>
        </Card>

        <Button onClick={() => onConfirm({ address, phone, time })} className="w-full py-5">Confirm Pickup</Button>
      </div>
    </div>
  );
};

const TrackingScreen = ({ request }: { request: RepairRequest }) => {
  const technician = MOCK_TECHNICIANS[0];
  const statuses: RepairStatus[] = [
    'Request Confirmed',
    'Technician Assigned',
    'On The Way',
    'Device Picked Up',
    'Repair In Progress',
    'Repair Completed',
    'Out For Delivery',
    'Delivered'
  ];

  const currentStatusIndex = statuses.indexOf(request.status);

  return (
    <div className="p-6 pt-12 space-y-8">
      <header className="flex justify-between items-center">
        <h1 className="text-2xl font-extrabold text-dark-gray">Track Repair</h1>
        <span className="px-3 py-1 bg-primary/10 text-primary text-xs font-bold rounded-full">
          {request.id}
        </span>
      </header>

      <div className="space-y-6">
        <Card className="p-4 flex items-center gap-4 border-none shadow-md">
          <img src={technician.photo} alt={technician.name} className="w-14 h-14 rounded-2xl bg-gray-100" referrerPolicy="no-referrer" />
          <div className="flex-1">
            <h3 className="font-bold text-dark-gray">{technician.name}</h3>
            <div className="flex items-center gap-1 text-xs text-gray-500 font-bold">
              <Star size={12} className="text-yellow-500 fill-yellow-500" />
              {technician.rating} • Certified Technician
            </div>
          </div>
          <div className="flex gap-2">
            <button className="p-3 bg-primary/10 text-primary rounded-2xl">
              <Phone size={20} />
            </button>
            <button className="p-3 bg-primary/10 text-primary rounded-2xl">
              <MessageSquare size={20} />
            </button>
          </div>
        </Card>

        <Card className="space-y-6 border-none shadow-sm">
          <h3 className="font-bold text-dark-gray">Repair Progress</h3>
          <div className="space-y-6 relative">
            <div className="absolute left-[11px] top-2 bottom-2 w-0.5 bg-gray-100" />
            {statuses.slice(0, 5).map((status, idx) => (
              <div key={status} className="flex gap-4 items-start relative z-10">
                <div className={cn(
                  "w-6 h-6 rounded-full flex items-center justify-center text-white transition-colors duration-500",
                  idx <= currentStatusIndex ? "bg-primary" : "bg-gray-200"
                )}>
                  {idx <= currentStatusIndex ? <CheckCircle2 size={14} /> : <div className="w-2 h-2 bg-white rounded-full" />}
                </div>
                <div className="flex-1">
                  <p className={cn(
                    "font-bold text-sm",
                    idx <= currentStatusIndex ? "text-dark-gray" : "text-gray-400"
                  )}>{status}</p>
                  {idx === currentStatusIndex && (
                    <p className="text-xs text-gray-500 mt-1">Technician is currently handling this step.</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card className="bg-blue-50 border-none">
          <div className="flex gap-3">
            <AlertCircle className="text-primary" size={20} />
            <div>
              <p className="text-sm font-bold text-dark-gray">Technician's Note</p>
              <p className="text-xs text-gray-600 mt-1 leading-relaxed">
                "I've received your request and I'm currently finishing a nearby repair. I'll be at your location shortly."
              </p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

const HistoryScreen = ({ requests, onSelect }: { requests: RepairRequest[]; onSelect: (r: RepairRequest) => void }) => (
  <div className="p-6 pt-12 space-y-8">
    <h1 className="text-2xl font-extrabold text-dark-gray">Repair History</h1>

    <div className="space-y-4">
      {requests.map(req => (
        <Card key={req.id} onClick={() => onSelect(req)} className="p-5 flex items-center gap-4 hover:shadow-md">
          <div className={cn(
            "w-14 h-14 rounded-2xl flex items-center justify-center",
            req.deviceType === 'Mobile' ? "bg-blue-50 text-blue-500" : "bg-indigo-50 text-indigo-500"
          )}>
            {req.deviceType === 'Mobile' ? <Smartphone size={28} /> : <Laptop size={28} />}
          </div>
          <div className="flex-1">
            <div className="flex justify-between items-start mb-1">
              <h3 className="font-bold text-dark-gray">{req.issue}</h3>
              <span className="text-xs font-extrabold text-primary">₹{req.estimatedCost}</span>
            </div>
            <div className="flex justify-between items-center">
              <p className="text-xs text-gray-400 font-semibold">{new Date(req.createdAt).toLocaleDateString()}</p>
              <span className={cn(
                "text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full",
                req.status === 'Delivered' ? "bg-success/10 text-success" : "bg-primary/10 text-primary"
              )}>
                {req.status}
              </span>
            </div>
          </div>
        </Card>
      ))}
    </div>
  </div>
);

const ProfileScreen = ({ user }: { user: typeof MOCK_USER }) => (
  <div className="p-6 pt-12 space-y-8">
    <h1 className="text-2xl font-extrabold text-dark-gray">My Profile</h1>

    <div className="flex flex-col items-center gap-4 text-center">
      <div className="relative">
        <img src={user.avatar} alt={user.name} className="w-24 h-24 rounded-3xl bg-white shadow-lg border-4 border-white" referrerPolicy="no-referrer" />
        <button className="absolute -bottom-2 -right-2 p-2 bg-primary text-white rounded-xl shadow-lg">
          <Camera size={16} />
        </button>
      </div>
      <div>
        <h2 className="text-xl font-bold text-dark-gray">{user.name}</h2>
        <p className="text-gray-400 font-semibold text-sm">{user.phone}</p>
      </div>
    </div>

    <div className="space-y-4">
      <ProfileMenuItem icon={<Smartphone size={20} />} label="My Repairs" />
      <ProfileMenuItem icon={<CreditCard size={20} />} label="Payment Methods" />
      <ProfileMenuItem icon={<Bell size={20} />} label="Notifications" badge="2" />
      <ProfileMenuItem icon={<ShieldCheck size={20} />} label="Help & Support" />
      <div className="pt-4">
        <ProfileMenuItem icon={<LogOut size={20} />} label="Logout" className="text-red-500 bg-red-50 border-none" />
      </div>
    </div>
  </div>
);

const ProfileMenuItem = ({ icon, label, badge, className }: { icon: React.ReactNode; label: string; badge?: string; className?: string }) => (
  <Card className={cn('flex items-center gap-4 p-4 active:scale-[0.98]', className)}>
    <div className="text-gray-400">{icon}</div>
    <span className="flex-1 font-bold text-sm">{label}</span>
    {badge && <span className="bg-primary text-white text-[10px] font-bold px-2 py-0.5 rounded-full">{badge}</span>}
    <ChevronRight size={18} className="text-gray-300" />
  </Card>
);

const AdminDashboard = ({ requests, onUpdateStatus, onBack }: { requests: RepairRequest[]; onUpdateStatus: (id: string, s: RepairStatus) => void; onBack: () => void }) => {
  const stats = [
    { label: 'Total Requests', value: requests.length, icon: <LayoutDashboard />, color: 'bg-blue-500' },
    { label: 'Active Repairs', value: requests.filter(r => r.status !== 'Delivered').length, icon: <TrendingUp />, color: 'bg-orange-500' },
    { label: 'Technicians', value: MOCK_TECHNICIANS.length, icon: <Users />, color: 'bg-green-500' },
  ];

  return (
    <div className="p-6 pt-12 space-y-8 bg-gray-50 min-h-screen">
      <header className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="p-3 bg-white rounded-2xl shadow-sm border border-black/5">
            <ArrowLeft size={20} />
          </button>
          <h1 className="text-2xl font-extrabold text-dark-gray">Admin Panel</h1>
        </div>
        <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center text-white">
          <User size={20} />
        </div>
      </header>

      <div className="grid grid-cols-3 gap-4">
        {stats.map(stat => (
          <div key={stat.label} className="bg-white p-4 rounded-3xl shadow-sm border border-black/5 space-y-2">
            <div className={cn("w-8 h-8 rounded-xl flex items-center justify-center text-white", stat.color)}>
              {React.cloneElement(stat.icon as React.ReactElement<any>, { size: 16 })}
            </div>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{stat.label}</p>
            <p className="text-xl font-extrabold text-dark-gray">{stat.value}</p>
          </div>
        ))}
      </div>

      <section className="space-y-4">
        <h3 className="text-lg font-bold text-dark-gray">Recent Requests</h3>
        <div className="space-y-4">
          {requests.map(req => (
            <Card key={req.id} className="p-5 space-y-4">
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center text-gray-500">
                    {req.deviceType === 'Mobile' ? <Smartphone size={20} /> : <Laptop size={20} />}
                  </div>
                  <div>
                    <h4 className="font-bold text-sm">{req.issue}</h4>
                    <p className="text-xs text-gray-400">{req.id}</p>
                  </div>
                </div>
                <button className="text-gray-400"><MoreVertical size={18} /></button>
              </div>
              
              <div className="flex items-center justify-between pt-4 border-t border-gray-50">
                <select 
                  value={req.status} 
                  onChange={(e) => onUpdateStatus(req.id, e.target.value as RepairStatus)}
                  className="bg-gray-50 text-xs font-bold text-primary px-3 py-2 rounded-xl focus:outline-none border-none"
                >
                  {[
                    'Request Confirmed',
                    'Technician Assigned',
                    'On The Way',
                    'Device Picked Up',
                    'Repair In Progress',
                    'Repair Completed',
                    'Out For Delivery',
                    'Delivered'
                  ].map(s => <option key={s} value={s}>{s}</option>)}
                </select>
                <span className="text-xs font-extrabold text-dark-gray">₹{req.estimatedCost}</span>
              </div>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
};
