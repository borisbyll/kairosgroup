import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link, useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import emailjs from '@emailjs/browser';
import { siteConfig } from '../config/siteConfig';

const CarDetail = () => {
  const { id } = useParams();
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const [car, setCar] = useState(null);
  const [others, setOthers] = useState([]);
  const [activeImg, setActiveImg] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const [status, setStatus] = useState("");
  const [isSending, setIsSending] = useState(false); 
  const form = useRef();
  const scrollRef = useRef(null);
  const primaryColor = siteConfig.theme.primaryColor;

  const hasIncremented = useRef(false);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [id, pathname]);

  useEffect(() => {
    const getData = async () => {
      try {
        const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/cars/${id}`);
        setCar(res.data);
        
        if (!hasIncremented.current) {
          await axios.put(`${import.meta.env.VITE_API_URL}/api/cars/views/${id}`);
          hasIncremented.current = true;
        }

        const all = await axios.get(`${import.meta.env.VITE_API_URL}/api/cars`);
        setOthers(all.data.filter(c => c._id !== id));
      } catch (e) { 
        console.error("Erreur chargement:", e); 
      }
    };

    hasIncremented.current = false; 
    getData();
  }, [id]);

  const handleBack = () => {
    navigate(-1);
  };

  const nextImg = () => car && setActiveImg((activeImg + 1) % car.images.length);
  const prevImg = () => car && setActiveImg((activeImg - 1 + car.images.length) % car.images.length);

  const scrollNext = () => {
    if (scrollRef.current) {
      const step = window.innerWidth < 768 ? window.innerWidth * 0.8 : 400;
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      if (scrollLeft + clientWidth >= scrollWidth - 20) scrollRef.current.scrollTo({ left: 0, behavior: 'smooth' });
      else scrollRef.current.scrollBy({ left: step, behavior: 'smooth' });
    }
  };

  const scrollPrev = () => {
    if (scrollRef.current) scrollRef.current.scrollBy({ left: -400, behavior: 'smooth' });
  };

  useEffect(() => {
    const interval = setInterval(scrollNext, 5000);
    return () => clearInterval(interval);
  }, [others]);

  const sendEmail = (e) => {
    e.preventDefault();
    setIsSending(true);
    setStatus("Envoi...");
    
    emailjs.sendForm(
      import.meta.env.VITE_EMAILJS_SERVICE_ID, 
      import.meta.env.VITE_EMAILJS_TEMPLATE_ID_CONTACT, 
      form.current, 
      import.meta.env.VITE_EMAILJS_PUBLIC_KEY
    )
      .then(() => { 
        setStatus("Envoyé !"); 
        setTimeout(() => { 
          setShowModal(false); 
          setStatus(""); 
        }, 2000); 
        form.current.reset(); 
      })
      .catch(() => setStatus("Erreur."))
      .finally(() => setIsSending(false));
  };

  if (!car) return <div className="h-screen flex items-center justify-center bg-slate-900 text-white font-black tracking-widest uppercase italic">Chargement...</div>;

  return (
    <div className="min-h-screen bg-white font-['Poppins'] text-slate-900">
      
      {/* SECTION HERO */}
      <section className="bg-slate-950 pt-32 pb-16 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-6">
            
            <button 
              onClick={handleBack} 
              className="flex items-center gap-3 text-slate-500 hover:text-white transition-all font-bold uppercase text-[10px] tracking-[0.3em] mb-10 group"
            >
              <span className="w-8 h-px bg-slate-700 group-hover:w-12 group-hover:bg-white transition-all"></span>
              Retour
            </button>

          <div className="grid lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-5 space-y-8">
              <div>
                <span style={{ color: primaryColor }} className="text-[10px] font-black uppercase tracking-[0.4em] mb-4 block italic">Exclusivité Kairos group</span>
                {/* RESTAURATION : MARQUE + MODÈLE */}
                <h1 className="text-4xl md:text-5xl font-black text-white uppercase italic leading-tight tracking-tighter mb-6">
                  <span style={{ color: primaryColor }} className="block text-2xl mb-2">{car.marque}</span>
                  {car.modele}
                </h1>
                <div className="px-6 py-2 bg-white/5 border border-white/10 rounded-full inline-block text-white">
                    <span className="text-2xl font-black italic">{car.prix?.toLocaleString()}</span>
                    <span className="ml-1 text-[9px] font-bold opacity-40 uppercase">{siteConfig.features.currency}</span>
                </div>
              </div>

              <div className="flex flex-wrap gap-3 max-w-sm">
                {car.images.map((img, i) => (
                  <button 
                    key={i} 
                    onClick={() => setActiveImg(i)}
                    className={`w-16 h-12 rounded-lg overflow-hidden border-2 transition-all ${activeImg === i ? 'border-white scale-110 shadow-[0_0_15px_rgba(255,255,255,0.3)]' : 'border-white/10 opacity-30 hover:opacity-100'}`}
                  >
                    <img src={img} className="w-full h-full object-cover" alt={`vue-${i}`} />
                  </button>
                ))}
              </div>
            </div>

            <div className="lg:col-span-7 relative">
              <div className="relative z-10 animate-in fade-in duration-700">
                <img src={car.images[activeImg]} className="w-full max-h-[450px] object-contain drop-shadow-[0_20px_60px_rgba(255,255,255,0.1)]" alt={car.modele} />
              </div>
              <div className="absolute top-1/2 -translate-y-1/2 w-full flex justify-between px-2 z-20 pointer-events-none">
                <button onClick={prevImg} className="p-3 rounded-full bg-white/10 backdrop-blur-md text-white pointer-events-auto hover:bg-white hover:text-black transition-all">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M15 19l-7-7 7-7" /></svg>
                </button>
                <button onClick={nextImg} className="p-3 rounded-full bg-white/10 backdrop-blur-md text-white pointer-events-auto hover:bg-white hover:text-black transition-all">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M9 5l7 7-7 7" /></svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION TECHNIQUE */}
      <section className="py-20 max-w-7xl mx-auto px-6 grid lg:grid-cols-3 gap-16">
        <div className="lg:col-span-2">
            <h2 className="text-[11px] font-black uppercase tracking-[0.3em] mb-10 flex items-center gap-3">
                <span className="w-8 h-[2px] bg-slate-900"></span> Fiche Technique
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12">
                {[
                  { label: "Kilométrage", val: `${car.valeurCompteur?.toLocaleString()} KM` },
                  { label: "Année", val: car.annee },
                  { label: "Motorisation", val: car.motorisation },
                  { label: "Transmission", val: car.transmission || "N/A" }
                ].map((item, idx) => (
                  <div key={idx} className="bg-slate-50 p-5 rounded-2xl border border-slate-100">
                    <p className="text-[8px] font-black text-slate-400 uppercase mb-1 tracking-widest">{item.label}</p>
                    <p className="text-xs font-black text-slate-900 uppercase italic">{item.val}</p>
                  </div>
                ))}
            </div>
            <p className="text-sm text-slate-500 leading-relaxed italic whitespace-pre-wrap">{car.description}</p>
        </div>

        <div className="lg:col-span-1">
            <div className="lg:sticky lg:top-32 space-y-4">
                <button onClick={() => setShowModal(true)} style={{ backgroundColor: primaryColor }} className="w-full text-white py-5 rounded-xl font-black uppercase text-[10px] tracking-widest shadow-xl active:scale-95 transition-all">
                    Vérifier disponibilité
                </button>
                <a href={`https://wa.me/${siteConfig.contact.whatsapp}`} target="_blank" rel="noopener noreferrer" className="block w-full bg-slate-900 text-white text-center py-5 rounded-xl font-black uppercase text-[10px] tracking-widest">
                    Réserver sur WhatsApp
                </a>
            </div>
        </div>
      </section>

      {/* SECTION CARROUSEL */}
      <section className="bg-slate-900 pt-24 pb-16">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-end mb-16 gap-8">
            <div className="max-w-2xl">
                <h3 className="text-4xl md:text-6xl font-black text-white uppercase italic tracking-tighter leading-[0.9] mb-6">
                    Poursuivez la <br /> <span style={{ color: primaryColor }}>Découverte</span>
                </h3>
                <p className="text-slate-500 text-[11px] font-bold uppercase tracking-[0.4em]">Explorez notre sélection exclusive</p>
            </div>
            <div className="flex gap-3">
                <button onClick={scrollPrev} className="w-12 h-12 rounded-full border border-white/10 text-white flex items-center justify-center hover:bg-white hover:text-black transition-all">←</button>
                <button onClick={scrollNext} className="w-12 h-12 rounded-full border border-white/10 text-white flex items-center justify-center hover:bg-white hover:text-black transition-all">→</button>
            </div>
        </div>

        <div ref={scrollRef} className="flex gap-8 overflow-x-auto px-6 no-scrollbar scroll-smooth pb-12">
            {others.map(c => (
              <Link key={c._id} to={`/car/${c._id}`} className="shrink-0 w-[280px] md:w-[380px] group">
                <div className="bg-white/5 rounded-[2.5rem] p-8 h-[240px] flex items-center justify-center border border-white/5 overflow-hidden transition-all group-hover:bg-white/10">
                    <img src={c.images[0]} className="max-w-full max-h-full object-contain group-hover:scale-110 transition-all duration-700" alt={c.modele} />
                </div>
                <div className="mt-6 px-2">
                    <div className="flex justify-between items-start">
                        <div>
                            <p style={{ color: primaryColor }} className="text-[8px] font-black uppercase mb-1 italic tracking-widest">{c.marque}</p>
                            <h5 className="text-xl font-black text-white uppercase italic leading-none">{c.modele}</h5>
                        </div>
                        <span className="text-white text-[12px] font-black italic">{c.prix?.toLocaleString()} {siteConfig.features.currency}</span>
                    </div>
                    <div className="flex gap-3 mt-4 text-[9px] font-bold text-slate-500 uppercase italic">
                        <span className="bg-white/5 px-3 py-1 rounded-full">{c.annee}</span>
                        <span className="bg-white/5 px-3 py-1 rounded-full">{c.valeurCompteur?.toLocaleString()} KM</span>
                    </div>
                </div>
              </Link>
            ))}
        </div>

        <div className="max-w-7xl mx-auto px-6">
            <div className="w-full h-px bg-white/10 mt-16"></div>
        </div>
      </section>

      {/* MODAL EMAILJS */}
      {showModal && (
        <div className="fixed inset-0 z-[2000] flex items-center justify-center p-6 bg-black/90 backdrop-blur-md">
          <div className="bg-white w-full max-w-md rounded-[3rem] p-10 relative shadow-2xl">
            <button 
              disabled={isSending}
              onClick={() => setShowModal(false)} 
              className="absolute top-8 right-8 text-slate-300 hover:text-black font-black"
            >
              ✕
            </button>
            <h3 className="text-2xl font-black text-slate-900 uppercase italic mb-8">Informations</h3>
            <form ref={form} onSubmit={sendEmail} className="space-y-4">
              <input type="hidden" name="car_id" value={car._id} />
              <input type="hidden" name="car_name" value={`${car.marque} ${car.modele}`} />
              
              <input type="text" name="user_name" placeholder="Nom complet" required className="w-full bg-slate-50 border-none rounded-xl px-6 py-4 outline-none" />
              <input type="email" name="user_email" placeholder="Votre Email" required className="w-full bg-slate-50 border-none rounded-xl px-6 py-4 outline-none" />
              <textarea name="message" placeholder="Votre message..." rows="2" className="w-full bg-slate-50 border-none rounded-xl px-6 py-4 outline-none resize-none"></textarea>
              
              <button 
                type="submit" 
                disabled={isSending}
                style={{ 
                  backgroundColor: isSending ? "#cbd5e1" : primaryColor,
                  cursor: isSending ? "not-allowed" : "pointer" 
                }} 
                className="w-full text-white font-black py-5 rounded-xl uppercase text-[10px] tracking-widest transition-all"
              >
                {isSending ? "Envoi en cours..." : "Envoyer"}
              </button>
              
              {status && <p className="text-center text-[9px] font-black uppercase mt-4 tracking-widest">{status}</p>}
            </form>
          </div>
        </div>
      )}

      <style>{`.no-scrollbar::-webkit-scrollbar { display: none; } .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }`}</style>
    </div>
  );
};

export default CarDetail;