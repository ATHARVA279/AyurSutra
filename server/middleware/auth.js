import jwt from 'jsonwebtoken';
import Patient from '../models/Patient.js';
import Practitioner from '../models/Practitioner.js';

export const authenticateToken = async (req, res, next) => {
  try {
    const token = req.cookies.token;

    if (!token) {
      return res.status(401).json({ error: 'Access denied. No token provided.' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    let user;
    if (decoded.role === 'patient') {
      user = await Patient.findById(decoded.userId).select('-passwordHash');
    } else if (decoded.role === 'practitioner') {
      user = await Practitioner.findById(decoded.userId).select('-passwordHash');
    }

    if (!user) {
      return res.status(401).json({ error: 'Invalid token.' });
    }

    req.user = user;
    req.user.role = decoded.role;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid token.' });
  }
};

export const requirePractitioner = (req, res, next) => {
  if (req.user.role !== 'practitioner') {
    return res.status(403).json({ error: 'Access denied. Practitioner role required.' });
  }
  next();
};

export const requirePatient = (req, res, next) => {
  if (req.user.role !== 'patient') {
    return res.status(403).json({ error: 'Access denied. Patient role required.' });
  }
  next();
};