import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { siteConfig } from '../config/siteConfig'; // Importation de la config
import AdminBlog from '../components/AdminBlog';

const Admin = () => {
  const navigate = useNavigate();
  const [activeMenu, setActiveMenu] = useState('stats'); 
  const [inventoryFilter, setInventoryFilter] = useState('Tous'); 
  const [vehicles, setVehicles] = useState([]);
  const [notifications, setNotifications] = useState([]); 
  const [unreadCount, setUnreadCount] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [lastId, setLastId] = useState(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState({ show: false, id: null });
  const [showClearHistoryModal, setShowClearHistoryModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [editId, setEditId] = useState(null);
  
  const [selectedIds, setSelectedIds] = useState([]);
  const [showBulkDeleteModal, setShowBulkDeleteModal] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Récupération de la couleur primaire depuis la config
  const primaryColor = siteConfig.theme.primaryColor;

  const [formData, setFormData] = useState({
    brand: '',
    model: '',
    year: '',
    price: '',
    mileage: '',
    fuel: 'Essence',
    transmission: 'Automatique',
    type: 'Occasion',
    description: '',
    images: [],
    features: [],
    engine: '',
    power: '',
    condition: 'Excellent'
  });

  const menuItems = [
    { id: 'stats', label: 'Tableau de bord', icon: '📊' },
    { id: 'inventory', label: 'Parc Automobile', icon: '🚗' },
    { id: 'add', label: 'Ajouter un véhicule', icon: '➕' },
    { id: 'blog', label: 'Gestion Blog', icon: '✍️' },
    { id: 'notifications', label: 'Alertes WhatsApp', icon: '🔔' },
  ];

  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    if (!token) {
      navigate('/login');
    } else {
      fetchVehicles();
      fetchNotifications();
    }
  }, [navigate]);

  const fetchVehicles = async () => {
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/cars`);
      setVehicles(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchNotifications = async () => {
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/notifications`);
      setNotifications(res.data);
      setUnreadCount(res.data.filter(n => !n.read).length);
    } catch (err) {
      console.error(err);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    navigate('/login');
  };

  const deleteVehicle = async (id) => {
    setShowDeleteModal({ show: true, id });
  };

  const confirmDelete = async () => {
    try {
      await axios.delete(`${import.meta.env.VITE_API_URL}/api/cars/${showDeleteModal.id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('adminToken')}` }
      });
      fetchVehicles();
      setShowDeleteModal({ show: false, id: null });
    } catch (err) {
      console.error(err);
    }
  };

  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files);
    setIsUploading(true);
    
    const uploadedUrls = [];
    for (const file of files) {
      const data = new FormData();
      data.append("file", file);
      data.append("upload_preset", import.meta.env.VITE_CLOUDINARY_PRESET);
      
      try {
        const res = await axios.post(
          `https://api.cloudinary.com/v1_1/${import.meta.env.VITE_CLOUDINARY_CLOUD_NAME}/image/upload`,
          data
        );
        uploadedUrls.push(res.data.secure_url);
      } catch (err) {
        console.error("Erreur upload", err);
      }
    }
    
    setFormData(prev => ({
      ...prev,
      images: [...prev.images, ...uploadedUrls]
    }));
    setIsUploading(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const url = editId 
        ? `${import.meta.env.VITE_API_URL}/api/cars/${editId}`
        : `${import.meta.env.VITE_API_URL}/api/cars/add`;
      
      const method = editId ? 'put' : 'post';

      await axios[method](url, formData, {
        headers: { Authorization: `Bearer ${localStorage.getItem('adminToken')}` }
      });
      
      setShowSuccessModal(true);
      setEditId(null);
      setFormData({
        brand: '', model: '', year: '', price: '', mileage: '',
        fuel: 'Essence', transmission: 'Automatique', type: 'Occasion',
        description: '', images: [], features: [], engine: '', power: '', condition: 'Excellent'
      });
      fetchVehicles();
    } catch (err) {
      alert("Erreur lors de l'enregistrement");
    }
  };

  const markAsRead = async (id) => {
    try {
      await axios.put(`${import.meta.env.VITE_API_URL}/api/notifications/${id}/read`);
      fetchNotifications();
    } catch (err) {
      console.error(err);
    }
  };

  const clearNotifications = async () => {
    try {
      await axios.delete(`${import.meta.env.VITE_API_URL}/api/notifications/clear-all`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('adminToken')}` }
      });
      fetchNotifications();
      setShowClearHistoryModal(false);
    } catch (err) {
      console.error(err);
    }
  };

  const toggleSelection = (id) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const bulkDelete = async () => {
    if (window.confirm(`Supprimer ${selectedIds.length} véhicules ?`)) {
      try {
        await Promise.all(selectedIds.map(id => 
          axios.delete(`${import.meta.env.VITE_API_URL}/api/cars/${id}`, {
            headers: { Authorization: `Bearer ${localStorage.getItem('adminToken')}` }
          })
        ));
        setSelectedIds([]);
        fetchVehicles();
      } catch (err) {
        alert("Erreur lors de la suppression groupée");
      }
    }
  };

  const renderStats = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {[
        { label: 'Total Véhicules', val: vehicles.length, icon: '🚗', color: 'bg-blue-50 text-blue-600' },
        { label: 'Prix Moyen', val: `${Math.round(vehicles.reduce((acc, c) => acc + c.price, 0) / (vehicles.length || 1)).toLocaleString()} FCFA`, icon: '💰', color: 'bg-green-50 text-green-600' },
        { label: 'Alertes WhatsApp', val: notifications.length, icon: '📱', color: 'bg-emerald-50 text-emerald-600' },
        { label: 'Messages non lus', val: unreadCount, icon: '✉️', color: 'bg-orange-50 text-orange-600' },
      ].map((stat, i) => (
        <div key={i} className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-all group">
          <div className={`w-14 h-14 ${stat.color} rounded-2xl flex items-center justify-center text-2xl mb-6 group-hover:scale-110 transition-transform`}>
            {stat.icon}
          </div>
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">{stat.label}</p>
          <h4 className="text-2xl font-black text-slate-900 mt-2 tracking-tighter">{stat.val}</h4>
        </div>
      ))}
    </div>
  );

  const renderInventory = () => {
    const filtered = vehicles.filter(v => 
      (inventoryFilter === 'Tous' || v.type === inventoryFilter) &&
      (v.brand.toLowerCase().includes(searchTerm.toLowerCase()) || v.model.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    return (
      <div className="space-y-8">
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
          <div className="flex bg-slate-100 p-1.5 rounded-2xl w-full md:w-auto">
            {['Tous', 'Neuf', 'Occasion'].map(f => (
              <button
                key={f}
                onClick={() => setInventoryFilter(f)}
                className={`px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${inventoryFilter === f ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
              >
                {f}
              </button>
            ))}
          </div>
          <div className="relative w-full md:w-80">
            <span className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400">🔍</span>
            <input 
              type="text" 
              placeholder="RECHERCHER UN MODÈLE..." 
              className="w-full pl-12 pr-6 py-4 bg-slate-50 border-none rounded-2xl text-[10px] font-bold uppercase tracking-widest focus:ring-2 focus:ring-slate-200"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          {selectedIds.length > 0 && (
            <button 
              onClick={bulkDelete}
              className="w-full md:w-auto px-8 py-4 bg-red-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-red-700 transition-all shadow-lg shadow-red-100"
            >
              Supprimer ({selectedIds.length})
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map(v => (
            <div key={v._id} className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden group hover:shadow-xl transition-all duration-500">
              <div className="relative h-64 overflow-hidden">
                <img src={v.images[0]} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" alt="" />
                <div className="absolute top-6 left-6 flex flex-col gap-2">
                  <span className="bg-white/90 backdrop-blur px-4 py-2 rounded-full text-[9px] font-black uppercase tracking-widest text-slate-900 shadow-sm">
                    {v.type}
                  </span>
                  <input 
                    type="checkbox" 
                    checked={selectedIds.includes(v._id)}
                    onChange={() => toggleSelection(v._id)}
                    className="w-6 h-6 rounded-lg border-none bg-white/90 backdrop-blur text-slate-900 focus:ring-0 cursor-pointer shadow-sm"
                  />
                </div>
                <div className="absolute bottom-6 right-6 flex gap-2 translate-y-12 group-hover:translate-y-0 transition-transform duration-500">
                  <button 
                    onClick={() => {
                      setEditId(v._id);
                      setFormData(v);
                      setActiveMenu('add');
                    }}
                    className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-lg shadow-xl hover:bg-slate-900 hover:text-white transition-all"
                  >
                    ✏️
                  </button>
                  <button 
                    onClick={() => deleteVehicle(v._id)}
                    className="w-12 h-12 bg-red-500 rounded-2xl flex items-center justify-center text-lg text-white shadow-xl hover:bg-red-600 transition-all"
                  >
                    🗑️
                  </button>
                </div>
              </div>
              <div className="p-8">
                <h4 className="text-lg font-black text-slate-900 uppercase tracking-tighter mb-1">{v.brand} {v.model}</h4>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{v.year} • {v.transmission} • {v.fuel}</p>
                <div className="mt-6 pt-6 border-t border-slate-50 flex items-center justify-between">
                  <span className="text-xl font-black text-slate-900 tracking-tighter" style={{ color: primaryColor }}>{v.price.toLocaleString()} FCFA</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderAddVehicle = () => (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-[3rem] shadow-2xl shadow-slate-200/50 border border-slate-100 overflow-hidden">
        <div className="bg-slate-900 p-10 text-center">
          <h3 className="text-white text-xl font-black uppercase tracking-[0.2em]">{editId ? 'Modifier le véhicule' : 'Nouveau Véhicule'}</h3>
          <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mt-2">Remplissez les informations techniques</p>
        </div>
        
        <form onSubmit={handleSubmit} className="p-12 space-y-12">
          <section className="space-y-8">
            <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-300 border-b border-slate-50 pb-4">01. Informations de base</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {[
                { label: 'Marque', key: 'brand', type: 'text', ph: 'Ex: Toyota' },
                { label: 'Modèle', key: 'model', type: 'text', ph: 'Ex: Camry' },
                { label: 'Année', key: 'year', type: 'number', ph: 'Ex: 2022' },
                { label: 'Prix (FCFA)', key: 'price', type: 'number', ph: 'Ex: 15000000' }
              ].map(field => (
                <div key={field.key} className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-slate-400 ml-1">{field.label}</label>
                  <input 
                    required
                    type={field.type}
                    placeholder={field.ph}
                    className="w-full p-5 bg-slate-50 border-none rounded-2xl text-sm font-bold focus:ring-2 focus:ring-slate-200 transition-all"
                    value={formData[field.key]}
                    onChange={(e) => setFormData({...formData, [field.key]: e.target.value})}
                  />
                </div>
              ))}
            </div>
          </section>

          <section className="space-y-8">
            <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-300 border-b border-slate-50 pb-4">02. Spécifications techniques</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                { label: 'Carburant', key: 'fuel', options: ['Essence', 'Diesel', 'Hybride', 'Électrique'] },
                { label: 'Transmission', key: 'transmission', options: ['Automatique', 'Manuelle'] },
                { label: 'Type', key: 'type', options: ['Occasion', 'Neuf'] }
              ].map(field => (
                <div key={field.key} className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-slate-400 ml-1">{field.label}</label>
                  <select 
                    className="w-full p-5 bg-slate-50 border-none rounded-2xl text-sm font-bold focus:ring-2 focus:ring-slate-200 transition-all appearance-none"
                    value={formData[field.key]}
                    onChange={(e) => setFormData({...formData, [field.key]: e.target.value})}
                  >
                    {field.options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                  </select>
                </div>
              ))}
            </div>
          </section>

          <section className="space-y-8">
            <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-300 border-b border-slate-50 pb-4">03. Médias & Description</h4>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Images du véhicule</label>
              <div className="relative">
                <input 
                  type="file" 
                  multiple 
                  onChange={handleImageUpload}
                  className="hidden" 
                  id="img-upload"
                />
                <label 
                  htmlFor="img-upload" 
                  className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-slate-200 bg-slate-50 rounded-[2rem] cursor-pointer hover:bg-slate-100 transition-all"
                >
                  {isUploading ? (
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-6 h-6 border-4 border-slate-900 border-t-transparent rounded-full animate-spin"></div>
                      <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Téléchargement...</span>
                    </div>
                  ) : (
                    <>
                      <span className="text-3xl mb-4">📸</span>
                      <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Cliquez pour ajouter des photos</p>
                    </>
                  )}
                </label>
              </div>
              
              {formData.images.length > 0 && (
                <div className="grid grid-cols-4 md:grid-cols-6 gap-4 mt-6">
                  {formData.images.map((img, i) => (
                    <div key={i} className="relative aspect-square rounded-2xl overflow-hidden group">
                      <img src={img} className="w-full h-full object-cover" alt="" />
                      <button 
                        type="button"
                        onClick={() => setFormData(prev => ({...prev, images: prev.images.filter((_, idx) => idx !== i)}))}
                        className="absolute inset-0 bg-red-600/80 text-white opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-xs font-bold"
                      >
                        SUPPRIMER
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Description complète</label>
              <textarea 
                required
                className="w-full p-8 bg-slate-50 border-none rounded-[2rem] text-sm font-medium focus:ring-2 focus:ring-slate-200 transition-all min-h-[200px]"
                placeholder="Décrivez l'état du véhicule, les options, l'historique..."
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
              />
            </div>
          </section>

          <button 
            type="submit" 
            disabled={isUploading}
            className="w-full py-6 bg-slate-900 text-white rounded-[2rem] font-black text-[11px] uppercase tracking-[0.3em] hover:bg-slate-800 transition-all shadow-2xl shadow-slate-200 disabled:opacity-50"
          >
            {editId ? 'Enregistrer les modifications' : 'Publier le véhicule'}
          </button>
        </form>
      </div>
    </div>
  );

  const renderNotifications = () => (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="flex items-center justify-between bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm">
        <div>
          <h3 className="text-xl font-black text-slate-900 uppercase tracking-tighter">Alertes Clients</h3>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Historique des clics WhatsApp</p>
        </div>
        <button 
          onClick={() => setShowClearHistoryModal(true)}
          className="px-6 py-3 bg-red-50 text-red-600 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-red-100 transition-all"
        >
          Vider l'historique
        </button>
      </div>

      <div className="space-y-4">
        {notifications.map(n => (
          <div key={n._id} className={`bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm flex items-center justify-between group hover:shadow-md transition-all ${!n.read ? 'border-l-4 border-l-emerald-500' : ''}`}>
            <div className="flex items-center gap-6">
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl ${!n.read ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-50 text-slate-400'}`}>
                📱
              </div>
              <div>
                <p className="text-sm font-black text-slate-900 uppercase tracking-tight">{n.message}</p>
                <div className="flex items-center gap-3 mt-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                    {new Date(n.createdAt).toLocaleString('fr-FR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                  </span>
                  {!n.read && <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 text-[8px] font-black uppercase rounded-full">Nouveau</span>}
                </div>
              </div>
            </div>
            {!n.read && (
              <button 
                onClick={() => markAsRead(n._id)}
                className="opacity-0 group-hover:opacity-100 px-6 py-3 bg-slate-900 text-white rounded-xl text-[9px] font-black uppercase tracking-widest transition-all"
              >
                Marquer lu
              </button>
            )}
          </div>
        ))}
        {notifications.length === 0 && (
          <div className="text-center py-20 bg-white rounded-[2rem] border border-dashed border-slate-200">
            <span className="text-4xl">📭</span>
            <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.2em] mt-4">Aucune alerte pour le moment</p>
          </div>
        )}
      </div>
    </div>
  );

  return (
    // MODIFICATION ICI : h-screen + overflow-hidden pour bloquer le scroll global
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      
      {/* SIDEBAR : Modification de la largeur et ajout de la gestion du scroll interne */}
      <aside className={`
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'} 
        lg:translate-x-0 fixed lg:relative z-50 w-72 h-full 
        bg-white border-r border-slate-200 transition-transform duration-300
        flex flex-col flex-shrink-0
      `}>
        <div className="p-8 border-b border-slate-50">
          <h1 className="text-xl font-black text-slate-900 tracking-tighter uppercase" translate="no">
            {siteConfig.name}<span style={{ color: primaryColor }}>.</span>
          </h1>
          <p className="text-[9px] font-bold text-slate-400 uppercase tracking-[0.2em] mt-1">Plateforme Admin</p>
        </div>

        {/* Menu : Scrollable seulement si les items dépassent la hauteur */}
        <nav className="flex-1 overflow-y-auto p-6 space-y-2">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                setActiveMenu(item.id);
                setIsMobileMenuOpen(false);
              }}
              className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl font-bold text-[11px] uppercase tracking-widest transition-all ${
                activeMenu === item.id 
                  ? 'bg-slate-900 text-white shadow-xl shadow-slate-200' 
                  : 'text-slate-400 hover:bg-slate-50 hover:text-slate-600'
              }`}
            >
              <span className="text-lg">{item.icon}</span>
              {item.label}
              {item.id === 'notifications' && unreadCount > 0 && (
                <span className="ml-auto w-5 h-5 bg-emerald-500 text-white text-[9px] flex items-center justify-center rounded-full animate-pulse">
                  {unreadCount}
                </span>
              )}
            </button>
          ))}
        </nav>

        <div className="p-6 border-t border-slate-50">
          <button 
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-3 p-4 bg-red-50 text-red-600 rounded-2xl font-bold text-[10px] uppercase tracking-widest hover:bg-red-100 transition-colors"
          >
            <span>🚪</span> Déconnexion
          </button>
        </div>
      </aside>

      {/* ZONE PRINCIPALE : Modification pour permettre le scroll seulement ici */}
      <main className="flex-1 h-full overflow-y-auto bg-slate-50 relative">
        <div className="max-w-6xl mx-auto p-6 lg:p-12">
          
          <div className="flex items-center justify-between mb-12">
            <div>
              <h2 className="text-3xl font-black text-slate-900 uppercase tracking-tighter">
                {menuItems.find(m => m.id === activeMenu)?.label}
              </h2>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em] mt-1">Gestion {siteConfig.name}</p>
            </div>
            
            <button 
              className="lg:hidden w-12 h-12 bg-white rounded-2xl shadow-sm flex items-center justify-center text-xl"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? '✕' : '☰'}
            </button>
          </div>

          {activeMenu === 'stats' && renderStats()}
          {activeMenu === 'inventory' && renderInventory()}
          {activeMenu === 'add' && renderAddVehicle()}
          {activeMenu === 'notifications' && renderNotifications()}
          {activeMenu === 'blog' && <AdminBlog />}
        </div>
      </main>

      {/* MODALES : Inchangées pour conserver la logique */}
      {showSuccessModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[200] flex items-center justify-center p-4">
          <div className="bg-white rounded-[3rem] p-12 max-w-sm w-full text-center shadow-2xl animate-in zoom-in duration-300">
            <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-4xl mx-auto mb-8 animate-bounce">✓</div>
            <h3 className="text-xl font-black text-slate-900 uppercase tracking-tighter">Succès !</h3>
            <p className="text-[11px] text-slate-500 mt-3 font-medium uppercase tracking-widest">L'opération a été validée.</p>
            <button onClick={() => setShowSuccessModal(false)} className="w-full mt-10 py-5 bg-slate-900 text-white rounded-2xl font-bold text-[10px] uppercase tracking-[0.2em] hover:bg-slate-800 transition-all">Continuer</button>
          </div>
        </div>
      )}

      {showDeleteModal.show && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[200] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-8 max-w-sm w-full text-center shadow-2xl">
            <h3 className="text-md font-bold text-slate-900 uppercase mb-6">Supprimer ce véhicule ?</h3>
            <div className="flex gap-4">
              <button onClick={() => setShowDeleteModal({ show: false, id: null })} className="flex-1 py-3 bg-slate-100 text-slate-600 rounded-lg font-bold text-[11px] uppercase">Annuler</button>
              <button onClick={confirmDelete} className="flex-1 py-3 bg-red-600 text-white rounded-lg font-bold text-[11px] uppercase">Confirmer</button>
            </div>
          </div>
        </div>
      )}

      {showClearHistoryModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[200] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-8 max-w-sm w-full text-center shadow-2xl">
            <h3 className="text-md font-bold text-slate-900 uppercase mb-2">Vider l'historique ?</h3>
            <p className="text-[11px] text-slate-500 mb-8 font-medium">Cette action supprimera toutes les alertes WhatsApp pour <strong translate="no"> {siteConfig.name}.</strong></p>
            <div className="flex gap-3">
              <button onClick={() => setShowClearHistoryModal(false)} className="flex-1 py-3 bg-slate-100 text-slate-600 rounded-xl font-bold text-[10px] uppercase">Annuler</button>
              <button onClick={clearNotifications} className="flex-1 py-3 bg-red-600 text-white rounded-xl font-bold text-[10px] uppercase shadow-lg shadow-red-100">Vider</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Admin;