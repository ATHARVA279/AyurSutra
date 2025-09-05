import express from 'express';
import Session from '../models/Session.js';
import Patient from '../models/Patient.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

router.get('/patient/:id', authenticateToken, async (req, res) => {
  try {
    const patientId = req.params.id;

    if (req.user.role === 'patient' && req.user._id.toString() !== patientId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const sessions = await Session.find({ patientId });
    const totalSessions = sessions.length;
    const completedSessions = sessions.filter(s => s.status === 'completed').length;
    const upcomingSessions = sessions.filter(s => s.status === 'scheduled' && new Date(s.scheduledDate) > new Date()).length;
    const missedSessions = sessions.filter(s => s.status === 'missed').length;

    const progressPercentage = totalSessions > 0 ? Math.round((completedSessions / totalSessions) * 100) : 0;

    const patient = await Patient.findById(patientId)
      .populate('assignedRegimen', 'name description duration');

    res.json({
      patient: {
        name: patient.name,
        regimen: patient.assignedRegimen
      },
      progress: {
        totalSessions,
        completedSessions,
        upcomingSessions,
        missedSessions,
        progressPercentage
      },
      recentFeedback: patient.feedback.slice(-5).reverse()
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

router.get('/center', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'practitioner') {
      return res.status(403).json({ error: 'Access denied' });
    }

    const totalPatients = await Patient.countDocuments();
    const totalSessions = await Session.countDocuments({ practitionerId: req.user._id });
    const completedSessions = await Session.countDocuments({ 
      practitionerId: req.user._id, 
      status: 'completed' 
    });

    const completionRate = totalSessions > 0 ? Math.round((completedSessions / totalSessions) * 100) : 0;

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    const todaysSessions = await Session.countDocuments({
      practitionerId: req.user._id,
      scheduledDate: { $gte: today, $lt: tomorrow }
    });

    res.json({
      totalPatients,
      totalSessions,
      completedSessions,
      completionRate,
      todaysSessions
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;