require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const jwt = require('jsonwebtoken');

// IMPORT DES MODÈLES
const Car = require('./models/Car');
const Notification = require('./models/Notification');

// IMPORT DES ROUTES EXTERNES
const notificationRoutes = require('./routes/NotificationRoute');

const app = express();

// --- MIDDLEWARES ---
app.use(express.json());

const allowedOrigins = [
  process.env.FRONTEND_URL, // Ta variable Render
  'http://localhost:5173'   // Pour que tu puisses continuer à travailler en local
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Bloqué par CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE'], // ABSOLUMENT INCLURE DELETE
  credentials: true
}));

// --- CONNEXION MONGODB ---
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

// --- ROUTES API ---

// 1. AUTHENTIFICATION
app.post('/api/login', (req, res) => {
  const identifier = req.body.email || req.body.username;
  const password = req.body.password;

  if (identifier === process.env.ADMIN_USERNAME && password === process.env.ADMIN_PASSWORD) {
    const token = jwt.sign({ role: 'admin' }, process.env.JWT_SECRET, { expiresIn: '24h' });
    return res.json({ success: true, token });
  }
  return res.status(401).json({ success: false, message: "Identifiants invalides" });
});

// 2. GESTION DES NOTIFICATIONS


app.delete('/api/notifications/clear-all', authenticateToken, async (req, res) => {
  try {
    await Notification.deleteMany({});
    res.status(200).json({ message: "Historique vidé" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
app.use('/api/notifications', notificationRoutes);

// 3. GESTION DES VOITURES (CARS)

// PUBLIQUE : Récupérer toutes les voitures
app.get('/api/cars', async (req, res) => {
  try {
    const cars = await Car.find().sort({ createdAt: -1 });
    res.json(cars);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// PUBLIQUE : Récupérer une voiture par ID
app.get('/api/cars/:id', async (req, res) => {
  try {
    const car = await Car.findById(req.params.id);
    if (!car) return res.status(404).json({ message: "Véhicule introuvable" });
    res.json(car);
  } catch (err) { res.status(500).json({ message: "Format ID invalide" }); }
});

// PUBLIQUE : Incrémenter les vues
app.put('/api/cars/views/:id', async (req, res) => {
  try {
    const car = await Car.findByIdAndUpdate(req.params.id, { $inc: { views: 1 } }, { new: true });
    res.json({ views: car.views });
  } catch (err) { res.status(500).json({ message: "Erreur vues" }); }
});

// PROTÉGÉE : Ajouter une voiture (Celle qui causait le 404)
app.post('/api/cars/add', authenticateToken, async (req, res) => {
  try {
    const newCar = new Car(req.body);
    await newCar.save();
    res.status(201).json(newCar);
  } catch (err) { res.status(400).json({ message: err.message }); }
});

// PROTÉGÉE : Modifier une voiture
app.put('/api/cars/:id', authenticateToken, async (req, res) => {
  try {
    const updatedCar = await Car.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updatedCar);
  } catch (err) { res.status(400).json({ message: err.message }); }
});

// PROTÉGÉE : Supprimer une voiture
app.delete('/api/cars/:id', authenticateToken, async (req, res) => {
  try {
    await Car.findByIdAndDelete(req.params.id);
    res.json({ message: "Véhicule supprimé avec succès" });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// --- LANCEMENT DU SERVEUR ---
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Serveur Emile Auto lancé sur le port ${PORT}`);
});