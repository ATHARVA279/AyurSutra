import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import Patient from '../models/Patient.js';
import Practitioner from '../models/Practitioner.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

router.post('/signup', async (req, res) => {
  try {
    const { name, email, phone, password, role, specialization } = req.body;

    if (!name || !email || !password || !role) {
      return res.status(400).json({ error: 'Required fields missing' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    let user;
    if (role === 'patient') {
      if (!phone) {
        return res.status(400).json({ error: 'Phone required for patients' });
      }
      user = new Patient({
        name,
        email,
        phone,
        passwordHash: hashedPassword
      });
    } else if (role === 'practitioner') {
      if (!specialization) {
        return res.status(400).json({ error: 'Specialization required for practitioners' });
      }
      user = new Practitioner({
        name,
        email,
        passwordHash: hashedPassword,
        specialization
      });
    } else {
      return res.status(400).json({ error: 'Invalid role' });
    }

    await user.save();

    const token = jwt.sign(
      { userId: user._id, role },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 24 * 60 * 60 * 1000
    });

    res.status(201).json({
      message: 'User created successfully',
      user: { id: user._id, name: user.name, email: user.email, role }
    });
  } catch (error) {
    if (error.code === 11000) {
      res.status(400).json({ error: 'Email already exists' });
    } else {
      res.status(500).json({ error: 'Server error' });
    }
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password, role } = req.body;

    let user;
    if (role === 'patient') {
      user = await Patient.findOne({ email });
    } else if (role === 'practitioner') {
      user = await Practitioner.findOne({ email });
    }

    if (!user || !await bcrypt.compare(password, user.passwordHash)) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { userId: user._id, role },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 24 * 60 * 60 * 1000
    });

    res.json({
      message: 'Login successful',
      user: { id: user._id, name: user.name, email: user.email, role }
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

router.post('/logout', (req, res) => {
  res.clearCookie('token');
  res.json({ message: 'Logged out successfully' });
});

router.get('/me', authenticateToken, (req, res) => {
  res.json({
    user: {
      id: req.user._id,
      name: req.user.name,
      email: req.user.email,
      role: req.user.role,
      specialization: req.user.specialization,
      phone: req.user.phone
    }
  });
});

export default router;