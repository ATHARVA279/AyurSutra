import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../utils/api';
import { format, isToday, isFuture, parseISO } from 'date-fns';
import Navbar from '../Layout/Navbar';
import SessionFeedbackModal from './SessionFeedbackModal';

interface Session {
  _id: string;
  scheduledDate: string;
  status: 'scheduled' | 'completed' | 'missed';
  stepIndex: number;
  regimenId: {
    name: string;
    steps: Array<{ procedureName: string; instructions: string }>;
  };
  practitionerId: {
    name: string;
    specialization: string;
  };
  feedback?: {
    rating: number;
    notes: string;
  };
}

interface Analytics {
  progress: {
    totalSessions: number;
    completedSessions: number;
    upcomingSessions: number;
    progressPercentage: number;
  };
  patient: {
    name: string;
    regimen?: {
      name: string;
      description: string;
    };
  };
}

const PatientDashboard: React.FC = () => {
  const { user } = useAuth();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedSession, setSelectedSession] = useState<Session | null>(null);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    if (!user) return;

    try {
      const [sessionsResponse, analyticsResponse] = await Promise.all([
        api.getPatientSchedule(user.id),
        api.getPatientAnalytics(user.id)
      ]);

      if (sessionsResponse.data) {
        setSessions(sessionsResponse.data);
      }

      if (analyticsResponse.data) {
        setAnalytics(analyticsResponse.data);
      }
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'text-green-600 bg-green-100';
      case 'scheduled':
        return 'text-blue-600 bg-blue-100';
      case 'missed':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <span className="text-green-600">✓</span>;
      case 'scheduled':
        return <span className="text-blue-600">🕐</span>;
      case 'missed':
        return <span className="text-red-600">⚠️</span>;
      default:
        return <span className="text-blue-600">🕐</span>;
    }
  };

  const openFeedbackModal = (session: Session) => {
    setSelectedSession(session);
    setShowFeedbackModal(true);
  };

  const handleFeedbackSubmit = async (rating: number, notes: string) => {
    if (!selectedSession || !user) return;

    try {
      await api.submitSessionFeedback(user.id, selectedSession._id, { rating, notes });
      setShowFeedbackModal(false);
      setSelectedSession(null);
      fetchData();
    } catch (error) {
      console.error('Failed to submit feedback:', error);
    }
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

  const upcomingSessions = sessions
    .filter(session => session.status === 'scheduled' && isFuture(parseISO(session.scheduledDate)))
    .slice(0, 3);

  const todaysSessions = sessions.filter(session => 
    isToday(parseISO(session.scheduledDate))
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Welcome back, {user?.name}</h1>
          <p className="text-gray-600">Track your Panchakarma journey and upcoming sessions</p>
        </div>

        {analytics && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <span className="h-8 w-8 text-emerald-600 text-2xl">📈</span>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Progress</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {analytics.progress.progressPercentage}%
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <span className="h-8 w-8 text-green-600 text-2xl">✅</span>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Completed</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {analytics.progress.completedSessions}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <span className="h-8 w-8 text-blue-600 text-2xl">🕐</span>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Upcoming</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {analytics.progress.upcomingSessions}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <span className="h-8 w-8 text-purple-600 text-2xl">📅</span>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Sessions</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {analytics.progress.totalSessions}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {analytics && (
          <div className="bg-white rounded-lg shadow p-6 mb-8">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">
                {analytics.patient.regimen?.name || 'Treatment Progress'}
              </h3>
              <span className="text-sm text-gray-500">
                {analytics.progress.completedSessions} of {analytics.progress.totalSessions} sessions
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div 
                className="bg-emerald-600 h-3 rounded-full transition-all duration-300"
                style={{ width: `${analytics.progress.progressPercentage}%` }}
              ></div>
            </div>
          </div>
        )}

        {todaysSessions.length > 0 && (
          <div className="bg-white rounded-lg shadow mb-8">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Today's Sessions</h3>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {todaysSessions.map((session) => (
                  <div key={session._id} className="border rounded-lg p-4 bg-blue-50">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900">
                          {session.regimenId.steps[session.stepIndex]?.procedureName}
                        </h4>
                        <p className="text-sm text-gray-600 mt-1">
                          {session.regimenId.steps[session.stepIndex]?.instructions}
                        </p>
                        <p className="text-sm text-gray-500 mt-2">
                          Dr. {session.practitionerId.name} • {format(parseISO(session.scheduledDate), 'h:mm a')}
                        </p>
                      </div>
                      <div className={`flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(session.status)}`}>
                        {getStatusIcon(session.status)}
                        <span className="ml-1 capitalize">{session.status}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Upcoming Sessions</h3>
          </div>
          <div className="p-6">
            {upcomingSessions.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No upcoming sessions scheduled.</p>
            ) : (
              <div className="space-y-4">
                {upcomingSessions.map((session) => (
                  <div key={session._id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <span className="text-gray-400">📅</span>
                          <span className="text-sm font-medium text-gray-900">
                            {format(parseISO(session.scheduledDate), 'EEEE, MMM d, yyyy')}
                          </span>
                        </div>
                        <h4 className="font-medium text-gray-900 mt-2">
                          {session.regimenId.steps[session.stepIndex]?.procedureName}
                        </h4>
                        <p className="text-sm text-gray-600 mt-1">
                          {session.regimenId.steps[session.stepIndex]?.instructions}
                        </p>
                        <p className="text-sm text-gray-500 mt-2">
                          Dr. {session.practitionerId.name} • {session.practitionerId.specialization}
                        </p>
                      </div>
                      <div className={`flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(session.status)}`}>
                        {getStatusIcon(session.status)}
                        <span className="ml-1 capitalize">{session.status}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow mt-8">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Recent Completed Sessions</h3>
          </div>
          <div className="p-6">
            {sessions.filter(s => s.status === 'completed').length === 0 ? (
              <p className="text-gray-500 text-center py-8">No completed sessions yet.</p>
            ) : (
              <div className="space-y-4">
                {sessions
                  .filter(session => session.status === 'completed')
                  .slice(0, 5)
                  .map((session) => (
                    <div key={session._id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2">
                            <span className="text-gray-400">📅</span>
                            <span className="text-sm font-medium text-gray-900">
                              {format(parseISO(session.scheduledDate), 'MMM d, yyyy')}
                            </span>
                          </div>
                          <h4 className="font-medium text-gray-900 mt-2">
                            {session.regimenId.steps[session.stepIndex]?.procedureName}
                          </h4>
                          <p className="text-sm text-gray-600 mt-1">
                            Dr. {session.practitionerId.name}
                          </p>
                          
                          {session.feedback ? (
                            <div className="flex items-center mt-2 text-sm text-gray-600">
                              <span className="text-yellow-400 mr-1">⭐</span>
                              <span>{session.feedback.rating}/5</span>
                              {session.feedback.notes && (
                                <span className="ml-2 text-gray-500">• {session.feedback.notes}</span>
                              )}
                            </div>
                          ) : (
                            <button
                              onClick={() => openFeedbackModal(session)}
                              className="mt-2 text-sm text-emerald-600 hover:text-emerald-700 font-medium"
                            >
                              Add Feedback
                            </button>
                          )}
                        </div>
                        <div className="flex items-center px-2 py-1 rounded-full text-xs font-medium text-green-600 bg-green-100">
                          <span className="text-green-600">✓</span>
                          <span className="ml-1">Completed</span>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {showFeedbackModal && selectedSession && (
        <SessionFeedbackModal
          session={selectedSession}
          onSubmit={handleFeedbackSubmit}
          onClose={() => setShowFeedbackModal(false)}
        />
      )}
    </div>
  );
};

export default PatientDashboard;