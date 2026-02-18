import React, { useState, useEffect } from 'react';
import axios from 'axios';

const AdminBlog = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [currentPostId, setCurrentPostId] = useState(null);
  
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    excerpt: '',
    image: '',
    published: true
  });

  const API_URL = `${import.meta.env.VITE_API_URL}/api/posts`;
  const getAuthHeader = () => ({
    headers: { Authorization: `Bearer ${localStorage.getItem('adminToken')}` }
  });

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      const res = await axios.get(API_URL);
      setPosts(res.data);
    } catch (err) {
      console.error("Erreur chargement posts", err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (editMode) {
        await axios.put(`${API_URL}/${currentPostId}`, formData, getAuthHeader());
      } else {
        await axios.post(API_URL, formData, getAuthHeader());
      }
      resetForm();
      fetchPosts();
      alert(editMode ? "Article mis à jour !" : "Article publié !");
    } catch (err) {
      alert("Erreur lors de l'opération.");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (post) => {
    setEditMode(true);
    setCurrentPostId(post._id);
    setFormData({
      title: post.title,
      content: post.content,
      excerpt: post.excerpt,
      image: post.image || '',
      published: post.published
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const deletePost = async (id) => {
    if (window.confirm("Supprimer définitivement cet article ?")) {
      try {
        await axios.delete(`${API_URL}/${id}`, getAuthHeader());
        fetchPosts();
      } catch (err) {
        alert("Erreur suppression.");
      }
    }
  };

  const resetForm = () => {
    setFormData({ title: '', content: '', excerpt: '', image: '', published: true });
    setEditMode(false);
    setCurrentPostId(null);
  };

  return (
    <div className="space-y-10 animate-in fade-in duration-700 pb-20">
      
      {/* HEADER PROFESSIONNEL */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tighter">Content Manager</h2>
          <p className="text-[11px] text-slate-500 font-bold uppercase tracking-widest mt-1">Gestion éditoriale de Emile Auto</p>
        </div>
        <div className="flex gap-3">
            <div className="px-4 py-2 bg-slate-100 rounded-lg text-[10px] font-bold text-slate-600 uppercase">
                {posts.length} Articles
            </div>
        </div>
      </div>

      {/* FORMULAIRE D'ÉDITION / CRÉATION */}
      <section className="bg-white rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden">
        <div className="bg-slate-900 p-4">
            <h3 className="text-white text-[10px] font-black uppercase tracking-[0.3em]">
                {editMode ? 'Modifier l\'article' : 'Nouvel Article'}
            </h3>
        </div>
        
        <form onSubmit={handleSubmit} className="p-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
                <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Titre de l'article</label>
                <input 
                type="text" 
                className="w-full mt-1 p-4 bg-slate-50 rounded-xl border-none text-sm font-bold focus:ring-2 focus:ring-blue-500 transition-all"
                value={formData.title}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
                required
                />
            </div>

            <div>
                <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Image illustrative (URL)</label>
                <input 
                type="text" 
                placeholder="https://images.unsplash.com/..."
                className="w-full mt-1 p-4 bg-slate-50 rounded-xl border-none text-sm focus:ring-2 focus:ring-blue-500"
                value={formData.image}
                onChange={(e) => setFormData({...formData, image: e.target.value})}
                />
            </div>

            <div>
                <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Extrait (SEO)</label>
                <textarea 
                className="w-full mt-1 p-4 bg-slate-50 rounded-xl border-none text-sm h-24 resize-none"
                value={formData.excerpt}
                onChange={(e) => setFormData({...formData, excerpt: e.target.value})}
                />
            </div>
          </div>

          <div className="space-y-4">
            <div>
                <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Corps de l'article (Markdown supporté)</label>
                <textarea 
                className="w-full mt-1 p-4 bg-slate-50 rounded-xl border-none text-sm h-[218px] focus:ring-2 focus:ring-blue-500"
                value={formData.content}
                onChange={(e) => setFormData({...formData, content: e.target.value})}
                required
                />
            </div>
          </div>

          <div className="lg:col-span-2 flex items-center justify-between pt-4 border-t border-slate-50">
            <div className="flex items-center gap-2">
                <input 
                    type="checkbox" 
                    id="published"
                    checked={formData.published}
                    onChange={(e) => setFormData({...formData, published: e.target.checked})}
                    className="w-4 h-4 rounded text-blue-600"
                />
                <label htmlFor="published" className="text-[11px] font-bold text-slate-600 uppercase cursor-pointer">Publier immédiatement</label>
            </div>
            
            <div className="flex gap-3">
                {editMode && (
                    <button type="button" onClick={resetForm} className="px-6 py-3 bg-slate-100 text-slate-600 rounded-xl font-bold text-[10px] uppercase tracking-widest hover:bg-slate-200">Annuler</button>
                )}
                <button 
                    disabled={loading}
                    className="px-10 py-3 bg-blue-600 text-white rounded-xl font-bold text-[10px] uppercase tracking-widest hover:bg-blue-700 transition-all shadow-lg shadow-blue-200"
                >
                    {loading ? 'Traitement...' : editMode ? 'Mettre à jour' : 'Lancer la publication'}
                </button>
            </div>
          </div>
        </form>
      </section>

      {/* INVENTAIRE DES POSTS */}
      <section className="space-y-4">
        <h3 className="text-[12px] font-black text-slate-900 uppercase tracking-widest ml-1">Inventaire des articles</h3>
        
        <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-sm">
            <table className="w-full text-left border-collapse">
                <thead>
                    <tr className="bg-slate-50/50">
                        <th className="p-4 text-[9px] font-black text-slate-400 uppercase">Aperçu</th>
                        <th className="p-4 text-[9px] font-black text-slate-400 uppercase">Détails de l'article</th>
                        <th className="p-4 text-[9px] font-black text-slate-400 uppercase">Statut</th>
                        <th className="p-4 text-[9px] font-black text-slate-400 uppercase text-right">Actions</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                    {posts.map(post => (
                        <tr key={post._id} className="hover:bg-slate-50/50 transition-colors">
                            <td className="p-4 w-20">
                                <div className="w-16 h-12 bg-slate-100 rounded-lg overflow-hidden">
                                    {post.image ? <img src={post.image} className="w-full h-full object-cover" alt="" /> : <div className="w-full h-full flex items-center justify-center text-[8px] text-slate-400">NO IMG</div>}
                                </div>
                            </td>
                            <td className="p-4">
                                <p className="text-sm font-bold text-slate-900 leading-tight">{post.title}</p>
                                <p className="text-[10px] text-slate-400 mt-1">{new Date(post.createdAt).toLocaleDateString('fr-FR')}</p>
                            </td>
                            <td className="p-4">
                                <span className={`px-2 py-1 rounded-md text-[8px] font-black uppercase ${post.published ? 'bg-green-50 text-green-600' : 'bg-orange-50 text-orange-600'}`}>
                                    {post.published ? 'En ligne' : 'Brouillon'}
                                </span>
                            </td>
                            <td className="p-4 text-right">
                                <div className="flex justify-end gap-2">
                                    <button onClick={() => handleEdit(post)} className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                                    </button>
                                    <button onClick={() => deletePost(post._id)} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                    </button>
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
            {posts.length === 0 && <div className="p-10 text-center text-slate-400 text-xs font-bold uppercase tracking-widest">Aucun article publié pour le moment</div>}
        </div>
      </section>
    </div>
  );
};

export default AdminBlog;