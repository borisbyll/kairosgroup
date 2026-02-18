const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
  title: { 
    type: String, 
    required: [true, "Le titre est obligatoire"] 
  },
  slug: { 
    type: String, 
    required: true, 
    unique: true 
  },
  content: { 
    type: String, 
    required: true 
  },
  excerpt: { 
    type: String 
  },
  image: { 
    type: String, 
    required: true 
  },
  category: { 
    type: String, 
    enum: ['Conseils', 'Nouveautés', 'Entretien', 'Événements'], 
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

// IMPORTANT : Si tu as un bloc postSchema.pre(...) qui cause l'erreur, 
// assure-toi qu'il ressemble à ceci ou supprime-le si tu gères le slug côté frontend.

module.exports = mongoose.model('Post', postSchema);