import React from 'react';
import { Download, FileText, Printer, RefreshCw } from 'lucide-react';

interface HeaderProps {
  onExport: () => Promise<void>;
  onPrint: () => void;
  isExporting: boolean;
}

const Header: React.FC<HeaderProps> = ({ onExport, onPrint, isExporting }) => {
  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 space-y-4 md:space-y-0">
      <div className="flex items-center space-x-3">
        <FileText className="h-6 w-6 text-gray-400" />
        <h2 className="text-lg font-semibold text-gray-900">Administrative Report</h2>
      </div>
      <div className="flex items-center space-x-2">
        <button 
          onClick={onPrint}
          className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:text-indigo-600 hover:bg-gray-50 rounded-lg transition-colors"
        >
          <Printer className="h-4 w-4" />
          <span>Print</span>
        </button>
        <button
          onClick={onExport}
          disabled={isExporting}
          className="flex items-center space-x-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50"
        >
          {isExporting ? (
            <>
              <RefreshCw className="h-4 w-4 animate-spin" />
              <span>Exporting...</span>
            </>
          ) : (
            <>
              <Download className="h-4 w-4" />
              <span>Export PDF</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default Header;