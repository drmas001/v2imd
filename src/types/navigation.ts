export type Page = 
  | 'dashboard' 
  | 'patient' 
  | 'consultation' 
  | 'reports' 
  | 'discharge' 
  | 'specialties' 
  | 'employees' 
  | 'appointments' 
  | 'profile'
  | 'new-admission'
  | 'about'
  | 'terms'
  | 'login';

export interface NavigationEvent extends CustomEvent<NavigationDetail | string> {
  detail: NavigationDetail | string;
}

export interface NavigationDetail {
  page: Page;
  specialty?: string;
}

export const isValidPage = (page: string): page is Page => {
  const validPages: Page[] = [
    'dashboard',
    'patient',
    'consultation',
    'reports',
    'discharge',
    'specialties',
    'employees',
    'appointments',
    'profile',
    'new-admission',
    'about',
    'terms',
    'login'
  ];
  return validPages.includes(page as Page);
};

declare global {
  interface WindowEventMap {
    navigate: NavigationEvent;
  }
}