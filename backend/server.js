require('dotenv').config(); // 1. CHARGEMENT PRIORITAIRE DU .ENV
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const jwt = require('jsonwebtoken');


// IMPORT DES MODÈLES (Acquis)
const Car = require('./models/Car');
const Notification = require('./models/Notification');

// IMPORT DES ROUTES EXTERNES (Acquis)
const notificationRoutes = require('./routes/NotificationRoute');

const app = express();

// --- MIDDLEWARES ---
const cors = require('cors');

// ... après app = express() ...

app.use(cors({
  origin: 'https://kairosgroup.vercel.app', // Ton URL exacte de Vercel
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true

}));
app.use(express.json());

// --- CONNEXION MONGODB ---
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log("✅ MongoDB Connecté pour Emile Auto"))
  .catch(err => console.log("❌ Erreur MongoDB:", err));

// --- FONCTION DE SÉCURITÉ (MIDDLEWARE JWT) ---
// Cette fonction protège les routes sans rien supprimer
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) return res.status(401).json({ message: "Accès refusé : Token manquant" });

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ message: "Session expirée ou Token invalide" });
    req.user = user;
    next();
  });
};

// --- 1. ROUTE LOGIN (STRICTE .ENV) ---
app.post('/api/login', (req, res) => {
  const identifier = req.body.email || req.body.username;
  const password = req.body.password;

  // Récupération stricte depuis le .env
  const ADMIN_USERNAME = process.env.ADMIN_USERNAME;
  const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;
  const JWT_SECRET = process.env.JWT_SECRET;

  if (!ADMIN_USERNAME || !ADMIN_PASSWORD || !JWT_SECRET) {
    return res.status(500).json({ error: "Configuration serveur incomplète (.env)" });
  }

  if (identifier === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
    const token = jwt.sign({ role: 'admin' }, JWT_SECRET, { expiresIn: '24h' });
    return res.json({ success: true, token });
  }
  return res.status(401).json({ success: false, message: "Identifiants invalides" });
});

// --- 2. GESTION DES NOTIFICATIONS (ACQUIS) ---
app.use('/api/notifications', notificationRoutes);

// Route pour vider l'historique (Protégée)
app.delete('/api/notifications/clear-all', authenticateToken, async (req, res) => {
  try {
    await Notification.deleteMany({});
    res.status(200).json({ message: "Historique vidé" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- 3. ROUTES API CARS (ACQUIS + VUES) ---

// PUBLIQUE : Incrémenter les vues (Placée avant :id)
app.put('/api/cars/views/:id', async (req, res) => {
  try {
    const car = await Car.findByIdAndUpdate(req.params.id, { $inc: { views: 1 } }, { new: true });
    res.json({ views: car.views });
  } catch (err) { res.status(500).json({ message: "Erreur vues" }); }
});

// PUBLIQUE : Récupérer toutes les voitures
app.get('/api/cars', async (req, res) => {
  try {
    const cars = await Car.find().sort({ createdAt: -1 });
    res.json(cars);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// PUBLIQUE : Récupérer une voiture
app.get('/api/cars/:id', async (req, res) => {
  try {
    const car = await Car.findById(req.params.id);
    if (!car) return res.status(404).json({ message: "Véhicule introuvable" });
    res.json(car);
  } catch (err) { res.status(500).json({ message: "Format ID invalide" }); }
});

// PROTÉGÉE : Ajouter une voiture
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