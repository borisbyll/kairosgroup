const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
  title: { 
    type: String, 
    required: [true, "Le titre est obligatoire"] 
  },
  slug: { 
    type: String, 
    required: true, 
    unique: true // Très important pour le SEO d'Emile Auto
  },
  content: { 
    type: String, 
    required: true 
  },
  excerpt: { 
    type: String // Un court résumé pour les cartes du blog
  },
  image: { 
    type: String, 
    required: true // L'URL Cloudinary
  },
  category: { 
    type: String, 
    enum: ['Conseils', 'Nouveautés', 'Entretien', 'Événements'], // Catégories fixes
    default: 'Conseils' 
  },
  author: { 
    type: String, 
    default: "KAIROS GROUP" 
  },
  published: { 
    type: Boolean, 
    default: true 
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  }
});

// On exporte le modèle pour qu'il soit reconnu par server.js
module.exports = mongoose.model('Post', postSchema);