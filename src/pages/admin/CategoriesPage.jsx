// src/pages/admin/CategoriesPage.jsx
import { useEffect, useState } from 'react';
import { getDocs, addDoc, updateDoc, deleteDoc, doc, collection, serverTimestamp } from 'firebase/firestore';
import { db } from '@/firebase/firebaseConfig';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import Modal from '@/components/ui/Modal';
import toast from 'react-hot-toast';

const EMPTY = { name: '', icon: '📦', slug: '', description: '' };

const AdminCategoriesPage = () => {
  const [cats, setCats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    const snap = await getDocs(collection(db, 'categories'));
    setCats(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const openNew = () => { setEditing(null); setForm(EMPTY); setModal(true); };
  const openEdit = (c) => { setEditing(c); setForm(c); setModal(true); };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editing) {
        await updateDoc(doc(db, 'categories', editing.id), form);
        toast.success('Category updated!');
      } else {
        await addDoc(collection(db, 'categories'), { ...form, createdAt: serverTimestamp() });
        toast.success('Category created!');
      }
      setModal(false);
      load();
    } catch { toast.error('Failed to save'); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this category?')) return;
    await deleteDoc(doc(db, 'categories', id));
    toast.success('Deleted');
    load();
  };

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="page-title">Categories</h1>
          <p className="text-sm text-gray-400 mt-0.5">{cats.length} categories</p>
        </div>
        <button onClick={openNew} className="btn-primary gap-2"><Plus size={16} /> Add Category</button>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          {[...Array(5)].map((_, i) => <div key={i} className="skeleton h-28 rounded-2xl" />)}
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          {cats.map(cat => (
            <div key={cat.id} className="card p-4 flex flex-col items-center text-center gap-2 group hover:shadow-md transition-all hover:-translate-y-1">
              <span className="text-3xl">{cat.icon}</span>
              <p className="font-semibold text-sm">{cat.name}</p>
              <p className="text-xs text-gray-400 line-clamp-2">{cat.description}</p>
              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity mt-1">
                <button onClick={() => openEdit(cat)} className="p-1.5 text-gray-400 hover:text-brand-600 hover:bg-brand-50 dark:hover:bg-brand-900/10 rounded-lg transition-colors"><Pencil size={13} /></button>
                <button onClick={() => handleDelete(cat.id)} className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-lg transition-colors"><Trash2 size={13} /></button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal open={modal} onClose={() => setModal(false)} title={editing ? 'Edit Category' : 'New Category'}>
        <form onSubmit={handleSave} className="space-y-4">
          {[
            { key: 'name', label: 'Name', placeholder: 'Electronics' },
            { key: 'icon', label: 'Icon (emoji)', placeholder: '💻' },
            { key: 'slug', label: 'Slug', placeholder: 'electronics' },
            { key: 'description', label: 'Description', placeholder: 'Category description' },
          ].map(({ key, label, placeholder }) => (
            <div key={key}>
              <label className="block text-xs font-medium mb-1.5 text-gray-500">{label}</label>
              <input required className="input" placeholder={placeholder} value={form[key]}
                onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))} />
            </div>
          ))}
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => setModal(false)} className="btn-secondary flex-1">Cancel</button>
            <button type="submit" disabled={saving} className="btn-primary flex-1">{saving ? 'Saving…' : editing ? 'Update' : 'Create'}</button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default AdminCategoriesPage;
