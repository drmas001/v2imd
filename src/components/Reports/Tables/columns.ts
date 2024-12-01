import { createColumnHelper } from '@tanstack/react-table';
import { formatDate } from '../../../utils/dateFormat';

const columnHelper = createColumnHelper<any>();

export const patientColumns = [
  columnHelper.accessor('mrn', {
    header: 'MRN',
    cell: info => info.getValue()
  }),
  columnHelper.accessor('name', {
    header: 'Patient Name',
    cell: info => info.getValue()
  }),
  columnHelper.accessor(row => row.admission_date, {
    id: 'admission_date',
    header: 'Admission Date',
    cell: info => formatDate(info.getValue())
  }),
  columnHelper.accessor(row => row.doctor_name, {
    id: 'doctor',
    header: 'Assigned Doctor',
    cell: info => info.getValue() || 'Not assigned'
  }),
  columnHelper.accessor(row => row.department, {
    id: 'department',
    header: 'Department',
    cell: info => info.getValue()
  })
];

export const consultationColumns = [
  columnHelper.accessor('mrn', {
    header: 'MRN',
    cell: info => info.getValue()
  }),
  columnHelper.accessor('patient_name', {
    header: 'Patient Name',
    cell: info => info.getValue()
  }),
  columnHelper.accessor('created_at', {
    header: 'Date',
    cell: info => formatDate(info.getValue())
  }),
  columnHelper.accessor('consultation_specialty', {
    header: 'Department',
    cell: info => info.getValue()
  })
];

export const appointmentColumns = [
  columnHelper.accessor('medicalNumber', {
    header: 'MRN',
    cell: info => info.getValue()
  }),
  columnHelper.accessor('patientName', {
    header: 'Patient Name',
    cell: info => info.getValue()
  }),
  columnHelper.accessor('createdAt', {
    header: 'Date',
    cell: info => formatDate(info.getValue())
  }),
  columnHelper.accessor('specialty', {
    header: 'Department',
    cell: info => info.getValue()
  })
];