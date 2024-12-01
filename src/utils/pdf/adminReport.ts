import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { format } from 'date-fns';
import { PDF_CONSTANTS } from './constants';
import { PDFGenerationError } from './error';
import { ASSETS } from '../../config/assets';
import type { ExportData } from '../../types/report';
import type { TableRow } from '../../types/pdf';

interface PDFWithAutoTable extends jsPDF {
  lastAutoTable: {
    finalY: number;
  };
}

export const generateAdminReport = async (data: ExportData): Promise<jsPDF> => {
  try {
    const doc = new jsPDF() as PDFWithAutoTable;
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
    doc.text('IMD-Care Administrative Report', doc.internal.pageSize.width / 2, currentY + 15, { align: 'center' });
    
    currentY += 25;
    doc.setFontSize(12);
    doc.text(`Generated on: ${format(new Date(), 'dd/MM/yyyy HH:mm')}`, doc.internal.pageSize.width / 2, currentY, { align: 'center' });
    
    currentY += 7;
    doc.text(
      `Period: ${format(new Date(data.dateFilter.startDate), 'dd/MM/yyyy')} to ${format(new Date(data.dateFilter.endDate), 'dd/MM/yyyy')}`,
      doc.internal.pageSize.width / 2,
      currentY,
      { align: 'center' }
    );
    
    currentY += 15;

    // Add summary section
    doc.setFontSize(14);
    doc.text('Summary Statistics', 14, currentY);
    currentY += 10;

    const summaryData: TableRow[] = [
      {
        cells: [
          { content: 'Total Active Patients' },
          { content: data.patients.filter(p => p.admissions?.[0]?.status === 'active').length.toString() }
        ]
      },
      {
        cells: [
          { content: 'Total Active Consultations' },
          { content: data.consultations.filter(c => c.status === 'active').length.toString() }
        ]
      },
      {
        cells: [
          { content: 'Total Appointments' },
          { content: data.appointments.length.toString() }
        ]
      }
    ];

    autoTable(doc, {
      startY: currentY,
      head: [['Metric', 'Count']],
      body: summaryData.map(row => row.cells.map(cell => cell.content)),
      styles: { fontSize: 10 },
      headStyles: { fillColor: PDF_CONSTANTS.COLORS.PRIMARY },
      margin: { left: 14 },
      tableWidth: 100
    });

    currentY = doc.lastAutoTable.finalY + 15;

    // Add footer with page numbers
    const pageCount = doc.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(10);
      doc.text(
        `Page ${i} of ${pageCount}`,
        doc.internal.pageSize.getWidth() / 2,
        doc.internal.pageSize.getHeight() - 10,
        { align: 'center' }
      );
    }

    return doc;
  } catch (error) {
    throw new PDFGenerationError(
      'Failed to generate administrative report',
      { originalError: error },
      'PDF_GENERATION_ERROR'
    );
  }
};

export const exportAdminPDF = async (data: ExportData): Promise<void> => {
  try {
    const doc = await generateAdminReport(data);
    doc.save(`imd-care-admin-report-${format(new Date(), 'dd-MM-yyyy-HHmm')}.pdf`);
  } catch (error) {
    throw new PDFGenerationError(
      'Failed to export administrative report',
      { originalError: error },
      'PDF_EXPORT_ERROR'
    );
  }
};