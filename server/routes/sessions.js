import express from 'express';
import Session from '../models/Session.js';
import { authenticateToken, requirePractitioner } from '../middleware/auth.js';

const router = express.Router();

router.get('/today', authenticateToken, requirePractitioner, async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    const sessions = await Session.find({
      practitionerId: req.user._id,
      scheduledDate: { $gte: today, $lt: tomorrow }
    })
    .populate('patientId', 'name email phone')
    .populate('regimenId', 'name steps')
    .sort({ scheduledDate: 1 });

    res.json(sessions);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

router.put('/:id/complete', authenticateToken, requirePractitioner, async (req, res) => {
  try {
    const { checklist, notes } = req.body;
    
    const session = await Session.findById(req.params.id);
    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }

    if (session.practitionerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Access denied' });
    }

    session.status = 'completed';
    session.checklist = checklist || session.checklist;
    session.practitionerNotes = notes || session.practitionerNotes;

    await session.save();

    res.json({ message: 'Session marked as completed', session });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const session = await Session.findById(req.params.id)
      .populate('patientId', 'name email phone')
      .populate('regimenId', 'name description steps')
      .populate('practitionerId', 'name specialization');

    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }

    if (req.user.role === 'patient' && session.patientId._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Access denied' });
    }

    if (req.user.role === 'practitioner' && session.practitionerId._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Access denied' });
    }

    res.json(session);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;