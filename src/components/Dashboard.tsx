import { useEffect, useState } from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle, 
  Package,
  Calendar,
  ArrowRight,
  Info
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer
} from 'recharts';
import { supabase } from '../lib/supabase';
import { Product } from '../types';
import { motion } from 'motion/react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

export default function Dashboard() {
  const [stats, setStats] = useState({
    totalIn: 0,
    totalOut: 0,
    lowStockCount: 0,
    totalProducts: 0
  });
  const [lowStockProducts, setLowStockProducts] = useState<Product[]>([]);
  const [chartData, setChartData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  async function fetchStats() {
    try {
      setLoading(true);
      
      // 1. Total In
      const { data: dataIn } = await supabase.from('donations_in').select('quantity');
      const totalIn = dataIn?.reduce((acc, curr) => acc + curr.quantity, 0) || 0;

      // 2. Total Out
      const { data: dataOut } = await supabase.from('donations_out').select('quantity');
      const totalOut = dataOut?.reduce((acc, curr) => acc + curr.quantity, 0) || 0;

      // 3. Low Stock & Total Products
      const { data: products } = await supabase.from('products').select('*');
      const lowStock = products?.filter(p => p.stock <= p.low_stock_threshold) || [];
      
      setStats({
        totalIn,
        totalOut,
        lowStockCount: lowStock.length,
        totalProducts: products?.length || 0
      });
      setLowStockProducts(lowStock.slice(0, 5));

      // 4. Chart Data (Mocking some monthly data for visualization if real data is sparse)
      // In a real app, you'd aggregate donations_in and donations_out by month
      setChartData([
        { name: 'Ene', entradas: 400, salidas: 240 },
        { name: 'Feb', entradas: 300, salidas: 139 },
        { name: 'Mar', entradas: 200, salidas: 980 },
        { name: 'Abr', entradas: 278, salidas: 390 },
        { name: 'May', entradas: 189, salidas: 480 },
        { name: 'Jun', entradas: 239, salidas: 380 },
      ]);

    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
    } finally {
      setLoading(false);
    }
  }

  const StatCard = ({ title, value, icon: Icon, color, subtext, delay }: any) => (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-100 flex items-start justify-between relative overflow-hidden group hover:shadow-xl hover:shadow-slate-200/50 transition-all duration-500"
    >
      <div className="relative z-10">
        <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2">{title}</p>
        <h3 className="text-4xl font-black text-slate-900 tracking-tight">{value}</h3>
        {subtext && <p className="text-[10px] font-bold text-slate-400 mt-2 uppercase tracking-wider">{subtext}</p>}
      </div>
      <div className={cn("p-4 rounded-2xl shadow-lg transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3", color)}>
        <Icon className="w-7 h-7 text-white" />
      </div>
      <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-slate-50 rounded-full opacity-50 group-hover:scale-150 transition-transform duration-700" />
    </motion.div>
  );

  // Helper for conditional classes
  function cn(...classes: string[]) {
    return classes.filter(Boolean).join(' ');
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-96 gap-4">
        <div className="w-12 h-12 border-4 border-fundacion-blue border-t-fundacion-yellow rounded-full animate-spin" />
        <p className="text-sm font-black text-slate-400 uppercase tracking-widest">Cargando Dashboard...</p>
      </div>
    );
  }

  return (
    <div className="space-y-10">
      {/* Welcome Message */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative overflow-hidden bg-fundacion-blue p-10 rounded-[3rem] text-white shadow-2xl shadow-blue-900/30"
      >
        <div className="absolute -right-20 -top-20 w-80 h-80 bg-white/10 rounded-full blur-3xl" />
        <div className="absolute -left-10 -bottom-10 w-40 h-40 bg-fundacion-yellow/20 rounded-full blur-2xl" />
        
        <div className="relative z-10 flex flex-col md:flex-row items-center gap-10">
          <div className="w-32 h-32 bg-white rounded-[2.5rem] flex items-center justify-center shadow-2xl rotate-3 shrink-0">
            <div className="w-24 h-24 bg-fundacion-blue rounded-3xl flex items-center justify-center text-white font-black text-5xl">
              J
            </div>
          </div>
          <div className="text-center md:text-left">
            <h2 className="text-4xl font-black tracking-tight mb-2">¡Bienvenido al Sistema de Inventario!</h2>
            <p className="text-blue-100 text-lg font-medium max-w-2xl">
              Fundación <span className="text-fundacion-yellow font-black">JUAN DE DIOS</span>. 
              Gestiona donaciones y entregas de manera eficiente para seguir ayudando a los campeones.
            </p>
            <div className="flex flex-wrap justify-center md:justify-start gap-4 mt-8">
              <div className="flex items-center gap-2 px-4 py-2 bg-white/10 rounded-xl border border-white/10 backdrop-blur-sm">
                <div className="w-2 h-2 rounded-full bg-fundacion-yellow animate-pulse" />
                <span className="text-xs font-bold uppercase tracking-widest">Sistema Activo</span>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 bg-white/10 rounded-xl border border-white/10 backdrop-blur-sm">
                <Calendar className="w-4 h-4 text-fundacion-yellow" />
                <span className="text-xs font-bold uppercase tracking-widest">{format(new Date(), 'dd MMMM, yyyy', { locale: es })}</span>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        <StatCard 
          title="Donaciones" 
          value={stats.totalIn} 
          icon={TrendingUp} 
          color="bg-fundacion-green"
          subtext="Unidades recibidas"
          delay={0.1}
        />
        <StatCard 
          title="Entregas" 
          value={stats.totalOut} 
          icon={TrendingDown} 
          color="bg-fundacion-blue"
          subtext="Unidades entregadas"
          delay={0.2}
        />
        <StatCard 
          title="Alertas" 
          value={stats.lowStockCount} 
          icon={AlertTriangle} 
          color="bg-fundacion-red"
          subtext="Stock crítico"
          delay={0.3}
        />
        <StatCard 
          title="Catálogo" 
          value={stats.totalProducts} 
          icon={Package} 
          color="bg-fundacion-orange"
          subtext="Total productos"
          delay={0.4}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Chart */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5 }}
          className="lg:col-span-2 bg-white p-10 rounded-[2.5rem] shadow-sm border border-slate-100"
        >
          <div className="flex items-center justify-between mb-10">
            <div>
              <h3 className="text-xl font-black text-slate-900 tracking-tight">Actividad Reciente</h3>
              <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">Flujo de inventario mensual</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-fundacion-green" />
                <span className="text-[10px] font-black text-slate-400 uppercase">Entradas</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-fundacion-blue" />
                <span className="text-[10px] font-black text-slate-400 uppercase">Salidas</span>
              </div>
            </div>
          </div>
          <div className="h-[350px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="8 8" vertical={false} stroke="#f1f5f9" />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 800 }}
                  dy={15}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 800 }}
                />
                <Tooltip 
                  cursor={{ fill: '#f8fafc', radius: 10 }}
                  contentStyle={{ borderRadius: '20px', border: 'none', boxShadow: '0 25px 50px -12px rgb(0 0 0 / 0.15)', padding: '15px' }}
                  itemStyle={{ fontWeight: 800, fontSize: '12px' }}
                />
                <Bar dataKey="entradas" fill="#22c55e" radius={[10, 10, 10, 10]} barSize={12} />
                <Bar dataKey="salidas" fill="#1e40af" radius={[10, 10, 10, 10]} barSize={12} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Low Stock List */}
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-white p-10 rounded-[2.5rem] shadow-sm border border-slate-100"
        >
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-xl font-black text-slate-900 tracking-tight">Alertas Críticas</h3>
            <div className="w-10 h-10 bg-fundacion-red/10 rounded-2xl flex items-center justify-center text-fundacion-red">
              <AlertTriangle className="w-5 h-5" />
            </div>
          </div>
          <div className="space-y-6">
            {lowStockProducts.length > 0 ? (
              lowStockProducts.map((product, idx) => (
                <motion.div 
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.7 + (idx * 0.1) }}
                  key={product.id} 
                  className="flex items-center justify-between p-5 rounded-3xl bg-slate-50 border border-slate-100 hover:border-fundacion-red transition-all group cursor-pointer"
                >
                  <div className="flex flex-col">
                    <span className="text-sm font-black text-slate-900 group-hover:text-fundacion-red transition-colors">{product.name}</span>
                    <span className="text-[10px] text-slate-400 font-black uppercase tracking-widest mt-0.5">{product.sku || 'SIN SKU'}</span>
                  </div>
                  <div className="flex flex-col items-end">
                    <span className="text-lg font-black text-fundacion-red">{product.stock}</span>
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">Stock</span>
                  </div>
                </motion.div>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center py-20 text-slate-300">
                <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                  <Package className="w-10 h-10 opacity-20" />
                </div>
                <p className="text-xs font-black uppercase tracking-widest">Todo en orden</p>
              </div>
            )}
            
            <button className="w-full py-5 text-xs font-black text-fundacion-blue uppercase tracking-widest hover:bg-fundacion-blue hover:text-white rounded-2xl transition-all flex items-center justify-center gap-2 mt-4 border-2 border-slate-100 hover:border-fundacion-blue">
              Ver Inventario Completo
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
