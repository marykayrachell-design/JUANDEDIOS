import { useEffect, useState, FormEvent } from 'react';
import { Plus, Search, Calendar, User, Package, X, UserCheck } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { DonationOut, Beneficiary, Product, Category, Subcategory } from '../types';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

export default function DonationsOut() {
  const [donations, setDonations] = useState<DonationOut[]>([]);
  const [beneficiaries, setBeneficiaries] = useState<Beneficiary[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [subcategories, setSubcategories] = useState<Subcategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [formData, setFormData] = useState({
    beneficiary_id: '',
    product_id: '',
    quantity: 1,
    delivered_by: '',
    date: format(new Date(), 'yyyy-MM-dd'),
    notes: ''
  });

  const [selectedCategoryId, setSelectedCategoryId] = useState('');
  const [selectedSubcategoryId, setSelectedSubcategoryId] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    try {
      setLoading(true);
      const [
        { data: donationsData },
        { data: beneficiariesData },
        { data: productsData },
        { data: categoriesData },
        { data: subcategoriesData }
      ] = await Promise.all([
        supabase.from('donations_out').select('*, beneficiary:beneficiaries(*), product:products(*)').order('created_at', { ascending: false }),
        supabase.from('beneficiaries').select('*').order('name'),
        supabase.from('products').select('*').order('name'),
        supabase.from('categories').select('*').order('name'),
        supabase.from('subcategories').select('*').order('name')
      ]);

      setDonations(donationsData || []);
      setBeneficiaries(beneficiariesData || []);
      setProducts(productsData || []);
      setCategories(categoriesData || []);
      setSubcategories(subcategoriesData || []);
    } catch (error) {
      console.error('Error fetching donations out:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    
    // Validate stock
    const product = products.find(p => p.id === formData.product_id);
    if (product && product.stock < formData.quantity) {
      alert(`Stock insuficiente. Stock actual: ${product.stock}`);
      return;
    }

    try {
      const { error } = await supabase.from('donations_out').insert([formData]);
      if (error) throw error;
      
      setIsModalOpen(false);
      setFormData({
        beneficiary_id: '',
        product_id: '',
        quantity: 1,
        delivered_by: '',
        date: format(new Date(), 'yyyy-MM-dd'),
        notes: ''
      });
      fetchData();
    } catch (error) {
      console.error('Error recording delivery:', error);
      alert('Error al registrar la salida');
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-6">
        <div className="relative flex-1 max-w-md group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-fundacion-blue transition-colors" />
          <input
            type="text"
            placeholder="Buscar entregas..."
            className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-2xl text-sm font-bold focus:outline-none focus:ring-4 focus:ring-fundacion-blue/10 focus:border-fundacion-blue transition-all shadow-sm"
          />
        </div>
        <div className="flex items-center gap-4">
          <div className="hidden lg:flex items-center gap-3 px-4 py-2 bg-fundacion-red/10 border border-fundacion-red/20 rounded-xl">
            <Package className="w-4 h-4 text-fundacion-red" />
            <span className="text-[10px] font-black text-fundacion-red uppercase tracking-widest">Nota: No se permite stock negativo</span>
          </div>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="flex items-center px-6 py-3 bg-fundacion-blue text-white rounded-2xl text-sm font-black hover:bg-blue-800 shadow-xl shadow-blue-900/20 transition-all active:scale-95 uppercase tracking-widest"
          >
            <Plus className="w-4 h-4 mr-2" />
            Registrar Entrega
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Fecha</th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Beneficiario</th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Producto</th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-wider text-center">Cantidad</th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Entregado por</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-fundacion-blue mx-auto"></div>
                  </td>
                </tr>
              ) : donations.length > 0 ? (
                donations.map((donation) => (
                  <tr key={donation.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center text-xs text-slate-600">
                        <Calendar className="w-3 h-3 mr-2 text-slate-400" />
                        {format(new Date(donation.date), 'dd MMM, yyyy', { locale: es })}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="text-sm font-medium text-slate-900">{donation.beneficiary?.name}</span>
                        <span className="text-[10px] text-slate-400 font-mono">{donation.beneficiary?.id_number}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <Package className="w-3 h-3 mr-2 text-slate-400" />
                        <span className="text-sm text-slate-700">{donation.product?.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="text-sm font-bold text-fundacion-blue">-{donation.quantity}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center text-xs text-slate-600">
                        <UserCheck className="w-3 h-3 mr-2 text-slate-400" />
                        {donation.delivered_by}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-400 text-sm">
                    No hay registros de salida
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
              <h3 className="text-lg font-bold text-slate-900">Registrar Entrega a Beneficiario</h3>
              <button onClick={() => setIsModalOpen(false)} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase">Beneficiario</label>
                  <select
                    required
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:border-blue-500 transition-all"
                    value={formData.beneficiary_id}
                    onChange={(e) => setFormData({...formData, beneficiary_id: e.target.value})}
                  >
                    <option value="">Seleccionar Beneficiario...</option>
                    {beneficiaries.map(b => <option key={b.id} value={b.id}>{b.name} ({b.id_number})</option>)}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase">Fecha</label>
                  <input
                    type="date"
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:border-blue-500 transition-all"
                    value={formData.date}
                    onChange={(e) => setFormData({...formData, date: e.target.value})}
                  />
                </div>
                
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase">Categoría</label>
                  <select
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:border-blue-500 transition-all"
                    value={selectedCategoryId}
                    onChange={(e) => {
                      setSelectedCategoryId(e.target.value);
                      setSelectedSubcategoryId('');
                    }}
                  >
                    <option value="">Todas las categorías</option>
                    {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase">Subcategoría</label>
                  <select
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:border-blue-500 transition-all"
                    value={selectedSubcategoryId}
                    onChange={(e) => setSelectedSubcategoryId(e.target.value)}
                  >
                    <option value="">Todas las subcategorías</option>
                    {subcategories
                      .filter(s => !selectedCategoryId || s.category_id === selectedCategoryId)
                      .map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>
                </div>

                <div className="space-y-1 md:col-span-2">
                  <label className="text-xs font-bold text-slate-500 uppercase">Producto</label>
                  <select
                    required
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:border-blue-500 transition-all"
                    value={formData.product_id}
                    onChange={(e) => setFormData({...formData, product_id: e.target.value})}
                  >
                    <option value="">Seleccionar Producto...</option>
                    {products
                      .filter(p => (!selectedCategoryId || p.category_id === selectedCategoryId) && (!selectedSubcategoryId || p.subcategory_id === selectedSubcategoryId))
                      .map(p => <option key={p.id} value={p.id}>{p.name} (Stock: {p.stock})</option>)}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase">Cantidad</label>
                  <input
                    required
                    type="number"
                    min="1"
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:border-blue-500 transition-all"
                    value={formData.quantity}
                    onChange={(e) => setFormData({...formData, quantity: parseInt(e.target.value)})}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase">Persona que entrega</label>
                  <input
                    required
                    type="text"
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:border-blue-500 transition-all"
                    value={formData.delivered_by}
                    onChange={(e) => setFormData({...formData, delivered_by: e.target.value})}
                  />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase">Notas</label>
                <textarea
                  rows={2}
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:border-blue-500 transition-all resize-none"
                  value={formData.notes}
                  onChange={(e) => setFormData({...formData, notes: e.target.value})}
                />
              </div>
              <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-100">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-xl">
                  Cancelar
                </button>
                <button type="submit" className="px-6 py-2 bg-fundacion-blue text-white rounded-xl text-sm font-bold hover:bg-blue-800 shadow-md">
                  Confirmar Entrega
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
