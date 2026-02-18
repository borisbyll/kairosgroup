import React, { useState, useEffect } from 'react';
import axios from 'axios';

const AdminBlog = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [newPost, setNewPost] = useState({ title: '', content: '', excerpt: '', image: '', published: true });

  // 1. HARMONISATION DU TOKEN (Important pour Emile Auto)
  const getAuthHeader = () => {
    const token = localStorage.getItem('adminToken'); // Utilise bien 'adminToken'
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/posts`);
      setPosts(res.data);
    } catch (err) {
      console.error("Erreur lors du chargement des articles", err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      // Utilisation du header avec le bon nom de token
      await axios.post(`${import.meta.env.VITE_API_URL}/api/posts`, newPost, {
        headers: getAuthHeader()
      });
      setNewPost({ title: '', content: '', excerpt: '', image: '', published: true });
      fetchPosts();
      alert("Article publié !");
    } catch (err) {
      alert("Erreur lors de la publication. Vérifiez votre connexion.");
    } finally {
      setLoading(false);
    }
  };

  const deletePost = async (id) => {
    if (window.confirm("Supprimer cet article ?")) {
      try {
        await axios.delete(`${import.meta.env.VITE_API_URL}/api/posts/${id}`, {
          headers: getAuthHeader()
        });
        fetchPosts();
      } catch (err) {
        alert("Erreur lors de la suppression.");
      }
    }
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-black text-slate-900 uppercase tracking-tighter">Gestion du Blog</h2>
        <span className="text-[10px] bg-blue-50 text-blue-600 px-3 py-1 rounded-full font-bold uppercase">Mode Édition</span>
      </div>

      {/* FORMULAIRE DE CRÉATION */}
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 space-y-4">
        <input 
          type="text" 
          placeholder="Titre de l'article" 
          className="w-full p-3 bg-slate-50 rounded-xl border-none text-sm focus:ring-2 focus:ring-blue-500"
          value={newPost.title}
          onChange={(e) => setNewPost({...newPost, title: e.target.value})}
          required
        />
        <textarea 
          placeholder="Extrait court (SEO)" 
          className="w-full p-3 bg-slate-50 rounded-xl border-none text-sm h-20"
          value={newPost.excerpt}
          onChange={(e) => setNewPost({...newPost, excerpt: e.target.value})}
        />
        <textarea 
          placeholder="Contenu de l'article" 
          className="w-full p-3 bg-slate-50 rounded-xl border-none text-sm h-40"
          value={newPost.content}
          onChange={(e) => setNewPost({...newPost, content: e.target.value})}
          required
        />
        <button 
          disabled={loading}
          className="w-full py-4 bg-slate-900 text-white rounded-xl font-bold text-[11px] uppercase tracking-widest hover:bg-slate-800 transition-all shadow-lg"
        >
          {loading ? 'Publication en cours...' : 'Publier sur le blog'}
        </button>
      </form>

      {/* LISTE DES ARTICLES */}
      <div className="grid gap-4">
        {posts.map(post => (
          <div key={post._id} className="bg-white p-4 rounded-xl flex items-center justify-between border border-slate-100">
            <div>
              <h4 className="font-bold text-slate-900 text-sm">{post.title}</h4>
              <p className="text-[10px] text-slate-400 uppercase font-medium">{new Date(post.createdAt).toLocaleDateString()}</p>
            </div>
            <button onClick={() => deletePost(post._id)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg">
              {/* Icône Corbeille SVG Simple */}
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminBlog;