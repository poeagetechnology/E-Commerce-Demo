// src/pages/vendor/ProductsPage.jsx
import { useEffect, useState } from 'react';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { getVendorProducts, createProduct, updateProduct, deleteProduct, uploadProductImage } from '@/services/productService';
import { getDocs, collection } from 'firebase/firestore';
import { db } from '@/firebase/firebaseConfig';
import useAuthStore from '@/store/authStore';
import DataTable from '@/components/ui/DataTable';
import Modal from '@/components/ui/Modal';
import { formatCurrency } from '@/utils';
import toast from 'react-hot-toast';

const EMPTY = { name: '', category: '', price: '', stock: '', description: '', images: [] };

const VendorProductsPage = () => {
  const { user } = useAuthStore();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);
  const [imgFile, setImgFile] = useState(null);

  const load = async () => {
    const [prods, catSnap] = await Promise.all([
      getVendorProducts(user.uid),
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
      const data = { ...form, price: parseFloat(form.price), stock: parseInt(form.stock), vendorId: user.uid };
      if (editing) {
        if (imgFile) { data.images = [await uploadProductImage(imgFile, editing.id)]; }
        await updateProduct(editing.id, data);
        toast.success('Updated!');
      } else {
        const ref = await createProduct(data);
        if (imgFile) { await updateProduct(ref.id, { images: [await uploadProductImage(imgFile, ref.id)] }); }
        toast.success('Created!');
      }
      setModal(false);
      load();
    } catch { toast.error('Failed to save'); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete?')) return;
    await deleteProduct(id);
    toast.success('Deleted');
    load();
  };

  const columns = [
    { key: 'images', label: 'Image', render: (v) => <img src={v?.[0]} alt="" className="w-10 h-10 rounded-lg object-cover bg-gray-100 dark:bg-gray-800" /> },
    { key: 'name', label: 'Name', render: (v) => <span className="font-medium text-sm">{v}</span> },
    { key: 'price', label: 'Price', render: (v) => <span className="font-semibold text-sm">{formatCurrency(v)}</span> },
    { key: 'stock', label: 'Stock', render: (v) => <span className={`badge ${v === 0 ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>{v}</span> },
    { key: 'id', label: '', render: (_, row) => (
      <div className="flex gap-1">
        <button onClick={() => openEdit(row)} className="p-1.5 text-gray-400 hover:text-brand-600 hover:bg-brand-50 dark:hover:bg-brand-900/10 rounded-lg"><Pencil size={14} /></button>
        <button onClick={() => handleDelete(row.id)} className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-lg"><Trash2 size={14} /></button>
      </div>
    )},
  ];

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="flex items-center justify-between">
        <h1 className="page-title">My Products</h1>
        <button onClick={openNew} className="btn-primary gap-2"><Plus size={16} /> Add Product</button>
      </div>
      <div className="card">
        <DataTable columns={columns} data={products} loading={loading} />
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
            <div className="col-span-2">
              <label className="block text-xs font-medium mb-1.5 text-gray-500">Description</label>
              <textarea rows={3} className="input resize-none" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
            </div>
            <div className="col-span-2">
              <label className="block text-xs font-medium mb-1.5 text-gray-500">Product Image</label>
              <input type="file" accept="image/*" className="text-sm text-gray-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:bg-emerald-50 file:text-emerald-700 file:text-xs file:font-medium hover:file:bg-emerald-100 cursor-pointer"
                onChange={e => setImgFile(e.target.files[0])} />
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => setModal(false)} className="btn-secondary flex-1">Cancel</button>
            <button type="submit" disabled={saving} className="btn-primary flex-1">{saving ? 'Saving…' : editing ? 'Update' : 'Create'}</button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default VendorProductsPage;
