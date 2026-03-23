// src/pages/admin/ProductsPage.jsx
import { useEffect, useState } from 'react';
import { Plus, Pencil, Trash2, Search } from 'lucide-react';
import { getProducts, createProduct, updateProduct, deleteProduct, uploadProductImage } from '@/services/productService';
import { getDocs, collection } from 'firebase/firestore';
import { db } from '@/firebase/firebaseConfig';
import DataTable from '@/components/ui/DataTable';
import Modal from '@/components/ui/Modal';
import { formatCurrency, formatDate } from '@/utils';
import toast from 'react-hot-toast';

const EMPTY = { name: '', category: '', price: '', stock: '', description: '', images: [] };

const AdminProductsPage = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);
  const [imgFile, setImgFile] = useState(null);

  const load = async () => {
    const [{ products: prods }, catSnap] = await Promise.all([
      getProducts({ pageSize: 100 }),
      getDocs(collection(db, 'categories')),
    ]);
    setProducts(prods);
    setCategories(catSnap.docs.map(d => ({ id: d.id, ...d.data() })));
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const openNew = () => { setEditing(null); setForm(EMPTY); setModal(true); };
  const openEdit = (p) => { setEditing(p); setForm({ ...p, price: String(p.price), stock: String(p.stock) }); setModal(true); };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const data = { ...form, price: parseFloat(form.price), stock: parseInt(form.stock) };
      if (editing) {
        if (imgFile) {
          const url = await uploadProductImage(imgFile, editing.id);
          data.images = [url];
        }
        await updateProduct(editing.id, data);
        toast.success('Product updated!');
      } else {
        const ref = await createProduct(data);
        if (imgFile) {
          const url = await uploadProductImage(imgFile, ref.id);
          await updateProduct(ref.id, { images: [url] });
        }
        toast.success('Product created!');
      }
      setModal(false);
      load();
    } catch { toast.error('Failed to save product'); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this product?')) return;
    await deleteProduct(id);
    toast.success('Deleted');
    load();
  };

  const filtered = products.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.category.toLowerCase().includes(search.toLowerCase())
  );

  const columns = [
    { key: 'images', label: 'Image', render: (v) => <img src={v?.[0]} alt="" className="w-10 h-10 rounded-lg object-cover bg-gray-100 dark:bg-gray-800" /> },
    { key: 'name', label: 'Name', render: (v) => <span className="font-medium text-sm">{v}</span> },
    { key: 'category', label: 'Category', render: (v) => <span className="capitalize text-sm text-gray-500">{v}</span> },
    { key: 'price', label: 'Price', render: (v) => <span className="font-semibold text-sm">{formatCurrency(v)}</span> },
    { key: 'stock', label: 'Stock', render: (v) => <span className={`badge ${v === 0 ? 'bg-red-100 text-red-700' : v <= 5 ? 'bg-orange-100 text-orange-700' : 'bg-green-100 text-green-700'}`}>{v}</span> },
    { key: 'id', label: 'Actions', render: (_, row) => (
      <div className="flex gap-1">
        <button onClick={() => openEdit(row)} className="p-1.5 text-gray-400 hover:text-brand-600 hover:bg-brand-50 dark:hover:bg-brand-900/10 rounded-lg transition-colors"><Pencil size={14} /></button>
        <button onClick={() => handleDelete(row.id)} className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-lg transition-colors"><Trash2 size={14} /></button>
      </div>
    )},
  ];

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="page-title">Products</h1>
          <p className="text-sm text-gray-400 mt-0.5">{products.length} total products</p>
        </div>
        <button onClick={openNew} className="btn-primary gap-2">
          <Plus size={16} /> Add Product
        </button>
      </div>

      <div className="card">
        <div className="p-4 border-b border-gray-100 dark:border-gray-800">
          <div className="relative max-w-sm">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input className="input pl-9 text-sm" placeholder="Search products…" value={search} onChange={e => setSearch(e.target.value)} />
          </div>
        </div>
        <DataTable columns={columns} data={filtered} loading={loading} />
      </div>

      <Modal open={modal} onClose={() => setModal(false)} title={editing ? 'Edit Product' : 'New Product'} size="lg">
        <form onSubmit={handleSave} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-xs font-medium mb-1.5 text-gray-500">Product Name</label>
              <input required className="input" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1.5 text-gray-500">Category</label>
              <select required className="input" value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}>
                <option value="">Select…</option>
                {categories.map(c => <option key={c.id} value={c.slug}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium mb-1.5 text-gray-500">Price ($)</label>
              <input required type="number" min="0" step="0.01" className="input" value={form.price} onChange={e => setForm(f => ({ ...f, price: e.target.value }))} />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1.5 text-gray-500">Stock</label>
              <input required type="number" min="0" className="input" value={form.stock} onChange={e => setForm(f => ({ ...f, stock: e.target.value }))} />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1.5 text-gray-500">Rating (0-5)</label>
              <input type="number" min="0" max="5" step="0.1" className="input" value={form.rating || ''} onChange={e => setForm(f => ({ ...f, rating: parseFloat(e.target.value) }))} />
            </div>
            <div className="col-span-2">
              <label className="block text-xs font-medium mb-1.5 text-gray-500">Description</label>
              <textarea rows={3} className="input resize-none" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
            </div>
            <div className="col-span-2">
              <label className="block text-xs font-medium mb-1.5 text-gray-500">Image</label>
              <input type="file" accept="image/*" className="text-sm text-gray-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:bg-brand-50 file:text-brand-700 file:text-xs file:font-medium hover:file:bg-brand-100 cursor-pointer"
                onChange={e => setImgFile(e.target.files[0])} />
              {form.images?.[0] && <img src={form.images[0]} alt="" className="mt-2 w-20 h-20 rounded-xl object-cover" />}
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => setModal(false)} className="btn-secondary flex-1">Cancel</button>
            <button type="submit" disabled={saving} className="btn-primary flex-1">
              {saving ? 'Saving…' : editing ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default AdminProductsPage;
