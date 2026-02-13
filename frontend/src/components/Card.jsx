import React from 'react';
import { useNavigate } from 'react-router-dom';

const Card = ({ car }) => {
  const navigate = useNavigate();

  // On prend la première image ou une image par défaut si vide
  const displayImage = car.images && car.images.length > 0 
    ? car.images[0] 
    : 'https://via.placeholder.com/600x800?text=Image+Indisponible';

  return (
    <div 
      onClick={() => navigate(`/car/${car._id}`)}
      className="group relative bg-transparent cursor-pointer"
    >
      {/* IMAGE CONTAINER : Perspective et Zoom */}
      <div className="relative h-[420px] w-full overflow-hidden rounded-[2.5rem] shadow-2xl transition-all duration-700 group-hover:rounded-[1.5rem]">
        <img 
          src={displayImage} 
          alt={`${car.marque} ${car.modele}`}
          className="h-full w-full object-cover transition-transform duration-1000 group-hover:scale-110 group-hover:rotate-1 grayscale-[15%] group-hover:grayscale-0"
        />
        
        {/* PRIX FLOTTANT : En haut à droite */}
        <div className="absolute top-6 right-6 bg-white/95 backdrop-blur-md px-5 py-2 rounded-2xl shadow-xl z-10 border border-white/20">
           <span className="text-slate-900 font-black text-lg">
             {Number(car.prix).toLocaleString()} €
           </span>
        </div>

        {/* BADGE CATÉGORIE : Discret en haut à gauche */}
        <div className="absolute top-6 left-6 bg-black/30 backdrop-blur-md px-4 py-1.5 rounded-full border border-white/10">
          <p className="text-[9px] font-bold uppercase tracking-widest text-white">
            {car.categorie}
          </p>
        </div>
      </div>

      {/* BLOC INFO FLOTTANT : Il chevauche l'image */}
      <div className="relative -mt-24 mx-6 bg-white p-7 rounded-[2.2rem] shadow-2xl border border-slate-50 transition-all duration-500 group-hover:-mt-28 z-20">
        <div className="flex justify-between items-start mb-5">
          <div>
            <p className="text-[10px] uppercase tracking-[0.3em] text-slate-400 font-bold mb-1">
              {car.marque}
            </p>
            <h3 className="text-xl font-black text-slate-900 uppercase tracking-tighter leading-none">
              {car.modele}
            </h3>
          </div>
          {/* Flèche d'action */}
          <div className="h-10 w-10 rounded-full flex items-center justify-center border border-slate-100 group-hover:bg-slate-900 group-hover:text-white transition-all duration-300">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M14 5l7 7m0 0l-7 7m7-7H3"></path>
            </svg>
          </div>
        </div>

        {/* SPÉCIFICATIONS TECHNIQUES */}
        <div className="flex items-center justify-between pt-5 border-t border-slate-50">
          <div className="flex flex-col">
            <span className="text-[9px] text-slate-400 uppercase font-bold tracking-widest">Année</span>
            <span className="text-xs font-black text-slate-700">{car.annee || 'N/C'}</span>
          </div>
          <div className="flex flex-col border-x border-slate-100 px-6">
            <span className="text-[9px] text-slate-400 uppercase font-bold tracking-widest">Kilométrage</span>
            <span className="text-xs font-black text-slate-700">
              {car.valeurCompteur ? `${Number(car.valeurCompteur).toLocaleString()} km` : 'N/C'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Card;