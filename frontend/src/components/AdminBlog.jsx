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
  const UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_PRESET_BLOG; 
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
    // Note: Le dossier 'blog' peut être configuré directement dans le preset Cloudinary

    setUploading(true);
    try {
      const res = await axios.post(CLOUDINARY_URL, data);
      setFormData(prev => ({ ...prev, image: res.data.secure_url }));
    } catch (err) {
      console.error("Détails erreur:", err.response?.data);
      alert("Erreur Cloudinary : Vérifiez que le preset est bien en mode 'Unsigned'");
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // 1. Vérification de l'image (obligatoire dans votre modèle Post.js)
    if (!formData.image) {
      return alert("Erreur : Vous devez uploader une image avant de publier.");
    }

    // 2. Génération automatique du slug (obligatoire dans votre modèle Post.js)
    // On transforme "Mon Article Test" en "mon-article-test"
    const generatedSlug = formData.title
      .toLowerCase()
      .trim()
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '') // Enlève les accents
      .replace(/[^\w ]+/g, '') // Enlève les caractères spéciaux
      .replace(/ +/g, '-'); // Remplace les espaces par des tirets

    // On prépare l'objet final avec le slug inclus
    const dataToSend = { 
      ...formData, 
      slug: generatedSlug 
    };

    setLoading(true);
    try {
      if (editMode) {
        await axios.put(`${API_URL}/${currentPostId}`, dataToSend, getAuthHeader());
      } else {
        await axios.post(API_URL, dataToSend, getAuthHeader());
      }
      resetForm();
      fetchPosts();
      alert("Article publié avec succès sur Kairos group !");
    } catch (err) {
      // On affiche le message précis du serveur pour déboguer
      const serverMessage = err.response?.data?.message || "Erreur de validation";
      alert(`Erreur 400 : ${serverMessage}. Vérifiez que le titre est unique.`);
      console.error("Détails erreur:", err.response?.data);
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
    <div className="space-y-10 animate-in fade-in duration-500 pb-20">
      
      {/* HEADER */}
      <div className="border-b border-slate-200 pb-6">
        <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tighter">Gestion Blog</h2>
        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">Publiez du contenu pour Emile Auto</p>
      </div>

      {/* FORMULAIRE */}
      <section className="bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden">
        <div className="bg-slate-900 p-4 flex justify-between items-center">
          <h3 className="text-white text-[10px] font-black uppercase tracking-[0.3em]">
            {editMode ? 'Modifier l\'article' : 'Nouvel Article'}
          </h3>
          {editMode && <button onClick={resetForm} className="text-white/60 hover:text-white text-[9px] font-bold uppercase">Annuler</button>}
        </div>
        
        <form onSubmit={handleSubmit} className="p-8 grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-6">
            <div>
              <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Titre</label>
              <input 
                type="text" 
                className="w-full mt-1 p-4 bg-slate-50 rounded-xl border-none text-sm font-bold focus:ring-2 focus:ring-blue-500"
                value={formData.title}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
                required
              />
            </div>

            <div>
              <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Image Couverture</label>
              <div className="mt-1 relative">
                <input type="file" id="file-blog" className="hidden" onChange={handleImageUpload} accept="image/*" />
                <label htmlFor="file-blog" className={`flex flex-col items-center justify-center w-full h-44 border-2 border-dashed rounded-2xl cursor-pointer transition-all ${formData.image ? 'border-green-200 bg-green-50' : 'border-slate-200 bg-slate-50 hover:bg-slate-100'}`}>
                  {uploading ? (
                    <div className="text-[10px] font-bold text-blue-600 animate-pulse uppercase">Chargement Cloudinary...</div>
                  ) : formData.image ? (
                    <img src={formData.image} className="h-full w-full object-cover rounded-2xl" alt="Preview" />
                  ) : (
                    <div className="text-center">
                      <span className="text-2xl">🖼️</span>
                      <p className="text-[9px] font-black text-slate-400 uppercase mt-2">Cliquez pour uploader</p>
                    </div>
                  )}
                </label>
              </div>
            </div>

            <div>
              <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Extrait SEO</label>
              <textarea 
                className="w-full mt-1 p-4 bg-slate-50 rounded-xl border-none text-sm h-20 resize-none"
                value={formData.excerpt}
                onChange={(e) => setFormData({...formData, excerpt: e.target.value})}
              />
            </div>
          </div>

          <div className="flex flex-col">
            <label className="text-[10px] font-black uppercase text-slate-400 ml-1 mb-1">Contenu (Texte)</label>
            <textarea 
              className="flex-1 p-4 bg-slate-50 rounded-xl border-none text-sm min-h-[300px] focus:ring-2 focus:ring-blue-500"
              value={formData.content}
              onChange={(e) => setFormData({...formData, content: e.target.value})}
              required
            />
          </div>

          <div className="lg:col-span-2 flex items-center justify-between pt-6 border-t border-slate-50">
            <div className="flex items-center gap-2">
              <input type="checkbox" id="pub" checked={formData.published} onChange={(e) => setFormData({...formData, published: e.target.checked})} className="w-4 h-4 rounded text-blue-600" />
              <label htmlFor="pub" className="text-[11px] font-bold text-slate-600 uppercase">Publier en ligne</label>
            </div>
            <button 
              disabled={loading || uploading}
              className="px-10 py-4 bg-blue-600 text-white rounded-xl font-bold text-[10px] uppercase tracking-widest hover:bg-blue-700 shadow-lg disabled:opacity-50"
            >
              {loading ? 'Envoi...' : editMode ? 'Mettre à jour' : 'Publier l\'article'}
            </button>
          </div>
        </form>
      </section>

      {/* TABLEAU INVENTAIRE */}
      <section className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-slate-50 text-[9px] font-black text-slate-400 uppercase">
            <tr>
              <th className="p-4">Article</th>
              <th className="p-4 hidden md:table-cell">Date</th>
              <th className="p-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {posts.map(post => (
              <tr key={post._id} className="hover:bg-slate-50/50 transition-all">
                <td className="p-4 flex items-center gap-3">
                  <div className="w-10 h-10 rounded bg-slate-100 overflow-hidden flex-shrink-0">
                    {post.image && <img src={post.image} className="w-full h-full object-cover" alt="" />}
                  </div>
                  <span className="text-sm font-bold text-slate-800 line-clamp-1">{post.title}</span>
                </td>
                <td className="p-4 hidden md:table-cell text-[10px] font-bold text-slate-400 uppercase">
                  {new Date(post.createdAt).toLocaleDateString()}
                </td>
                <td className="p-4 text-right space-x-2">
                  <button onClick={() => handleEdit(post)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-all">✏️</button>
                  <button onClick={() => deletePost(post._id)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-all">🗑️</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {posts.length === 0 && <div className="p-10 text-center text-[10px] font-bold text-slate-300 uppercase">Aucun article trouvé</div>}
      </section>
    </div>
  );
};

export default AdminBlog;