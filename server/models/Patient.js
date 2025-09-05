import mongoose from 'mongoose';

const patientSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true
  },
  phone: {
    type: String,
    required: true
  },
  passwordHash: {
    type: String,
    required: true
  },
  assignedRegimen: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Regimen',
    default: null
  },
  sessions: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Session'
  }],
  feedback: [{
    sessionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Session'
    },
    rating: {
      type: Number,
      min: 1,
      max: 5
    },
    notes: String,
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  role: {
    type: String,
    default: 'patient'
  }
}, {
  timestamps: true
});

export default mongoose.model('Patient', patientSchema);