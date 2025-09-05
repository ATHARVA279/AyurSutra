import React, { useState } from 'react';
import { X, CheckCircle } from 'lucide-react';

interface Session {
  _id: string;
  patientId: {
    name: string;
  };
  regimenId: {
    name: string;
    steps: Array<{
      procedureName: string;
      instructions: string;
    }>;
  };
  stepIndex: number;
  checklist: Array<{
    item: string;
    completed: boolean;
  }>;
  practitionerNotes?: string;
}

interface SessionCompletionModalProps {
  session: Session;
  onSubmit: (sessionId: string, data: any) => Promise<void>;
  onClose: () => void;
}

const SessionCompletionModal: React.FC<SessionCompletionModalProps> = ({
  session,
  onSubmit,
  onClose,
}) => {
  const [checklist, setChecklist] = useState(
    session.checklist.map(item => ({ ...item }))
  );
  const [notes, setNotes] = useState(session.practitionerNotes || '');
  const [submitting, setSubmitting] = useState(false);

  const toggleChecklistItem = (index: number) => {
    const updatedChecklist = checklist.map((item, i) =>
      i === index ? { ...item, completed: !item.completed } : item
    );
    setChecklist(updatedChecklist);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    setSubmitting(true);
    try {
      await onSubmit(session._id, {
        checklist,
        notes: notes.trim() || undefined
      });
    } catch (error) {
      console.error('Failed to complete session:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const currentStep = session.regimenId.steps[session.stepIndex];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium text-gray-900">Complete Session</h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="p-6">
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <h4 className="font-medium text-gray-900 mb-2">Session Details</h4>
            <div className="text-sm text-gray-600 space-y-1">
              <p><strong>Patient:</strong> {session.patientId.name}</p>
              <p><strong>Regimen:</strong> {session.regimenId.name}</p>
              <p><strong>Procedure:</strong> {currentStep?.procedureName}</p>
              <p><strong>Instructions:</strong> {currentStep?.instructions}</p>
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="mb-6">
              <h4 className="font-medium text-gray-900 mb-3">Procedure Checklist</h4>
              <div className="space-y-3">
                {checklist.map((item, index) => (
                  <div key={index} className="flex items-center">
                    <button
                      type="button"
                      onClick={() => toggleChecklistItem(index)}
                      className={`flex items-center justify-center w-5 h-5 rounded border-2 mr-3 transition-colors ${
                        item.completed
                          ? 'bg-emerald-600 border-emerald-600 text-white'
                          : 'border-gray-300 hover:border-emerald-500'
                      }`}
                    >
                      {item.completed && <CheckCircle className="w-3 h-3" />}
                    </button>
                    <span className={`text-sm ${item.completed ? 'text-gray-500 line-through' : 'text-gray-700'}`}>
                      {item.item}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Session Notes
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-emerald-500 focus:border-emerald-500"
                placeholder="Add any observations, patient response, or additional notes..."
              />
            </div>

            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-4 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 disabled:opacity-50"
              >
                {submitting ? 'Completing...' : 'Mark as Completed'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default SessionCompletionModal;