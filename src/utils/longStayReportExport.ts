import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { format } from 'date-fns';
import type { Patient } from '../types/patient';

interface ExportOptions {
  dateRange?: {
    startDate: string;
    endDate: string;
  };
}

export const exportLongStayReport = async (patients: Patient[], options: ExportOptions): Promise<void> => {
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
        startY: currentY,
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
        }),
        styles: { fontSize: 10 },
        headStyles: { fillColor: [79, 70, 229] }
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
    console.error('Error generating long stay report:', error);
    throw new Error('Failed to generate long stay report');
  }
};