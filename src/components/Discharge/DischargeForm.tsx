import React, { useState, useEffect } from 'react';
import { AlertCircle } from 'lucide-react';
import { useDischargeStore } from '../../stores/useDischargeStore';
import { useConsultationStore } from '../../stores/useConsultationStore';
import DischargeTypeSelector from './DischargeTypeSelector';
import FollowUpSection from './FollowUpSection';
import DischargeNoteEditor from './DischargeNoteEditor';
import type { FormErrors } from '../../types/formErrors';

interface DischargeFormData {
  discharge_type: string;
  follow_up_required: boolean;
  follow_up_date: string;
  discharge_note: string;
}

const DischargeForm: React.FC = () => {
  const { selectedPatient, processDischarge } = useDischargeStore();
  const { consultations } = useConsultationStore();
  const [formData, setFormData] = useState<DischargeFormData>({
    discharge_type: '',
    follow_up_required: false,
    follow_up_date: '',
    discharge_note: ''
  });
  const [formErrors, setFormErrors] = useState<FormErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  // Check for active consultations
  const hasActiveConsultations = consultations.some(
    consultation => 
      consultation.patient_id === selectedPatient?.patient_id && 
      consultation.status === 'active'
  );

  if (!selectedPatient) {
    return null;
  }

  const validateForm = (): boolean => {
    const errors: FormErrors = {};

    if (hasActiveConsultations) {
      errors.submit = 'Please complete all active consultations before discharging the patient';
    }

    if (!formData.discharge_type) {
      errors.discharge_type = 'Please select a discharge type';
    }

    if (formData.follow_up_required && !formData.follow_up_date) {
      errors.follow_up_date = 'Please select a follow-up date';
    }

    if (!formData.discharge_note.trim()) {
      errors.discharge_note = 'Discharge note is required';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) {
      return;
    }

    setSubmitting(true);
    try {
      await processDischarge({
        discharge_date: new Date().toISOString(),
        discharge_type: formData.discharge_type as 'regular' | 'against-medical-advice' | 'transfer',
        follow_up_required: formData.follow_up_required,
        follow_up_date: formData.follow_up_date,
        discharge_note: formData.discharge_note,
        status: 'discharged'
      });
      setShowSuccess(true);
    } catch (error) {
      setFormErrors(prev => ({
        ...prev,
        submit: error instanceof Error ? error.message : 'Failed to process discharge'
      }));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {formErrors.submit && (
        <div className="p-4 bg-red-50 text-red-700 rounded-lg flex items-center space-x-2">
          <AlertCircle className="h-5 w-5" />
          <span>{formErrors.submit}</span>
        </div>
      )}

      {showSuccess && (
        <div className="p-4 bg-green-50 text-green-700 rounded-lg flex items-center space-x-2">
          <AlertCircle className="h-5 w-5" />
          <span>Patient discharged successfully!</span>
        </div>
      )}

      {hasActiveConsultations && (
        <div className="p-4 bg-yellow-50 text-yellow-800 rounded-lg flex items-center space-x-2">
          <AlertCircle className="h-5 w-5" />
          <div>
            <p className="font-medium">Active Consultations Present</p>
            <p className="text-sm">Please complete all active consultations before proceeding with discharge.</p>
          </div>
        </div>
      )}

      <DischargeTypeSelector
        value={formData.discharge_type}
        onChange={(value) => {
          setFormData(prev => ({ ...prev, discharge_type: value }));
          setFormErrors(prev => ({ ...prev, discharge_type: undefined }));
        }}
        error={formErrors.discharge_type}
      />

      <FollowUpSection
        followUpRequired={formData.follow_up_required}
        followUpDate={formData.follow_up_date}
        onFollowUpChange={(required) => {
          setFormData(prev => ({ 
            ...prev, 
            follow_up_required: required,
            follow_up_date: required ? prev.follow_up_date : ''
          }));
          setFormErrors(prev => ({ ...prev, follow_up_date: undefined }));
        }}
        onDateChange={(date) => {
          setFormData(prev => ({ ...prev, follow_up_date: date }));
          setFormErrors(prev => ({ ...prev, follow_up_date: undefined }));
        }}
        error={formErrors.follow_up_date}
      />

      <DischargeNoteEditor
        value={formData.discharge_note}
        onChange={(value) => {
          setFormData(prev => ({ ...prev, discharge_note: value }));
          setFormErrors(prev => ({ ...prev, discharge_note: undefined }));
        }}
        error={formErrors.discharge_note}
      />

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={submitting || hasActiveConsultations}
          className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
        >
          {submitting ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              <span>Processing...</span>
            </>
          ) : (
            <span>Process Discharge</span>
          )}
        </button>
      </div>
    </form>
  );
};

export default DischargeForm;