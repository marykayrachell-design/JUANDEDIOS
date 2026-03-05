import React from 'react';
import { 
  LayoutDashboard, 
  Package, 
  ArrowDownToLine, 
  ArrowUpFromLine, 
  Users, 
  HeartHandshake,
  Menu,
  X,
  Info,
  HelpCircle,
  LogOut
} from 'lucide-react';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';
import { supabase } from '../lib/supabase';

interface SidebarItemProps {
  icon: React.ElementType;
  label: string;
  active: boolean;
  onClick: () => void;
  [key: string]: any;
}

const SidebarItem = ({ icon: Icon, label, active, onClick }: SidebarItemProps) => (
  <button
    onClick={onClick}
    className={cn(
      "flex items-center w-full px-4 py-3 text-sm font-semibold transition-all rounded-xl relative group",
      active 
        ? "bg-fundacion-blue text-white shadow-lg shadow-blue-900/20" 
        : "text-slate-500 hover:bg-slate-100 hover:text-fundacion-blue"
    )}
  >
    <Icon className={cn("w-5 h-5 mr-3 transition-transform group-hover:scale-110", active ? "text-fundacion-yellow" : "text-slate-400")} />
    {label}
    {active && (
      <motion.div 
        layoutId="active-pill"
        className="absolute right-2 w-1.5 h-1.5 rounded-full bg-fundacion-yellow"
      />
    )}
  </button>
);

