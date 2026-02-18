import React, { useState, useEffect } from 'react';
import axios from 'axios';
// Retire Layout s'il est déjà présent dans App.jsx
import Layout from '../components/layout'; 
import { siteConfig } from '../config/siteConfig';
import { Link } from 'react-router-dom';

const Blog = () => {
  const [posts, setPosts] = useState([]);
  const primaryColor = siteConfig.theme.primaryColor;

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/posts`);
        setPosts(res.data);
      } catch (err) {
        console.error("Erreur lors de la récupération des articles", err);
      }
    };
    fetchPosts();
  }, []);

  // Si ton App.jsx utilise déjà <Layout>, retire-le ici et utilise une <div> simple
  return (
    <div className="pt-40 pb-20 bg-white min-h-screen">
      <div className="max-w-7xl mx-auto px-6">
        <header className="mb-16 border-l-4 pl-6" style={{ borderColor: primaryColor }}>
          <h1 className="text-4xl font-black uppercase tracking-tighter text-slate-900 leading-none">
            L'Actualité <br/> <span style={{ color: primaryColor }}>{siteConfig.name}</span>
          </h1>
          <p className="mt-4 text-slate-500 text-xs font-bold uppercase tracking-widest">Conseils • Tests • Nouveautés</p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          {posts.map((post) => (
            <Link to={`/blog/${post.slug}`} key={post._id} className="group">
              <div className="relative h-64 mb-6 overflow-hidden rounded-2xl bg-slate-100">
                <img src={post.image} alt={post.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                <div className="absolute top-4 left-4">
                  <span className="bg-white/90 backdrop-blur px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest text-slate-900">
                    {post.category}
                  </span>
                </div>
              </div>
              <h2 className="text-xl font-bold text-slate-900 leading-snug group-hover:text-slate-600 transition-colors">
                {post.title}
              </h2>
              <div className="mt-4 flex items-center gap-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                <span>{new Date(post.createdAt).toLocaleDateString()}</span>
                <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
                {/* Suppression de post.readTime s'il n'est pas dans ton modèle Post.js */}
                <span>Kairos group</span> 
              </div>
            </Link>
          ))}
        </div>
        {posts.length === 0 && (
          <div className="text-center py-20 text-slate-400 font-bold uppercase text-xs tracking-widest">
            Aucun article pour le moment
          </div>
        )}
      </div>
    </div>
  );
};

export default Blog;