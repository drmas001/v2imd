import type { jsPDF } from 'jspdf';
import type { UserOptions } from 'jspdf-autotable';
import { PDF_CONSTANTS } from './constants';
import type { PDFTableStyles } from './types';

export const createTableOptions = (
  startY: number,
  customStyles?: Partial<UserOptions>
): UserOptions => ({
  startY,
  theme: 'grid',
  styles: {
    fontSize: PDF_CONSTANTS.FONT_SIZES.BODY,
    cellPadding: PDF_CONSTANTS.SPACING.TABLE.CELL_PADDING,
    lineColor: PDF_CONSTANTS.COLORS.BORDER as [number, number, number],
    lineWidth: 0.1
  },
  ...customStyles,
  didDrawPage: (data) => {
    const doc = data.doc as jsPDF;
    if (data.pageCount > 1) {
      doc.setFontSize(PDF_CONSTANTS.FONT_SIZES.SMALL);
      doc.setTextColor(...PDF_CONSTANTS.COLORS.SECONDARY);
      doc.text(
        `Page ${data.pageCount}`,
        doc.internal.pageSize.width / 2,
        doc.internal.pageSize.height - PDF_CONSTANTS.SPACING.MARGIN,
        { align: 'center' }
      );
    }
  }
});