const mongoose = require('mongoose');
const slugify = require('slugify'); // Tu devras peut-être faire : npm install slugify

const postSchema = new mongoose.Schema({
  title: { type: String, required: [true, "Le titre est obligatoire"] },
  slug: { type: String, unique: true }, // Retiré 'required: true' car on va le générer
  content: { type: String, required: true },
  excerpt: { type: String },
  image: { type: String, required: true },
  category: { 
    type: String, 
    enum: ['Conseils', 'Nouveautés', 'Entretien', 'Événements'], 
    default: 'Conseils' 
  },
  author: { type: String, default: "KAIROS GROUP" },
  published: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now }
});

// LOGIQUE AUTOMATIQUE : Génère le slug à partir du titre avant de sauvegarder
postSchema.pre('validate', function(next) {
  if (this.title) {
    this.slug = slugify(this.title, { lower: true, strict: true });
  }
  next();
});

module.exports = mongoose.model('Post', postSchema);