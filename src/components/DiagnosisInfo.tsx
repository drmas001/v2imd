import React from 'react';

interface DiagnosisInfoProps {
  diagnosis?: string;
  className?: string;
}

const DiagnosisInfo: React.FC<DiagnosisInfoProps> = ({ diagnosis, className = '' }) => {
  if (!diagnosis) {
    return (
      <p className={`text-sm text-gray-500 italic ${className}`}>
        No diagnosis recorded
      </p>
    );
  }

  return (
    <p className={`text-sm font-medium text-gray-900 whitespace-pre-wrap ${className}`}>
      {diagnosis}
    </p>
  );
};

export default DiagnosisInfo;