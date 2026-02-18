import React, { useState, useEffect } from 'react';
import axios from 'axios';

const AdminBlog = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [currentPostId, setCurrentPostId] = useState(null);
  
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    excerpt: '',
    image: '',
    published: true
  });

  // RÉCUPÉRATION DES VARIABLES D'ENVIRONNEMENT
  const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
  const UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET_BLOG;
  const CLOUDINARY_URL = `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`;
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

  // --- GESTION DE L'UPLOAD IMAGE (CLOUDINARY) ---
  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const data = new FormData();
    data.append("file", file);
    data.append("upload_preset", UPLOAD_PRESET);
    data.append("folder", "kairosgroupblog"); 

    setUploading(true);
    try {
      const res = await axios.post(CLOUDINARY_URL, data);
      setFormData({ ...formData, image: res.data.secure_url });
    } catch (err) {
      alert("Erreur lors du transfert de l'image. Vérifiez votre configuration Cloudinary.");
      console.error(err);
    } finally {
      setUploading(false);
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
      alert(editMode ? "Article mis à jour !" : "Article publié avec succès !");
    } catch (err) {
      alert("Erreur lors de l'enregistrement. Vérifiez votre connexion au serveur.");
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
    if (window.confirm("Voulez-vous vraiment supprimer cet article ? Cette action est irréversible.")) {
      try {
        await axios.delete(`${API_URL}/${id}`, getAuthHeader());
        fetchPosts();
      } catch (err) {
        alert("Erreur lors de la suppression.");
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
      
      {/* HEADER GESTION */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tighter">Gestion du Blog</h2>
          <p className="text-[11px] text-slate-500 font-bold uppercase tracking-widest mt-1">Espace éditorial - Emile Auto</p>
        </div>
      </div>

      {/* ZONE D'ÉDITION */}
      <section className="bg-white rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden">
        <div className="bg-slate-900 p-4 flex justify-between items-center">
            <h3 className="text-white text-[10px] font-black uppercase tracking-[0.3em]">
                {editMode ? 'Modifier l\'article' : 'Rédiger un nouvel article'}
            </h3>
            {editMode && <button onClick={resetForm} className="text-white text-[9px] font-bold uppercase bg-white/10 px-3 py-1 rounded-lg">Annuler l'édition</button>}
        </div>
        
        <form onSubmit={handleSubmit} className="p-8 grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-6">
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
                <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Image illustrative</label>
                <div className="mt-1 relative">
                    <input 
                        type="file" id="blog-image" className="hidden" 
                        onChange={handleImageUpload} accept="image/*"
                    />
                    <label htmlFor="blog-image" className={`flex flex-col items-center justify-center w-full h-40 border-2 border-dashed rounded-2xl cursor-pointer transition-all ${formData.image ? 'border-green-200 bg-green-50' : 'border-slate-200 bg-slate-50 hover:bg-slate-100'}`}>
                        {uploading ? (
                            <div className="text-[10px] font-bold text-blue-600 animate-pulse uppercase">Upload en cours...</div>
                        ) : formData.image ? (
                            <div className="relative w-full h-full">
                                <img src={formData.image} className="h-full w-full object-cover rounded-2xl" alt="Preview" />
                                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity rounded-2xl">
                                    <span className="text-white text-[10px] font-bold uppercase">Changer l'image</span>
                                </div>
                            </div>
                        ) : (
                            <div className="text-center">
                                <div className="text-3xl mb-2">📸</div>
                                <p className="text-[10px] font-black text-slate-400 uppercase">Cliquez pour choisir une photo</p>
                            </div>
                        )}
                    </label>
                </div>
            </div>

            <div>
                <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Extrait court (SEO)</label>
                <textarea 
                  className="w-full mt-1 p-4 bg-slate-50 rounded-xl border-none text-sm h-24 resize-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Apparaît sur la liste des articles..."
                  value={formData.excerpt}
                  onChange={(e) => setFormData({...formData, excerpt: e.target.value})}
                />
            </div>
          </div>

          <div className="flex flex-col">
            <label className="text-[10px] font-black uppercase text-slate-400 ml-1 mb-1">Contenu de l'article</label>
            <textarea 
              className="flex-1 p-4 bg-slate-50 rounded-xl border-none text-sm min-h-[300px] focus:ring-2 focus:ring-blue-500"
              placeholder="Rédigez ici le corps de votre article..."
              value={formData.content}
              onChange={(e) => setFormData({...formData, content: e.target.value})}
              required
            />
          </div>

          <div className="lg:col-span-2 flex items-center justify-between pt-6 border-t border-slate-50">
            <div className="flex items-center gap-2">
                <input 
                    type="checkbox" id="pub" checked={formData.published}
                    onChange={(e) => setFormData({...formData, published: e.target.checked})}
                    className="w-4 h-4 rounded border-slate-300 text-blue-600"
                />
                <label htmlFor="pub" className="text-[11px] font-bold text-slate-600 uppercase cursor-pointer">Visible sur le site</label>
            </div>
            
            <button 
                disabled={loading || uploading}
                className="px-12 py-4 bg-blue-600 text-white rounded-xl font-bold text-[10px] uppercase tracking-widest hover:bg-blue-700 transition-all shadow-lg shadow-blue-100 disabled:opacity-50"
            >
                {loading ? 'Traitement...' : editMode ? 'Mettre à jour l\'article' : 'Publier l\'article'}
            </button>
          </div>
        </form>
      </section>

      {/* INVENTAIRE / LISTE DES POSTS */}
      <section className="space-y-4">
        <h3 className="text-[12px] font-black text-slate-900 uppercase tracking-widest ml-1">Articles Publiés</h3>
        
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            <table className="w-full text-left">
                <thead className="bg-slate-50/50">
                    <tr>
                        <th className="p-4 text-[9px] font-black text-slate-400 uppercase">Article</th>
                        <th className="p-4 text-[9px] font-black text-slate-400 uppercase hidden md:table-cell">Statut</th>
                        <th className="p-4 text-[9px] font-black text-slate-400 uppercase text-right">Actions</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                    {posts.map(post => (
                        <tr key={post._id} className="hover:bg-slate-50/50 transition-colors">
                            <td className="p-4 flex items-center gap-4">
                                <div className="w-14 h-14 bg-slate-100 rounded-lg overflow-hidden flex-shrink-0">
                                    {post.image ? <img src={post.image} className="w-full h-full object-cover" alt="" /> : <div className="w-full h-full flex items-center justify-center text-[8px] text-slate-400 font-bold uppercase">No Img</div>}
                                </div>
                                <div>
                                    <p className="text-sm font-bold text-slate-900 line-clamp-1">{post.title}</p>
                                    <p className="text-[10px] text-slate-400 font-medium">{new Date(post.createdAt).toLocaleDateString('fr-FR')}</p>
                                </div>
                            </td>
                            <td className="p-4 hidden md:table-cell">
                                <span className={`px-3 py-1 rounded-full text-[8px] font-black uppercase ${post.published ? 'bg-green-50 text-green-600' : 'bg-orange-50 text-orange-600'}`}>
                                    {post.published ? 'En ligne' : 'Brouillon'}
                                </span>
                            </td>
                            <td className="p-4 text-right">
                                <div className="flex justify-end gap-2">
                                    <button onClick={() => handleEdit(post)} className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all" title="Modifier">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                                    </button>
                                    <button onClick={() => deletePost(post._id)} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all" title="Supprimer">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                    </button>
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
            {posts.length === 0 && (
                <div className="p-20 text-center">
                    <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Aucun article dans la base de données</p>
                </div>
            )}
        </div>
      </section>
    </div>
  );
};

export default AdminBlog;