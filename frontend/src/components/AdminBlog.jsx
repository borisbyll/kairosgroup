import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { siteConfig } from '../config/siteConfig';
import * as Icons from 'lucide-react'; // Assure-toi d'avoir lucide-react installé

const AdminBlog = () => {
  const [posts, setPosts] = useState([]);
  const [isAdding, setIsAdding] = useState(false);
  const [loading, setLoading] = useState(false);
  const primaryColor = siteConfig.theme.primaryColor;

  // État du formulaire
  const [newPost, setNewPost] = useState({
    title: '',
    slug: '',
    content: '',
    category: 'Conseils',
    image: '',
    readTime: '5 min'
  });

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/posts`);
      setPosts(res.data);
    } catch (err) {
      console.error("Erreur de chargement", err);
    }
  };

  // Génération automatique du SLUG (URL propre pour Emile Auto)
  const handleTitleChange = (e) => {
    const title = e.target.value;
    const slug = title
      .toLowerCase()
      .trim()
      .normalize("NFD").replace(/[\u0300-\u036f]/g, "") // Enlève les accents
      .replace(/[^\w ]+/g, '') // Enlève les caractères spéciaux
      .replace(/ +/g, '-');    // Remplace les espaces par des tirets
    setNewPost({ ...newPost, title, slug });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      await axios.post(`${import.meta.env.VITE_API_URL}/api/posts`, newPost, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setIsAdding(false);
      fetchPosts();
      setNewPost({ title: '', slug: '', content: '', category: 'Conseils', image: '', readTime: '5 min' });
      alert("Article publié sur Emile Auto !");
    } catch (err) {
      alert("Erreur lors de la publication.");
    } finally {
      setLoading(false);
    }
  };

  const deletePost = async (id) => {
    if (window.confirm("Supprimer définitivement cet article ?")) {
      try {
        const token = localStorage.getItem('token');
        await axios.delete(`${import.meta.env.VITE_API_URL}/api/posts/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        fetchPosts();
      } catch (err) {
        alert("Erreur suppression");
      }
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* HEADER DE LA SECTION */}
      <div className="flex justify-between items-center bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
        <div>
          <h2 className="text-2xl font-black uppercase tracking-tighter text-slate-900">
            Gestion du <span style={{ color: primaryColor }}>Blog</span>
          </h2>
          <p className="text-slate-400 text-[10px] font-bold uppercase tracking-[0.2em] mt-1">
            {posts.length} Articles en ligne
          </p>
        </div>
        <button 
          onClick={() => setIsAdding(!isAdding)}
          style={{ backgroundColor: isAdding ? '#f1f5f9' : primaryColor }}
          className={`px-6 py-3 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all shadow-lg ${isAdding ? 'text-slate-600' : 'text-white hover:scale-105'}`}
        >
          {isAdding ? 'Annuler' : 'Rédiger un article'}
        </button>
      </div>

      {/* FORMULAIRE D'AJOUT */}
      {isAdding && (
        <form onSubmit={handleSubmit} className="bg-white p-8 rounded-3xl border border-slate-100 shadow-2xl space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Titre</label>
              <input 
                type="text" 
                value={newPost.title} 
                onChange={handleTitleChange}
                className="w-full px-5 py-4 bg-slate-50 rounded-2xl border-none focus:ring-2 text-sm font-bold"
                style={{ '--tw-ring-color': primaryColor }}
                required 
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Slug (URL SEO)</label>
              <input 
                type="text" 
                value={newPost.slug} 
                readOnly
                className="w-full px-5 py-4 bg-slate-100 rounded-2xl border-none text-sm text-slate-500 font-mono"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Contenu</label>
            <textarea 
              rows="10"
              value={newPost.content}
              onChange={(e) => setNewPost({...newPost, content: e.target.value})}
              className="w-full px-5 py-4 bg-slate-50 rounded-2xl border-none focus:ring-2 text-sm leading-relaxed"
              style={{ '--tw-ring-color': primaryColor }}
              required
            ></textarea>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <input 
              type="text" 
              placeholder="Image URL (Cloudinary)"
              value={newPost.image}
              onChange={(e) => setNewPost({...newPost, image: e.target.value})}
              className="w-full px-5 py-4 bg-slate-50 rounded-2xl border-none text-xs"
              required
            />
            <select 
              value={newPost.category}
              onChange={(e) => setNewPost({...newPost, category: e.target.value})}
              className="w-full px-5 py-4 bg-slate-50 rounded-2xl border-none text-xs font-bold"
            >
              <option value="Conseils">Conseils</option>
              <option value="Nouveautés">Nouveautés</option>
              <option value="Entretien">Entretien</option>
            </select>
            <button 
              type="submit" 
              disabled={loading}
              style={{ backgroundColor: primaryColor }}
              className="w-full py-4 rounded-2xl text-white text-[11px] font-black uppercase tracking-widest shadow-lg hover:opacity-90 transition-all"
            >
              {loading ? 'Publication...' : 'Publier l\'article'}
            </button>
          </div>
        </form>
      )}

      {/* LISTE DES ARTICLES */}
      <div className="grid grid-cols-1 gap-4">
        {posts.map((post) => (
          <div key={post._id} className="bg-white p-4 rounded-2xl border border-slate-100 flex items-center justify-between shadow-sm">
            <div className="flex items-center gap-5">
              <img src={post.image} className="w-16 h-16 rounded-xl object-cover" alt="" />
              <div>
                <h4 className="font-bold text-slate-900 text-sm">{post.title}</h4>
                <p className="text-[9px] text-slate-400 uppercase font-black tracking-widest mt-1">
                  {post.category} • {new Date(post.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>
            <button onClick={() => deletePost(post._id)} className="px-4 py-2 text-xs font-bold text-red-500 hover:bg-red-50 rounded-lg transition-colors">
              Supprimer
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminBlog;