import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import Patient from './models/Patient.js';
import Practitioner from './models/Practitioner.js';
import Regimen from './models/Regimen.js';
import Session from './models/Session.js';

dotenv.config();

const seedData = async () => {
  try {
  await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB for seeding');

    await Promise.all([
      Patient.deleteMany({}),
      Practitioner.deleteMany({}),
      Regimen.deleteMany({}),
      Session.deleteMany({})
    ]);

    const hashedPassword = await bcrypt.hash('password123', 10);
    
    const practitioner = new Practitioner({
      name: 'Dr. Rajesh Sharma',
      email: 'dr.sharma@ayursutra.com',
      passwordHash: hashedPassword,
      specialization: 'Panchakarma Specialist'
    });

    await practitioner.save();

    const virechanaRegimen = new Regimen({
      name: 'Virechana 14-day Protocol',
      description: 'Complete Virechana therapy program for detoxification and rejuvenation',
      duration: 14,
      createdBy: practitioner._id,
      steps: [
        {
          dayOffset: 0,
          procedureName: 'Initial Consultation & Assessment',
          instructions: 'Complete medical history, pulse diagnosis, and constitutional assessment. Begin preparatory diet.'
        },
        {
          dayOffset: 1,
          procedureName: 'Deepana Pachana',
          instructions: 'Digestive fire enhancement with herbal formulations. Light diet and digestive herbs.'
        },
        {
          dayOffset: 2,
          procedureName: 'Deepana Pachana (Day 2)',
          instructions: 'Continue digestive preparation. Monitor digestive capacity and adjust herbs accordingly.'
        },
        {
          dayOffset: 3,
          procedureName: 'Snehana (Oleation) - Day 1',
          instructions: 'Begin internal oleation with medicated ghee. Start with small dose and gradually increase.'
        },
        {
          dayOffset: 4,
          procedureName: 'Snehana (Oleation) - Day 2',
          instructions: 'Continue internal oleation. Monitor for proper oleation signs.'
        },
        {
          dayOffset: 5,
          procedureName: 'Snehana (Oleation) - Day 3',
          instructions: 'Complete oleation process. Achieve full oleation signs before proceeding.'
        },
        {
          dayOffset: 6,
          procedureName: 'Rest Day & Preparation',
          instructions: 'Light diet, rest, and mental preparation for main procedure.'
        },
        {
          dayOffset: 7,
          procedureName: 'Swedana (Sudation)',
          instructions: 'Full body sudation therapy to prepare channels for elimination.'
        },
        {
          dayOffset: 8,
          procedureName: 'Virechana (Main Procedure)',
          instructions: 'Administration of purgative medicines for controlled elimination. Close monitoring required.'
        },
        {
          dayOffset: 9,
          procedureName: 'Samsarjana Krama - Day 1',
          instructions: 'Begin graduated diet regimen with rice water and simple preparations.'
        },
        {
          dayOffset: 10,
          procedureName: 'Samsarjana Krama - Day 2',
          instructions: 'Progress to semi-solid foods. Monitor digestion and energy levels.'
        },
        {
          dayOffset: 11,
          procedureName: 'Samsarjana Krama - Day 3',
          instructions: 'Introduce more solid foods gradually. Assess digestive strength.'
        },
        {
          dayOffset: 12,
          procedureName: 'Recovery & Rasayana',
          instructions: 'Begin rejuvenating therapies and herbal preparations for tissue building.'
        },
        {
          dayOffset: 13,
          procedureName: 'Final Assessment & Guidelines',
          instructions: 'Complete evaluation, lifestyle recommendations, and maintenance protocols.'
        }
      ]
    });

    await virechanaRegimen.save();

    const patient1 = new Patient({
      name: 'Priya Patel',
      email: 'priya.patel@email.com',
      phone: '+91-9876543210',
      passwordHash: hashedPassword,
      assignedRegimen: virechanaRegimen._id
    });

    const patient2 = new Patient({
      name: 'Arjun Kumar',
      email: 'arjun.kumar@email.com',
      phone: '+91-9876543211',
      passwordHash: hashedPassword
    });

    await Promise.all([patient1.save(), patient2.save()]);

    const sessions = [];
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 5);

    for (const step of virechanaRegimen.steps) {
      const sessionDate = new Date(startDate);
      sessionDate.setDate(startDate.getDate() + step.dayOffset);

      const session = new Session({
        patientId: patient1._id,
        regimenId: virechanaRegimen._id,
        stepIndex: virechanaRegimen.steps.indexOf(step),
        scheduledDate: sessionDate,
        practitionerId: practitioner._id,
        status: step.dayOffset < 6 ? 'completed' : 'scheduled',
        checklist: [
          { item: 'Patient preparation completed', completed: step.dayOffset < 6 },
          { item: 'Procedure executed properly', completed: step.dayOffset < 6 },
          { item: 'Post-procedure care given', completed: step.dayOffset < 6 }
        ]
      });

      if (step.dayOffset < 6) {
        session.feedback = {
          rating: Math.floor(Math.random() * 2) + 4, 
          notes: ['Felt very relaxed', 'Good experience', 'Slight discomfort but manageable', 'Feeling much better'][Math.floor(Math.random() * 4)]
        };
      }

      const savedSession = await session.save();
      sessions.push(savedSession);
    }

    patient1.sessions = sessions.map(s => s._id);
    await patient1.save();

    practitioner.regimensCreated.push(virechanaRegimen._id);
    await practitioner.save();

    console.log('Seed data created successfully!');
    console.log('Practitioner login: dr.sharma@ayursutra.com / password123');
    console.log('Patient login: priya.patel@email.com / password123');
    console.log('Patient login: arjun.kumar@email.com / password123');

  } catch (error) {
    console.error('Seeding error:', error);
  } finally {
    await mongoose.connection.close();
  }
};

seedData();