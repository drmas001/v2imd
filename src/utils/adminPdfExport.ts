import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { format } from 'date-fns';
import { PDF_CONSTANTS } from './pdf/constants';
import { PDFGenerationError } from './pdf/error';
import { ASSETS } from '../config/assets';
import type { ExportData } from '../types/report';

export const exportAdminPDF = async (data: ExportData): Promise<void> => {
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
    doc.text(data.title || 'IMD-Care Report', pageWidth / 2, currentY + 15, { align: 'center' });
    
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

    // Add summary section
    doc.setFontSize(14);
    doc.text('Summary Statistics', 14, currentY);
    currentY += 10;

    const summaryData = [
      ['Total Active Patients', data.patients.filter(p => p.admissions?.some(a => a.status === 'active')).length.toString()],
      ['Total Active Consultations', data.consultations.filter(c => c.status === 'active').length.toString()],
      ['Total Appointments', data.appointments.length.toString()]
    ];

    autoTable(doc, {
      startY: currentY,
      head: [['Metric', 'Count']],
      body: summaryData,
      styles: { fontSize: 10 },
      headStyles: { fillColor: PDF_CONSTANTS.COLORS.PRIMARY as [number, number, number] },
      margin: { left: 14 },
      tableWidth: 100
    });

    // Add footer with page numbers
    const pageCount = doc.getNumberOfPages();
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
    doc.save(`imd-care-report-${format(new Date(), 'dd-MM-yyyy-HHmm')}.pdf`);
  } catch (error) {
    throw new PDFGenerationError(
      'Failed to generate administrative report',
      { originalError: error },
      'PDF_GENERATION_ERROR'
    );
  }
};

export { exportAdminReport } from './pdf/export';