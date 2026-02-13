import React, { useState, useEffect, useMemo, useCallback } from 'react';
import axios from 'axios';
import { useLocation } from 'react-router-dom';
import Card from '../components/Card';
import { siteConfig } from '../config/siteConfig';

const MemoizedCard = React.memo(Card);

const Catalog = () => {
  const [vehicles, setVehicles] = useState([]);
  const [filteredVehicles, setFilteredVehicles] = useState([]);
  const [isFilterVisible, setIsFilterVisible] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const { pathname } = useLocation();
  
  // --- AJOUT 1 : RÉCUPÉRATION DE LA PAGE AU CHARGEMENT ---
  const [currentPage, setCurrentPage] = useState(() => {
    const savedPage = sessionStorage.getItem('catalogue_page');
    return savedPage ? parseInt(savedPage) : 1;
  });

  const vehiclesPerPage = 6; 
  const primaryColor = siteConfig.theme.primaryColor;

  useEffect(() => {
    window.scrollTo(0, 0);
    const timer = setTimeout(() => setIsLoaded(true), 100);
    return () => clearTimeout(timer);
  }, [pathname]);

  // --- AJOUT 2 : SAUVEGARDE DE LA PAGE DÈS QU'ELLE CHANGE ---
  useEffect(() => {
    sessionStorage.setItem('catalogue_page', currentPage);
  }, [currentPage]);

  const [tempFilters, setTempFilters] = useState({
    categorie: 'Tous',
    marque: 'Tous',
    modele: 'Tous',
    prixMax: '',
    kmMax: '',
    anneeMin: '',
    motorisation: 'Tous'
  });

  useEffect(() => {
    const fetchVehicles = async () => {
      try {
        const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/cars`);
        setVehicles(res.data);
        setFilteredVehicles(res.data);
      } catch (err) {
        console.error("Erreur chargement catalogue:", err);
      }
    };
    fetchVehicles();
  }, []);

  const categoriesDispo = useMemo(() => ['Tous', ...new Set(vehicles.map(v => v.categorie))], [vehicles]);
  const marquesDispo = useMemo(() => ['Tous', ...new Set(vehicles.filter(v => tempFilters.categorie === 'Tous' || v.categorie === tempFilters.categorie).map(v => v.marque))], [vehicles, tempFilters.categorie]);
  const modelesDispo = useMemo(() => ['Tous', ...new Set(vehicles.filter(v => (tempFilters.categorie === 'Tous' || v.categorie === tempFilters.categorie) && (tempFilters.marque === 'Tous' || v.marque === tempFilters.marque)).map(v => v.modele))], [vehicles, tempFilters.categorie, tempFilters.marque]);

  const handleSearch = useCallback((e) => {
    if (e) e.preventDefault();
    setCurrentPage(1);
    const results = vehicles.filter((v) => {
      const matchCat = tempFilters.categorie === 'Tous' || v.categorie === tempFilters.categorie;
      const matchMarque = tempFilters.marque === 'Tous' || v.marque === tempFilters.marque;
      const matchModele = tempFilters.modele === 'Tous' || v.modele === tempFilters.modele;
      const matchPrix = tempFilters.prixMax === '' || Number(v.prix) <= Number(tempFilters.prixMax);
      const matchKm = tempFilters.kmMax === '' || Number(v.valeurCompteur) <= Number(tempFilters.kmMax);
      const matchAnnee = tempFilters.anneeMin === '' || Number(v.annee) >= Number(tempFilters.anneeMin);
      const matchMotor = tempFilters.motorisation === 'Tous' || v.motorisation === tempFilters.motorisation;
      return matchCat && matchMarque && matchModele && matchPrix && matchKm && matchAnnee && matchMotor;
    });
    setFilteredVehicles(results);
    setIsFilterVisible(false);
  }, [tempFilters, vehicles]);

  const currentVehicles = useMemo(() => {
    const last = currentPage * vehiclesPerPage;
    return filteredVehicles.slice(last - vehiclesPerPage, last);
  }, [currentPage, filteredVehicles]);

  const totalPages = Math.ceil(filteredVehicles.length / vehiclesPerPage);

  const resetFilters = () => {
    setTempFilters({
      categorie: 'Tous',
      marque: 'Tous',
      modele: 'Tous',
      prixMax: '',
      kmMax: '',
      anneeMin: '',
      motorisation: 'Tous'
    });
    setFilteredVehicles(vehicles);
    setCurrentPage(1);
    // --- AJOUT 3 : RÉINITIALISATION MÉMOIRE AU RESET ---
    sessionStorage.removeItem('catalogue_page');
  };

  return (
    <div className={`min-h-screen bg-[#f8fafc] font-['Poppins'] transition-opacity duration-700 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}>
      
      {/* --- HEADER --- */}
      <section className="relative h-[65vh] w-full flex items-center justify-center overflow-hidden bg-black">
        <div className="absolute inset-0">
          <img 
            src="/images/parc2.jpg" 
            className="w-full h-full object-cover scale-110 animate-[kenburns_20s_ease_infinite_alternate] opacity-50"
            alt="Showroom"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent to-black/70"></div>
        </div>
        
        <div className="relative z-10 text-center px-6">
          <div className="inline-block px-5 py-1.5 border border-white/20 backdrop-blur-md rounded-full mb-8">
            <span style={{ color: primaryColor }} className="font-bold text-[10px] uppercase tracking-[0.5em] italic">
              Parc Auto {siteConfig.name}
            </span>
          </div>
          <h1 className="relative">
            <span className="absolute -top-16 left-1/2 -translate-x-1/2 text-[100px] md:text-[180px] font-black uppercase text-white/5 select-none leading-none tracking-tighter">
              {siteConfig.name.split(' ')[0]}
            </span>
            <div className="flex flex-col items-center">
              <span className="text-5xl md:text-8xl font-black text-white uppercase italic leading-none tracking-tighter">
                Catalogue <br /> 
                <span style={{ color: primaryColor }}>Exclusif</span>
              </span>
            </div>
          </h1>
        </div>

        <style>{`
          @keyframes kenburns {
            from { transform: scale(1); }
            to { transform: scale(1.15); }
          }
        `}</style>
      </section>

      {/* --- CONTENU --- */}
      <div className="max-w-7xl mx-auto px-6 -mt-24 relative z-[60]">
        
        {/* --- BARRE DE FILTRES --- */}
        <div className="bg-white/90 backdrop-blur-2xl rounded-[2.5rem] shadow-[0_25px_60px_rgba(0,0,0,0.18)] border border-white/20 p-6 mb-16">
          <div className="flex flex-wrap items-center justify-between gap-6">
            <div className="flex items-center gap-5">
              <div style={{ backgroundColor: primaryColor }} className="w-14 h-14 rounded-2xl flex flex-col items-center justify-center text-white shadow-xl rotate-3">
                <span className="text-xl font-black leading-none">{filteredVehicles.length}</span>
                <span className="text-[8px] uppercase font-bold">Unités</span>
              </div>
              <div className="hidden sm:block">
                <p className="text-[10px] uppercase tracking-widest font-bold text-slate-400">Parc Automobile</p>
                <p className="text-sm font-black text-slate-900 uppercase tracking-tight">Disponibilité Immédiate</p>
              </div>
            </div>

            <button 
              onClick={() => setIsFilterVisible(!isFilterVisible)}
              className="flex items-center gap-4 px-10 py-5 bg-slate-900 text-white rounded-full hover:scale-105 transition-all shadow-2xl active:scale-95 group"
            >
              <span className="text-[11px] font-black uppercase tracking-widest">
                {isFilterVisible ? "Masquer les critères" : "Affiner la recherche"}
              </span>
              <div className={`w-2.5 h-2.5 rounded-full transition-all duration-500 ${isFilterVisible ? 'bg-red-500 scale-125' : 'bg-white animate-pulse'}`}></div>
            </button>
          </div>

          <div className={`overflow-hidden transition-all duration-700 ease-in-out ${isFilterVisible ? 'max-h-[1500px] mt-10 opacity-100' : 'max-h-0 opacity-0'}`}>
            <form onSubmit={handleSearch} className="grid grid-cols-1 md:grid-cols-4 gap-x-10 gap-y-8 pt-10 border-t border-slate-100">
              
              <div className="flex flex-col gap-3">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Catégorie</label>
                <select 
                  className="bg-transparent border-b-2 border-slate-100 focus:border-slate-900 px-1 py-3 text-sm font-bold outline-none appearance-none cursor-pointer"
                  value={tempFilters.categorie}
                  onChange={(e) => setTempFilters({...tempFilters, categorie: e.target.value, marque: 'Tous', modele: 'Tous'})}
                >
                  {categoriesDispo.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                </select>
              </div>

              <div className="flex flex-col gap-3">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Marque</label>
                <select 
                  className="bg-transparent border-b-2 border-slate-100 focus:border-slate-900 px-1 py-3 text-sm font-bold outline-none appearance-none cursor-pointer"
                  value={tempFilters.marque}
                  onChange={(e) => setTempFilters({...tempFilters, marque: e.target.value, modele: 'Tous'})}
                >
                  {marquesDispo.map(m => <option key={m} value={m}>{m}</option>)}
                </select>
              </div>

              <div className="flex flex-col gap-3">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Modèle</label>
                <select 
                  className="bg-transparent border-b-2 border-slate-100 focus:border-slate-900 px-1 py-3 text-sm font-bold outline-none appearance-none cursor-pointer"
                  value={tempFilters.modele}
                  onChange={(e) => setTempFilters({...tempFilters, modele: e.target.value})}
                >
                  {modelesDispo.map(mod => <option key={mod} value={mod}>{mod}</option>)}
                </select>
              </div>

              <div className="flex flex-col gap-3">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Budget Max</label>
                <input 
                  type="number" 
                  placeholder="Ex: 50000"
                  className="bg-transparent border-b-2 border-slate-100 focus:border-slate-900 px-1 py-3 text-sm font-bold outline-none"
                  value={tempFilters.prixMax}
                  onChange={(e) => setTempFilters({...tempFilters, prixMax: e.target.value})}
                />
              </div>

              <div className="flex items-end gap-4">
                <button 
                  type="button"
                  onClick={resetFilters}
                  className="px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-slate-400 hover:text-red-500 transition-colors"
                >
                  Vider
                </button>
                <button 
                  type="submit"
                  style={{ backgroundColor: primaryColor }}
                  className="flex-1 text-white py-4 rounded-2xl font-black uppercase text-[11px] tracking-[0.2em] shadow-xl hover:brightness-110 active:scale-95 transition-all"
                >
                  Rechercher
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* --- GRILLE DE RÉSULTATS --- */}
        <div className="pb-32 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-10 gap-y-16">
          {currentVehicles.map((car) => (
            <MemoizedCard key={car._id} car={car} />
          ))}
        </div>

        {/* PAGINATION */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center pb-24 gap-4">
            {[...Array(totalPages)].map((_, i) => (
              <button
                key={i}
                onClick={() => { setCurrentPage(i + 1); window.scrollTo({top: 450, behavior: 'smooth'}); }}
                style={{ 
                    backgroundColor: currentPage === i + 1 ? primaryColor : 'white',
                    color: currentPage === i + 1 ? 'white' : '#1e293b'
                }}
                className={`w-12 h-12 rounded-xl font-black shadow-md border border-slate-100 transition-all ${currentPage !== i + 1 && 'hover:bg-slate-50'}`}
              >
                {i + 1}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Catalog;