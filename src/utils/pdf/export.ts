import { format } from 'date-fns';
import { AdminReportGenerator } from './generators/AdminReportGenerator';
import { PDFGenerationError } from './error';
import type { ExportData } from '../../types/report';

export const exportAdminReport = async (data: ExportData): Promise<void> => {
  try {
    const generator = new AdminReportGenerator(data);
    const blob = await generator.generate();
    
    // Create download link
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    const filename = format(new Date(), 'dd-MM-yyyy-HHmm');
    link.download = `admin-report-${filename}.pdf`;
    
    // Trigger download
    document.body.appendChild(link);
    link.click();
    
    // Cleanup
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error('PDF Export Error:', error);
    
    if (error instanceof PDFGenerationError) {
      throw error;
    }
    
    throw new PDFGenerationError(
      'Failed to export administrative report',
      { originalError: error },
      'EXPORT_ERROR'
    );
  }
};