import React, { useEffect, useState, useMemo, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Building2, 
  UserCheck,
  RefreshCw,
  Trophy,
  Calendar,
  User,
  ArrowUpRight,
  Target,
  Crown,
  Medal,
  Settings,
  Bell
} from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { fetchAppointments } from './services/appointmentService';
import { fetchLogos } from './services/logoService';
import { Appointment } from './types';
import AdminPanel from './components/AdminPanel';

// --- Background Components ---

const DynamicBackground = () => (
  <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none bg-[#f8f9fa]">
    {/* Pulsing Green Base Aura */}
    <motion.div 
      animate={{ 
        opacity: [0.03, 0.07, 0.03],
        scale: [1, 1.1, 1],
      }}
      transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
      className="absolute inset-0 bg-brand-green/5 blur-3xl"
    />

    {/* Animated Green Blobs (Intensified) */}
    <motion.div 
      animate={{ 
        scale: [1, 1.3, 1],
        opacity: [0.02, 0.06, 0.02],
        x: [0, 100, 0],
        y: [0, -40, 0],
        rotate: [0, 45, 0]
      }}
      transition={{ duration: 30, repeat: Infinity, ease: "easeInOut" }}
      className="absolute -top-1/4 -right-1/4 w-[1400px] h-[1400px] bg-brand-green/15 rounded-full blur-[180px]" 
    />
    
    <motion.div 
      animate={{ 
        scale: [1.2, 1, 1.2],
        opacity: [0.01, 0.04, 0.01],
        x: [0, -100, 0],
        y: [0, 60, 0],
        rotate: [0, -30, 0]
      }}
      transition={{ duration: 40, repeat: Infinity, ease: "easeInOut" }}
      className="absolute -bottom-1/4 -left-1/4 w-[1500px] h-[1500px] bg-brand-green/10 rounded-full blur-[200px]" 
    />

    {/* Sweeping Green Light / Shade */}
    <motion.div 
      animate={{ 
        x: ['-100%', '100%'],
        opacity: [0, 0.02, 0],
      }}
      transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
      className="absolute inset-0 bg-gradient-to-r from-transparent via-brand-green/8 to-transparent -skew-x-12"
    />

    {/* Subtle Grid / Texture */}
    <div className="absolute inset-0 opacity-[0.04] pointer-events-none bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />
    <div className="absolute inset-0 bg-gradient-to-tr from-brand-navy/[0.03] via-transparent to-brand-green/[0.05] pointer-events-none" />
  </div>
);

// --- Entity Icon Helper ---

const EntityIcon = ({ name, logos, type = 'default' }: { name: string, logos: Record<string, string>, type?: 'default' | 'user' }) => {
  const [imgError, setImgError] = useState(false);
  
  const url = useMemo(() => {
    if (!name || !logos) return null;
    
    const normalizedName = name.trim().toUpperCase();
    
    // 1. Direct match
    if (logos[name]) return logos[name];
    
    // 2. Normalized match (uppercase/trimmed)
    if (logos[normalizedName]) return logos[normalizedName];
    
    // 3. Case-insensitive search through all keys
    const entries = Object.entries(logos);
    const match = entries.find(([key]) => key.trim().toUpperCase() === normalizedName);
    if (match) return match[1];
    
    // 4. Special normalization for MRV
    if (normalizedName.includes('MRV')) {
       // Search for ANY key that contains 'MRV' OR find a key that is just 'MRV'
       const mrvMatch = entries.find(([key]) => {
         const k = key.toUpperCase();
         return k === 'MRV' || k === 'MRV ENGENHARIA';
       });
       if (mrvMatch) return mrvMatch[1];
    }
    
    // 5. General partial match: check if logos contains a key that is within the name
    // (e.g. name "CONSTRUTORA EXATA" matches key "EXATA")
    const partialMatch = entries.find(([key]) => {
      const k = key.trim().toUpperCase();
      return k.length > 2 && normalizedName.includes(k);
    });
    if (partialMatch) return partialMatch[1];

    return null;
  }, [name, logos]);

  // Reset error state if URL changes
  useEffect(() => {
    setImgError(false);
  }, [url]);

  const iconColor = "text-brand-navy/30";

  if (url && !imgError) {
    return (
      <div className="w-full h-full overflow-hidden flex items-center justify-center rounded-sm bg-white p-1 border border-brand-navy/5 shadow-sm">
        <img 
          src={url} 
          alt={name} 
          className="w-full h-full object-contain" 
          referrerPolicy="no-referrer"
          onError={() => setImgError(true)}
        />
      </div>
    );
  }
  
  return type === 'user' ? <User size={24} className={iconColor} /> : <Building2 size={24} className={iconColor} />;
};

// --- Reusable UI Blocks ---

const CardHeading = ({ title, icon: Icon }: { title: string, icon: any }) => (
  <div className="flex items-center gap-3 mb-6">
    <div className="p-2 bg-brand-navy/5 rounded-md text-brand-navy border border-brand-navy/10 shadow-sm">
      <Icon size={18} />
    </div>
    <h2 className="text-[14px] font-extrabold uppercase tracking-[0.25em] text-brand-navy font-sans">{title}</h2>
  </div>
);

interface ProgressBarProps {
  label: string;
  count: number;
  percent: number;
  color?: string;
  index: number;
  logos: Record<string, string>;
}

const ProgressBar: React.FC<ProgressBarProps> = ({ label, count, percent, color = "green-gradient", index, logos }) => {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsReady(true), 1000 + (index * 100));
    return () => clearTimeout(timer);
  }, [index]);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.1, duration: 0.5 }}
      className="super-glass bg-white p-4 lg:p-5 border-[#d1d5db] group hover:border-brand-green/30 transition-all duration-300 flex flex-col gap-3"
    >
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 flex items-center justify-center">
            <EntityIcon name={label} logos={logos} />
          </div>
          <div className="flex flex-col">
            <span className="text-[11px] font-black uppercase tracking-wider text-brand-green-text font-sans leading-none mb-1">Construtora</span>
            <span className="text-lg font-bold text-brand-navy font-display leading-tight">{label}</span>
          </div>
        </div>
        <div className="text-right">
          <span className="text-4xl font-black tabular-nums text-brand-navy leading-none font-display">{count}</span>
          <div className="text-[12px] font-bold text-brand-text-muted uppercase tracking-wider mt-1 font-sans">Agendamentos</div>
        </div>
      </div>
      
      <div className="flex items-center gap-3">
        <div className="h-2 bg-brand-bg rounded-full flex-1 p-0.5 border border-[#bfc2c5] overflow-hidden relative">
          {!isReady && (
            <motion.div 
              initial={{ x: "-100%" }}
              animate={{ x: "100%" }}
              transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
              className="absolute inset-y-0 w-1/2 bg-brand-green/20 blur-sm"
            />
          )}
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: isReady ? `${percent}%` : 0 }}
            transition={{ duration: 1.5, ease: "easeOut" }}
            className={`h-full rounded-full ${color}`}
          />
        </div>
        <div className="w-10 flex justify-end">
          {isReady ? (
            <motion.span 
              initial={{ opacity: 0, x: -5 }}
              animate={{ opacity: 1, x: 0 }}
              className="text-[12px] font-bold text-brand-green-text tabular-nums font-sans"
            >
              {percent}%
            </motion.span>
          ) : (
            <div className="w-full h-3 bg-brand-navy/5 animate-pulse rounded-sm" />
          )}
        </div>
      </div>
    </motion.div>
  );
};

