import { useEffect, useState, FormEvent } from 'react';
import { 
  Plus, 
  Search, 
  Filter, 
  MoreVertical, 
  Edit2, 
  Trash2, 
  AlertCircle,
  X
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { Product, Category, Subcategory } from '../types';
import { cn } from '../lib/utils';

export default function Inventory() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [subcategories, setSubcategories] = useState<Subcategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategoryId, setFilterCategoryId] = useState('');
  const [filterSubcategoryId, setFilterSubcategoryId] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [isSubcategoryModalOpen, setIsSubcategoryModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newSubcategoryName, setNewSubcategoryName] = useState('');
  const [newSubcategoryCategoryId, setNewSubcategoryCategoryId] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    subcategory_id: '',
    description: '',
    current_stock: 0,
    category_id: '' // Still needed for the UI to filter subcategories
  });

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    try {
      setLoading(true);
      const [
        { data: productsData },
        { data: categoriesData },
        { data: subcategoriesData }
      ] = await Promise.all([
        supabase.from('products').select('*, subcategory:subcategories(*, category:categories(*))').order('name'),
        supabase.from('categories').select('*').order('name'),
        supabase.from('subcategories').select('*').order('name')
      ]);

      // Flatten the data for easier use
      const flattenedProducts = (productsData || []).map(p => ({
        ...p,
        category: p.subcategory?.category,
        category_id: p.subcategory?.category_id
      }));

      setProducts(flattenedProducts);
      setCategories(categoriesData || []);
      setSubcategories(subcategoriesData || []);
    } catch (error) {
      console.error('Error fetching inventory data:', error);
    } finally {
      setLoading(false);
    }
  }

  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = !filterCategoryId || p.category_id === filterCategoryId;
    const matchesSubcategory = !filterSubcategoryId || p.subcategory_id === filterSubcategoryId;
    return matchesSearch && matchesCategory && matchesSubcategory;
  });

  async function handleAddCategory(e: FormEvent) {
    e.preventDefault();
    if (!newCategoryName.trim()) return;
    try {
      setIsSaving(true);
      const { data, error } = await supabase
        .from('categories')
        .insert([{ name: newCategoryName.trim() }])
        .select()
        .single();
      if (error) throw error;
      
      setCategories([...categories, data]);
      setFormData({ ...formData, category_id: data.id });
      setNewCategoryName('');
      setIsCategoryModalOpen(false);
    } catch (error) {
      console.error('Error creating category:', error);
      alert('Error al crear la categoría');
    } finally {
      setIsSaving(false);
    }
  }

  async function handleAddSubcategory(e: FormEvent) {
    e.preventDefault();
    const categoryId = newSubcategoryCategoryId || formData.category_id;
    if (!newSubcategoryName.trim() || !categoryId) {
      alert('Por favor selecciona una categoría y escribe un nombre');
      return;
    }
    try {
      setIsSaving(true);
      const { data, error } = await supabase
        .from('subcategories')
        .insert([{ 
          name: newSubcategoryName.trim(), 
          category_id: categoryId 
        }])
        .select()
        .single();
      if (error) throw error;
      
      setSubcategories([...subcategories, data]);
      // Si estamos en el modal de producto, auto-seleccionamos la nueva subcategoría
      setFormData({ ...formData, category_id: categoryId, subcategory_id: data.id });
      setNewSubcategoryName('');
      setNewSubcategoryCategoryId('');
      setIsSubcategoryModalOpen(false);
    } catch (error) {
      console.error('Error creating subcategory:', error);
      alert('Error al crear la subcategoría');
    } finally {
      setIsSaving(false);
    }
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    try {
      const { category_id, ...payload } = formData;
      if (editingProduct) {
        const { error } = await supabase
          .from('products')
          .update(payload)
          .eq('id', editingProduct.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('products')
          .insert([payload]);
        if (error) throw error;
      }
      
      setIsModalOpen(false);
      setEditingProduct(null);
      setFormData({
        name: '',
        subcategory_id: '',
        description: '',
        current_stock: 0,
        category_id: ''
      });
      fetchData();
    } catch (error) {
      console.error('Error saving product:', error);
      alert('Error al guardar el producto');
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('¿Estás seguro de eliminar este producto?')) return;
    try {
      const { error } = await supabase.from('products').delete().eq('id', id);
      if (error) throw error;
      fetchData();
    } catch (error) {
      console.error('Error deleting product:', error);
      alert('No se puede eliminar el producto (puede tener registros asociados)');
    }
  }

  function openEditModal(product: Product) {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      subcategory_id: product.subcategory_id,
      description: product.description || '',
      current_stock: product.current_stock,
      category_id: product.category_id || ''
    });
    setIsModalOpen(true);
  }

  return (
    <div className="space-y-6">
      {/* Actions Bar */}
      <div className="flex flex-col gap-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="relative flex-1 max-w-md group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-fundacion-blue transition-colors" />
            <input
              type="text"
              placeholder="Buscar por nombre..."
              className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-2xl text-sm font-bold focus:outline-none focus:ring-4 focus:ring-fundacion-blue/10 focus:border-fundacion-blue transition-all shadow-sm"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex items-center space-x-4">
            <div className="hidden md:flex items-center gap-2 px-4 py-2 bg-fundacion-yellow/10 border border-fundacion-yellow/20 rounded-xl">
              <AlertCircle className="w-4 h-4 text-fundacion-orange" />
              <span className="text-[10px] font-black text-fundacion-orange uppercase tracking-widest">Tip: Revisa el stock crítico</span>
            </div>
            <button 
              onClick={() => {
                setEditingProduct(null);
                setFormData({
                  name: '',
                  subcategory_id: '',
                  description: '',
                  current_stock: 0,
                  category_id: ''
                });
                setIsModalOpen(true);
              }}
              className="flex items-center px-6 py-3 bg-fundacion-blue text-white rounded-2xl text-sm font-black hover:bg-blue-800 shadow-xl shadow-blue-900/20 transition-all active:scale-95 uppercase tracking-widest"
            >
              <Plus className="w-4 h-4 mr-2" />
              Nuevo Producto
            </button>
          </div>
        </div>

        {/* Filters Row */}
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-slate-400" />
            <span className="text-xs font-bold text-slate-500 uppercase">Filtrar por:</span>
          </div>
          <select
            className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-600 focus:outline-none focus:ring-2 focus:ring-fundacion-blue/10"
            value={filterCategoryId}
            onChange={(e) => {
              setFilterCategoryId(e.target.value);
              setFilterSubcategoryId('');
            }}
          >
            <option value="">Todas las Categorías</option>
            {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          <select
            className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-600 focus:outline-none focus:ring-2 focus:ring-fundacion-blue/10 disabled:opacity-50"
            disabled={!filterCategoryId}
            value={filterSubcategoryId}
            onChange={(e) => setFilterSubcategoryId(e.target.value)}
          >
            <option value="">Todas las Subcategorías</option>
            {subcategories
              .filter(s => s.category_id === filterCategoryId)
              .map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
          {(filterCategoryId || filterSubcategoryId || searchQuery) && (
            <button 
              onClick={() => {
                setFilterCategoryId('');
                setFilterSubcategoryId('');
                setSearchQuery('');
              }}
              className="text-xs font-bold text-fundacion-red hover:underline"
            >
              Limpiar filtros
            </button>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Producto</th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Categoría</th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-wider text-center">Stock Actual</th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-wider text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-fundacion-blue mx-auto"></div>
                  </td>
                </tr>
              ) : filteredProducts.length > 0 ? (
                filteredProducts.map((product) => (
                  <tr key={product.id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="text-sm font-semibold text-slate-900">{product.name}</span>
                        <span className="text-[10px] text-slate-400 truncate max-w-[200px]">{product.description}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="text-xs font-medium text-slate-700">{product.category?.name || '-'}</span>
                        <span className="text-[10px] text-slate-400">{product.subcategory?.name || '-'}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="text-sm font-bold text-slate-700">
                        {product.current_stock}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button 
                          onClick={() => openEditModal(product)}
                          className="p-1.5 text-slate-400 hover:text-fundacion-blue hover:bg-fundacion-blue/5 rounded-lg transition-colors"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleDelete(product.id)}
                          className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-slate-400 text-sm">
                    No se encontraron productos
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
              <h3 className="text-lg font-bold text-slate-900">
                {editingProduct ? 'Editar Producto' : 'Nuevo Producto'}
              </h3>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase">Nombre del Producto</label>
                  <input
                    required
                    type="text"
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase">Stock Inicial</label>
                  <input
                    type="number"
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                    value={formData.current_stock}
                    onChange={(e) => setFormData({...formData, current_stock: parseInt(e.target.value)})}
                  />
                </div>
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-500 uppercase">Categoría</label>
                    <button 
                      type="button"
                      onClick={() => setIsCategoryModalOpen(true)}
                      className="text-[10px] font-black text-fundacion-blue uppercase hover:underline"
                    >
                      + Nueva
                    </button>
                  </div>
                  <select
                    required
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                    value={formData.category_id}
                    onChange={(e) => setFormData({...formData, category_id: e.target.value, subcategory_id: ''})}
                  >
                    <option value="">Seleccionar...</option>
                    {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-500 uppercase">Subcategoría</label>
                    {formData.category_id && (
                      <button 
                        type="button"
                        onClick={() => setIsSubcategoryModalOpen(true)}
                        className="text-[10px] font-black text-fundacion-blue uppercase hover:underline"
                      >
                        + Nueva
                      </button>
                    )}
                  </div>
                  <select
                    required
                    disabled={!formData.category_id}
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all disabled:opacity-50"
                    value={formData.subcategory_id}
                    onChange={(e) => setFormData({...formData, subcategory_id: e.target.value})}
                  >
                    <option value="">Seleccionar...</option>
                    {subcategories
                      .filter(s => s.category_id === formData.category_id)
                      .map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase">Descripción</label>
                <textarea
                  rows={3}
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all resize-none"
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                />
              </div>
              <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-100">
                <button 
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
                >
                  Cancelar
                </button>
                <button 
                  type="submit"
                  className="px-6 py-2 bg-fundacion-blue text-white rounded-xl text-sm font-bold hover:bg-blue-800 shadow-md shadow-blue-200 transition-all"
                >
                  {editingProduct ? 'Actualizar' : 'Guardar Producto'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Category Modal */}
      {isCategoryModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
              <h3 className="text-lg font-bold text-slate-900">Nueva Categoría</h3>
              <button onClick={() => setIsCategoryModalOpen(false)} className="p-2 text-slate-400 hover:text-slate-600 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleAddCategory} className="p-6 space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase">Nombre de la Categoría</label>
                <input
                  autoFocus
                  required
                  type="text"
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                />
              </div>
              <div className="flex items-center justify-end space-x-3 pt-4">
                <button type="button" onClick={() => setIsCategoryModalOpen(false)} className="px-4 py-2 text-sm font-medium text-slate-600">Cancelar</button>
                <button 
                  disabled={isSaving}
                  type="submit" 
                  className="px-6 py-2 bg-fundacion-blue text-white rounded-xl text-sm font-bold hover:bg-blue-800 disabled:opacity-50"
                >
                  {isSaving ? 'Creando...' : 'Crear Categoría'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Subcategory Modal */}
      {isSubcategoryModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
              <h3 className="text-lg font-bold text-slate-900">Nueva Subcategoría</h3>
              <button onClick={() => setIsSubcategoryModalOpen(false)} className="p-2 text-slate-400 hover:text-slate-600 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleAddSubcategory} className="p-6 space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase">Categoría Perteneciente</label>
                <select
                  required
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                  value={newSubcategoryCategoryId || formData.category_id}
                  onChange={(e) => setNewSubcategoryCategoryId(e.target.value)}
                >
                  <option value="">Seleccionar Categoría...</option>
                  {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase">Nombre de la Subcategoría</label>
                <input
                  autoFocus
                  required
                  type="text"
                  placeholder="Ej: Arroz, Camisas, etc."
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                  value={newSubcategoryName}
                  onChange={(e) => setNewSubcategoryName(e.target.value)}
                />
              </div>
              <div className="flex items-center justify-end space-x-3 pt-4">
                <button type="button" onClick={() => setIsSubcategoryModalOpen(false)} className="px-4 py-2 text-sm font-medium text-slate-600">Cancelar</button>
                <button 
                  disabled={isSaving}
                  type="submit" 
                  className="px-6 py-2 bg-fundacion-blue text-white rounded-xl text-sm font-bold hover:bg-blue-800 disabled:opacity-50"
                >
                  {isSaving ? 'Creando...' : 'Crear Subcategoría'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
