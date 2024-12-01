import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { format } from 'date-fns';
import { ASSETS } from '../config/assets';
import type { ExportData } from '../types/report';
import { PDF_CONSTANTS } from './pdf/constants';
import { createTableOptions } from './pdf/tables';
import { PDFGenerationError } from './pdf/error';

export const exportDailyReport = async (data: ExportData): Promise<void> => {
  try {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.width;
    let currentY = 15;

    // Add logo and header
    try {
      const logoResponse = await fetch(ASSETS.LOGO.PDF);
      if (logoResponse.ok) {
        const logoBlob = await logoResponse.blob();
        const reader = new FileReader();
        reader.readAsDataURL(logoBlob);
        await new Promise((resolve) => {
          reader.onloadend = () => {
            const logoData = reader.result as string;
            doc.addImage(logoData, 'PNG', 15, currentY, 30, 30);
            resolve(null);
          };
        });
      }
    } catch (error) {
      console.error('Error adding logo to PDF:', error);
    }

    // Add title
    doc.setFontSize(20);
    doc.text('IMD-Care Daily Report', pageWidth / 2, currentY + 15, { align: 'center' });
    
    currentY += 25;
    doc.setFontSize(12);
    doc.text(`Generated on: ${format(new Date(), 'dd/MM/yyyy HH:mm')}`, pageWidth / 2, currentY, { align: 'center' });
    
    currentY += 7;
    doc.text(
      `Period: ${format(new Date(data.dateFilter.startDate), 'dd/MM/yyyy')} to ${format(new Date(data.dateFilter.endDate), 'dd/MM/yyyy')}`,
      pageWidth / 2,
      currentY,
      { align: 'center' }
    );
    
    currentY += 15;

    // Medical Consultations Section
    if (data.consultations.length > 0) {
      doc.setFontSize(14);
      doc.text('Medical Consultations', 14, currentY);
      currentY += 10;

      autoTable(doc, {
        ...createTableOptions(currentY),
        head: [['Patient', 'MRN', 'Specialty', 'Doctor', 'Created', 'Urgency']],
        body: data.consultations.map(consultation => [
          consultation.patient_name,
          consultation.mrn,
          consultation.consultation_specialty,
          consultation.doctor_name || 'Pending',
          format(new Date(consultation.created_at), 'dd/MM/yyyy HH:mm'),
          consultation.urgency
        ])
      });

      currentY = (doc as any).lastAutoTable.finalY + 15;
    }

    // Clinic Appointments Section
    if (data.appointments.length > 0) {
      doc.setFontSize(14);
      doc.text('Clinic Appointments', 14, currentY);
      currentY += 10;

      autoTable(doc, {
        ...createTableOptions(currentY),
        head: [['Patient', 'Medical Number', 'Specialty', 'Type', 'Status']],
        body: data.appointments.map(appointment => [
          appointment.patientName,
          appointment.medicalNumber,
          appointment.specialty,
          appointment.appointmentType,
          appointment.status
        ])
      });

      currentY = (doc as any).lastAutoTable.finalY + 15;
    }

    // Add summary section
    doc.setFontSize(14);
    doc.text('Summary', 14, currentY);
    currentY += 10;

    const summaryData = [
      ['Total Medical Consultations', data.consultations.length.toString()],
      ['Total Clinic Appointments', data.appointments.length.toString()],
      ['Emergency Consultations', data.consultations.filter(c => c.urgency === 'emergency').length.toString()],
      ['Urgent Consultations', data.consultations.filter(c => c.urgency === 'urgent').length.toString()]
    ];

    autoTable(doc, {
      ...createTableOptions(currentY),
      head: [['Metric', 'Count']],
      body: summaryData,
      margin: { left: 14 },
      tableWidth: 100
    });

    // Add footer with page numbers
    const pageCount = (doc as any).internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(10);
      doc.setTextColor(...PDF_CONSTANTS.COLORS.SECONDARY);
      doc.text(
        `Page ${i} of ${pageCount}`,
        pageWidth / 2,
        doc.internal.pageSize.height - 10,
        { align: 'center' }
      );
    }

    // Save the PDF
    doc.save(`imd-care-daily-report-${format(new Date(), 'dd-MM-yyyy-HHmm')}.pdf`);
  } catch (error) {
    throw new PDFGenerationError(
      'Failed to generate daily report',
      { originalError: error },
      'PDF_GENERATION_ERROR'
    );
  }
};

export const exportLongStayReport = async (patients: any[], options: { dateRange?: { startDate: string; endDate: string } }): Promise<void> => {
  try {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.width;
    let currentY = 15;

    // Add header
    doc.setFontSize(20);
    doc.text('Long Stay Patient Report', pageWidth / 2, currentY, { align: 'center' });
    
    currentY += 10;
    doc.setFontSize(12);
    doc.text(`Generated on: ${format(new Date(), 'dd/MM/yyyy HH:mm')}`, pageWidth / 2, currentY, { align: 'center' });

    if (options.dateRange) {
      currentY += 7;
      doc.text(
        `Period: ${format(new Date(options.dateRange.startDate), 'dd/MM/yyyy')} to ${format(new Date(options.dateRange.endDate), 'dd/MM/yyyy')}`,
        pageWidth / 2,
        currentY,
        { align: 'center' }
      );
    }
    
    currentY += 15;

    // Add patient table
    if (patients.length > 0) {
      autoTable(doc, {
        ...createTableOptions(currentY),
        head: [['Patient Name', 'MRN', 'Department', 'Doctor', 'Admission Date', 'Stay Duration']],
        body: patients.map(patient => {
          const admission = patient.admissions?.[0];
          if (!admission) return [];
          
          const stayDuration = Math.ceil(
            (new Date().getTime() - new Date(admission.admission_date).getTime()) / 
            (1000 * 60 * 60 * 24)
          );
          
          return [
            patient.name,
            patient.mrn,
            admission.department,
            admission.admitting_doctor?.name || 'Not assigned',
            format(new Date(admission.admission_date), 'dd/MM/yyyy'),
            `${stayDuration} days`
          ];
        })
      });

      currentY = (doc as any).lastAutoTable.finalY + 15;
    } else {
      doc.setFontSize(12);
      doc.text('No long stay patients found.', 14, currentY);
      currentY += 15;
    }

    // Add footer with page numbers
    const pageCount = (doc as any).internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(10);
      doc.setTextColor(...PDF_CONSTANTS.COLORS.SECONDARY);
      doc.text(
        `Page ${i} of ${pageCount}`,
        pageWidth / 2,
        doc.internal.pageSize.height - 10,
        { align: 'center' }
      );
    }

    // Save the PDF
    doc.save(`long-stay-report-${format(new Date(), 'dd-MM-yyyy-HHmm')}.pdf`);
  } catch (error) {
    throw new PDFGenerationError(
      'Failed to generate long stay report',
      { originalError: error },
      'PDF_GENERATION_ERROR'
    );
  }
};