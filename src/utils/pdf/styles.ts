import type { PDFTableStyles } from './types';

// A4 dimensions in points (1 pt = 1/72 inch)
const A4_WIDTH = 595.28;  // 210mm
const A4_HEIGHT = 841.89; // 297mm

// Margins
const MARGIN = {
  top: 40,
  right: 40,
  bottom: 40,
  left: 40
} as const;

// Calculate usable width
const USABLE_WIDTH = A4_WIDTH - (MARGIN.left + MARGIN.right);

export const PDF_FONTS = {
  regular: 'helvetica',
  bold: 'helvetica-bold',
  italic: 'helvetica-oblique',
  boldItalic: 'helvetica-boldoblique',
  size: {
    title: 24,
    heading: 18,
    subheading: 14,
    body: 12,
    small: 10,
    caption: 8
  }
} as const;

// Define color arrays as readonly tuples
export const PDF_COLORS = {
  primary: [79, 70, 229] as const, // Indigo-600
  secondary: [99, 102, 241] as const, // Indigo-500
  success: [16, 185, 129] as const, // Green-500
  warning: [245, 158, 11] as const, // Yellow-500
  error: [239, 68, 68] as const, // Red-500
  text: {
    primary: [17, 24, 39] as const,   // Gray-900
    secondary: [55, 65, 81] as const, // Gray-700
    muted: [107, 114, 128] as const,  // Gray-500
    light: [156, 163, 175] as const,  // Gray-400
    white: [255, 255, 255] as const
  },
  border: {
    light: [229, 231, 235] as const, // Gray-200
    medium: [209, 213, 219] as const // Gray-300
  },
  background: {
    white: [255, 255, 255] as const,
    light: [249, 250, 251] as const, // Gray-50
    medium: [243, 244, 246] as const // Gray-100
  }
} as const;

export const PDF_SPACING = {
  margin: MARGIN,
  header: {
    height: 80,
    logoSize: 50,
    spacing: 20
  },
  section: {
    spacing: 20,
    margin: {
      top: 20,
      bottom: 20
    }
  },
  table: {
    rowSpacing: 6,
    cellPadding: {
      vertical: 8,
      horizontal: 10
    },
    headerHeight: 40
  }
} as const;

export const PDF_STYLES = {
  page: {
    width: A4_WIDTH,
    height: A4_HEIGHT,
    margin: MARGIN,
    usableWidth: USABLE_WIDTH
  },
  text: {
    title: {
      fontSize: PDF_FONTS.size.title,
      font: PDF_FONTS.bold,
      color: PDF_COLORS.text.primary
    },
    heading: {
      fontSize: PDF_FONTS.size.heading,
      font: PDF_FONTS.bold,
      color: PDF_COLORS.text.primary
    },
    subheading: {
      fontSize: PDF_FONTS.size.subheading,
      font: PDF_FONTS.regular,
      color: PDF_COLORS.text.secondary
    },
    body: {
      fontSize: PDF_FONTS.size.body,
      font: PDF_FONTS.regular,
      color: PDF_COLORS.text.primary
    },
    small: {
      fontSize: PDF_FONTS.size.small,
      font: PDF_FONTS.regular,
      color: PDF_COLORS.text.muted
    }
  },
  table: {
    header: {
      fillColor: PDF_COLORS.primary,
      textColor: PDF_COLORS.text.white,
      fontSize: PDF_FONTS.size.body,
      font: PDF_FONTS.bold,
      padding: PDF_SPACING.table.cellPadding
    },
    cell: {
      fontSize: PDF_FONTS.size.body,
      font: PDF_FONTS.regular,
      padding: PDF_SPACING.table.cellPadding,
      borderColor: PDF_COLORS.border.light
    },
    alternateRow: {
      fillColor: PDF_COLORS.background.light
    }
  },
  borders: {
    thin: 0.1,
    medium: 0.5,
    thick: 1
  }
} as const;

export type { PDFTableStyles };