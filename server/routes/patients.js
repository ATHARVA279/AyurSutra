import express from 'express';
import Patient from '../models/Patient.js';
import Session from '../models/Session.js';
import { authenticateToken, requirePractitioner } from '../middleware/auth.js';

const router = express.Router();

router.get('/', authenticateToken, requirePractitioner, async (req, res) => {
  try {
    const patients = await Patient.find({})
      .select('-passwordHash')
      .populate('assignedRegimen', 'name description duration');
    
    res.json(patients);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

router.get('/:id/schedule', authenticateToken, async (req, res) => {
  try {
    const patientId = req.params.id;
    
    if (req.user.role === 'patient' && req.user._id.toString() !== patientId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const sessions = await Session.find({ patientId })
      .populate('regimenId', 'name steps')
      .populate('practitionerId', 'name specialization')
      .sort({ scheduledDate: 1 });

    res.json(sessions);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

router.get('/:id/sessions', authenticateToken, async (req, res) => {
  try {
    const patientId = req.params.id;
    
    if (req.user.role === 'patient' && req.user._id.toString() !== patientId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const sessions = await Session.find({ patientId })
      .populate('regimenId', 'name description steps')
      .populate('practitionerId', 'name specialization')
      .sort({ scheduledDate: -1 });

    res.json(sessions);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

router.post('/:id/sessions/:sessionId/feedback', authenticateToken, async (req, res) => {
  try {
    const { id: patientId, sessionId } = req.params;
    const { rating, notes } = req.body;

    if (req.user.role === 'patient' && req.user._id.toString() !== patientId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const session = await Session.findById(sessionId);
    if (!session || session.patientId.toString() !== patientId) {
      return res.status(404).json({ error: 'Session not found' });
    }

    session.feedback = { rating, notes };
    await session.save();

    await Patient.findByIdAndUpdate(patientId, {
      $push: {
        feedback: {
          sessionId,
          rating,
          notes,
          createdAt: new Date()
        }
      }
    });

    res.json({ message: 'Feedback submitted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;