import express from 'express';
import Regimen from '../models/Regimen.js';
import Patient from '../models/Patient.js';
import Session from '../models/Session.js';
import Practitioner from '../models/Practitioner.js';
import { authenticateToken, requirePractitioner } from '../middleware/auth.js';

const router = express.Router();

router.get('/', authenticateToken, async (req, res) => {
  try {
    const regimens = await Regimen.find({})
      .populate('createdBy', 'name specialization');
    
    res.json(regimens);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

router.post('/', authenticateToken, requirePractitioner, async (req, res) => {
  try {
    const { name, description, steps } = req.body;

    const regimen = new Regimen({
      name,
      description,
      steps,
      createdBy: req.user._id,
      duration: Math.max(...steps.map(step => step.dayOffset)) + 1
    });

    await regimen.save();

    await Practitioner.findByIdAndUpdate(req.user._id, {
      $push: { regimensCreated: regimen._id }
    });

    res.status(201).json(regimen);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

router.post('/:id/assign', authenticateToken, requirePractitioner, async (req, res) => {
  try {
    const { patientId, startDate } = req.body;
    const regimenId = req.params.id;

    const regimen = await Regimen.findById(regimenId);
    const patient = await Patient.findById(patientId);

    if (!regimen || !patient) {
      return res.status(404).json({ error: 'Regimen or patient not found' });
    }

    patient.assignedRegimen = regimenId;
    await patient.save();

    const sessions = [];
    const start = new Date(startDate);

    for (const step of regimen.steps) {
      const sessionDate = new Date(start);
      sessionDate.setDate(start.getDate() + step.dayOffset);

      const session = new Session({
        patientId,
        regimenId,
        stepIndex: regimen.steps.indexOf(step),
        scheduledDate: sessionDate,
        practitionerId: req.user._id,
        checklist: [
          { item: 'Patient preparation completed', completed: false },
          { item: 'Procedure executed properly', completed: false },
          { item: 'Post-procedure care given', completed: false }
        ]
      });

      const savedSession = await session.save();
      sessions.push(savedSession);
    }

    patient.sessions = sessions.map(s => s._id);
    await patient.save();

    res.json({ message: 'Regimen assigned successfully', sessions });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;