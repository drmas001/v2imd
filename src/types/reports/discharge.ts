export interface DischargeStats {
  totalDischarges: number;
  averageLengthOfStay: number;
  dischargesByDepartment: {
    department: string;
    count: number;
  }[];
} 