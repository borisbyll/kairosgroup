import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link, useLocation } from 'react-router-dom';
import Card from '../components/Card';
import { siteConfig } from '../config/siteConfig';

const Home = () => {
  const [recentVehicles, setRecentVehicles] = useState([]);
  const { pathname, hash } = useLocation();
  const primaryColor = siteConfig.theme.primaryColor;

  useEffect(() => {
    if (hash) {
      const element = document.getElementById(hash.replace('#', ''));
      if (element) {
        setTimeout(() => { element.scrollIntoView({ behavior: 'smooth' }); }, 100);
      }
    } else { window.scrollTo(0, 0); }
  }, [pathname, hash]);

  useEffect(() => {
    const fetchRecent = async () => {
      try {
        const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/cars`);
        const latest = res.data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 3);
        setRecentVehicles(latest);
      } catch (err) { console.error("Erreur:", err); }
    };
    fetchRecent();
  }, []);

  return (
    <div className="font-['Poppins'] bg-white overflow-x-hidden">
      {/* --- INJECTION DU CSS D'ANIMATION --- */}
      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes kenBurns {
          from { transform: scale(1.1); }
          to { transform: scale(1); }
        }
        .animate-fade-up { animation: fadeInUp 0.8s ease-out forwards; }
        .animate-ken-burns { animation: kenBurns 10s ease-out infinite alternate; }
        .delay-1 { animation-delay: 0.2s; }
        .delay-2 { animation-delay: 0.4s; }
        .delay-3 { animation-delay: 0.6s; }
      `}</style>

      {/* --- SECTION HERO : TEXTE IMPOSANT & CENTRÉ --- */}
      <section className="relative min-h-[85vh] md:h-screen w-full flex items-center justify-center bg-[#1a1a1a] overflow-hidden pt-24">
        {/* Image de fond avec effet Ken Burns */}
        <div className="absolute inset-0 z-0">
          <img 
            src={siteConfig.theme.heroImage} 
            className="w-full h-full object-cover object-center animate-ken-burns" 
            alt="Background Hero" 
          />
          <div className="absolute inset-0 bg-black/60"></div>
        </div>

        {/* Contenu textuel CENTRÉ et IMPOSANT */}
        <div className="relative z-10 w-full max-w-[95%] mx-auto px-4 text-center">
          <div className="max-w-6xl mx-auto">
            <span style={{ color: primaryColor }} className="animate-fade-up font-bold text-[10px] md:text-[14px] uppercase tracking-[0.4em] md:tracking-[0.6em] mb-8 block ">
              Prestige & Performance
            </span>
            
            {/* Titre réajusté pour mobile (text-3xl à md:text-[120px]) */}
            <h1 translate="no" className="animate-fade-up delay-1 text-4xl sm:text-6xl md:text-[120px] font-black text-white uppercase leading-tight md:leading-none mb-10 tracking-tighter break-words overflow-hidden">
              {siteConfig.name.split(' ')[0]} <span className="text-slate-400">{siteConfig.name.split(' ').slice(1).join(' ')}</span>
            </h1>

            <p className="animate-fade-up delay-2 text-slate-200 text-sm md:text-2xl mb-14 font-light max-w-3xl mx-auto leading-relaxed tracking-wide px-2">
              {siteConfig.tagline}. <br className="hidden md:block" /> 
              L'expertise internationale pour votre mobilité d'exception.
            </p>

            <div className="animate-fade-up delay-3">
              <Link to="/Catalogue" style={{ backgroundColor: primaryColor }} className="inline-block text-white px-10 md:px-20 py-5 md:py-6 rounded-full font-bold uppercase text-[10px] md:text-[12px] tracking-[0.2em] shadow-2xl hover:scale-105 transition-transform">
                Explorer le stock
              </Link>
            </div>
          </div>
        </div>

        {/* Indicateur de Scroll */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-10 animate-bounce hidden md:block">
          <div className="w-[1px] h-12 bg-gradient-to-b from-white to-transparent"></div>
        </div>
      </section>

      {/* --- SECTION EXPERTISES --- */}
      <section id="expertises" className="py-16 md:py-24 px-4 md:px-6 bg-white relative z-20">
        <div className="max-w-4xl mx-auto text-center mb-16">
          <span style={{ color: primaryColor }} className="font-bold text-[10px] md:text-[11px] uppercase tracking-[0.3em] md:tracking-[0.5em] mb-4 block animate-fade-up">Notre Savoir-Faire</span>
          <h2 className="text-3xl md:text-6xl font-black text-slate-900 uppercase leading-none tracking-tighter">
            Une Expertise <br className="md:hidden" /> <span className="text-slate-300 italic">Multisectorielle</span>
          </h2>
          <div className="w-20 md:w-24 h-1.5 mx-auto mt-8" style={{ backgroundColor: primaryColor }}></div>
        </div>

        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-6 md:gap-8">
          <div className="md:col-span-7 group relative h-[350px] md:h-[500px] overflow-hidden rounded-[2rem] bg-slate-900 shadow-xl">
            <img src="/images/back.jpg" className="absolute inset-0 w-full h-full object-cover opacity-80 group-hover:scale-110 group-hover:opacity-100 transition-all duration-1000 ease-in-out" alt="Luxe" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/10 to-transparent"></div>
            <div className="absolute bottom-10 left-6 md:left-10 right-6 md:right-10">
              <h3 className="text-2xl md:text-3xl font-black text-white uppercase mb-2 tracking-tighter">Véhicules premium</h3>
              <p className="text-slate-300 text-xs md:text-sm max-w-sm md:opacity-0 md:group-hover:opacity-100 transform translate-y-4 md:group-hover:translate-y-0 transition-all duration-500 ease-out">
                Berlines de prestige et SUV premium importés pour une expérience de conduite inégalée.
              </p>
            </div>
          </div>

          <div className="md:col-span-5 group relative h-[350px] md:h-[500px] overflow-hidden rounded-[2rem] bg-slate-900 shadow-xl">
            <img src="/images/camion.jpg" className="absolute inset-0 w-full h-full object-cover opacity-75 group-hover:scale-110 group-hover:opacity-100 transition-all duration-1000 ease-in-out" alt="Poids Lourds" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/10 to-transparent"></div>
            <div className="absolute bottom-10 left-6 md:left-10 right-6 md:right-10">
              <h3 className="text-2xl md:text-3xl font-black text-white uppercase mb-2 tracking-tighter">Camions</h3>
              <p className="text-slate-300 text-xs md:text-sm md:opacity-0 md:group-hover:opacity-100 transform translate-y-4 md:group-hover:translate-y-0 transition-all duration-500 ease-out">
                Solutions logistiques robustes adaptés aux exigences des professionnels.
              </p>
            </div>
          </div>

          <div className="md:col-span-12 group relative h-[400px] md:h-[450px] overflow-hidden rounded-[2rem] bg-slate-900 shadow-xl">
            <img src="/images/tracteur.jpg" className="absolute inset-0 w-full h-full object-cover opacity-75 group-hover:scale-105 group-hover:opacity-100 transition-all duration-1000 ease-in-out" alt="Tracteurs Agricoles" />
            <div className="absolute inset-0 bg-gradient-to-t md:bg-gradient-to-r from-black/90 via-black/20 to-transparent"></div>
            <div className="absolute inset-y-0 left-6 md:left-12 flex flex-col justify-center right-6 md:right-auto">
              <span className="text-white/60 text-[9px] md:text-[10px] uppercase tracking-[0.4em] mb-4">Secteur Primaire</span>
              <h3 className="text-3xl md:text-5xl font-black text-white uppercase mb-4 tracking-tighter">
                Tracteurs & <br /> <span style={{ color: primaryColor }}>Machines Agricoles</span>
              </h3>
              <div className="md:opacity-0 md:group-hover:opacity-100 transform translate-y-4 md:group-hover:translate-y-0 transition-all duration-500 ease-out">
                  <p className="text-slate-300 text-xs md:text-sm max-w-md mb-8">
                    Équipements de pointe pour optimiser vos rendements.
                  </p>
                  <Link to="/Catalogue" className="flex items-center gap-4 text-white text-[10px] md:text-[11px] font-bold uppercase tracking-widest hover:translate-x-3 transition-transform">
                    Voir le catalogue agricole <span className="text-xl md:text-2xl" style={{ color: primaryColor }}>→</span>
                  </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* --- SECTION POURQUOI NOUS CHOISIR --- */}
      <section id="propos" className="py-20 md:py-28 bg-[#1a2b48] text-white overflow-hidden relative">
        <div className="absolute top-0 left-0 w-[300px] md:w-[500px] h-[300px] md:h-[500px] blur-[100px] md:blur-[150px] rounded-full opacity-40" style={{ backgroundColor: primaryColor }}></div>
        <div className="max-w-7xl mx-auto px-4 md:px-6 text-center lg:text-left">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 md:gap-20 items-center">
            <div className="relative group">
              <div className="relative z-10 overflow-hidden rounded-[2rem] md:rounded-[3rem] border border-white/10 shadow-2xl">
                <img src="/images/cool.jpg" className="w-full h-[400px] md:h-[600px] object-cover transition-transform duration-[2s] group-hover:scale-110" alt="Kairos group Prestige" />
                <div className="absolute top-6 right-6 md:top-10 md:right-10 bg-white/10 backdrop-blur-xl border border-white/20 p-4 md:p-6 rounded-2xl md:rounded-3xl text-center">
                  <p className="text-2xl md:text-4xl font-black italic mb-0" style={{ color: primaryColor }}>Parc</p>
                  <p className="text-[8px] md:text-[10px] uppercase tracking-widest font-bold">Premium</p>
                </div>
              </div>
              <div className="absolute -bottom-6 -left-6 w-full h-full border-2 border-dashed border-white/10 rounded-[2rem] md:rounded-[3rem] -z-10 transition-transform group-hover:-translate-x-2 group-hover:translate-y-2"></div>
            </div>
            <div className="space-y-10 md:space-y-12">
              <div className="space-y-4">
                <span style={{ color: primaryColor }} className="font-bold text-[10px] md:text-[11px] uppercase tracking-[0.3em] md:tracking-[0.5em] block">Nos Atouts Majeurs</span>
                <h2 className="text-4xl md:text-6xl font-black uppercase leading-tight tracking-tighter">
                  L'Excellence <br /> <span className="text-slate-500 italic">sans compromis.</span>
                </h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
                <div className="group space-y-4 p-6 rounded-3xl transition-colors hover:bg-white/5 border border-white/5 md:border-transparent md:hover:border-white/10 text-left">
                  <div className="w-10 h-10 md:w-12 md:h-12 rounded-2xl flex items-center justify-center border border-white/20 group-hover:bg-white group-hover:text-black transition-all duration-500">
                     <span className="text-lg md:text-xl font-bold">01</span>
                  </div>
                  <h4 className="text-md md:text-lg font-bold uppercase tracking-tight">Importation Directe</h4>
                  <p className="text-slate-400 text-xs md:text-sm leading-relaxed">Nous maîtrisons toute la chaîne logistique, CANADA-LOME / ALLEMAGNE-LOME.</p>
                </div>
                <div className="group space-y-4 p-6 rounded-3xl transition-colors hover:bg-white/5 border border-white/5 md:border-transparent md:hover:border-white/10 text-left">
                  <div className="w-10 h-10 md:w-12 md:h-12 rounded-2xl flex items-center justify-center border border-white/20 group-hover:bg-white group-hover:text-black transition-all duration-500">
                     <span className="text-lg md:text-xl font-bold">02</span>
                  </div>
                  <h4 className="text-md md:text-lg font-bold uppercase tracking-tight">Qualité Certifiée</h4>
                  <p className="text-slate-400 text-xs md:text-sm leading-relaxed">Chaque véhicule passe par un contrôle technique rigoureux avant livraison.</p>
                </div>
                <div className="group space-y-4 p-6 rounded-3xl transition-colors hover:bg-white/5 border border-white/5 md:border-transparent md:hover:border-white/10 text-left">
                  <div className="w-10 h-10 md:w-12 md:h-12 rounded-2xl flex items-center justify-center border border-white/20 group-hover:bg-white group-hover:text-black transition-all duration-500">
                     <span className="text-lg md:text-xl font-bold">03</span>
                  </div>
                  <h4 className="text-md md:text-lg font-bold uppercase tracking-tight">Zéro Surprise</h4>
                  <p className="text-slate-400 text-xs md:text-sm leading-relaxed">Historique complet et traçabilité totale : vous savez exactement ce que vous achetez, sans zone d'ombre.</p>
                </div>
                <div className="group space-y-4 p-6 rounded-3xl transition-colors hover:bg-white/5 border border-white/5 md:border-transparent md:hover:border-white/10 text-left">
                  <div className="w-10 h-10 md:w-12 md:h-12 rounded-2xl flex items-center justify-center border border-white/20 group-hover:bg-white group-hover:text-black transition-all duration-500">
                     <span className="text-lg md:text-xl font-bold">04</span>
                  </div>
                  <h4 className="text-md md:text-lg font-bold uppercase tracking-tight">Service Clé en Main</h4>
                  <p className="text-slate-400 text-xs md:text-sm leading-relaxed">On s'occupe de tout ! Du conseil d'expert aux démarches administratives, repartez l'esprit léger.</p>
                </div>
              
              </div>
            </div>
          </div>
        </div>
      </section>
{/* --- NOUVELLE SECTION : NOTRE PROCESSUS & STRATÉGIE --- */}
<section id="processus" className="py-16 md:py-28 bg-slate-50 relative overflow-hidden">
  <div className="max-w-7xl mx-auto px-4 md:px-6">
    <div className="text-center max-w-3xl mx-auto mb-16 md:mb-20">
      <span style={{ color: primaryColor }} className="font-bold text-[10px] md:text-[11px] uppercase tracking-[0.3em] md:tracking-[0.5em] mb-4 block">De l'Occident à l'Afrique</span>
      <h2 className="text-3xl md:text-6xl font-black text-slate-900 uppercase leading-none tracking-tighter">
        Une Logistique <br /> <span className="text-slate-300 italic">Transcontinentale</span>
      </h2>
      <p className="mt-6 md:mt-8 text-slate-600 font-medium text-sm md:text-base">
        Chez <span className="text-slate-900 font-bold">{siteConfig.name}</span>, nous connectons les marchés. Que vous soyez pressé ou en quête d'une configuration rare, nous avons la solution.
      </p>
    </div>

    {/* BLOC DES DEUX OPTIONS STRATÉGIQUES */}
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-20">
      {/* Option 1: Stock Local */}
      <div className="bg-white p-8 md:p-12 rounded-[2.5rem] shadow-xl border-t-4 relative overflow-hidden group" style={{ borderTopColor: primaryColor }}>
        <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:rotate-12 transition-transform duration-500">
          <span className="text-8xl">📍</span>
        </div>
        <h3 className="text-2xl md:text-3xl font-black text-slate-900 uppercase mb-4 tracking-tighter italic">Disponibilité Immédiate</h3>
        <p className="text-slate-500 text-sm md:text-base leading-relaxed mb-6">
          Une sélection de véhicules est déjà <strong>dédouanée et disponible sur le territoire togolais</strong>. Idéal pour ceux qui souhaitent inspecter, tester et repartir avec leur voiture le jour même.
        </p>
        <div className="flex items-center gap-3 text-slate-900 font-black text-[10px] uppercase tracking-widest">
           <span className="w-8 h-[2px]" style={{ backgroundColor: primaryColor }}></span> Stock Togo
        </div>
      </div>

      {/* Option 2: Importation */}
      <div className="bg-slate-900 p-8 md:p-12 rounded-[2.5rem] shadow-xl border-t-4 relative overflow-hidden group" style={{ borderTopColor: primaryColor }}>
        <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:-rotate-12 transition-transform duration-500">
          <span className="text-8xl">🚢</span>
        </div>
        <h3 className="text-2xl md:text-3xl font-black text-white uppercase mb-4 tracking-tighter italic">Importation Sur-Mesure</h3>
        <p className="text-slate-400 text-sm md:text-base leading-relaxed mb-6">
          Accédez aux enchères et parcs exclusifs au <strong>Canada et en Allemagne</strong>. Économisez sur le prix d'achat et obtenez des options haut de gamme introuvables localement, livrées en 45 jours.
        </p>
        <div className="flex items-center gap-3 text-white font-black text-[10px] uppercase tracking-widest">
           <span className="w-8 h-[2px]" style={{ backgroundColor: primaryColor }}></span> Direct Occident
        </div>
      </div>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-12 opacity-80 scale-95">
      {/* Étape 1 */}
      <div className="relative p-8 md:p-10 bg-white rounded-[2rem] md:rounded-[2.5rem] shadow-sm border border-slate-100 group transition-all duration-500">
        <div className="absolute -top-5 md:-top-6 left-8 md:left-10 w-12 h-12 md:w-14 md:h-14 rounded-2xl flex items-center justify-center text-white font-black text-lg md:text-xl shadow-lg" style={{ backgroundColor: primaryColor }}>01</div>
        <h3 className="text-lg md:text-xl font-black text-slate-900 uppercase mb-4 mt-4 tracking-tight">Sourcing Expert</h3>
        <p className="text-slate-500 text-xs md:text-sm leading-relaxed">
          Nos équipes au <strong>Canada</strong> et en <strong>Allemagne</strong> sélectionnent rigoureusement les meilleurs véhicules. Vous achetez à la source, au prix réel.
        </p>
      </div>

      {/* Étape 2 */}
      <div className="relative p-8 md:p-10 bg-white rounded-[2rem] md:rounded-[2.5rem] shadow-sm border border-slate-100 group transition-all duration-500">
        <div className="absolute -top-5 md:-top-6 left-8 md:left-10 w-12 h-12 md:w-14 md:h-14 rounded-2xl flex items-center justify-center text-white font-black text-lg md:text-xl shadow-lg" style={{ backgroundColor: primaryColor }}>02</div>
        <h3 className="text-lg md:text-xl font-black text-slate-900 uppercase mb-4 mt-4 tracking-tight">Prix "Tout Inclus"</h3>
        <p className="text-slate-500 text-xs md:text-sm leading-relaxed">
          Aucune surprise. Le prix affiché couvre : <strong>l'achat, les formalités export et le transport sécurisé</strong> jusqu'au Port de Lomé.
        </p>
      </div>

      {/* Étape 3 */}
      <div className="relative p-8 md:p-10 bg-white rounded-[2rem] md:rounded-[2.5rem] shadow-sm border border-slate-100 group transition-all duration-500">
        <div className="absolute -top-5 md:-top-6 left-8 md:left-10 w-12 h-12 md:w-14 md:h-14 rounded-2xl flex items-center justify-center text-white font-black text-lg md:text-xl shadow-lg" style={{ backgroundColor: primaryColor }}>03</div>
        <h3 className="text-lg md:text-xl font-black text-slate-900 uppercase mb-4 mt-4 tracking-tight">Livraison Garantie</h3>
        <p className="text-slate-500 text-xs md:text-sm leading-relaxed">
          Livraison au Port de Lomé sous <strong>45 jours maximum</strong>. Notre représentation locale au Togo assure le suivi final.
        </p>
      </div>
    </div>

    {/* Bannière de réassurance rapide */}
    <div className="mt-12 md:mt-20 p-6 md:p-8 rounded-[1.5rem] md:rounded-[2rem] bg-slate-900 text-white flex flex-col md:flex-row items-center justify-between gap-6 md:gap-8">
      <div className="flex items-center gap-4 md:gap-6">
        <div className="w-12 h-12 md:w-16 md:h-16 rounded-full border-2 border-dashed border-white/20 flex items-center justify-center shrink-0">
          <span style={{ color: primaryColor }} className="text-xl md:text-2xl">⚓</span>
        </div>
        <div>
          <h4 className="text-sm md:text-lg font-bold uppercase tracking-tight">Quel que soit votre choix, nous sécurisons l'achat.</h4>
          <p className="text-slate-400 text-[8px] md:text-xs uppercase tracking-widest italic"><span translate='no'>Kairos Group</span> : La confiance à chaque kilomètre</p>
        </div>
      </div>
      <Link to="/Catalogue" style={{ backgroundColor: primaryColor }} className="w-full md:w-auto text-center px-8 md:px-10 py-4 rounded-full font-bold uppercase text-[10px] tracking-widest hover:opacity-90 transition-opacity">
        Découvrir le catalogue complet
      </Link>
    </div>
  </div>
</section>

      {/* --- NOUVEAUTÉS --- */}
      <section className="py-16 md:py-24 bg-white px-4 md:px-6">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-black text-slate-900 uppercase mb-12 md:mb-16 italic text-center">Dernières <span style={{ color: primaryColor }}>Opportunités</span></h2>
          <div translate="no" className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 md:gap-10">
            {recentVehicles.length > 0 ? (
              recentVehicles.map((car) => <Card key={car._id} car={car} />)
            ) : (
              <p className="col-span-full text-center text-slate-400 uppercase tracking-widest text-[10px] md:text-xs">Mise à jour du parc...</p>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;