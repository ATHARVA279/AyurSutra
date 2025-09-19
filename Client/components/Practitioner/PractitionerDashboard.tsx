import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../utils/api';
import { format, parseISO } from 'date-fns';
import Navbar from '../Layout/Navbar';
import CreateRegimenModal from './CreateRegimenModal';
import AssignRegimenModal from './AssignRegimenModal';
import TodaysSessionsPanel from './TodaysSessionsPanel';

interface Analytics {
  totalPatients: number;
  totalSessions: number;
  completedSessions: number;
  completionRate: number;
  todaysSessions: number;
}

interface Patient {
  _id: string;
  name: string;
  email: string;
  phone: string;
  assignedRegimen?: {
    name: string;
    description: string;
    duration: number;
  };
}

interface Regimen {
  _id: string;
  name: string;
  description: string;
  duration: number;
  steps: Array<{
    dayOffset: number;
    procedureName: string;
    instructions: string;
  }>;
  createdBy: {
    name: string;
  };
}

const PractitionerDashboard: React.FC = () => {
  const { user } = useAuth();
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [regimens, setRegimens] = useState<Regimen[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<string>('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [analyticsRes, patientsRes, regimensRes] = await Promise.all([
        api.getCenterAnalytics(),
        api.getPatients(),
        api.getRegimens()
      ]);

      if (analyticsRes.data) setAnalytics(analyticsRes.data);
      if (patientsRes.data) setPatients(patientsRes.data);
      if (regimensRes.data) setRegimens(regimensRes.data);
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateRegimen = async (regimenData: any) => {
    try {
      await api.createRegimen(regimenData);
      setShowCreateModal(false);
      fetchData(); 
    } catch (error) {
      console.error('Failed to create regimen:', error);
    }
  };

  const handleAssignRegimen = async (regimenId: string, patientId: string, startDate: string) => {
    try {
      await api.assignRegimen(regimenId, patientId, startDate);
      setShowAssignModal(false);
      setSelectedPatient('');
      fetchData(); 
    } catch (error) {
      console.error('Failed to assign regimen:', error);
    }
  };

  const openAssignModal = (patientId: string) => {
    setSelectedPatient(patientId);
    setShowAssignModal(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Practitioner Dashboard</h1>
          <p className="text-gray-600">Manage your patients, regimens, and sessions</p>
        </div>

        {analytics && (
          <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <span className="h-8 w-8 text-blue-600 text-2xl">👥</span>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Patients</p>
                  <p className="text-2xl font-bold text-gray-900">{analytics.totalPatients}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <span className="h-8 w-8 text-purple-600 text-2xl">📅</span>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Sessions</p>
                  <p className="text-2xl font-bold text-gray-900">{analytics.totalSessions}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <span className="h-8 w-8 text-green-600 text-2xl">✅</span>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Completed</p>
                  <p className="text-2xl font-bold text-gray-900">{analytics.completedSessions}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <span className="h-8 w-8 text-emerald-600 text-2xl">📈</span>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Completion Rate</p>
                  <p className="text-2xl font-bold text-gray-900">{analytics.completionRate}%</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <span className="h-8 w-8 text-orange-600 text-2xl">🗓️</span>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Today's Sessions</p>
                  <p className="text-2xl font-bold text-gray-900">{analytics.todaysSessions}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        <TodaysSessionsPanel onRefresh={fetchData} />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
              <h3 className="text-lg font-medium text-gray-900">Patients</h3>
            </div>
            <div className="p-6">
              {patients.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No patients found.</p>
              ) : (
                <div className="space-y-4">
                  {patients.map((patient) => (
                    <div key={patient._id} className="border rounded-lg p-4 hover:bg-gray-50">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900">{patient.name}</h4>
                          <p className="text-sm text-gray-600">{patient.email}</p>
                          <p className="text-sm text-gray-500">{patient.phone}</p>
                          {patient.assignedRegimen ? (
                            <div className="mt-2">
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">
                                {patient.assignedRegimen.name}
                              </span>
                            </div>
                          ) : (
                            <div className="mt-2">
                              <button
                                onClick={() => openAssignModal(patient._id)}
                                className="text-xs text-emerald-600 hover:text-emerald-700 font-medium"
                              >
                                Assign Regimen
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
              <h3 className="text-lg font-medium text-gray-900">Treatment Regimens</h3>
              <button
                onClick={() => setShowCreateModal(true)}
                className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500"
              >
                <span className="text-lg mr-1">➕</span>
                Create New
              </button>
            </div>
            <div className="p-6">
              {regimens.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No regimens created yet.</p>
              ) : (
                <div className="space-y-4">
                  {regimens.map((regimen) => (
                    <div key={regimen._id} className="border rounded-lg p-4 hover:bg-gray-50">
                      <h4 className="font-medium text-gray-900">{regimen.name}</h4>
                      <p className="text-sm text-gray-600 mt-1">{regimen.description}</p>
                      <div className="mt-2 flex items-center text-sm text-gray-500">
                        <span>{regimen.duration} days</span>
                        <span className="mx-2">•</span>
                        <span>{regimen.steps.length} procedures</span>
                        <span className="mx-2">•</span>
                        <span>Created by {regimen.createdBy.name}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {showCreateModal && (
        <CreateRegimenModal
          onSubmit={handleCreateRegimen}
          onClose={() => setShowCreateModal(false)}
        />
      )}

      {showAssignModal && (
        <AssignRegimenModal
          patientId={selectedPatient}
          patients={patients}
          regimens={regimens}
          onSubmit={handleAssignRegimen}
          onClose={() => {
            setShowAssignModal(false);
            setSelectedPatient('');
          }}
        />
      )}
    </div>
  );
};

export default PractitionerDashboard;