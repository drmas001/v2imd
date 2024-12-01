export interface TableCell {
  content: string;
  colSpan?: number;
  rowSpan?: number;
  styles?: TableCellStyles;
}

export interface TableCellStyles {
  fillColor?: readonly [number, number, number];
  textColor?: readonly [number, number, number];
  fontSize?: number;
  fontStyle?: 'normal' | 'bold' | 'italic' | 'bolditalic';
  halign?: 'left' | 'center' | 'right';
  valign?: 'top' | 'middle' | 'bottom';
  cellPadding?: number;
}

export interface TableRow {
  cells: TableCell[];
  height?: number;
}

export interface TableOptions {
  head?: TableRow[];
  body: TableRow[];
  startY?: number;
  margin?: {
    top?: number;
    right?: number;
    bottom?: number;
    left?: number;
  };
  styles?: object;
  columnStyles?: object;
  alternateRowStyles?: object;
  showHead?: boolean;
  showFoot?: boolean;
  theme?: 'striped' | 'grid' | 'plain';
  tableTitle?: string;
}

export interface PDFOptions {
  title: string;
  subtitle?: string;
  showLogo?: boolean;
  showFooter?: boolean;
  showPageNumbers?: boolean;
  margins?: {
    top?: number;
    right?: number;
    bottom?: number;
    left?: number;
  };
}

export type FontStyle = 'normal' | 'bold' | 'italic' | 'bolditalic';