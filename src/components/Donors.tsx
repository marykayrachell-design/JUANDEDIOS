import { useEffect, useState, FormEvent } from 'react';
import { Plus, Search, HeartHandshake, Mail, Phone, X, Edit2, Trash2 } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { Donor } from '../types';

export default function Donors() {
  const [donors, setDonors] = useState<Donor[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDonor, setEditingDonor] = useState<Donor | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    contact_info: ''
  });

  useEffect(() => {
    fetchDonors();
  }, []);

  async function fetchDonors() {
    try {
      setLoading(true);
      const { data } = await supabase.from('donors').select('*').order('name');
      setDonors(data || []);
    } catch (error) {
      console.error('Error fetching donors:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    try {
      if (editingDonor) {
        const { error } = await supabase.from('donors').update(formData).eq('id', editingDonor.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('donors').insert([formData]);
        if (error) throw error;
      }
      setIsModalOpen(false);
      setEditingDonor(null);
      setFormData({ name: '', contact_info: '' });
      fetchDonors();
    } catch (error) {
      console.error('Error saving donor:', error);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-6">
        <div className="relative flex-1 max-w-md group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-fundacion-blue transition-colors" />
          <input
            type="text"
            placeholder="Buscar donantes..."
            className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-2xl text-sm font-bold focus:outline-none focus:ring-4 focus:ring-fundacion-blue/10 focus:border-fundacion-blue transition-all shadow-sm"
          />
        </div>
        <button 
          onClick={() => {
            setEditingDonor(null);
            setFormData({ name: '', contact_info: '' });
            setIsModalOpen(true);
          }}
          className="flex items-center px-6 py-3 bg-fundacion-blue text-white rounded-2xl text-sm font-black hover:bg-blue-800 shadow-xl shadow-blue-900/20 transition-all active:scale-95 uppercase tracking-widest"
        >
          <Plus className="w-4 h-4 mr-2" />
          Nuevo Donante
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-full py-12 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-fundacion-blue mx-auto"></div>
          </div>
        ) : donors.length > 0 ? (
          donors.map((donor) => (
            <div key={donor.id} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 hover:shadow-md transition-all group">
              <div className="flex items-start justify-between mb-4">
                <div className="p-3 bg-blue-50 rounded-xl">
                  <HeartHandshake className="w-6 h-6 text-fundacion-blue" />
                </div>
                <div className="flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button 
                    onClick={() => {
                      setEditingDonor(donor);
                      setFormData({ name: donor.name, contact_info: donor.contact_info || '' });
                      setIsModalOpen(true);
                    }}
                    className="p-1.5 text-slate-400 hover:text-fundacion-blue hover:bg-fundacion-blue/5 rounded-lg"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-1">{donor.name}</h3>
              <p className="text-xs text-slate-500 mb-4">Donante Registrado</p>
              <div className="space-y-2">
                <div className="flex items-center text-sm text-slate-600">
                  <Mail className="w-4 h-4 mr-2 text-slate-400" />
                  <span className="truncate">{donor.contact_info || 'Sin contacto'}</span>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full py-12 text-center text-slate-400">
            No hay donantes registrados
          </div>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
              <h3 className="text-lg font-bold text-slate-900">{editingDonor ? 'Editar Donante' : 'Nuevo Donante'}</h3>
              <button onClick={() => setIsModalOpen(false)} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase">Nombre Completo / Razón Social</label>
                <input
                  required
                  type="text"
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:border-blue-500 transition-all"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase">Información de Contacto</label>
                <textarea
                  rows={3}
                  placeholder="Email, teléfono, dirección..."
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:border-blue-500 transition-all resize-none"
                  value={formData.contact_info}
                  onChange={(e) => setFormData({...formData, contact_info: e.target.value})}
                />
              </div>
              <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-100">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-xl">
                  Cancelar
                </button>
                <button type="submit" className="px-6 py-2 bg-fundacion-blue text-white rounded-xl text-sm font-bold hover:bg-blue-800 shadow-md">
                  {editingDonor ? 'Actualizar' : 'Guardar Donante'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
