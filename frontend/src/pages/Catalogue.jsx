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

  const [filters, setFilters] = useState({
    marque: '',
    type: '',
    prixMax: '',
    annee: ''
  });

  useEffect(() => {
    const fetchCars = async () => {
      try {
        const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/cars`);
        setVehicles(res.data);
        setFilteredVehicles(res.data);
      } catch (err) {
        console.error("Erreur chargement catalogue:", err);
      }
    };
    fetchCars();
  }, []);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const applyFilters = useCallback((e) => {
    if (e) e.preventDefault();
    let result = vehicles;

    if (filters.marque) {
      result = result.filter(v => v.marque.toLowerCase().includes(filters.marque.toLowerCase()));
    }
    if (filters.type) {
      result = result.filter(v => v.type === filters.type);
    }
    if (filters.prixMax) {
      result = result.filter(v => v.prix <= parseInt(filters.prixMax));
    }
    if (filters.annee) {
      result = result.filter(v => v.annee === parseInt(filters.annee));
    }

    setFilteredVehicles(result);
    setCurrentPage(1);
    setIsFilterVisible(false);
  }, [filters, vehicles]);

  const indexOfLastVehicle = currentPage * vehiclesPerPage;
  const indexOfFirstVehicle = indexOfLastVehicle - vehiclesPerPage;
  const currentVehicles = useMemo(() => 
    filteredVehicles.slice(indexOfFirstVehicle, indexOfLastVehicle),
    [filteredVehicles, indexOfFirstVehicle, indexOfLastVehicle]
  );

  const totalPages = Math.ceil(filteredVehicles.length / vehiclesPerPage);

  return (
    <div className={`min-h-screen bg-white font-['Poppins'] transition-opacity duration-700 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}>
      
      {/* --- HEADER CATALOGUE --- */}
      <section className="bg-slate-950 pt-32 pb-16 md:pt-40 md:pb-24 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[300px] md:w-[600px] h-[300px] md:h-[600px] bg-white/5 rounded-full blur-[120px] -mr-32 -mt-32"></div>
        <div className="max-w-7xl mx-auto px-4 md:px-6 relative z-10 text-center md:text-left">
          <span style={{ color: primaryColor }} className="text-[10px] md:text-[11px] font-black uppercase tracking-[0.4em] md:tracking-[0.6em] mb-4 block">
            Stock Disponible
          </span>
          <h1 className="text-4xl md:text-8xl font-black text-white uppercase italic leading-none tracking-tighter">
            Le <span style={{ color: primaryColor }}>Catalogue</span>
          </h1>
          <p className="text-slate-500 text-[10px] md:text-xs font-bold uppercase mt-6 tracking-[0.3em]">
            {filteredVehicles.length} Véhicules d'exception trouvés
          </p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 md:px-6">
        {/* --- BARRE DE FILTRES --- */}
        <div className="relative -mt-8 md:-mt-12 mb-16 md:mb-20 z-30">
          <div className="bg-white shadow-[0_20px_60px_rgba(0,0,0,0.1)] rounded-[2rem] md:rounded-[3rem] p-4 md:p-8 border border-slate-50">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-6 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 no-scrollbar">
                {['Tous', 'SUV', 'Berline', 'Sport', 'Camion', 'Agricole'].map((type) => (
                  <button
                    key={type}
                    onClick={() => {
                        const newType = type === 'Tous' ? '' : type;
                        setFilters(prev => ({ ...prev, type: newType }));
                        // Application immédiate pour les onglets
                        let res = vehicles;
                        if (newType) res = res.filter(v => v.type === newType);
                        setFilteredVehicles(res);
                        setCurrentPage(1);
                    }}
                    className={`text-[10px] md:text-[11px] font-black uppercase tracking-widest whitespace-nowrap transition-all ${
                      (filters.type === type || (type === 'Tous' && !filters.type)) 
                      ? 'text-slate-900 border-b-2' 
                      : 'text-slate-400 hover:text-slate-600'
                    }`}
                    style={{ borderColor: (filters.type === type || (type === 'Tous' && !filters.type)) ? primaryColor : 'transparent' }}
                  >
                    {type}
                  </button>
                ))}
              </div>

              <button 
                onClick={() => setIsFilterVisible(!isFilterVisible)}
                className="w-full md:w-auto flex items-center justify-center gap-4 bg-slate-900 text-white px-8 py-4 md:py-5 rounded-2xl md:rounded-3xl hover:scale-105 transition-all shadow-xl active:scale-95"
              >
                <span className="text-[10px] font-black uppercase tracking-widest">Recherche Avancée</span>
                <svg className={`w-4 h-4 transition-transform duration-500 ${isFilterVisible ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M19 9l-7 7-7-7" />
                </svg>
              </button>
            </div>

            {/* PANEL DE FILTRES DÉROULANT */}
            <form 
              onSubmit={applyFilters}
              className={`overflow-hidden transition-all duration-700 ease-in-out ${isFilterVisible ? 'max-h-[600px] mt-8 md:mt-12 opacity-100' : 'max-h-0 opacity-0'}`}
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 pt-6 border-t border-slate-100">
                <div className="space-y-2">
                  <label className="text-[9px] font-black uppercase text-slate-400 ml-4 tracking-widest">Marque / Modèle</label>
                  <input 
                    type="text" 
                    name="marque"
                    value={filters.marque}
                    onChange={handleFilterChange}
                    placeholder="Ex: Mercedes..." 
                    className="w-full bg-slate-50 border-none rounded-2xl px-6 py-4 outline-none focus:ring-2 transition-all text-xs font-bold"
                    style={{ '--tw-ring-color': primaryColor }}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[9px] font-black uppercase text-slate-400 ml-4 tracking-widest">Prix Max</label>
                  <input 
                    type="number" 
                    name="prixMax"
                    value={filters.prixMax}
                    onChange={handleFilterChange}
                    placeholder="Budget max..." 
                    className="w-full bg-slate-50 border-none rounded-2xl px-6 py-4 outline-none focus:ring-2 transition-all text-xs font-bold"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[9px] font-black uppercase text-slate-400 ml-4 tracking-widest">Année</label>
                  <select 
                    name="annee"
                    value={filters.annee}
                    onChange={handleFilterChange}
                    className="w-full bg-slate-50 border-none rounded-2xl px-6 py-4 outline-none focus:ring-2 transition-all text-xs font-bold appearance-none"
                  >
                    <option value="">Toutes les années</option>
                    {[...Array(25)].map((_, i) => (
                      <option key={i} value={2025 - i}>{2025 - i}</option>
                    ))}
                  </select>
                </div>
                <div className="flex items-end">
                  <button 
                    type="submit"
                    style={{ backgroundColor: primaryColor }}
                    className="w-full text-white py-4 md:py-5 rounded-2xl font-black uppercase text-[10px] md:text-[11px] tracking-[0.2em] shadow-xl hover:brightness-110 active:scale-95 transition-all"
                  >
                    Rechercher
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>

        {/* --- GRILLE DE RÉSULTATS --- */}
        <div className="pb-20 md:pb-32 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 md:gap-x-10 gap-y-12 md:gap-y-16">
          {currentVehicles.map((car) => (
            <MemoizedCard key={car._id} car={car} />
          ))}
        </div>

        {/* PAGINATION */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center pb-20 md:pb-24 gap-3 md:gap-4">
            {[...Array(totalPages)].map((_, i) => (
              <button
                key={i}
                onClick={() => { setCurrentPage(i + 1); window.scrollTo({top: 450, behavior: 'smooth'}); }}
                style={{ 
                    backgroundColor: currentPage === i + 1 ? primaryColor : 'white',
                    color: currentPage === i + 1 ? 'white' : '#1e293b'
                }}
                className={`w-10 h-10 md:w-12 md:h-12 rounded-xl font-black shadow-md border border-slate-100 transition-all text-xs md:text-sm ${
                  currentPage !== i + 1 ? 'hover:bg-slate-50' : ''
                }`}
              >
                {i + 1}
              </button>
            ))}
          </div>
        )}

        {filteredVehicles.length === 0 && (
          <div className="py-24 md:py-40 text-center">
            <span className="text-4xl md:text-6xl block mb-8">🔍</span>
            <h3 className="text-xl md:text-2xl font-black uppercase italic text-slate-900 tracking-tighter">Aucun résultat trouvé</h3>
            <p className="text-slate-400 text-[10px] md:text-xs font-bold uppercase mt-4 tracking-widest">Essayez d'élargir vos critères de recherche</p>
            <button 
              onClick={() => { setFilters({ marque: '', type: '', prixMax: '', annee: '' }); setFilteredVehicles(vehicles); }}
              className="mt-10 text-[10px] font-black uppercase tracking-[0.3em] border-b-2 pb-2"
              style={{ borderColor: primaryColor }}
            >
              Réinitialiser
            </button>
          </div>
        )}
      </div>

      <style>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>

    </div>
  );
};

export default Catalog;