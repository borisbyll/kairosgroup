require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const jwt = require('jsonwebtoken');

// --- IMPORT DES MODÈLES ---
const Car = require('./models/Car');
const Notification = require('./models/Notification');
const Post = require('./models/Post');

// --- IMPORT DES ROUTES ---
const notificationRoutes = require('./routes/NotificationRoute');
const postRoutes = require('./routes/PostRoute');

const app = express();

// --- MIDDLEWARES ---
app.use(express.json());

const allowedOrigins = [
  'https://kairosgroup.vercel.app', 
  'http://localhost:5173'
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Bloqué par CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE','OPTIONS'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'], // Ajoute OPTIONS ici
  allowedHeaders: ['Content-Type', 'Authorization'],    // AJOUTE CETTE LIGNE
  credentials: true
}));
// --- BRANCHEMENT DES ROUTES MODULAIRES ---
app.use('/api/posts', postRoutes);
app.use('/api/notifications', notificationRoutes);

// --- CONNEXION MONGODB ---
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log("✅ MongoDB Connecté pour Kairos Group"))
  .catch(err => console.log("❌ Erreur MongoDB:", err));

// --- MIDDLEWARE D'AUTHENTIFICATION ---
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ message: "Accès refusé" });

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ message: "Session expirée" });
    req.user = user;
    next();
  });
};

// --- ROUTES API ---

// 1. AUTHENTIFICATION
app.post('/api/login', (req, res) => {
  const { username, email, password } = req.body;
  const identifier = email || username;

  if (identifier === process.env.ADMIN_USERNAME && password === process.env.ADMIN_PASSWORD) {
    const token = jwt.sign({ role: 'admin' }, process.env.JWT_SECRET, { expiresIn: '24h' });
    return res.json({ success: true, token });
  }
  return res.status(401).json({ success: false, message: "Identifiants invalides" });
});

// 2. GESTION DES VOITURES (PUBLIQUE)
app.get('/api/cars', async (req, res) => {
  try {
    const cars = await Car.find().sort({ createdAt: -1 });
    res.json(cars);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

app.put('/api/cars/views/:id', async (req, res) => {
  try {
    const car = await Car.findByIdAndUpdate(req.params.id, { $inc: { views: 1 } }, { new: true });
    res.json({ views: car.views });
  } catch (err) { res.status(500).json({ message: "Erreur vues" }); }
});

// 3. GESTION DES VOITURES (PROTÉGÉES - ADMIN)
app.post('/api/cars/add', authenticateToken, async (req, res) => {
  try {
    const newCar = new Car(req.body);
    await newCar.save();
    res.status(201).json(newCar);
  } catch (err) { res.status(400).json({ message: err.message }); }
});

app.put('/api/cars/:id', authenticateToken, async (req, res) => {
  try {
    const updatedCar = await Car.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updatedCar) return res.status(404).json({ message: "Voiture non trouvée" });
    res.json(updatedCar);
  } catch (err) { res.status(400).json({ message: err.message }); }
});

app.delete('/api/cars/:id', authenticateToken, async (req, res) => {
  try {
    const deletedCar = await Car.findByIdAndDelete(req.params.id);
    if (!deletedCar) return res.status(404).json({ message: "Voiture déjà supprimée" });
    res.json({ message: "Véhicule supprimé avec succès" });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// --- LANCEMENT ---
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Serveur Kairos group lancé sur le port ${PORT}`);
});