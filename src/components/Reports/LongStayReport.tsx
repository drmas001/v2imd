import React, { useState, useEffect } from 'react';
import { Clock, AlertCircle, FileText, Download, RefreshCw } from 'lucide-react';
import { useLongStayStore } from '../../stores/useLongStayStore';
import { formatDate } from '../../utils/dateFormat';
import { calculateStay, LONG_STAY_THRESHOLD } from '../../utils/stayCalculator';
import { exportLongStayReport } from '../../utils/longStayReportExport';
import SafetyBadge from '../PatientProfile/SafetyBadge';
import DoctorDisplay from '../DoctorDisplay';

const REFRESH_INTERVAL = 300000; // 5 minutes in milliseconds

const LongStayReport: React.FC = () => {
  const { patients, loading, error, lastUpdate, fetchLongStayPatients } = useLongStayStore();
  const [isExporting, setIsExporting] = useState(false);
  const [exportError, setExportError] = useState<string | null>(null);
  const [selectedDepartment, setSelectedDepartment] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Initial fetch and setup refresh intervals
  useEffect(() => {
    const fetchData = async () => {
      await fetchLongStayPatients();
    };

    fetchData();

    // Refresh data every 5 minutes
    const refreshInterval = setInterval(fetchData, REFRESH_INTERVAL);

    // Set up daily refresh at midnight
    const now = new Date();
    const tomorrow = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
    const timeUntilMidnight = tomorrow.getTime() - now.getTime();
    
    const midnightTimeout = setTimeout(() => {
      fetchData();
      // Set up daily interval after first midnight
      const dailyRefresh = setInterval(fetchData, 86400000); // 24 hours
      return () => clearInterval(dailyRefresh);
    }, timeUntilMidnight);

    return () => {
      clearInterval(refreshInterval);
      clearTimeout(midnightTimeout);
    };
  }, [fetchLongStayPatients]);

  const handleExport = async () => {
    if (isExporting) return;
    setIsExporting(true);
    setExportError(null);

    try {
      await exportLongStayReport(filteredPatients, {
        dateRange: {
          startDate: new Date().toISOString().split('T')[0],
          endDate: new Date().toISOString().split('T')[0]
        }
      });
    } catch (error) {
      console.error('Export error:', error);
      setExportError('Failed to export long stay report. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  // Filter patients based on department and search query
  const filteredPatients = patients.filter(patient => {
    const admission = patient.admissions?.[0];
    if (!admission) return false; // Exclude patients with no admissions
    if (admission.discharge_date) return false; // Exclude discharged patients
    const matchesDepartment = selectedDepartment === 'all' || patient.department === selectedDepartment;
    const matchesSearch = searchQuery === '' || 
      patient.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      patient.mrn.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesDepartment && matchesSearch;
  });

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-center">
          <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center space-x-2 text-red-600">
          <AlertCircle className="h-5 w-5" />
          <span>{error}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <Clock className="h-6 w-6 text-gray-400" />
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Long Stay Patients</h2>
              <p className="text-sm text-gray-600">
                Active patients hospitalized over {LONG_STAY_THRESHOLD} days
              </p>
            </div>
          </div>
          <button
            onClick={handleExport}
            disabled={isExporting || filteredPatients.length === 0}
            className="flex items-center space-x-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50"
          >
            {isExporting ? (
              <>
                <RefreshCw className="h-4 w-4 animate-spin" />
                <span>Exporting...</span>
              </>
            ) : (
              <>
                <Download className="h-4 w-4" />
                <span>Export Report</span>
              </>
            )}
          </button>
        </div>

        {exportError && (
          <div className="mt-4 p-4 bg-red-50 text-red-700 rounded-lg flex items-center space-x-2">
            <AlertCircle className="h-5 w-5" />
            <span>{exportError}</span>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Department Filter
            </label>
            <select
              value={selectedDepartment}
              onChange={(e) => setSelectedDepartment(e.target.value)}
              className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-600 focus:border-transparent"
            >
              <option value="all">All Departments</option>
              {Array.from(new Set(patients.map(p => p.department))).map(dept => (
                <option key={dept} value={dept}>{dept}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Search
            </label>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name or MRN..."
              className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-600 focus:border-transparent"
            />
          </div>
        </div>

        {lastUpdate && (
          <div className="mt-4 text-sm text-gray-500">
            Last updated: {lastUpdate.toLocaleTimeString()}
          </div>
        )}
      </div>

      <div className="p-6">
        {filteredPatients.length === 0 ? (
          <div className="text-center py-12">
            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Long Stay Patients</h3>
            <p className="text-gray-500">
              Currently there are no active patients with stays longer than {LONG_STAY_THRESHOLD} days
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredPatients.map(patient => {
              const admission = patient.admissions?.[0];
              if (!admission) return null;

              const stayDuration = calculateStay(admission.admission_date);

              return (
                <div
                  key={patient.id}
                  className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="space-y-2">
                      <div className="flex items-center space-x-3">
                        <h3 className="text-lg font-medium text-gray-900">{patient.name}</h3>
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                          {stayDuration} days
                        </span>
                        {admission.safety_type && (
                          <SafetyBadge type={admission.safety_type} />
                        )}
                      </div>
                      
                      <p className="text-sm text-gray-600">MRN: {patient.mrn}</p>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-gray-600">Admission Date</p>
                          <p className="text-sm font-medium text-gray-900">
                            {formatDate(admission.admission_date)}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Department</p>
                          <p className="text-sm font-medium text-gray-900">
                            {admission.department}
                          </p>
                        </div>
                      </div>

                      <div className="mt-2">
                        <DoctorDisplay 
                          doctor={admission.admitting_doctor}
                          showIcon={true}
                        />
                      </div>

                      {admission.diagnosis && (
                        <div className="mt-2">
                          <p className="text-sm text-gray-600">Diagnosis</p>
                          <p className="text-sm font-medium text-gray-900">
                            {admission.diagnosis}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default LongStayReport;