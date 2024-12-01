export const LONG_STAY_THRESHOLD = 7; // days

export const calculateStayDuration = (admissionDate: string, dischargeDate?: string | null): number => {
  const admissionDateTime = new Date(admissionDate);
  const endDateTime = dischargeDate ? new Date(dischargeDate) : new Date();
  return Math.ceil((endDateTime.getTime() - admissionDateTime.getTime()) / (1000 * 60 * 60 * 24));
};

export const isLongStay = (admissionDate: string, dischargeDate?: string | null): boolean => {
  const stayDuration = calculateStayDuration(admissionDate, dischargeDate);
  return stayDuration > LONG_STAY_THRESHOLD;
};