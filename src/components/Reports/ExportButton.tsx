import React from 'react';
import { Download, RefreshCw } from 'lucide-react';
import { Button } from '../ui/Button';
import { useToast } from '../../hooks/useToast';
import { exportAdminPDF } from '../../utils/adminPdfExport';
import type { ExportData } from '../../types/report';

interface ExportButtonProps {
  data: ExportData;
  isDisabled?: boolean;
}

export const ExportButton: React.FC<ExportButtonProps> = ({ data, isDisabled }) => {
  const [isExporting, setIsExporting] = React.useState(false);
  const { showToast } = useToast();

  const handleExport = async () => {
    if (isExporting) return;
    
    setIsExporting(true);
    try {
      await exportAdminPDF(data);
      showToast({
        title: 'Success',
        message: 'Report exported successfully',
        type: 'success'
      });
    } catch (error) {
      console.error('Export error:', error);
      showToast({
        title: 'Error',
        message: error instanceof Error ? error.message : 'Failed to export report',
        type: 'error'
      });
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Button
      variant="primary"
      onClick={handleExport}
      disabled={isDisabled || isExporting}
      leftIcon={isExporting ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
    >
      {isExporting ? 'Exporting...' : 'Export PDF'}
    </Button>
  );
};