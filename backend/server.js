require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors'); // Déclaré UNE SEULE FOIS ici
const jwt = require('jsonwebtoken');

// IMPORT DES MODÈLES
const Car = require('./models/Car');
const Notification = require('./models/Notification');

// IMPORT DES ROUTES EXTERNES
const notificationRoutes = require('./routes/NotificationRoute');

const app = express();

// --- MIDDLEWARES ---
app.use(cors({
  // Autorise ton site Vercel ET ton ordinateur local pour les tests
  origin: ['https://kairosgroup.vercel.app', 'http://localhost:5173'],
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true
}));
app.use(express.json());

// --- CONNEXION MONGODB ---
// Vérifie bien que la variable s'appelle MONGODB_URI dans Render
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log("✅ MongoDB Connecté pour Kairos Group"))
  .catch(err => console.log("❌ Erreur MongoDB:", err));

// --- FONCTION DE SÉCURITÉ (MIDDLEWARE JWT) ---
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

// --- ROUTES ---

// Login
app.post('/api/login', (req, res) => {
  const identifier = req.body.email || req.body.username;
  const password = req.body.password;

  if (identifier === process.env.ADMIN_USERNAME && password === process.env.ADMIN_PASSWORD) {
    const token = jwt.sign({ role: 'admin' }, process.env.JWT_SECRET, { expiresIn: '24h' });
    return res.json({ success: true, token });
  }
  return res.status(401).json({ success: false, message: "Identifiants invalides" });
});

// Notifications
app.use('/api/notifications', notificationRoutes);

// Cars
app.get('/api/cars', async (req, res) => {
  try {
    const cars = await Car.find().sort({ createdAt: -1 });
    res.json(cars);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// ... Garde le reste de tes routes (POST, PUT, DELETE) telles quelles ...

// --- LANCEMENT DU SERVEUR ---
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Serveur Kairos Group lancé sur le port ${PORT}`);
});