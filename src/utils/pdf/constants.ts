export const PDF_CONSTANTS = {
  COLORS: {
    PRIMARY: [79, 70, 229] as [number, number, number],
    TEXT: [17, 24, 39] as [number, number, number],
    SECONDARY: [75, 85, 99] as [number, number, number],
    BORDER: [229, 231, 235] as [number, number, number],
    BACKGROUND: [249, 250, 251] as [number, number, number],
    WHITE: [255, 255, 255] as [number, number, number]
  },
  FONT_SIZES: {
    TITLE: 14,
    HEADING: 12,
    SUBHEADING: 11,
    BODY: 9,
    SMALL: 8
  },
  SPACING: {
    MARGIN: 20,
    HEADER: 15,
    SECTION: 10,
    TABLE: {
      CELL_PADDING: 4,
      ROW_GAP: 2
    }
  }
} as const;