import express from 'express';
import Practitioner from '../models/Practitioner.js';
import { authenticateToken, requirePractitioner } from '../middleware/auth.js';

const router = express.Router();

router.get('/', authenticateToken, async (req, res) => {
  try {
    const practitioners = await Practitioner.find({})
      .select('-passwordHash')
      .populate('regimensCreated', 'name description');
    
    res.json(practitioners);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const practitioner = await Practitioner.findById(req.params.id)
      .select('-passwordHash')
      .populate('regimensCreated', 'name description duration');
    
    if (!practitioner) {
      return res.status(404).json({ error: 'Practitioner not found' });
    }
    
    res.json(practitioner);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;