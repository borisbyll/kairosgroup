export const siteConfig = {
  // --- IDENTITÉ DU SITE ---
  name: "KAIROS GROUP",
  tagline: "L'excellence automobile à votre portée",
  logo: "/images/logo.png",
  favicon: "/favicon.ico",

  // --- COORDONNÉES & RÉSEAUX ---
  contact: {
    phone: "+1 (506) 838-4859 / +228 99 79 47 72",
    whatsapp: "15068384859", 
    email: "contact@kairos-group.com",
    address: "Hédzranawoé, rue N°4 Lomé, Togo / Nouveau-Brunswick, Canada",
    googleMapsLink: "https://maps.google.com",
  },

  // --- PERSONNALISATION VISUELLE (Design inspiré de l'image) ---
  theme: {
    primaryColor: "#f5a430",      // Rouge/Rose vif (identique à l'image)
    primaryHover: "#BE123C",      
    secondaryColor: "#94a3b8",    
    backgroundColor: "#6bcefd",   // Fond Dark Anthracite pour le Hero
    cardBackground: "#ffffff",
    heroLayout: "split",          // Active le design avec image à droite
    // Image d'une BMW noire élégante pour le rendu premium
    heroImage: "/images/bmw.jpg?q=80&w=2070&auto=format&fit=crop",
  },

  // --- CATALOGUE & FONCTIONNALITÉS ---
  features: {
    currency: "FCFA",
    showStats: true,
    enableWhatsAppAlert: true,
    categories: [
      { id: "voiture", label: "Voitures", icon: "🚗" },
      { id: "camion", label: "Poids Lourds", icon: "🚛" },
      { id: "tracteur", label: "Engins BTP", icon: "🚜" }
    ],
    conditions: ["Neuf", "Occasion Europe", "Occasion Pays"]
  },

  // --- TEXTES "À PROPOS" ---
  about: {
    title: "À propos de KAIROS GROUP",
    description: "Nous sommes spécialisés dans l'importation et la vente de véhicules de qualité supérieure. Fort d'un réseau de partenaires partout dans le monde, nous accompagnons nos clients dans le choix de leurs outils de mobilité et de travaux.",
    stats: [
      { label: "Véhicules Vendus", value: "500+" },
      { label: "Clients Satisfaits", value: "450+" }
    ]
  },

  // --- CONFIGURATION SEO (Google) ---
  seo: {
    title: "KAIROS GROUP - Vente de voitures et engins lourds au Togo",
    description: "Trouvez les meilleurs véhicules, camions et tracteurs chez KAIROS GROUP. Qualité garantie et service après-vente professionnel.",
    keywords: "voitures Togo, vente camions Lomé, tracteurs BTP, achat voiture occasion"
  }
};