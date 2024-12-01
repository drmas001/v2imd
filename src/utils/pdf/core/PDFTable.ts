import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import autoTable, { UserOptions, Styles } from 'jspdf-autotable';
import { PDF_CONSTANTS } from '../constants';
import { PDFGenerationError } from '../error';
import type { TableOptions, TableRow } from '../../../types/pdf';

type Color = [number, number, number];

// Define a type that matches the structure of our styles
interface TableCellStyles extends Omit<Partial<Styles>, 'fillColor' | 'textColor' | 'lineColor'> {
  fillColor?: readonly [number, number, number];
  textColor?: readonly [number, number, number];
  lineColor?: readonly [number, number, number];
}

export class PDFTable {
  constructor(private doc: jsPDF) {}

  public addTable(options: TableOptions): number {
    try {
      const finalY = this.createTable(options);
      return finalY;
    } catch (error) {
      throw new PDFGenerationError(
        'Failed to add table',
        { originalError: error },
        'TABLE_GENERATION_ERROR'
      );
    }
  }

  private createTable(options: TableOptions): number {
    const {
      head,
      body,
      startY = 60,
      margin = {
        top: PDF_CONSTANTS.SPACING.MARGIN,
        right: PDF_CONSTANTS.SPACING.MARGIN,
        bottom: PDF_CONSTANTS.SPACING.MARGIN,
        left: PDF_CONSTANTS.SPACING.MARGIN,
      },
      styles = {},
      columnStyles = {},
      alternateRowStyles = {},
      showHead = true,
      showFoot = false,
      theme = 'striped',
      tableTitle,
    } = options;

    const tableBody = this.formatTableData(body);
    const tableHead = head ? this.formatTableData(head) : undefined;

    const tableOptions: UserOptions = {
      startY,
      head: tableHead,
      body: tableBody,
      margin,
      styles: {
        fontSize: PDF_CONSTANTS.FONT_SIZES.BODY,
        cellPadding: PDF_CONSTANTS.SPACING.TABLE.CELL_PADDING,
        lineColor: [...PDF_CONSTANTS.COLORS.BORDER] as Color,
        lineWidth: 0.1,
        ...this.convertStyles(styles as TableCellStyles),
      },
      headStyles: {
        fillColor: [...PDF_CONSTANTS.COLORS.PRIMARY] as Color,
        textColor: [...PDF_CONSTANTS.COLORS.WHITE] as Color,
        fontStyle: 'bold',
      },
      columnStyles: Object.entries(columnStyles).reduce((acc, [key, value]) => {
        acc[key] = this.convertStyles(value as TableCellStyles);
        return acc;
      }, {} as { [key: string]: Partial<Styles> }),
      alternateRowStyles: {
        fillColor: [...PDF_CONSTANTS.COLORS.BACKGROUND] as Color,
        ...this.convertStyles(alternateRowStyles as TableCellStyles),
      },
      showHead,
      showFoot,
      theme,
    };

    if (tableTitle) {
      this.doc.setFontSize(PDF_CONSTANTS.FONT_SIZES.SUBHEADING);
      this.doc.text(
        tableTitle,
        this.doc.internal.pageSize.getWidth() / 2,
        startY - 10,
        { align: 'center' }
      );
    }

    autoTable(this.doc, tableOptions);
    return this.doc.lastAutoTable?.finalY ?? 0;
  }

  private formatTableData(
    rows: TableRow[]
  ): (string | { content: string; colSpan?: number; rowSpan?: number; styles?: Partial<Styles> })[][] {
    return rows.map((row) =>
      row.cells.map((cell) => {
        if (typeof cell === 'string') {
          return cell;
        }
        return {
          content: cell.content,
          colSpan: cell.colSpan,
          rowSpan: cell.rowSpan,
          styles: cell.styles ? this.convertStyles(cell.styles as TableCellStyles) : undefined,
        };
      })
    );
  }

  private convertStyles(inputStyles: TableCellStyles): Partial<Styles> {
    // Create a new object without color properties
    const { fillColor, textColor, lineColor, ...rest } = inputStyles;
    const outputStyles: Partial<Styles> = { ...rest };

    if (fillColor && Array.isArray(fillColor)) {
      outputStyles.fillColor = [...fillColor] as Color;
    }

    if (textColor && Array.isArray(textColor)) {
      outputStyles.textColor = [...textColor] as Color;
    }

    if (lineColor && Array.isArray(lineColor)) {
      outputStyles.lineColor = [...lineColor] as Color;
    }

    return outputStyles;
  }
}