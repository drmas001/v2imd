import { jsPDF } from 'jspdf';
import { PDFGenerationError } from '../error';

export class PDFChart {
  constructor(private doc: jsPDF) {}

  public async addChart(
    chartElement: HTMLElement,
    x: number,
    y: number,
    width: number,
    height: number
  ): Promise<void> {
    try {
      // Convert chart to image
      const canvas = await this.chartToCanvas(chartElement);
      const imageData = canvas.toDataURL('image/png');

      // Add image to PDF
      this.doc.addImage(imageData, 'PNG', x, y, width, height);
    } catch (error) {
      throw new PDFGenerationError(
        'Failed to add chart to PDF',
        { originalError: error },
        'CHART_GENERATION_ERROR'
      );
    }
  }

  private async chartToCanvas(element: HTMLElement): Promise<HTMLCanvasElement> {
    try {
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');
      
      if (!context) {
        throw new Error('Failed to get canvas context');
      }

      // Set canvas dimensions
      canvas.width = element.clientWidth;
      canvas.height = element.clientHeight;

      // Convert SVG to string
      const svgData = new XMLSerializer().serializeToString(element);
      const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
      const url = URL.createObjectURL(svgBlob);

      // Create image from SVG
      const img = new Image();
      img.src = url;

      return new Promise((resolve, reject) => {
        img.onload = () => {
          context.drawImage(img, 0, 0);
          URL.revokeObjectURL(url);
          resolve(canvas);
        };
        img.onerror = () => {
          URL.revokeObjectURL(url);
          reject(new Error('Failed to load chart image'));
        };
      });
    } catch (error) {
      throw new PDFGenerationError(
        'Failed to convert chart to canvas',
        { originalError: error },
        'CHART_CONVERSION_ERROR'
      );
    }
  }
}