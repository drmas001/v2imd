import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { format } from 'date-fns';
import { PDF_CONSTANTS } from './constants';
import { createTableOptions } from './tables';
import { validateTableData, validateTablePosition } from './validation';
import { PDFGenerationError } from './error';
import type { Patient } from '../../types/patient';
import type { LongStayNote } from '../../types/longStayNote';

interface SectionOptions {
  startY: number;
  title: string;
  showBorders?: boolean;
}

export const addPatientSection = async (
  doc: jsPDF,
  patient: Patient,
  notes: LongStayNote[],
  options: SectionOptions
): Promise<number> => {
  if (!doc || !patient) {
    throw new PDFGenerationError(
      'Invalid parameters for patient section',
      { patient },
      'DATA_VALIDATION_ERROR'
    );
  }

  try {
    validateTablePosition(options.startY, doc.internal.pageSize.height);
    
    const admission = patient.admissions?.[0];
    if (!admission) {
      throw new PDFGenerationError(
        'No admission data found',
        { patient },
        'DATA_VALIDATION_ERROR'
      );
    }

    // Add section title
    let currentY = options.startY;
    doc.setFontSize(PDF_CONSTANTS.FONT_SIZES.HEADING);
    doc.setTextColor(...PDF_CONSTANTS.COLORS.TEXT);
    doc.text(options.title, PDF_CONSTANTS.SPACING.MARGIN, currentY);
    currentY += PDF_CONSTANTS.SPACING.SECTION;

    // Create patient info table
    const patientData = [
      ['Name', patient.name],
      ['MRN', patient.mrn],
      ['Department', admission.department],
      ['Doctor', admission.admitting_doctor?.name || 'Not assigned'],
      ['Admission Date', format(new Date(admission.admission_date), 'dd/MM/yyyy')],
      ['Status', admission.status]
    ];

    validateTableData(patientData);

    autoTable(doc, {
      ...createTableOptions(currentY),
      body: patientData,
      theme: options.showBorders ? 'grid' : 'plain'
    });

    currentY = (doc as any).lastAutoTable.finalY + PDF_CONSTANTS.SPACING.SECTION;

    // Add notes if available
    if (notes && notes.length > 0) {
      validateTableData(notes);
      validateTablePosition(currentY, doc.internal.pageSize.height);

      const notesData = notes.map(note => [
        format(new Date(note.created_at), 'dd/MM/yyyy HH:mm'),
        note.created_by.name,
        note.content
      ]);

      autoTable(doc, {
        ...createTableOptions(currentY),
        head: [['Date', 'Created By', 'Note']],
        body: notesData,
        theme: options.showBorders ? 'grid' : 'plain'
      });

      currentY = (doc as any).lastAutoTable.finalY + PDF_CONSTANTS.SPACING.SECTION;
    }

    return currentY;
  } catch (error) {
    throw new PDFGenerationError(
      'Failed to add patient section',
      { originalError: error },
      'PDF_GENERATION_ERROR'
    );
  }
};