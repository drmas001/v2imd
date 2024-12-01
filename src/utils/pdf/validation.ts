import { PDF_CONSTANTS } from './constants';
import { PDFGenerationError } from './error';
import type { ExportData } from '../../types/report';

export const validateExportData = (data: ExportData): void => {
  if (!data || typeof data !== 'object') {
    throw new PDFGenerationError(
      'Invalid export data format',
      { reason: 'Export data must be an object' },
      'DATA_VALIDATION_ERROR'
    );
  }

  // Validate arrays
  const requiredArrays = ['patients', 'consultations', 'appointments'] as const;
  for (const key of requiredArrays) {
    if (!Array.isArray(data[key])) {
      throw new PDFGenerationError(
        `Invalid ${key} data format`,
        { reason: `${key} must be an array`, received: typeof data[key] },
        'DATA_VALIDATION_ERROR'
      );
    }
  }

  // Validate date filter
  if (!data.dateFilter || typeof data.dateFilter !== 'object') {
    throw new PDFGenerationError(
      'Invalid date filter',
      { reason: 'Date filter is required' },
      'DATA_VALIDATION_ERROR'
    );
  }

  const { startDate, endDate } = data.dateFilter;
  validateDateRange(startDate, endDate);
};

export const validateDateRange = (startDate: string, endDate: string): void => {
  if (!startDate || !endDate) {
    throw new PDFGenerationError(
      'Invalid date range',
      { reason: 'Start and end dates are required' },
      'DATA_VALIDATION_ERROR'
    );
  }

  const start = new Date(startDate);
  const end = new Date(endDate);

  if (isNaN(start.getTime()) || isNaN(end.getTime())) {
    throw new PDFGenerationError(
      'Invalid date format',
      { reason: 'Dates must be in valid ISO format', startDate, endDate },
      'DATA_VALIDATION_ERROR'
    );
  }

  if (end < start) {
    throw new PDFGenerationError(
      'Invalid date range',
      { reason: 'End date must be after start date', startDate, endDate },
      'DATA_VALIDATION_ERROR'
    );
  }
};

export const validateTableData = (data: unknown[]): void => {
  if (!Array.isArray(data)) {
    throw new PDFGenerationError(
      'Invalid table data',
      { reason: 'Table data must be an array' },
      'TABLE_GENERATION_ERROR'
    );
  }

  if (data.length === 0) {
    throw new PDFGenerationError(
      'Empty table data',
      { reason: 'Table data cannot be empty' },
      'TABLE_GENERATION_ERROR'
    );
  }

  // Validate row structure
  data.forEach((row, index) => {
    if (!row || typeof row !== 'object') {
      throw new PDFGenerationError(
        'Invalid row data',
        { reason: `Invalid row at index ${index}`, row },
        'TABLE_GENERATION_ERROR'
      );
    }
  });
};

export const validateTablePosition = (startY: number, pageHeight: number): void => {
  if (startY < PDF_CONSTANTS.SPACING.MARGIN) {
    throw new PDFGenerationError(
      'Invalid table position',
      { reason: 'Start position is too close to top margin', startY },
      'PAGE_OVERFLOW_ERROR'
    );
  }

  if (startY > pageHeight - PDF_CONSTANTS.SPACING.MARGIN) {
    throw new PDFGenerationError(
      'Invalid table position',
      { reason: 'Start position exceeds page height', startY, pageHeight },
      'PAGE_OVERFLOW_ERROR'
    );
  }
};

export const validatePageDimensions = (width: number, height: number): void => {
  if (width <= 0 || height <= 0) {
    throw new PDFGenerationError(
      'Invalid page dimensions',
      { reason: 'Page dimensions must be positive numbers', width, height },
      'PDF_GENERATION_ERROR'
    );
  }
};

export const validateFontSize = (size: number): void => {
  if (size < PDF_CONSTANTS.FONT_SIZES.SMALL || size > PDF_CONSTANTS.FONT_SIZES.TITLE) {
    throw new PDFGenerationError(
      'Invalid font size',
      { reason: 'Font size out of allowed range', size },
      'FONT_ERROR'
    );
  }
};

export const validateColor = (color: readonly number[]): void => {
  if (!Array.isArray(color) || color.length !== 3) {
    throw new PDFGenerationError(
      'Invalid color format',
      { reason: 'Color must be an array of 3 numbers', color },
      'PDF_GENERATION_ERROR'
    );
  }

  color.forEach((value, index) => {
    if (value < 0 || value > 255) {
      throw new PDFGenerationError(
        'Invalid color value',
        { reason: `Color value at index ${index} out of range`, value },
        'PDF_GENERATION_ERROR'
      );
    }
  });
};

export const validateSpacing = (spacing: number): void => {
  if (spacing < 0) {
    throw new PDFGenerationError(
      'Invalid spacing value',
      { reason: 'Spacing must be a positive number', spacing },
      'PDF_GENERATION_ERROR'
    );
  }
};

export const validateText = (text: string): void => {
  if (typeof text !== 'string') {
    throw new PDFGenerationError(
      'Invalid text format',
      { reason: 'Text must be a string', received: typeof text },
      'PDF_GENERATION_ERROR'
    );
  }

  if (text.trim().length === 0) {
    throw new PDFGenerationError(
      'Empty text',
      { reason: 'Text cannot be empty' },
      'PDF_GENERATION_ERROR'
    );
  }
};