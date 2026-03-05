import React from 'react';
import { 
  BookOpen, 
  LayoutDashboard, 
  Package, 
  ArrowDownToLine, 
  ArrowUpFromLine, 
  HeartHandshake, 
  Users,
  CheckCircle2,
  AlertCircle,
  HelpCircle
} from 'lucide-react';
import { motion } from 'motion/react';

const GuideSection = ({ icon: Icon, title, description, steps, color }: any) => (
  <motion.div 
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-500 group"
  >
    <div className="flex items-start gap-6">
      <div className={`p-4 rounded-2xl ${color} text-white shadow-lg group-hover:scale-110 transition-transform duration-500`}>
        <Icon className="w-6 h-6" />
      </div>
      <div className="flex-1">
        <h3 className="text-xl font-black text-slate-900 mb-3 tracking-tight">{title}</h3>
        <p className="text-sm text-slate-500 leading-relaxed mb-6 font-medium">{description}</p>
        
        <div className="space-y-3">
          {steps.map((step: string, idx: number) => (
            <div key={idx} className="flex items-start gap-3">
              <div className="mt-1">
                <CheckCircle2 className="w-4 h-4 text-fundacion-green" />
              </div>
              <span className="text-xs font-bold text-slate-600 leading-tight">{step}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  </motion.div>
);

export default function UserGuide() {
  const sections = [
    {
      icon: LayoutDashboard,
      title: "Dashboard (Resumen)",
      color: "bg-fundacion-blue",
      description: "Es tu centro de control principal. Aquí ves el estado actual de la fundación de un vistazo.",
      steps: [
        "Visualiza el total de donaciones recibidas y entregadas.",
        "Monitorea alertas de stock crítico (productos por agotarse).",
        "Observa gráficos de actividad mensual para planeación.",
        "Accede rápidamente a las funciones principales."
      ]
    },
    {
      icon: Package,
      title: "Inventario (Catálogo)",
      color: "bg-fundacion-orange",
      description: "Donde registras qué productos maneja la fundación (alimentos, ropa, medicinas, etc).",
      steps: [
        "Crea nuevos productos definiendo su categoría y subcategoría.",
        "Organiza todo por Categorías (ej: Alimentos) y Subcategorías (ej: Granos).",
        "Edita descripciones o elimina productos que ya no se manejen.",
        "El stock se actualiza solo, no necesitas editarlo manualmente."
      ]
    },
    {
      icon: ArrowDownToLine,
      title: "Entradas (Recibir Donación)",
      color: "bg-fundacion-green",
      description: "Usa esta pestaña cada vez que alguien traiga una donación física a la fundación.",
      steps: [
        "Haz clic en 'Registrar Entrada'.",
        "Selecciona quién dona (Donante) y qué entrega (Producto).",
        "Ingresa la cantidad recibida.",
        "Al guardar, el stock del producto subirá automáticamente."
      ]
    },
    {
      icon: ArrowUpFromLine,
      title: "Salidas (Entregas)",
      color: "bg-fundacion-red",
      description: "Registra aquí cada vez que entregues ayuda a una persona o familia.",
      steps: [
        "Selecciona el beneficiario que recibe la ayuda.",
        "Elige el producto y la cantidad a entregar.",
        "Indica quién de la fundación está realizando la entrega.",
        "El sistema restará la cantidad del inventario automáticamente."
      ]
    },
    {
      icon: HeartHandshake,
      title: "Donantes",
      color: "bg-fundacion-blue",
      description: "Base de datos de las personas o empresas generosas que apoyan la causa.",
      steps: [
        "Registra nombres y datos de contacto.",
        "Mantén un historial de quiénes son tus aliados principales.",
        "Puedes editar sus datos si cambian de teléfono o dirección."
      ]
    },
    {
      icon: Users,
      title: "Beneficiarios",
      color: "bg-fundacion-yellow",
      description: "Registro de las personas que reciben la ayuda de la fundación.",
      steps: [
        "Es vital registrar su número de cédula/ID para evitar duplicados.",
        "Asegura que la ayuda llegue a las personas correctas.",
        "Registra su contacto para seguimiento de casos."
      ]
    }
  ];

  return (
    <div className="space-y-12 pb-20">
      {/* Header Section */}
      <div className="relative overflow-hidden bg-fundacion-blue p-12 rounded-[3rem] text-white shadow-2xl shadow-blue-900/30">
        <div className="absolute -right-20 -top-20 w-80 h-80 bg-white/10 rounded-full blur-3xl" />
        <div className="relative z-10 flex flex-col md:flex-row items-center gap-10">
          <div className="w-24 h-24 bg-fundacion-yellow rounded-[2rem] flex items-center justify-center shadow-2xl rotate-6 shrink-0">
            <BookOpen className="w-12 h-12 text-fundacion-blue" />
          </div>
          <div>
            <h2 className="text-4xl font-black tracking-tight mb-3">Guía de Uso del Sistema</h2>
            <p className="text-blue-100 text-lg font-medium max-w-3xl leading-relaxed">
              Bienvenido a la herramienta de gestión de la <span className="text-fundacion-yellow font-black">Fundación JUAN DE DIOS</span>. 
              Esta guía te ayudará a entender cómo cada sección contribuye a nuestra misión.
            </p>
          </div>
        </div>
      </div>

      {/* Grid of Sections */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {sections.map((section, idx) => (
          <GuideSection key={idx} {...section} />
        ))}
      </div>

      {/* Important Tips */}
      <div className="bg-fundacion-yellow/10 border-2 border-fundacion-yellow/20 p-10 rounded-[2.5rem] relative overflow-hidden">
        <div className="absolute -right-10 -bottom-10 opacity-10">
          <HelpCircle className="w-40 h-40 text-fundacion-yellow" />
        </div>
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-6">
            <AlertCircle className="w-6 h-6 text-fundacion-orange" />
            <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight">Consejos de Oro</h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
            <div className="space-y-2">
              <p className="text-sm font-black text-slate-900 uppercase tracking-widest">El Orden es Clave</p>
              <p className="text-xs text-slate-600 font-medium leading-relaxed">
                Antes de registrar una entrada, asegúrate de que el producto ya exista en el <span className="font-bold text-fundacion-blue">Inventario</span>.
              </p>
            </div>
            <div className="space-y-2">
              <p className="text-sm font-black text-slate-900 uppercase tracking-widest">Stock Automático</p>
              <p className="text-xs text-slate-600 font-medium leading-relaxed">
                Nunca intentes "adivinar" el stock. El sistema lo calcula sumando las <span className="font-bold text-fundacion-green">Entradas</span> y restando las <span className="font-bold text-fundacion-red">Salidas</span>.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
