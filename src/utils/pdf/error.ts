export class PDFGenerationError extends Error {
  constructor(
    message: string,
    public readonly details?: unknown,
    public readonly code: string = 'PDF_GENERATION_ERROR'
  ) {
    super(message);
    this.name = 'PDFGenerationError';

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, PDFGenerationError);
    }
  }

  public getDisplayMessage(): string {
    switch (this.code) {
      case 'IMAGE_LOAD_ERROR':
        return 'Failed to load images. The report will be generated without images.';
      case 'TABLE_GENERATION_ERROR':
        return 'Error generating tables. Please check your data and try again.';
      case 'PAGE_OVERFLOW_ERROR':
        return 'Content exceeds page limits. Try reducing the data or splitting into multiple reports.';
      case 'FONT_ERROR':
        return 'Error loading fonts. The report will use system defaults.';
      case 'DATA_VALIDATION_ERROR':
        return 'Invalid data format. Please ensure all required fields are present.';
      default:
        return this.message || 'An unexpected error occurred while generating the PDF.';
    }
  }
}

export const handlePDFError = (error: unknown): never => {
  if (error instanceof PDFGenerationError) {
    console.error('PDF Generation Error:', {
      message: error.message,
      code: error.code,
      details: error.details
    });
    throw error;
  }

  if (error instanceof Error) {
    console.error('Unexpected Error:', error);
    throw new PDFGenerationError(
      error.message,
      { originalError: error },
      'PDF_GENERATION_ERROR'
    );
  }

  console.error('Unknown Error:', error);
  throw new PDFGenerationError(
    'An unknown error occurred while generating the PDF',
    { originalError: error },
    'PDF_GENERATION_ERROR'
  );
};