interface RankingItemProps {
  rank: number;
  name: string;
  count: number;
  percent: number;
  index: number;
  logos: Record<string, string>;
}

const RankingItem: React.FC<RankingItemProps> = ({ rank, name, count, percent, index, logos }) => (
  <motion.div 
    initial={{ opacity: 0, x: -20 }}
    whileInView={{ opacity: 1, x: 0 }}
    viewport={{ once: true }}
    transition={{ delay: index * 0.1, duration: 0.5 }}
    className={`super-glass p-4 lg:p-5 flex items-center gap-4 relative group border-[#d1d5db] ${rank === 1 ? 'bg-brand-green/[0.03] border-brand-green/20' : 'bg-white'}`}
  >
    <div className="relative shrink-0">
       {rank <= 3 ? (
         <div className={`absolute -top-1.5 -left-1.5 z-20 w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-bold border border-white shadow-sm ${
           rank === 1 ? 'bg-yellow-500 text-white' : rank === 2 ? 'bg-slate-300 text-slate-700' : 'bg-amber-700 text-white'
         }`}>
           {rank}
         </div>
       ) : null}
       <div className="w-10 h-10 rounded-md overflow-hidden bg-brand-bg flex items-center justify-center p-1 border border-[#d1d5db] group-hover:scale-105 transition-all duration-300">
          <EntityIcon name={name} logos={logos} type="user" />
       </div>
    </div>
    <div className="flex-1 min-w-0">
      <span className="text-[10px] font-black uppercase text-brand-green-text tracking-wider mb-0 block font-sans">Superintendência</span>
      <h3 className="text-lg font-bold text-brand-navy font-display truncate leading-tight">{name}</h3>
    </div>

    <div className="text-right shrink-0">
      <div className="flex items-center justify-end gap-1 text-brand-navy tabular-nums font-display">
        <span className="text-3xl font-black">{count}</span>
        <ArrowUpRight size={12} className="text-brand-green" />
      </div>
    </div>
  </motion.div>
);


interface BoardRankingItemProps {
  item: { name: string, count: number };
  idx: number;
  maxCount: number;
  logos: Record<string, string>;
}