interface LayoutProps {
  children: React.ReactNode;
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export default function Layout({ children, activeTab, setActiveTab }: LayoutProps) {
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);
  const [showHelp, setShowHelp] = React.useState(false);

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'inventory', label: 'Inventario', icon: Package },
    { id: 'donations_in', label: 'Entradas', icon: ArrowDownToLine },
    { id: 'donations_out', label: 'Salidas', icon: ArrowUpFromLine },
    { id: 'donors', label: 'Donantes', icon: HeartHandshake },
    { id: 'beneficiaries', label: 'Beneficiarios', icon: Users },
  ];

  return (
    <div className="flex h-screen bg-[#F8FAFC] overflow-hidden font-sans">
      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-slate-900/60 backdrop-blur-sm lg:hidden"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <aside className={cn(
        "fixed inset-y-0 left-0 z-50 w-72 bg-white border-r border-slate-200 transition-all duration-500 ease-in-out transform lg:translate-x-0 lg:static lg:inset-0",
        isSidebarOpen ? "translate-x-0 shadow-2xl" : "-translate-x-full"
      )}>
        <div className="flex flex-col h-full">
          {/* Logo Section */}
          <div className="p-8">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-xl rotate-3 border border-slate-50 overflow-hidden">
                  <img 
                    src="/logo.jpg" 
                    alt="Logo Fundación" 
                    className="w-10 h-10 object-contain"
                    referrerPolicy="no-referrer"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none';
                      (e.target as HTMLImageElement).parentElement!.innerHTML = '<div class="w-full h-full bg-fundacion-blue flex items-center justify-center text-white font-black text-2xl">J</div>';
                    }}
                  />
                </div>
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-fundacion-red rounded-full border-2 border-white" />
              </div>
              <div className="flex flex-col">
                <span className="text-lg font-black text-slate-900 leading-none tracking-tight">JUAN DE DIOS</span>
                <span className="text-[10px] text-fundacion-green uppercase tracking-[0.2em] font-black mt-1">Fundación</span>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 space-y-1.5 overflow-y-auto custom-scrollbar">
            {menuItems.map((item) => (
              <SidebarItem
                key={item.id}
                icon={item.icon}
                label={item.label}
                active={activeTab === item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  setIsSidebarOpen(false);
                }}
              />
            ))}
          </nav>

          {/* Sidebar Footer */}
          <div className="p-6">
            <button 
              onClick={() => setShowHelp(!showHelp)}
              className="flex items-center justify-between w-full p-4 bg-slate-50 rounded-2xl border border-slate-100 hover:border-fundacion-yellow transition-all group"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white rounded-lg shadow-sm group-hover:text-fundacion-orange">
                  <HelpCircle className="w-4 h-4" />
                </div>
                <span className="text-xs font-bold text-slate-600">¿Necesitas ayuda?</span>
              </div>
              <div className="w-2 h-2 rounded-full bg-fundacion-yellow animate-pulse" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex flex-col flex-1 overflow-hidden">
        {/* Header */}
        <header className="h-20 bg-white/80 backdrop-blur-md border-b border-slate-200 flex items-center justify-between px-8 shrink-0 z-30">
          <div className="flex items-center gap-4">
            <button 
              className="lg:hidden p-2.5 text-slate-600 hover:bg-slate-100 rounded-xl transition-all"
              onClick={() => setIsSidebarOpen(true)}
            >
              <Menu className="w-6 h-6" />
            </button>
            <div className="flex flex-col">
              <h1 className="text-xl font-black text-slate-900 capitalize tracking-tight">
                {menuItems.find(i => i.id === activeTab)?.label}
              </h1>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Panel de Control</p>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <div className="hidden md:flex items-center gap-3 px-4 py-2 bg-slate-50 rounded-2xl border border-slate-100">
              <div className="w-2 h-2 rounded-full bg-fundacion-green" />
              <span className="text-xs font-bold text-slate-600">Sistema Online</span>
            </div>
            
            <div className="flex items-center gap-3 pl-6 border-l border-slate-200">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-black text-slate-900">Administrador</p>
                <p className="text-[10px] text-fundacion-blue font-bold uppercase">Fundación Juan de Dios</p>
              </div>
              <button 
                onClick={() => supabase.auth.signOut()}
                className="w-12 h-12 bg-fundacion-yellow rounded-2xl flex items-center justify-center text-fundacion-blue font-black shadow-lg shadow-yellow-500/20 border-2 border-white hover:bg-fundacion-red hover:text-white transition-all group"
                title="Cerrar Sesión"
              >
                <LogOut className="w-5 h-5 group-hover:scale-110 transition-transform" />
              </button>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <main className="flex-1 overflow-y-auto p-8 custom-scrollbar">
          <motion.div 
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="max-w-7xl mx-auto"
          >
            {/* Contextual Help Banner */}
            <AnimatePresence>
              {showHelp && (
                <motion.div 
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="mb-8 overflow-hidden"
                >
                  <div className="bg-fundacion-blue p-6 rounded-3xl text-white relative overflow-hidden shadow-2xl shadow-blue-900/30">
                    <div className="absolute -right-10 -top-10 w-40 h-40 bg-white/10 rounded-full blur-3xl" />
                    <div className="relative z-10 flex items-start gap-4">
                      <div className="p-3 bg-white/20 rounded-2xl">
                        <Info className="w-6 h-6 text-fundacion-yellow" />
                      </div>
                      <div>
                        <h4 className="text-lg font-black mb-1 tracking-tight">Guía Rápida: {menuItems.find(i => i.id === activeTab)?.label}</h4>
                        <p className="text-sm text-blue-100 max-w-2xl font-medium leading-relaxed">
                          {activeTab === 'dashboard' && "Aquí puedes ver un resumen general de la fundación. Los gráficos te ayudan a entender el flujo de donaciones y las alertas te avisan cuando un producto se está agotando."}
                          {activeTab === 'inventory' && "Administra tu catálogo de productos. Puedes agregar nuevos items, editarlos o eliminarlos. El stock se actualiza automáticamente con cada entrada o salida."}
                          {activeTab === 'donations_in' && "Registra cada vez que un donante entrega productos. Selecciona el donante, el producto y la cantidad. ¡El stock subirá al instante!"}
                          {activeTab === 'donations_out' && "Registra las entregas a beneficiarios. Es obligatorio ingresar la cédula del beneficiario y quién realiza la entrega para mantener el control."}
                          {activeTab === 'donors' && "Mantén un registro de todas las personas y empresas que apoyan a la fundación con sus donaciones."}
                          {activeTab === 'beneficiaries' && "Registra a las personas que reciben ayuda. Esto nos permite asegurar que las donaciones lleguen a quienes más lo necesitan."}
                        </p>
                      </div>
                      <button 
                        onClick={() => setShowHelp(false)}
                        className="ml-auto p-2 hover:bg-white/10 rounded-xl transition-all"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {children}
          </motion.div>
        </main>
      </div>
    </div>
  );
}
