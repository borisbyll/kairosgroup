const express = require('express');
const router = express.Router();
const Car = require('../models/Car');
const authenticateToken = require('../middleware/auth'); // <-- Importe ton middleware ici

// 1. Récupérer toutes les voitures (Public)
router.get('/', async (req, res) => {
    try {
        const voitures = await Car.find().sort({ _id: -1 });
        res.json(voitures);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// 2. Ajouter une voiture (PROTÉGÉ)
// On ajoute authenticateToken entre le chemin et la fonction
router.post('/add', authenticateToken, async (req, res) => {
    try {
        const nouvelleVoiture = new Car(req.body);
        await nouvelleVoiture.save();
        res.status(201).json(nouvelleVoiture);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// 3. Modifier une voiture (PROTÉGÉ - C'est sûrement celle-là qui te manquait)
router.put('/:id', authenticateToken, async (req, res) => {
    try {
        const voitureModifiee = await Car.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true }
        );
        res.json(voitureModifiee);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// 4. Supprimer une voiture (PROTÉGÉ)
router.delete('/:id', authenticateToken, async (req, res) => {
    try {
        await Car.findByIdAndDelete(req.params.id);
        res.json({ message: "Voiture supprimée avec succès" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// 5. Route pour incrémenter les vues (Public - Changé app.put en router.put)
router.put('/views/:id', async (req, res) => {
  try {
    const car = await Car.findByIdAndUpdate(
      req.params.id, 
      { $inc: { views: 1 } }, 
      { new: true }
    );
    if (!car) return res.status(404).json({ message: "Voiture non trouvée" });
    res.json({ views: car.views });
  } catch (err) {
    res.status(500).json({ message: "Erreur lors de l'incrémentation des vues" });
  }
});

module.exports = router;