const BoardRankingItem: React.FC<BoardRankingItemProps> = ({ item, idx, maxCount, logos }) => {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsReady(true), 1200 + (idx * 150));
    return () => clearTimeout(timer);
  }, [idx]);

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      transition={{ delay: idx * 0.1, duration: 0.5 }}
      className="flex items-center gap-4 group feature-card bg-brand-bg p-4 lg:p-5 border-[#d1d5db] hover:border-brand-green/20 transition-all duration-300"
    >
      <div className="w-9 h-9 lg:w-10 lg:h-10 bg-white flex items-center justify-center p-1.5 rounded-sm border border-[#d1d5db] shadow-sm shrink-0">
         <EntityIcon name={item.name} logos={logos} type="user" />
      </div>
      <div className="flex-1 min-w-0">
         <div className="flex justify-between items-baseline mb-0.5 text-brand-navy">
           <div className="flex flex-col min-w-0">
             <span className="text-[10px] font-black uppercase text-brand-green-text tracking-wider mb-0 font-sans">Métrica Master</span>
             <span className="text-base lg:text-lg font-bold text-brand-navy font-display truncate leading-tight">{item.name}</span>
           </div>
           <span className="text-2xl font-black tabular-nums font-display shrink-0">{item.count}</span>
         </div>
         <div className="h-1.5 bg-white rounded-full overflow-hidden p-0.5 border border-[#d1d5db] relative">
            {!isReady && (
              <motion.div 
                initial={{ x: "-100%" }}
                animate={{ x: "100%" }}
                transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                className="absolute inset-y-0 w-1/3 bg-brand-green/10 blur-sm"
              />
            )}
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: isReady ? `${(item.count / maxCount) * 100}%` : 0 }}
              className="h-full green-gradient rounded-full"
              transition={{ duration: 1.5, ease: "easeOut" }}
            />
         </div>
      </div>
    </motion.div>
  );
};

// --- New Appointment Notification ---

