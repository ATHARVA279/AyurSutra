import React, { useState, useEffect } from 'react';
import { Calendar, CheckCircle, Clock, User } from 'lucide-react';
import api from '../../utils/api';
import { format, parseISO } from 'date-fns';
import SessionCompletionModal from './SessionCompletionModal';

interface Session {
  _id: string;
  scheduledDate: string;
  status: 'scheduled' | 'completed' | 'missed';
  stepIndex: number;
  patientId: {
    name: string;
    email: string;
    phone: string;
  };
  regimenId: {
    name: string;
    steps: Array<{
      procedureName: string;
      instructions: string;
    }>;
  };
  checklist: Array<{
    item: string;
    completed: boolean;
  }>;
  practitionerNotes?: string;
}

interface TodaysSessionsPanelProps {
  onRefresh: () => void;
}

const TodaysSessionsPanel: React.FC<TodaysSessionsPanelProps> = ({ onRefresh }) => {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSession, setSelectedSession] = useState<Session | null>(null);
  const [showCompletionModal, setShowCompletionModal] = useState(false);

  useEffect(() => {
    fetchTodaysSessions();
  }, []);

  const fetchTodaysSessions = async () => {
    try {
      const response = await api.getTodaysSessions();
      if (response.data) {
        setSessions(response.data);
      }
    } catch (error) {
      console.error('Failed to fetch today\'s sessions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCompleteSession = (session: Session) => {
    setSelectedSession(session);
    setShowCompletionModal(true);
  };

  const handleSessionCompletion = async (sessionId: string, data: any) => {
    try {
      await api.completeSession(sessionId, data);
      setShowCompletionModal(false);
      setSelectedSession(null);
      fetchTodaysSessions();
      onRefresh();
    } catch (error) {
      console.error('Failed to complete session:', error);
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
        return <CheckCircle className="h-4 w-4" />;
      case 'scheduled':
        return <Clock className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Today's Sessions</h3>
        </div>
        <div className="p-6 flex justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500"></div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="bg-white rounded-lg shadow mb-8">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium text-gray-900">Today's Sessions</h3>
            <div className="flex items-center text-sm text-gray-500">
              <Calendar className="h-4 w-4 mr-1" />
              {format(new Date(), 'EEEE, MMM d, yyyy')}
            </div>
          </div>
        </div>
        
        <div className="p-6">
          {sessions.length === 0 ? (
            <div className="text-center py-8">
              <Calendar className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No sessions scheduled for today.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {sessions.map((session) => (
                <div
                  key={session._id}
                  className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <User className="h-4 w-4 text-gray-400" />
                        <span className="font-medium text-gray-900">
                          {session.patientId.name}
                        </span>
                        <span className="text-sm text-gray-500">
                          {session.patientId.phone}
                        </span>
                      </div>
                      
                      <h4 className="font-medium text-gray-900 mb-1">
                        {session.regimenId.steps[session.stepIndex]?.procedureName}
                      </h4>
                      
                      <p className="text-sm text-gray-600 mb-2">
                        {session.regimenId.steps[session.stepIndex]?.instructions}
                      </p>
                      
                      <div className="text-sm text-gray-500">
                        <span className="font-medium">{session.regimenId.name}</span>
                        <span className="mx-2">•</span>
                        <span>Step {session.stepIndex + 1}</span>
                        <span className="mx-2">•</span>
                        <span>{format(parseISO(session.scheduledDate), 'h:mm a')}</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      <div className={`flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(session.status)}`}>
                        {getStatusIcon(session.status)}
                        <span className="ml-1 capitalize">{session.status}</span>
                      </div>
                      
                      {session.status === 'scheduled' && (
                        <button
                          onClick={() => handleCompleteSession(session)}
                          className="px-3 py-1 text-xs font-medium text-emerald-700 bg-emerald-100 hover:bg-emerald-200 rounded-md transition-colors"
                        >
                          Mark Complete
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {showCompletionModal && selectedSession && (
        <SessionCompletionModal
          session={selectedSession}
          onSubmit={handleSessionCompletion}
          onClose={() => {
            setShowCompletionModal(false);
            setSelectedSession(null);
          }}
        />
      )}
    </>
  );
};

export default TodaysSessionsPanel;