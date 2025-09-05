import mongoose from 'mongoose';

const regimenSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  steps: [{
    dayOffset: {
      type: Number,
      required: true
    },
    procedureName: {
      type: String,
      required: true
    },
    instructions: {
      type: String,
      required: true
    }
  }],
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Practitioner',
    required: true
  },
  duration: {
    type: Number,
    required: true
  }
}, {
  timestamps: true
});

export default mongoose.model('Regimen', regimenSchema);