const NewAppointmentNotification = ({ appointment, onClose, logos }: { appointment: Appointment, onClose: () => void, logos: Record<string, string> }) => {
  useEffect(() => {
    // This timer will now only run once because onClose is memoized
    const timer = setTimeout(onClose, 8000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[200] flex items-center justify-center p-4 lg:p-10 pointer-events-none"
    >
      {/* Backdrop Inside (so it animates with the same timing) */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-brand-navy/90 backdrop-blur-2xl pointer-events-auto"
        onClick={onClose}
      />
      
      <motion.div
        initial={{ opacity: 0, scale: 0.8, y: 50 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.8, y: -50 }}
        transition={{ type: "spring", damping: 25, stiffness: 200 }}
        className="relative z-[201] w-[800px] max-w-full p-2 bg-brand-navy rounded-[2rem] shadow-[0_50px_150px_rgba(0,0,0,1)] border border-brand-green/30 overflow-hidden pointer-events-auto"
      >
        <div className="relative bg-brand-navy p-10 lg:p-14 rounded-[1.5rem] flex items-center gap-10 lg:gap-14 overflow-hidden">
          {/* Animated cinematic glow */}
          <motion.div 
            animate={{ 
              opacity: [0.1, 0.5, 0.1],
              scale: [1, 1.5, 1]
            }}
            transition={{ duration: 4, repeat: Infinity }}
            className="absolute inset-0 bg-brand-green/10 blur-[100px] pointer-events-none" 
          />
          
          {/* Giant Progress bar at the bottom */}
          <motion.div 
            initial={{ width: "100%" }}
            animate={{ width: "0%" }}
            transition={{ duration: 8, ease: "linear" }}
            className="absolute bottom-0 left-0 h-2 bg-brand-green shadow-[0_0_40px_rgba(0,255,157,1)]"
          />

          <div className="w-32 h-32 lg:w-48 lg:h-48 shrink-0 bg-white p-6 lg:p-8 rounded-2xl border-4 border-white shadow-2xl relative z-10 flex items-center justify-center">
             <EntityIcon name={appointment.constructor} logos={logos} />
             <div className="absolute -top-4 -right-4 w-12 h-12 bg-brand-green rounded-full flex items-center justify-center shadow-2xl border-4 border-brand-navy">
                <Trophy size={24} className="text-brand-navy" />
             </div>
          </div>
          
          <div className="flex-1 min-w-0 relative z-10">
            <div className="flex items-center gap-4 mb-4">
              <div className="relative">
                <div className="w-4 h-4 rounded-full bg-brand-green shadow-[0_0_15px_rgba(0,255,157,1)] animate-ping absolute" />
                <div className="w-4 h-4 rounded-full bg-brand-green relative border-2 border-brand-navy" />
              </div>
              <span className="text-base lg:text-xl font-black uppercase text-brand-green tracking-[0.6em] font-sans">
                Aviso de Agendamento
              </span>
            </div>
            
            <motion.h4 
              initial={{ x: 50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.3, type: "spring" }}
              className="text-6xl lg:text-7xl font-black text-white leading-[0.9] font-display mb-6 tracking-tighter"
            >
              {appointment.clientName}
            </motion.h4>
            
            <div className="grid grid-cols-2 gap-8 lg:gap-12">
              <div className="flex flex-col">
                <span className="text-xs lg:text-sm font-black uppercase text-white/40 tracking-[0.3em] mb-2 font-sans truncate">Incorporadora</span>
                <div className="text-xl lg:text-2xl font-black text-white uppercase tracking-wider font-sans px-4 py-2 border-2 border-brand-green/40 rounded-lg bg-brand-green/10 inline-block w-fit truncate max-w-full">
                  {appointment.constructor}
                </div>
              </div>

              <div className="flex flex-col overflow-hidden">
                <span className="text-xs lg:text-sm font-black uppercase text-white/40 tracking-[0.3em] mb-2 font-sans truncate">Responsável</span>
                <span className="text-xl lg:text-2xl font-black text-white uppercase tracking-widest font-sans truncate">
                  {appointment.brokerName}
                </span>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

const parseDate = (dateStr: string) => {
  if (!dateStr) return new Date(0);
  const d = new Date(dateStr);
  if (!isNaN(d.getTime())) return d;
  
  // Handle DD/MM/YYYY HH:mm:ss (Common in Brazil/Google Sheets)
  const match = dateStr.match(/^(\d{2})\/(\d{2})\/(\d{4})(\s*(\d{2})?:?(\d{2})?:?(\d{2})?)?$/);
  if (match) {
    const [_, day, month, year, timePart = '', hour = '0', min = '0', sec = '0'] = match;
    return new Date(parseInt(year), parseInt(month) - 1, parseInt(day), parseInt(hour), parseInt(min), parseInt(sec));
  }
  return new Date(0);
};

export default function App() {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [logos, setLogos] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const [showAdmin, setShowAdmin] = useState(false);
  const [currentNotification, setCurrentNotification] = useState<Appointment | null>(null);
  const [viewMode, setViewMode] = useState<'dashboard' | 'ranking'>('dashboard');
  
  const lastSeenId = useRef<string | null>(null);
  const isInitialLoad = useRef(true);

  const closeNotification = useCallback(() => {
    setCurrentNotification(null);
  }, []);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const loadData = async () => {
    try {
      const [appts, logosData] = await Promise.all([
        fetchAppointments(),
        fetchLogos()
      ]);
      setAppointments(appts);
      setLogos(logosData);
      setLastUpdate(new Date());
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    const interval = setInterval(() => {
      console.log('Checking for new data...');
      loadData();
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const cycleInterval = setInterval(() => {
      setViewMode(prev => prev === 'dashboard' ? 'ranking' : 'dashboard');
    }, 30000); // 30 seconds dashboard, 30 seconds ranking
    return () => clearInterval(cycleInterval);
  }, []);

  const totalAppointments = appointments.length;
  const validatedAppointmentsCount = useMemo(() => 
    appointments.filter(a => a.isValidated).length, 
  [appointments]);
  
  const latestAppointment = useMemo(() => {
    if (appointments.length === 0) return null;
    const valid = appointments.filter(a => a.clientName && !a.clientName.includes('<'));
    if (valid.length === 0) return null;

    return [...valid].sort((a, b) => {
      const timeA = parseDate(a.timestamp).getTime();
      const timeB = parseDate(b.timestamp).getTime();
      if (timeA !== timeB) return timeB - timeA;
      return appointments.indexOf(b) - appointments.indexOf(a);
    })[0];
  }, [appointments]);
  
  const constructorStats = useMemo(() => {
    const counts: Record<string, number> = {};
    appointments.forEach(a => {
      if (a.constructor) counts[a.constructor] = (counts[a.constructor] || 0) + 1;
    });
    return Object.entries(counts)
      .map(([name, count]) => ({ name, count, percent: Math.round((count / totalAppointments) * 100) || 0 }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  }, [appointments, totalAppointments]);

  const superintendenceStats = useMemo(() => {
    const counts: Record<string, number> = {};
    appointments.forEach(a => {
      if (a.superintendence) counts[a.superintendence] = (counts[a.superintendence] || 0) + 1;
    });
    return Object.entries(counts)
      .map(([name, count]) => ({ name, count, percent: Math.round((count / totalAppointments) * 100) || 0 }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 3);
  }, [appointments, totalAppointments]);

  const boardStats = useMemo(() => {
    const counts: Record<string, number> = {};
    appointments.forEach(a => {
      if (a.board) counts[a.board] = (counts[a.board] || 0) + 1;
    });
    return Object.entries(counts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  }, [appointments]);

  const brokerTop10 = useMemo(() => {
    const counts: Record<string, number> = {};
    appointments.forEach(a => {
      if (a.brokerName) counts[a.brokerName] = (counts[a.brokerName] || 0) + 1;
    });
    return Object.entries(counts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);
  }, [appointments]);

  const leaderTop10 = useMemo(() => {
    const counts: Record<string, number> = {};
    appointments.forEach(a => {
      if (a.leader) counts[a.leader] = (counts[a.leader] || 0) + 1;
    });
    return Object.entries(counts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);
  }, [appointments]);

  useEffect(() => {
    if (appointments.length > 0) {
      // 1. Filter out garbage data (like HTML tags parsed as CSV)
      const validAppointments = appointments.filter(a => 
        a.clientName && 
        !a.clientName.includes('<') && 
        !a.clientName.includes('meta name=') &&
        !a.clientName.includes('initial-scale')
      );

      if (validAppointments.length === 0) return;

      // 2. Robust sorting: by Date, then by original array position (implicitly)
      // We assume the LATEST ones are usually at the end of the array if dates are identical/missing
      const sorted = [...validAppointments].sort((a, b) => {
        const timeA = parseDate(a.timestamp).getTime();
        const timeB = parseDate(b.timestamp).getTime();
        
        if (timeA !== timeB) return timeB - timeA;
        
        // If dates are identical or invalid, use their position in the ORIGINAL array
        // (Items later in the array are assumed newer)
        return appointments.indexOf(b) - appointments.indexOf(a);
      });
      
      const latest = sorted[0];
      // Generate a unique ID for this specific appointment
      const latestId = `${latest.timestamp}-${latest.clientName}-${latest.constructor}-${latest.brokerName}`;

      console.log(`[Notification Check] Count: ${validAppointments.length} | Latest: ${latest.clientName} | Last Seen: ${lastSeenId.current}`);

      if (isInitialLoad.current) {
        lastSeenId.current = latestId;
        isInitialLoad.current = false;
        console.log('[Notification] Initial state set');
      } else if (latestId !== lastSeenId.current) {
        console.log(`[Notification] NEW APPOINTMENT DETECTED: ${latest.clientName}`);
        
        // Use a functional update or a slight delay to ensure key change triggers animation
        setCurrentNotification(prev => {
          if (prev && `${prev.timestamp}-${prev.clientName}-${prev.constructor}-${prev.brokerName}` === latestId) {
             return prev; 
          }
          return latest;
        });
        
        lastSeenId.current = latestId;
      }
    }
  }, [appointments]);

  const triggerTestNotification = () => {
    if (appointments.length > 0) {
      setCurrentNotification(appointments[Math.floor(Math.random() * appointments.length)]);
    }
  };

  if (showAdmin) {
    return (
      <div className="relative min-h-screen text-slate-900 bg-[#f8fafc] p-10 font-sans overflow-hidden">
        <DynamicBackground />
        <div className="relative z-10 h-full max-w-[1920px] mx-auto">
          <AdminPanel onBack={() => { setShowAdmin(false); loadData(); }} />
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen text-slate-900 overflow-hidden selection:bg-brand-green/20">
      <DynamicBackground />

      <AnimatePresence mode="wait">
        {currentNotification && (
          <NewAppointmentNotification 
            key={`${currentNotification.timestamp}-${currentNotification.clientName}`}
            appointment={currentNotification} 
            logos={logos} 
            onClose={closeNotification} 
          />
        )}
      </AnimatePresence>

      {/* Admin Access (Hidden) */}
      <button 
        onClick={() => setShowAdmin(true)}
        className="fixed top-4 right-4 w-12 h-12 z-[100] opacity-0 hover:opacity-100 flex items-center justify-center transition-opacity text-slate-200 hover:text-slate-400"
      >
        <Settings size={20} />
      </button>

      <div className="relative z-10 p-10 h-screen flex flex-col max-w-[1920px] mx-auto">
        
        {/* Header Row */}
        <div className="flex justify-between items-start mb-8">
          {/* Logo Area */}
          <div className="flex flex-col">
            <div className="h-16 group cursor-pointer" onClick={() => setShowAdmin(true)}>
               <img 
                 src="https://i.postimg.cc/Y2W2FZTp/salao-T1-T3.png" 
                 alt="Logo Salão Imobiliário" 
                 className="h-full w-auto object-contain brightness-100 drop-shadow-[0_5px_15px_rgba(0,0,0,0.1)]"
                 referrerPolicy="no-referrer"
               />
            </div>
          </div>

          <div className="flex items-center gap-10">
             <div className="flex flex-col items-end border-r border-brand-navy/10 pr-10">
                <p className="text-[12px] font-extrabold uppercase tracking-[0.4em] text-brand-green-text mb-1 font-sans">Time & Sync</p>
                <div className="flex items-center gap-3">
                   <div className="w-2 h-2 rounded-full bg-brand-green animate-pulse" />
                   <h3 className="text-2xl font-black text-brand-navy tabular-nums font-display">
                      {format(currentTime, 'HH:mm:ss')}
                   </h3>
                   <button 
                     onClick={triggerTestNotification}
                     className="p-1 rounded-full hover:bg-brand-navy/5 text-brand-navy/20 hover:text-brand-green transition-all"
                     title="Testar Notificação"
                   >
                     <Bell size={18} />
                   </button>
                </div>
             </div>

             <div className="hidden xl:flex flex-col items-end">
                <p className="text-[12px] font-extrabold uppercase tracking-[0.4em] text-brand-text-dim mb-1 font-sans">Ambiente</p>
                <div className="flex items-center gap-2">
                   <span className="text-xl font-black text-brand-navy font-display">SALA DE GUERRA v4.0</span>
                </div>
             </div>
          </div>
        </div>

        <AnimatePresence mode="wait">
          {viewMode === 'dashboard' ? (
            <motion.div 
              key="dashboard"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.02 }}
              transition={{ duration: 0.5 }}
              className="flex-1 flex flex-col overflow-hidden"
            >
              {/* Dynamic Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 flex-1 overflow-y-auto lg:overflow-hidden pb-4 custom-scrollbar-hidden">
                
                {/* Section: 1/3 - Latest Appointment */}
                <div className="col-span-1 lg:col-span-4 h-auto lg:h-full overflow-hidden">
                  <div className="feature-card p-6 lg:p-8 h-full flex flex-col bg-white relative min-h-[500px]">
                    <CardHeading title="Recente" icon={ArrowUpRight} />
                    
                    <div className="flex-1 flex flex-col">
                      {latestAppointment ? (
                        <div className="flex-1 flex flex-col justify-center py-2">
                          <motion.div 
                            initial={{ opacity: 0, y: 15 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            key={latestAppointment.timestamp}
                            className="space-y-6 lg:space-y-8"
                          >
                            <motion.div
                              initial={{ opacity: 0, y: 10 }}
                              whileInView={{ opacity: 1, y: 0 }}
                              viewport={{ once: true }}
                              transition={{ delay: 0.1 }}
                            >
                              <p className="text-[14px] font-extrabold uppercase tracking-[0.3em] text-brand-green-text mb-2 font-sans">Cliente VIP</p>
                              <h3 className="text-5xl lg:text-6xl font-black text-brand-navy leading-none font-display tracking-tight">{latestAppointment.clientName}</h3>
                            </motion.div>
        
                            <div className="grid grid-cols-2 gap-6">
                              <motion.div
                                initial={{ opacity: 0, x: -10 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: 0.2 }}
                              >
                                <p className="text-[12px] font-black uppercase tracking-widest text-brand-text-dim mb-2 font-sans">Corretor Responsável</p>
                                <p className="text-xl lg:text-2xl font-bold text-brand-navy font-display">{latestAppointment.brokerName}</p>
                              </motion.div>
                              <motion.div
                                initial={{ opacity: 0, x: 10 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: 0.3 }}
                              >
                                <p className="text-[12px] font-black uppercase tracking-widest text-brand-text-dim mb-2 font-sans">Canal de Origem</p>
                                <p className="text-xl lg:text-2xl font-bold text-brand-navy font-display">{latestAppointment.origin}</p>
                              </motion.div>
                            </div>
        
                            <motion.div 
                              initial={{ opacity: 0, y: 20 }}
                              whileInView={{ opacity: 1, y: 0 }}
                              viewport={{ once: true }}
                              transition={{ delay: 0.4 }}
                              className="p-6 rounded-md bg-brand-bg border border-[#d1d5db] shadow-[inset_0_2px_4px_rgba(0,0,0,0.01)]"
                            >
                              <div className="flex items-center gap-4 lg:gap-6">
                                <div className="w-16 h-16 lg:w-20 lg:h-20 bg-white flex items-center justify-center p-2 rounded-sm border border-[#d1d5db] shadow-sm">
                                   <EntityIcon name={latestAppointment.constructor} logos={logos} />
                                </div>
                                <div className="flex-1">
                                  <p className="text-[12px] font-black uppercase tracking-widest text-brand-green-text mb-1.5 font-sans">Incorporadora</p>
                                  <p className="text-2xl lg:text-4xl font-black text-brand-navy font-display leading-tight">{latestAppointment.constructor}</p>
                                </div>
                              </div>
                            </motion.div>
                          </motion.div>
                        </div>
                      ) : (
                        <div className="flex-1 flex items-center justify-center text-brand-navy/10">
                          <p className="font-bold uppercase tracking-widest font-sans">Aguardando dados...</p>
                        </div>
                      )}
        
                      <div className="mt-auto pt-6 border-t border-[#d1d5db] flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-brand-green animate-pulse" />
                          <span className="text-[12px] font-black uppercase tracking-widest text-brand-text-dim font-sans">Tempo Real</span>
                        </div>
                        <motion.p 
                          initial={{ opacity: 0, scale: 0.5 }}
                          whileInView={{ opacity: 1, scale: 1 }}
                          viewport={{ once: true }}
                          transition={{ type: "spring", stiffness: 200, delay: 0.5 }}
                          className="text-2xl lg:text-4xl font-black text-brand-navy/30 font-display"
                        >
                          #{totalAppointments}
                        </motion.p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Section: 2/3 - Indicators Grid */}
                <div className="col-span-1 lg:col-span-8 grid grid-cols-1 md:grid-cols-2 gap-8 h-auto lg:h-full">
                  
                  {/* 1. Total Appointments Card */}
                  <div className="feature-card p-6 lg:p-8 flex flex-col bg-white group transition-all duration-500 min-h-[250px] hover:border-brand-navy/10 overflow-hidden">
                    <CardHeading title="Desempenho Geral" icon={Calendar} />
                    <div className="flex-1 flex items-center justify-around gap-4">
                       
                       <div className="flex flex-col items-center">
                          <motion.p 
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="text-[12px] lg:text-[14px] font-extrabold uppercase tracking-[0.3em] text-brand-text-dim mb-2 font-sans text-center"
                          >
                            Total
                          </motion.p>
                          <motion.h1 
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 1, delay: 0.3, ease: "easeOut" }}
                            className="text-6xl lg:text-8xl font-black tracking-tighter tabular-nums text-brand-navy font-display"
                          >
                            {totalAppointments.toLocaleString('pt-BR')}
                          </motion.h1>
                       </div>

                       <div className="w-px h-24 bg-brand-navy/10" />

                       <div className="flex flex-col items-center">
                          <motion.p 
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.4 }}
                            className="text-[12px] lg:text-[14px] font-extrabold uppercase tracking-[0.3em] text-brand-green-text mb-2 font-sans text-center"
                          >
                            Validados
                          </motion.p>
                          <motion.h1 
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 1, delay: 0.5, ease: "easeOut" }}
                            className="text-6xl lg:text-8xl font-black tracking-tighter tabular-nums text-brand-green font-display"
                          >
                            {validatedAppointmentsCount.toLocaleString('pt-BR')}
                          </motion.h1>
                       </div>

                    </div>
                  </div>

                  {/* 2. Ranking Construtoras */}
                  <div className="feature-card p-4 lg:p-6 flex flex-col bg-white min-h-[250px] transition-all duration-300 hover:border-brand-navy/20 hover:shadow-xl overflow-hidden">
                    <CardHeading title="Engajamento Construtoras" icon={Building2} />
                    <div className="space-y-2 lg:space-y-3 flex-1 overflow-hidden flex flex-col justify-center max-h-[280px]">
                      {constructorStats.slice(0, 3).map((item, idx) => (
                        <ProgressBar 
                          key={item.name} 
                          label={item.name} 
                          count={item.count} 
                          percent={item.percent} 
                          index={idx}
                          logos={logos}
                        />
                      ))}
                    </div>
                  </div>

                  {/* 3. Ranking Superintendências */}
                  <div className="feature-card p-4 lg:p-6 flex flex-col bg-white min-h-[250px] transition-all duration-300 hover:border-brand-navy/20 hover:shadow-xl overflow-hidden">
                    <CardHeading title="Performance Regional" icon={Trophy} />
                    <div className="space-y-2 lg:space-y-3 flex-1 overflow-hidden flex flex-col justify-center max-h-[280px]">
                      {superintendenceStats.slice(0, 3).map((item, idx) => (
                        <RankingItem 
                          key={item.name}
                          rank={idx + 1}
                          name={item.name}
                          count={item.count}
                          percent={item.percent}
                          index={idx}
                          logos={logos}
                        />
                      ))}
                    </div>
                  </div>

                  {/* 4. Ranking Diretorias */}
                  <div className="feature-card p-4 lg:p-6 flex flex-col bg-white min-h-[250px] transition-all duration-300 hover:border-brand-navy/20 hover:shadow-xl overflow-hidden">
                    <CardHeading title="Melhores Diretorias" icon={UserCheck} />
                    <div className="space-y-2 lg:space-y-3 flex-1 overflow-hidden flex flex-col justify-center max-h-[280px]">
                      {boardStats.slice(0, 3).map((item, idx) => (
                        <BoardRankingItem 
                          key={item.name}
                          item={item}
                          idx={idx}
                          maxCount={boardStats[0]?.count || 1}
                          logos={logos}
                        />
                      ))}
                    </div>
                  </div>

                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div 
              key="ranking"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.02 }}
              transition={{ duration: 0.5 }}
              className="flex-1 flex flex-col overflow-hidden"
            >
              <div className="grid grid-cols-2 gap-10 flex-1 overflow-hidden">
                {/* Ranking Corretores */}
                <div className="feature-card h-full flex flex-col bg-white overflow-hidden p-8">
                  <div className="flex items-center justify-between mb-8">
                    <CardHeading title="Top 10 Corretores" icon={Medal} />
                    <div className="flex items-center gap-2 px-3 py-1 bg-brand-green/10 text-brand-green rounded-full">
                       <Target size={14} className="animate-pulse" />
                       <span className="text-[10px] font-black uppercase tracking-widest">Tempo Real</span>
                    </div>
                  </div>
                  
                  <div className="flex-1 flex flex-col overflow-hidden">
                    {/* Header Row */}
                    <div className="flex items-center px-4 mb-4 text-[10px] font-black uppercase tracking-[0.2em] text-brand-text-dim font-sans">
                      <div className="w-12">Pos</div>
                      <div className="flex-1">Corretor</div>
                      <div className="w-32 text-right">Agendamentos</div>
                    </div>
                    
                    <div className="flex-1 flex flex-col gap-2 pb-2">
                      {brokerTop10.map((item, idx) => (
                        <motion.div 
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: idx * 0.04 }}
                          key={item.name} 
                          className={`flex-1 flex items-center px-4 rounded-xl group ${idx === 0 ? 'bg-brand-green/5' : 'bg-brand-bg'} hover:bg-brand-navy/5 transition-colors border border-transparent hover:border-brand-navy/5`}
                        >
                           <div className="w-12">
                              <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-black text-sm ${
                                idx === 0 ? 'bg-yellow-500 text-white' : 
                                idx === 1 ? 'bg-slate-300 text-slate-700' : 
                                idx === 2 ? 'bg-amber-700 text-white' : 'text-brand-navy/60 bg-white border border-[#d1d5db]'
                              }`}>
                                {idx + 1}
                              </div>
                           </div>
                           <div className="flex-1 font-bold text-brand-navy text-lg lg:text-xl font-display truncate pr-4">
                              {item.name}
                           </div>
                           <div className="w-32 flex items-center justify-end gap-2 text-brand-navy">
                              <span className="text-2xl lg:text-3xl font-black font-display">{item.count}</span>
                              <Crown className={`text-brand-green opacity-0 group-hover:opacity-100 transition-opacity ${idx === 0 ? 'opacity-100' : ''}`} size={16} />
                           </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Ranking Líderes */}
                <div className="feature-card h-full flex flex-col bg-white overflow-hidden p-8">
                  <div className="flex items-center justify-between mb-8">
                    <CardHeading title="Top 10 Líderes" icon={Trophy} />
                    <div className="flex items-center gap-2 px-3 py-1 bg-brand-navy/5 text-brand-navy/40 rounded-full">
                       <Target size={14} />
                       <span className="text-[10px] font-black uppercase tracking-widest">Alta Métrica</span>
                    </div>
                  </div>

                  <div className="flex-1 flex flex-col overflow-hidden">
                    {/* Header Row */}
                    <div className="flex items-center px-4 mb-4 text-[10px] font-black uppercase tracking-[0.2em] text-brand-text-dim font-sans">
                      <div className="w-12">Pos</div>
                      <div className="flex-1">Líder</div>
                      <div className="w-32 text-right">Volume</div>
                    </div>

                    <div className="flex-1 flex flex-col gap-2 pb-2">
                      {leaderTop10.map((item, idx) => (
                        <motion.div 
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: idx * 0.04 }}
                          key={item.name} 
                          className={`flex-1 flex items-center px-4 rounded-xl group ${idx === 0 ? 'bg-brand-navy/5' : 'bg-brand-bg'} hover:bg-brand-green/5 transition-colors border border-transparent hover:border-brand-green/5`}
                        >
                           <div className="w-12">
                              <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-black text-sm ${
                                idx === 0 ? 'bg-brand-navy text-white' : 
                                idx === 1 ? 'bg-brand-navy/70 text-white' : 
                                idx === 2 ? 'bg-brand-navy/40 text-white' : 'text-brand-navy/60 bg-white border border-[#d1d5db]'
                              }`}>
                                {idx + 1}
                              </div>
                           </div>
                           <div className="flex-1 font-bold text-brand-navy text-lg lg:text-xl font-display truncate pr-4">
                              {item.name}
                           </div>
                           <div className="w-32 flex items-center justify-end gap-2 text-brand-navy">
                              <span className="text-2xl lg:text-3xl font-black font-display">{item.count}</span>
                              <Target className={`text-brand-green opacity-0 group-hover:opacity-100 transition-opacity ${idx === 0 ? 'opacity-100' : ''}`} size={16} />
                           </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
}
