import mongoose from 'mongoose';

const sessionSchema = new mongoose.Schema({
  patientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Patient',
    required: true
  },
  regimenId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Regimen',
    required: true
  },
  stepIndex: {
    type: Number,
    required: true
  },
  scheduledDate: {
    type: Date,
    required: true
  },
  status: {
    type: String,
    enum: ['scheduled', 'completed', 'missed'],
    default: 'scheduled'
  },
  practitionerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Practitioner',
    required: true
  },
  checklist: [{
    item: String,
    completed: {
      type: Boolean,
      default: false
    }
  }],
  feedback: {
    rating: Number,
    notes: String
  },
  practitionerNotes: String
}, {
  timestamps: true
});

export default mongoose.model('Session', sessionSchema);