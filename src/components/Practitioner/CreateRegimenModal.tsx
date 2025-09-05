import React, { useState } from 'react';
import { X, Plus, Trash2 } from 'lucide-react';

interface RegimenStep {
  dayOffset: number;
  procedureName: string;
  instructions: string;
}

interface CreateRegimenModalProps {
  onSubmit: (regimen: any) => Promise<void>;
  onClose: () => void;
}

const CreateRegimenModal: React.FC<CreateRegimenModalProps> = ({
  onSubmit,
  onClose,
}) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
  });
  const [steps, setSteps] = useState<RegimenStep[]>([
    { dayOffset: 0, procedureName: '', instructions: '' }
  ]);
  const [submitting, setSubmitting] = useState(false);

  const addStep = () => {
    const lastDay = steps.length > 0 ? Math.max(...steps.map(s => s.dayOffset)) : -1;
    setSteps([
      ...steps,
      { dayOffset: lastDay + 1, procedureName: '', instructions: '' }
    ]);
  };

  const removeStep = (index: number) => {
    if (steps.length > 1) {
      setSteps(steps.filter((_, i) => i !== index));
    }
  };

  const updateStep = (index: number, field: keyof RegimenStep, value: string | number) => {
    const updatedSteps = steps.map((step, i) =>
      i === index ? { ...step, [field]: value } : step
    );
    setSteps(updatedSteps);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.description || steps.some(step => !step.procedureName || !step.instructions)) {
      return;
    }

    setSubmitting(true);
    try {
      await onSubmit({
        ...formData,
        steps: steps.sort((a, b) => a.dayOffset - b.dayOffset)
      });
    } catch (error) {
      console.error('Failed to create regimen:', error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium text-gray-900">Create New Regimen</h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Regimen Name
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-emerald-500 focus:border-emerald-500"
                placeholder="e.g., Virechana 14-day Protocol"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-emerald-500 focus:border-emerald-500"
                placeholder="Brief description of the regimen..."
                required
              />
            </div>
          </div>

          <div className="mb-6">
            <div className="flex justify-between items-center mb-4">
              <h4 className="text-sm font-medium text-gray-700">Treatment Steps</h4>
              <button
                type="button"
                onClick={addStep}
                className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-emerald-700 bg-emerald-100 hover:bg-emerald-200"
              >
                <Plus className="h-4 w-4 mr-1" />
                Add Step
              </button>
            </div>

            <div className="space-y-4">
              {steps.map((step, index) => (
                <div key={index} className="border rounded-lg p-4 bg-gray-50">
                  <div className="flex justify-between items-start mb-3">
                    <h5 className="text-sm font-medium text-gray-800">Step {index + 1}</h5>
                    {steps.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeStep(index)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">
                        Day
                      </label>
                      <input
                        type="number"
                        value={step.dayOffset}
                        onChange={(e) => updateStep(index, 'dayOffset', parseInt(e.target.value) || 0)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 text-sm"
                        min="0"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">
                        Procedure Name
                      </label>
                      <input
                        type="text"
                        value={step.procedureName}
                        onChange={(e) => updateStep(index, 'procedureName', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 text-sm"
                        placeholder="e.g., Snehana (Oleation)"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">
                        Instructions
                      </label>
                      <textarea
                        value={step.instructions}
                        onChange={(e) => updateStep(index, 'instructions', e.target.value)}
                        rows={2}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 text-sm"
                        placeholder="Detailed instructions for this step..."
                        required
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
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
              {submitting ? 'Creating...' : 'Create Regimen'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateRegimenModal;