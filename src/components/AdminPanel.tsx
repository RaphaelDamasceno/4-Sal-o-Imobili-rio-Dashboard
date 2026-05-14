import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Save, ArrowLeft, Image as ImageIcon, Loader2, CheckCircle2, ShieldCheck, Search } from 'lucide-react';
import { fetchLogos, saveLogos } from '../services/logoService';
import { fetchAppointments } from '../services/appointmentService';

export default function AdminPanel({ onBack }: { onBack: () => void }) {
  const [logos, setLogos] = useState<Record<string, string>>({});
  const [entities, setEntities] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState('');
  const [feedback, setFeedback] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const [savedLogos, appointments] = await Promise.all([
          fetchLogos(),
          fetchAppointments()
        ]);
        
        // Extract all unique names that can have a logo
        const uniqueNames = new Set<string>();
        appointments.forEach(a => {
          if (a.constructor) uniqueNames.add(a.constructor);
          if (a.superintendence) uniqueNames.add(a.superintendence);
          if (a.board) uniqueNames.add(a.board);
        });

        setLogos(savedLogos);
        setEntities(Array.from(uniqueNames).sort());
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      await saveLogos(logos);
      setFeedback(true);
      setTimeout(() => setFeedback(false), 3000);
    } catch (err) {
      alert('Erro ao salvar');
    } finally {
      setSaving(false);
    }
  };

  const filteredEntities = entities.filter(e => 
    e.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-screen gap-6 text-brand-text-dim">
        <Loader2 className="animate-spin text-brand-green" size={48} />
        <p className="font-bold uppercase tracking-[0.4em] text-base font-sans">Sincronizando Sistema...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full text-[#191c1d] font-sans">
      <header className="flex flex-col lg:flex-row lg:items-center justify-between mb-12 gap-8">
        <div className="flex items-center gap-6">
          <button 
            onClick={onBack}
            className="w-14 h-14 bg-white rounded-md flex items-center justify-center hover:bg-brand-bg transition-all duration-300 border border-[#d1d5db] active:scale-95 group shadow-sm"
          >
            <ArrowLeft size={20} className="text-brand-navy group-hover:-translate-x-1 transition-transform" />
          </button>
          <div>
            <div className="flex items-center gap-3 text-brand-green-text mb-2">
              <div className="w-2 h-2 rounded-full bg-brand-green shadow-[0_0_10px_rgba(29,179,74,0.4)]" />
              <span className="text-[12px] font-bold uppercase tracking-[0.3em] font-sans">Infraestrutura Privada</span>
            </div>
            <h1 className="text-6xl lg:text-7xl font-black text-brand-navy leading-none font-display tracking-tight">Gestão de Identidade</h1>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-brand-text-dim" size={18} />
            <input 
              type="text" 
              placeholder="Localizar registro..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="bg-white border border-[#d1d5db] rounded-md pl-14 pr-6 py-4 w-full sm:w-[320px] focus:ring-1 ring-brand-green/30 outline-none transition-all duration-300 shadow-sm text-base font-semibold text-brand-navy"
            />
          </div>
          <button 
            onClick={handleSave}
            disabled={saving}
            className={`flex items-center justify-center gap-3 px-8 py-4 rounded-md font-bold uppercase tracking-wider text-base transition-all duration-300 shadow-md ${
              feedback ? 'bg-green-600 text-white shadow-brand-green/20' : 'navy-gradient text-white hover:opacity-90 active:scale-95'
            }`}
          >
            {saving ? <Loader2 className="animate-spin" size={18} /> : feedback ? <CheckCircle2 size={18} /> : <Save size={18} />}
            {feedback ? 'Configuração Salva' : 'Atualizar Ativos'}
          </button>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto pr-2 custom-scrollbar-hidden pb-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredEntities.map((name) => (
            <motion.div 
              key={name}
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              className="feature-card p-6 bg-white border-[#d1d5db] group hover:border-brand-green/20 transition-all duration-300"
            >
              <div className="flex items-center gap-5 mb-6">
                <div className="w-16 h-16 bg-brand-bg rounded-md flex items-center justify-center overflow-hidden border border-[#d1d5db] group-hover:bg-white transition-all duration-500 shadow-inner">
                  {logos[name] ? (
                    <img src={logos[name]} alt={name} className="w-full h-full object-contain p-2" referrerPolicy="no-referrer" />
                  ) : (
                    <ImageIcon size={24} className="text-brand-navy/10" />
                  )}
                </div>
                <div className="flex-1 overflow-hidden">
                  <p className="text-[11px] font-bold uppercase text-brand-green-text tracking-wider mb-1 leading-none font-sans">Registro de Ativo</p>
                  <h3 className="text-xl font-bold text-brand-navy font-display truncate leading-tight">{name}</h3>
                </div>
              </div>
              
              <div className="space-y-2.5">
                <div className="flex justify-between items-center">
                   <label className="text-[11px] font-bold uppercase text-brand-text-dim tracking-widest font-sans">URL da Logomarca</label>
                   {logos[name] && <div className="w-1.5 h-1.5 rounded-full bg-brand-green" />}
                </div>
                <div className="relative">
                   <input 
                     type="text" 
                     value={logos[name] || ''}
                     placeholder="https://cdn.horizon.com/logo.png"
                     onChange={(e) => setLogos({ ...logos, [name]: e.target.value })}
                     className="w-full bg-brand-bg border border-[#d1d5db] rounded-sm px-4 py-3 text-sm font-mono focus:ring-1 ring-brand-green/30 outline-none text-brand-navy transition-all"
                   />
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </main>

    </div>
  );
}
