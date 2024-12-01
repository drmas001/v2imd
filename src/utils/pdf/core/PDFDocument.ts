import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import { format } from 'date-fns';
import { PDF_CONSTANTS } from '../constants';
import { PDFGenerationError } from '../error';
import type { PDFOptions as ImportedPDFOptions } from '../../../types/pdf';

interface Margins {
  top: number;
  right: number;
  bottom: number;
  left: number;
}

interface LocalPDFOptions {
  title: string;
  subtitle?: string;
  showLogo?: boolean;
  showFooter?: boolean;
  showPageNumbers?: boolean;
  margins?: Partial<Margins>;
}

interface DocumentOptions {
  title: string;
  subtitle: string;
  showLogo: boolean;
  showFooter: boolean;
  showPageNumbers: boolean;
  margins: Margins;
}

export class PDFDocument {
  private doc: jsPDF;
  private currentPage: number;
  private totalPages: number;
  private readonly options: DocumentOptions;

  constructor(options: LocalPDFOptions) {
    this.options = {
      title: options.title,
      subtitle: options.subtitle || '',
      showLogo: options.showLogo ?? true,
      showFooter: options.showFooter ?? true,
      showPageNumbers: options.showPageNumbers ?? true,
      margins: {
        top: options.margins?.top ?? 40,
        right: options.margins?.right ?? 40,
        bottom: options.margins?.bottom ?? 40,
        left: options.margins?.left ?? 40,
      },
    };

    this.doc = new jsPDF({
      orientation: 'portrait',
      unit: 'pt',
      format: 'a4',
    });
    this.currentPage = 1;
    this.totalPages = 1;
    this.doc.setFont('helvetica');
  }

  public async initialize(): Promise<void> {
    try {
      await this.addHeader();
      if (this.options.showFooter) {
        this.addFooter();
      }
    } catch (error) {
      throw new PDFGenerationError(
        'Failed to initialize PDF document',
        { originalError: error },
        'PDF_INITIALIZATION_ERROR'
      );
    }
  }

  private async addHeader(): Promise<void> {
    const pageWidth = this.doc.internal.pageSize.width;
    let currentY = PDF_CONSTANTS.SPACING.MARGIN;

    try {
      this.doc.setFontSize(PDF_CONSTANTS.FONT_SIZES.TITLE);
      this.doc.setTextColor(...PDF_CONSTANTS.COLORS.TEXT);
      this.doc.text(this.options.title, pageWidth / 2, currentY, { align: 'center' });

      if (this.options.subtitle) {
        currentY += PDF_CONSTANTS.SPACING.SECTION;
        this.doc.setFontSize(PDF_CONSTANTS.FONT_SIZES.SUBHEADING);
        this.doc.text(this.options.subtitle, pageWidth / 2, currentY, { align: 'center' });
      }

      // Add generation timestamp
      currentY += PDF_CONSTANTS.SPACING.SECTION;
      this.doc.setFontSize(PDF_CONSTANTS.FONT_SIZES.BODY);
      this.doc.setTextColor(...PDF_CONSTANTS.COLORS.SECONDARY);
      const timestamp = format(new Date(), 'dd/MM/yyyy HH:mm');
      this.doc.text(
        `Generated on: ${timestamp}`,
        pageWidth / 2,
        currentY,
        { align: 'center' }
      );
    } catch (error) {
      throw new PDFGenerationError(
        'Failed to add header',
        { originalError: error },
        'PDF_HEADER_ERROR'
      );
    }
  }

  private addFooter(): void {
    const pageWidth = this.doc.internal.pageSize.width;
    const pageHeight = this.doc.internal.pageSize.height;

    try {
      // Add separator line
      this.doc.setDrawColor(...PDF_CONSTANTS.COLORS.BORDER);
      this.doc.setLineWidth(0.5);
      this.doc.line(
        this.options.margins.left,
        pageHeight - 40,
        pageWidth - this.options.margins.right,
        pageHeight - 40
      );

      // Add page numbers if enabled
      if (this.options.showPageNumbers) {
        this.doc.setFontSize(PDF_CONSTANTS.FONT_SIZES.SMALL);
        this.doc.setTextColor(...PDF_CONSTANTS.COLORS.SECONDARY);
        this.doc.text(
          `Page ${this.currentPage} of ${this.totalPages}`,
          pageWidth / 2,
          pageHeight - 20,
          { align: 'center' }
        );
      }
    } catch (error) {
      throw new PDFGenerationError(
        'Failed to add footer',
        { originalError: error },
        'PDF_FOOTER_ERROR'
      );
    }
  }

  public addPage(): void {
    this.doc.addPage();
    this.currentPage++;
    this.totalPages = Math.max(this.totalPages, this.currentPage);
    if (this.options.showFooter) {
      this.addFooter();
    }
  }

  public save(filename: string): void {
    try {
      this.doc.save(filename);
    } catch (error) {
      throw new PDFGenerationError(
        'Failed to save PDF',
        { originalError: error },
        'PDF_SAVE_ERROR'
      );
    }
  }

  public getBlob(): Promise<Blob> {
    return new Promise((resolve, reject) => {
      try {
        const blob = this.doc.output('blob');
        resolve(blob);
      } catch (error) {
        reject(new PDFGenerationError(
          'Failed to generate PDF blob',
          { originalError: error },
          'PDF_BLOB_ERROR'
        ));
      }
    });
  }

  public get document(): jsPDF {
    return this.doc;
  }
}