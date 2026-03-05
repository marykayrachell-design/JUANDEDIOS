import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { motion } from 'motion/react';
import { LogIn, Mail, Lock, AlertCircle } from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) throw error;
    } catch (err: any) {
      setError(err.message || 'Error al iniciar sesión');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center p-4 font-sans">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-fundacion-blue/5 rounded-full blur-3xl" />
        <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-fundacion-yellow/5 rounded-full blur-3xl" />
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md relative z-10"
      >
        <div className="bg-white rounded-[2.5rem] shadow-2xl shadow-slate-200/60 border border-slate-100 p-10">
          <div className="flex flex-col items-center mb-10">
            <div className="w-20 h-20 bg-white rounded-3xl flex items-center justify-center shadow-xl mb-6 border border-slate-50">
              <img 
                src="/logo.jpg" 
                alt="Logo Fundación" 
                className="w-16 h-16 object-contain"
                referrerPolicy="no-referrer"
                onError={(e) => {
                  // Fallback if logo doesn't exist yet
                  (e.target as HTMLImageElement).style.display = 'none';
                  (e.target as HTMLImageElement).parentElement!.innerHTML = '<div class="w-12 h-12 bg-fundacion-blue rounded-2xl flex items-center justify-center text-white font-black text-2xl">J</div>';
                }}
              />
            </div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">Iniciar Sesión</h1>
            <p className="text-sm text-slate-400 font-bold uppercase tracking-widest mt-2">Fundación Juan de Dios</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Correo Electrónico</label>
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300 group-focus-within:text-fundacion-blue transition-colors" />
                <input
                  required
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold focus:outline-none focus:ring-4 focus:ring-fundacion-blue/10 focus:border-fundacion-blue transition-all"
                  placeholder="admin@fundacion.org"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Contraseña</label>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300 group-focus-within:text-fundacion-blue transition-colors" />
                <input
                  required
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold focus:outline-none focus:ring-4 focus:ring-fundacion-blue/10 focus:border-fundacion-blue transition-all"
                  placeholder="••••••••"
                />
              </div>
            </div>

            {error && (
              <motion.div 
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-center gap-3 p-4 bg-fundacion-red/10 border border-fundacion-red/20 rounded-2xl"
              >
                <AlertCircle className="w-5 h-5 text-fundacion-red shrink-0" />
                <p className="text-xs font-bold text-fundacion-red leading-tight">{error}</p>
              </motion.div>
            )}

            <button
              disabled={loading}
              type="submit"
              className="w-full py-4 bg-fundacion-blue text-white rounded-2xl text-sm font-black uppercase tracking-[0.2em] shadow-xl shadow-blue-900/20 hover:bg-blue-800 transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <LogIn className="w-5 h-5" />
                  Entrar al Sistema
                </>
              )}
            </button>
          </form>

          <div className="mt-10 text-center">
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
              © {new Date().getFullYear()} Fundación Juan de Dios
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
