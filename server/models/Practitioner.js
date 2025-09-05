import mongoose from 'mongoose';

const practitionerSchema = new mongoose.Schema({
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
  passwordHash: {
    type: String,
    required: true
  },
  specialization: {
    type: String,
    required: true
  },
  regimensCreated: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Regimen'
  }],
  role: {
    type: String,
    default: 'practitioner'
  }
}, {
  timestamps: true
});

export default mongoose.model('Practitioner', practitionerSchema);