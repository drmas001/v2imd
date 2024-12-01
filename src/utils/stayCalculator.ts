export const LONG_STAY_THRESHOLD = 30;

export function calculateStay(admissionDate: string): number {
  const admission = new Date(admissionDate);
  const today = new Date();
  const diffTime = Math.abs(today.getTime() - admission.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
}

export const isLongStay = (admissionDate: string, dischargeDate?: string | null): boolean => {
  const stayDuration = calculateStay(admissionDate);
  return stayDuration > LONG_STAY_THRESHOLD;
};

export default calculateStay;