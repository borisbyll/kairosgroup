import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import Layout from '../components/layout';
import { siteConfig } from '../config/siteConfig';

const BlogPost = () => {
  const { slug } = useParams();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/posts/${slug}`);
        setPost(res.data);
      } catch (err) {
        console.error("Erreur article:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchPost();
  }, [slug]);

  if (loading) return <Layout><div className="pt-40 text-center font-bold uppercase tracking-widest">Chargement...</div></Layout>;
  if (!post) return <Layout><div className="pt-40 text-center font-bold">Article introuvable.</div></Layout>;

  return (
    
      <article className="bg-white min-h-screen">
        {/* Banner Image */}
        <div className="w-full h-[60vh] relative">
          <img src={post.image} className="w-full h-full object-cover" alt={post.title} />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"></div>
          <div className="absolute bottom-0 left-0 w-full p-12">
            <div className="max-w-4xl mx-auto">
               <span className="bg-white px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest mb-6 inline-block">
                {post.category}
              </span>
              <h1 className="text-4xl md:text-6xl font-black text-white uppercase tracking-tighter mb-4">
                {post.title}
              </h1>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="max-w-4xl mx-auto px-6 py-20">
          <div className="flex items-center gap-6 mb-12 pb-8 border-b border-slate-100">
            <div className="text-xs font-bold text-slate-400 uppercase tracking-widest">
              Publié le {new Date(post.createdAt).toLocaleDateString('fr-FR')}
            </div>
            <div className="h-1 w-1 bg-slate-300 rounded-full"></div>
            <div className="text-xs font-bold text-slate-400 uppercase tracking-widest">
              Par {siteConfig.name}
            </div>
          </div>

          <div className="prose prose-xl prose-slate max-w-none">
            {/* On sépare les paragraphes par les sauts de ligne */}
            {post.content.split('\n').map((paragraph, index) => (
              <p key={index} className="text-slate-600 leading-relaxed mb-6 text-lg">
                {paragraph}
              </p>
            ))}
          </div>

          <div className="mt-20 pt-10 border-t border-slate-100">
            <Link 
              to="/blog" 
              className="inline-flex items-center gap-3 text-sm font-black uppercase tracking-widest hover:gap-5 transition-all"
              style={{ color: siteConfig.theme.primaryColor }}
            >
              ← Retour au blog
            </Link>
          </div>
        </div>
      </article>
  );
};

export default BlogPost;