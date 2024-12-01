export interface PDFTableStyles {
  fontSize?: number;
  fontStyle?: 'normal' | 'bold' | 'italic' | 'bolditalic';
  textColor?: [number, number, number];
  fillColor?: [number, number, number];
  lineColor?: [number, number, number];
  lineWidth?: number;
  cellPadding?: number;
  valign?: 'top' | 'middle' | 'bottom';
  halign?: 'left' | 'center' | 'right';
}

export interface PDFTableOptions {
  startY: number;
  head?: Array<Array<string | { content: string; colSpan?: number; rowSpan?: number; styles?: PDFTableStyles }>>;
  body: Array<Array<string | { content: string; colSpan?: number; rowSpan?: number; styles?: PDFTableStyles }>>;
  styles?: PDFTableStyles;
  columnStyles?: {
    [key: number]: PDFTableStyles;
  };
  theme?: 'striped' | 'grid' | 'plain';
  margin?: {
    top: number;
    right: number;
    bottom: number;
    left: number;
  };
}