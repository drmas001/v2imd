import { jsPDF } from 'jspdf';
import { PDFDocument } from '../core/PDFDocument';
import { PDFTable } from '../core/PDFTable';
import { PDFChart } from '../core/PDFChart';
import { PDF_CONSTANTS } from '../constants';
import { PDFGenerationError } from '../error';
import { ASSETS } from '../../../config/assets';
import type { ExportData } from '../../../types/report';
import type { TableRow } from '../../../types/pdf';

interface PDFWithAutoTable extends jsPDF {
  lastAutoTable: {
    finalY: number;
  };
}

export class AdminReportGenerator {
  private doc: PDFDocument;
  private table: PDFTable;
  private chart: PDFChart;

  constructor(private data: ExportData) {
    this.doc = new PDFDocument({
      title: 'Administrative Report',
      showLogo: true,
      showFooter: true,
      showPageNumbers: true
    });
    this.table = new PDFTable(this.doc.document as PDFWithAutoTable);
    this.chart = new PDFChart(this.doc.document);
  }

  public async generate(): Promise<Blob> {
    try {
      await this.doc.initialize();

      // Add header with logo
      await this.addLogo();

      // Add summary statistics
      await this.addSummarySection();

      // Add department statistics
      await this.addDepartmentSection();

      // Add consultation statistics
      await this.addConsultationSection();

      // Add safety statistics
      await this.addSafetySection();

      return await this.doc.getBlob();
    } catch (error) {
      throw new PDFGenerationError(
        'Failed to generate administrative report',
        { originalError: error },
        'REPORT_GENERATION_ERROR'
      );
    }
  }

  private async addLogo(): Promise<void> {
    try {
      const logoResponse = await fetch(ASSETS.LOGO.PDF);
      if (logoResponse.ok) {
        const logoBlob = await logoResponse.blob();
        const reader = new FileReader();
        reader.readAsDataURL(logoBlob);
        await new Promise<void>((resolve) => {
          reader.onloadend = () => {
            const logoData = reader.result as string;
            this.doc.document.addImage(
              logoData,
              'PNG',
              PDF_CONSTANTS.SPACING.MARGIN,
              PDF_CONSTANTS.SPACING.MARGIN,
              30,
              30
            );
            resolve();
          };
        });
      }
    } catch (error) {
      console.error('Error adding logo:', error);
    }
  }

  private async addSummarySection(): Promise<void> {
    const activePatients = this.data.patients.filter(p => 
      p.admissions?.some(a => a.status === 'active')
    ).length;

    const activeConsultations = this.data.consultations.filter(c => 
      c.status === 'active'
    ).length;

    const summaryData: TableRow[] = [
      {
        cells: [
          { content: 'Total Active Patients' },
          { content: activePatients.toString() }
        ]
      },
      {
        cells: [
          { content: 'Active Consultations' },
          { content: activeConsultations.toString() }
        ]
      },
      {
        cells: [
          { content: 'Total Appointments' },
          { content: this.data.appointments.length.toString() }
        ]
      }
    ];

    this.table.addTable({
      startY: PDF_CONSTANTS.SPACING.MARGIN * 3,
      head: [{
        cells: [
          { content: 'Metric' },
          { content: 'Count' }
        ]
      }],
      body: summaryData,
      theme: 'grid'
    });
  }

  private async addDepartmentSection(): Promise<void> {
    const departmentStats = this.data.patients.reduce((acc, patient) => {
      const dept = patient.department || 'Unassigned';
      if (!acc[dept]) {
        acc[dept] = { total: 0, active: 0 };
      }
      acc[dept].total++;
      if (patient.admissions?.some(a => a.status === 'active')) {
        acc[dept].active++;
      }
      return acc;
    }, {} as Record<string, { total: number; active: number; }>);

    const tableData: TableRow[] = Object.entries(departmentStats).map(([dept, stats]) => ({
      cells: [
        { content: dept },
        { content: stats.total.toString() },
        { content: stats.active.toString() },
        { content: `${Math.round((stats.active / stats.total) * 100)}%` }
      ]
    }));

    this.table.addTable({
      startY: (this.doc.document as PDFWithAutoTable).lastAutoTable.finalY + PDF_CONSTANTS.SPACING.SECTION,
      head: [{
        cells: [
          { content: 'Department' },
          { content: 'Total Patients' },
          { content: 'Active Patients' },
          { content: 'Occupancy Rate' }
        ]
      }],
      body: tableData,
      theme: 'grid'
    });
  }

  private async addConsultationSection(): Promise<void> {
    const consultationStats = this.data.consultations.reduce((acc, consultation) => {
      const specialty = consultation.consultation_specialty;
      if (!acc[specialty]) {
        acc[specialty] = { total: 0, emergency: 0, urgent: 0, routine: 0 };
      }
      acc[specialty].total++;
      acc[specialty][consultation.urgency as keyof typeof acc[string]]++;
      return acc;
    }, {} as Record<string, { total: number; emergency: number; urgent: number; routine: number; }>);

    const tableData: TableRow[] = Object.entries(consultationStats).map(([specialty, stats]) => ({
      cells: [
        { content: specialty },
        { content: stats.total.toString() },
        { content: stats.emergency.toString() },
        { content: stats.urgent.toString() },
        { content: stats.routine.toString() }
      ]
    }));

    this.table.addTable({
      startY: (this.doc.document as PDFWithAutoTable).lastAutoTable.finalY + PDF_CONSTANTS.SPACING.SECTION,
      head: [{
        cells: [
          { content: 'Specialty' },
          { content: 'Total' },
          { content: 'Emergency' },
          { content: 'Urgent' },
          { content: 'Routine' }
        ]
      }],
      body: tableData,
      theme: 'grid'
    });
  }

  private async addSafetySection(): Promise<void> {
    const safetyStats = this.data.patients.reduce((acc, patient) => {
      const safetyType = patient.admissions?.[0]?.safety_type;
      if (safetyType) {
        acc[safetyType] = (acc[safetyType] || 0) + 1;
      }
      return acc;
    }, {} as Record<string, number>);

    const tableData: TableRow[] = Object.entries(safetyStats).map(([type, count]) => ({
      cells: [
        { content: type.charAt(0).toUpperCase() + type.slice(1) },
        { content: count.toString() },
        { content: `${Math.round((count / this.data.patients.length) * 100)}%` }
      ]
    }));

    this.table.addTable({
      startY: (this.doc.document as PDFWithAutoTable).lastAutoTable.finalY + PDF_CONSTANTS.SPACING.SECTION,
      head: [{
        cells: [
          { content: 'Safety Type' },
          { content: 'Count' },
          { content: 'Percentage' }
        ]
      }],
      body: tableData,
      theme: 'grid'
    });
  }
}