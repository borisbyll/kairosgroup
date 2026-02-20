import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import axios from 'axios';

// Correction de la casse pour correspondre à tes fichiers réels
import Layout from './components/layout'; 

// Importation des composants
import Home from './pages/Home';
import Catalogue from './pages/Catalogue';
import CarDetail from './pages/CarDetail';
import Admin from './pages/Admin';
import Login from './pages/login'; // Vérifie la majuscule ici aussi
import { siteConfig } from './config/siteConfig'; 

// Blog (Nouvelles routes Kairos group)
import Blog from './pages/Blog';
import BlogPost from './pages/BlogPost';

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

// --- PROTECTION DES ROUTES (CONSERVÉ) ---
const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('adminToken');
  if (!token) return <Navigate to="/login" replace />;
  return children;
};

// --- BOUTON WHATSAPP (TOUTES TES FONCTIONNALITÉS CONSERVÉES) ---
const FloatingWhatsApp = () => {
  const location = useLocation();
  const isHidden = location.pathname.toLowerCase().startsWith('/admin') || 
                   location.pathname.toLowerCase() === '/login';
  
  if (isHidden) return null;

  const handleWhatsAppClick = async (e) => {
    if (e) e.preventDefault(); 
    let provenance = "Page d'accueil";
    if (location.pathname.startsWith('/Car/')) provenance = "Fiche Véhicule";
    else if (location.pathname === '/Catalogue') provenance = "Catalogue Complet";

    try {
      // Enregistrement de la notification dans ton backend
      await axios.post(`${API_URL}/api/notifications/add`, { page: provenance });
    } catch (err) {
      console.error("Erreur notification:", err);
    } finally {
      // Ton lien WhatsApp spécifique
      window.open(`https://wa.me/15068384859?text=${encodeURIComponent("Bonjour kairos group, je suis interessé par ce véhicule: .")}`, "_blank");
    }
  };

  return (
    <button onClick={handleWhatsAppClick} className="fixed bottom-8 right-8 z-[100] flex items-center group bg-transparent border-none p-0 outline-none cursor-pointer">
      <span className="absolute inline-flex h-full w-full rounded-full bg-[#25D366] opacity-20 animate-ping"></span>
      <div className="relative bg-[#25D366] text-white p-4 rounded-2xl shadow-lg hover:scale-110 transition-all duration-300 flex items-center">
        <span className="max-w-0 overflow-hidden group-hover:max-w-xs group-hover:ml-3 transition-all duration-500 font-bold text-[11px] uppercase tracking-[0.2em] whitespace-nowrap">
          Conseiller en ligne
        </span>
        <svg viewBox="0 0 24 24" className="w-7 h-7 fill-current" xmlns="http://www.w3.org/2000/svg">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.414 0 .018 5.396.015 12.03c0 2.12.553 4.189 1.602 6.006L0 24l6.149-1.613a11.82 11.82 0 005.895 1.564h.005c6.635 0 12.032-5.396 12.035-12.03a11.85 11.85 0 00-3.527-8.503z"/>
        </svg>
      </div>
    </button>
  );
};

function App() {
  return (
    <Router>
      <div className="relative min-h-screen">
        <Layout>
          <Routes>
            <Route index element={<Home />} />
            <Route path="/Catalogue" element={<Catalogue />} />
            <Route path="/Car/:id" element={<CarDetail />} />
            <Route path="/login" element={<Login />} />
            
            {/* Route de secours pour le contact */}
            <Route path="/contact" element={<Home />} /> 
            
            <Route 
              path="/admin/*" 
              element={
                <ProtectedRoute>
                  <Admin />
                </ProtectedRoute>
              } 
            />
            <Route path="/blog" element={<Blog />} />

            <Route path="/blog/:slug" element={<BlogPost/>} />
            
            {/* Gestion automatique des erreurs 404 vers l'accueil */}
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </Layout>
        <FloatingWhatsApp />
      </div>
    </Router>
  );
}

export default App;