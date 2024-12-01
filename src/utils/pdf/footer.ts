import type { jsPDF } from 'jspdf';
import { PDF_CONSTANTS } from './constants';

export const addFooter = (doc: jsPDF, pageNumber: number, totalPages: number): void => {
  const pageWidth = doc.internal.pageSize.width;
  const pageHeight = doc.internal.pageSize.height;
  const margin = PDF_CONSTANTS.SPACING.MARGIN;

  // Add separator line
  doc.setDrawColor(...PDF_CONSTANTS.COLORS.BORDER);
  doc.setLineWidth(0.1);
  doc.line(
    margin,
    pageHeight - margin - 10,
    pageWidth - margin,
    pageHeight - margin - 10
  );

  // Add page numbers
  doc.setFontSize(PDF_CONSTANTS.FONT_SIZES.SMALL);
  doc.setTextColor(...PDF_CONSTANTS.COLORS.SECONDARY);
  doc.text(
    `Page ${pageNumber} of ${totalPages}`,
    pageWidth / 2,
    pageHeight - margin,
    { align: 'center' }
  );
}