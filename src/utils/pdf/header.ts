import type { jsPDF } from 'jspdf';
import { format } from 'date-fns';
import { PDF_CONSTANTS } from './constants';
import { PDFGenerationError } from './error';

const loadImage = async (url: string): Promise<string> => {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch image: ${response.statusText}`);
    }
    const blob = await response.blob();
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  } catch (error) {
    throw new PDFGenerationError(
      'Failed to load logo',
      { originalError: error },
      'IMAGE_LOAD_ERROR'
    );
  }
};

export const addHeader = async (doc: jsPDF, title: string, logoUrl?: string): Promise<number> => {
  const pageWidth = doc.internal.pageSize.width;
  let currentY = PDF_CONSTANTS.SPACING.MARGIN;

  try {
    // Add logo if URL is provided
    if (logoUrl) {
      const logoData = await loadImage(logoUrl);
      const logoSize = 30; // Fixed logo size
      
      doc.addImage(
        logoData,
        'PNG',
        PDF_CONSTANTS.SPACING.MARGIN,
        currentY,
        logoSize,
        logoSize,
        undefined,
        'FAST'
      );

      // Add title next to logo
      doc.setFontSize(PDF_CONSTANTS.FONT_SIZES.TITLE);
      doc.setTextColor(...PDF_CONSTANTS.COLORS.TEXT);
      doc.text(
        title,
        PDF_CONSTANTS.SPACING.MARGIN + logoSize + 10,
        currentY + (logoSize / 2),
        { baseline: 'middle' }
      );

      currentY += logoSize + PDF_CONSTANTS.SPACING.SECTION;
    } else {
      // Center the title if no logo
      doc.setFontSize(PDF_CONSTANTS.FONT_SIZES.TITLE);
      doc.setTextColor(...PDF_CONSTANTS.COLORS.TEXT);
      doc.text(title, pageWidth / 2, currentY, { align: 'center' });
      currentY += PDF_CONSTANTS.SPACING.SECTION;
    }

    // Add generation date
    doc.setFontSize(PDF_CONSTANTS.FONT_SIZES.BODY);
    doc.setTextColor(...PDF_CONSTANTS.COLORS.SECONDARY);
    doc.text(
      `Generated on: ${format(new Date(), 'dd/MM/yyyy HH:mm')}`,
      pageWidth / 2,
      currentY,
      { align: 'center' }
    );
    currentY += PDF_CONSTANTS.SPACING.SECTION;

    // Add separator line
    doc.setDrawColor(...PDF_CONSTANTS.COLORS.BORDER);
    doc.setLineWidth(0.1);
    doc.line(
      PDF_CONSTANTS.SPACING.MARGIN,
      currentY,
      pageWidth - PDF_CONSTANTS.SPACING.MARGIN,
      currentY
    );
    currentY += PDF_CONSTANTS.SPACING.SECTION;

    return currentY;
  } catch (error) {
    throw new PDFGenerationError(
      'Failed to add header',
      { originalError: error },
      'PDF_GENERATION_ERROR'
    );
  }
};