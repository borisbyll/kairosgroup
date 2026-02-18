import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { siteConfig } from '../config/siteConfig'; 

const Login = () => {
  // CHANGEMENT : On utilise 'username' au lieu de 'email'
  const [credentials, setCredentials] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const primaryColor = siteConfig.theme.primaryColor;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      // Maintenant 'credentials' contient 'username', ce qui correspond au backend
      const response = await axios.post(`${import.meta.env.VITE_API_URL}/api/login`, credentials);

      if (response.data.token) {
        localStorage.setItem('adminToken', response.data.token);
        navigate('/admin');
      }
    } catch (err) {
      if (err.response && err.response.status === 401) {
        setError('Identifiant ou mot de passe incorrect.');
      } else {
        setError('Une erreur est survenue lors de la connexion au serveur.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center font-['Poppins'] p-4">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-xl border border-slate-100 p-10">
        
        <div className="text-center mb-10">
          <img translate="no" 
            src={siteConfig.logo} 
            alt={siteConfig.name} 
            className="h-16 w-auto mx-auto mb-4" 
          />
          <h1 translate="no" className="text-xl font-bold tracking-[0.2em] text-slate-900 uppercase">
            {siteConfig.name.split(' ')[0]} <span style={{ color: primaryColor }}>{siteConfig.name.split(' ')[1] || ''}</span>
          </h1>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-2 italic">Accès Restreint</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Identifiant Admin</label>
            <input 
              type="text" // CHANGÉ de email à text pour plus de flexibilité
              className="w-full mt-2 p-4 bg-slate-50 border border-slate-100 rounded-xl outline-none transition-all text-sm font-medium focus:ring-1"
              style={{ borderColor: 'transparent' }}
              placeholder="Ex: admin"
              value={credentials.username} // CHANGÉ
              onChange={(e) => setCredentials({...credentials, username: e.target.value})} // CHANGÉ
              required
            />
          </div>

          <div>
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Mot de passe</label>
            <input 
              type="password" 
              className="w-full mt-2 p-4 bg-slate-50 border border-slate-100 rounded-xl outline-none transition-all text-sm font-medium"
              placeholder="••••••••"
              value={credentials.password}
              onChange={(e) => setCredentials({...credentials, password: e.target.value})}
              required
            />
          </div>

          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 p-3">
              <p className="text-red-700 text-[10px] font-bold uppercase text-center">{error}</p>
            </div>
          )}

          <button 
            type="submit" 
            disabled={isLoading}
            style={{ backgroundColor: isLoading ? '#64748b' : primaryColor }}
            className={`w-full text-white py-4 rounded-xl font-bold text-[11px] uppercase tracking-[0.2em] transition-all shadow-lg shadow-slate-200 ${isLoading ? 'opacity-50 cursor-not-allowed' : 'hover:opacity-90 hover:-translate-y-1'}`}
          >
            {isLoading ? 'Vérification...' : 'Se connecter'}
          </button>
        </form>

        <div className="text-center mt-8">
          <a href="/" className="text-[10px] font-bold text-slate-300 uppercase tracking-widest hover:text-slate-600 transition-colors">
            ← Retour au site public
          </a>
        </div>
      </div>
    </div>
  );
};

export default Login;