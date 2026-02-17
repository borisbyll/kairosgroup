import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { siteConfig } from '../config/siteConfig';
import emailjs from '@emailjs/browser'; 

const Layout = ({ children }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0); // Ajouté pour détecter le sens du scroll
  const [isModalOpen, setIsModalOpen] = useState(false); 
  const [isSending, setIsSending] = useState(false);
  const [sentStatus, setSentStatus] = useState(null); // 'success' ou 'error'
  const location = useLocation();

  // --- GESTION DU SCROLL OPTIMISÉE ---
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      // On définit un seuil de disparition dynamique
      // Sur le catalogue, on veut qu'elle s'efface presque tout de suite (50px)
      const threshold = location.pathname.toLowerCase().includes('catalogue') ? 50 : 150;

      if (currentScrollY > threshold) {
        // Si on descend, on cache. Si on remonte, on montre.
        if (currentScrollY > lastScrollY) {
          setIsVisible(false);
        } else {
          setIsVisible(true);
        }
      } else {
        // Toujours visible en haut de page
        setIsVisible(true);
      }
      
      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY, location.pathname]); // Dépendances pour recalculer selon la page

  const isControlPanel = location.pathname.toLowerCase().startsWith('/admin') || 
                         location.pathname.toLowerCase() === '/login';

  if (isControlPanel) {
    return <>{children}</>;
  }

  const isCarDetail = location.pathname.startsWith('/Car/');
  const primaryColor = siteConfig.theme.primaryColor;

  const handleNavbarContactSubmit = (e) => {
    e.preventDefault();
    const s_id = import.meta.env.VITE_EMAILJS_SERVICE_ID;
    const t_id = import.meta.env.VITE_EMAILJS_TEMPLATE_ID_CONTACT;
    const p_key = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;

    if (!s_id || !t_id || !p_key) {
      console.error("Identifiants manquants !");
      return;
    }

    emailjs.sendForm(s_id, t_id, e.target, p_key)
      .then(() => {
        setSentStatus('success')
      }, (error) => {
        console.error("Erreur EmailJS:", error);
        setSentStatus('error');
      });
  };

  return (
    <div className="min-h-screen flex flex-col font-['Poppins'] bg-white text-slate-900 overflow-x-hidden">
      
      {/* --- NAVBAR --- */}
      <nav 
        className={`fixed top-6 left-1/2 -translate-x-1/2 w-[95%] max-w-6xl z-[1000] transition-all duration-700 ease-in-out ${
          isVisible 
            ? 'opacity-100 translate-y-0' 
            : 'opacity-0 -translate-y-20 pointer-events-none'
        }`}
      >
        <div className="bg-white/95 backdrop-blur-md border border-slate-100 rounded-[2rem] px-8 py-4 shadow-xl">
          <div className="flex justify-between items-center">
            
            <Link to="/" className="flex items-center group">
              <img src={siteConfig.logo} alt={siteConfig.name} className="h-9 w-auto group-hover:scale-105 transition-transform duration-300" />
            </Link>

            <div className="hidden md:flex items-center gap-10 text-[10px] font-black uppercase tracking-[0.4em]">
              <Link to="/" className="relative group text-slate-900">
                Accueil
                <span className={`absolute -bottom-2 left-0 h-[2px] transition-all duration-300 ${location.pathname === '/' ? 'w-full' : 'w-0 group-hover:w-full'}`} style={{ backgroundColor: primaryColor }}></span>
              </Link>
              <Link to="/Catalogue" className="relative group text-slate-900">
                Catalogue
                <span className={`absolute -bottom-2 left-0 h-[2px] transition-all duration-300 ${location.pathname === '/Catalogue' ? 'w-full' : 'w-0 group-hover:w-full'}`} style={{ backgroundColor: primaryColor }}></span>
              </Link>
              <a href="/#expertises" className="relative group text-slate-900">
                Expertises
                <span className="absolute -bottom-2 left-0 h-[2px] w-0 group-hover:w-full transition-all duration-300" style={{ backgroundColor: primaryColor }}></span>
              </a>
            </div>

            <div className="hidden md:block">
              <button 
                onClick={() => setIsModalOpen(true)}
                style={{ backgroundColor: primaryColor }}
                className="text-white text-[10px] font-black uppercase tracking-widest px-8 py-3 rounded-full hover:scale-105 transition-all shadow-md"
              >
                Prendre Contact
              </button>
            </div>

            <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="md:hidden text-slate-900 p-2 focus:outline-none">
              <div className="space-y-1.5">
                <span className={`block h-0.5 w-6 bg-slate-900 transition-transform ${isMenuOpen ? 'rotate-45 translate-y-2' : ''}`}></span>
                <span className={`block h-0.5 w-6 bg-slate-900 ${isMenuOpen ? 'opacity-0' : ''}`}></span>
                <span className={`block h-0.5 w-6 bg-slate-900 ${isMenuOpen ? '-rotate-45 -translate-y-2' : ''}`}></span>
              </div>
            </button>
          </div>
        </div>

        {/* MOBILE OVERLAY */}
        {isMenuOpen && (
          <div className="fixed inset-0 top-0 left-0 w-full h-screen bg-white z-[1100] flex flex-col items-center justify-center gap-10 md:hidden">
             <button onClick={() => setIsMenuOpen(false)} className="absolute top-10 right-10 text-slate-900 font-bold uppercase tracking-widest">Fermer ✕</button>
             <Link to="/" onClick={() => setIsMenuOpen(false)} className="text-3xl font-black text-slate-900 uppercase">Accueil</Link>
             <Link to="/Catalogue" onClick={() => setIsMenuOpen(false)} className="text-3xl font-black text-slate-900 uppercase">Catalogue</Link>
             <a href="/#expertises" onClick={() => setIsMenuOpen(false)} className="text-3xl font-black text-slate-900 uppercase">Expertises</a>
             <button onClick={() => { setIsMenuOpen(false); setIsModalOpen(true); }} className="text-3xl font-black uppercase" style={{ color: primaryColor }}>Prendre Contact</button>
          </div>
        )}
      </nav>

{/* --- MODALE --- */}
{isModalOpen && (
  <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4">
    <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => { setIsModalOpen(false); setSentStatus(null); }}></div>
    <div className="relative bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl overflow-hidden">
      <div className="p-10">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl font-black uppercase tracking-tighter">
            Contact <span style={{ color: primaryColor }}>{siteConfig.name}</span>
          </h2>
          <button onClick={() => { setIsModalOpen(false); setSentStatus(null); }} className="h-10 w-10 flex items-center justify-center rounded-full bg-slate-50 text-slate-400 hover:text-red-500 transition-colors">✕</button>
        </div>

        {sentStatus === 'success' ? (
          /* --- MESSAGE DE SUCCÈS PROFESSIONNEL --- */
          <div className="text-center py-10 animate-fade-in">
            <div className="w-12 h-12 bg-green-100 text-green-500 rounded-full flex items-center justify-center mx-auto mb-6 text-3xl">✓</div>
            <h3 className="text-xl font-bold text-slate-900 uppercase mb-2">Message envoyé !</h3>
            <p className="text-slate-500 text-sm mb-8">Notre équipe vous recontactera dans les plus brefs délais.</p>
            <button 
              onClick={() => { setIsModalOpen(false); setSentStatus(null); }}
              className="px-8 py-3 bg-slate-900 text-white rounded-xl font-bold uppercase text-[10px] tracking-widest"
            >
              Fermer
            </button>
          </div>
        ) : (
          /* --- FORMULAIRE --- */
          <form onSubmit={async (e) => {
            setIsSending(true);
            await handleNavbarContactSubmit(e); // Votre fonction d'envoi
            setIsSending(false);
            setSentStatus('success'); // Active le message de succès
          }} className="space-y-4">
            <input name="name" required disabled={isSending} type="text" placeholder="Votre nom complet" className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-4 focus:outline-none focus:ring-2 focus:ring-slate-100 transition-all disabled:opacity-50" />
            <input name="phone" required disabled={isSending} type="tel" placeholder="Votre numéro de téléphone" className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-4 focus:outline-none focus:ring-2 focus:ring-slate-100 transition-all disabled:opacity-50" />
            <input name="user_email" required disabled={isSending} type="email" placeholder="Votre adresse email" className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-4 focus:outline-none focus:ring-2 focus:ring-slate-100 transition-all disabled:opacity-50" />
            
            <select name="subject" disabled={isSending} className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-4 focus:outline-none focus:ring-2 focus:ring-slate-100 transition-all disabled:opacity-50">
              <option value="Demande d'achat">Demande d'achat</option>
              <option value="Autre demande">Autre demande</option>
            </select>
            
            <textarea name="message" required disabled={isSending} rows="4" placeholder="Détaillez votre demande ici..." className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-4 focus:outline-none focus:ring-2 focus:ring-slate-100 transition-all disabled:opacity-50"></textarea>
            
            <button 
              type="submit" 
              disabled={isSending}
              style={{ backgroundColor: primaryColor }} 
              className={`w-full text-white font-black uppercase tracking-widest py-5 rounded-2xl transition-all shadow-lg flex items-center justify-center gap-3
                ${isSending ? 'cursor-not-allowed opacity-80' : 'hover:brightness-110'}`}
            >
              {isSending ? (
                <>
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                  Envoi en cours...
                </>
              ) : "Envoyer par Email"}
            </button>
          </form>
        )}
      </div>
    </div>
  </div>
)}

      {/* --- FIL D'ARIANE --- */}
      {isCarDetail && (
        <div className="bg-slate-50 border-b border-slate-100 py-4 mt-32">
          <div className="max-w-7xl mx-auto px-6 flex items-center gap-2 text-[9px] font-bold uppercase tracking-[0.2em] text-slate-400">
            <Link to="/" className="hover:text-slate-900 transition-colors">Accueil</Link>
            <span>/</span>
            <Link to="/Catalogue" className="hover:text-slate-900 transition-colors">Catalogue</Link>
            <span>/</span>
            <span style={{ color: primaryColor }}>Détails du véhicule</span>
          </div>
        </div>
      )}

      <main className="flex-grow">{children}</main>

      {/* --- FOOTER --- */}
      <footer className="bg-slate-900 text-white py-20 mt-auto">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <img src={siteConfig.logo} alt={siteConfig.name} className="h-10 w-auto mx-auto mb-8 brightness-100 invert opacity-100" />
          <div className="space-y-2 mb-8">
              <p className="text-slate-400 text-sm tracking-wide">{siteConfig.contact.address}</p>
              <p className="text-slate-400 text-sm tracking-wide">{siteConfig.contact.email}</p>
          </div>
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.5em]">
            © {new Date().getFullYear()} {siteConfig.name} — Expertise Automobile
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Layout;