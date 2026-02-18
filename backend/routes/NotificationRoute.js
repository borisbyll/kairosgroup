const express = require('express');
const router = express.Router();
const Notification = require('../models/Notification');
const jwt = require('jsonwebtoken'); // Import nécessaire pour vérifier le badge

// --- DÉFINITION LOCALE DU VIGILE (Plus besoin du require externe) ---
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

// Route pour enregistrer un clic WhatsApp (Publique)
router.post('/add', async (req, res) => {
  try {
    const newNotif = new Notification({
      pageOrigin: req.body.page
    });
    await newNotif.save();
    res.status(201).json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Route : Supprimer toutes les notifications (Protégée)
router.delete('/clear-all', authenticateToken, async (req, res) => {
  try {
    await Notification.deleteMany({});
    res.json({ message: "Toutes les notifications ont été supprimées avec succès" });
  } catch (err) {
    res.status(500).json({ message: "Erreur lors de la suppression", error: err.message });
  }
});

// Route pour récupérer les notifications (Publique ou Protégée selon ton choix)
router.get('/', async (req, res) => {
  try {
    const notifs = await Notification.find().sort({ date: -1 }).limit(20);
    res.json(notifs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Marquer comme lues
router.put('/mark-as-read', async (req, res) => {
  try {
    await Notification.updateMany({ read: false }, { $set: { read: true } });
    res.json({ success: true, message: "Notifications marquées comme lues" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;