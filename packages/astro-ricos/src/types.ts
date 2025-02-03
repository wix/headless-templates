export enum DecorationType {
  BOLD = "BOLD",
  ITALIC = "ITALIC",
  UNDERLINE = "UNDERLINE",
  SPOILER = "SPOILER",
  ANCHOR = "ANCHOR",
  MENTION = "MENTION",
  LINK = "LINK",
  COLOR = "COLOR",
  FONT_SIZE = "FONT_SIZE",
}

export enum RicosAlignment {
  LEFT = "LEFT",
  CENTER = "CENTER",
  RIGHT = "RIGHT",
}

export enum RicosNodeType {
  TEXT = "TEXT",
  HEADING = "HEADING",
  PARAGRAPH = "PARAGRAPH",
  IMAGE = "IMAGE",
  GIF = "GIF",
  VIDEO = "VIDEO",
  CAPTION = "CAPTION",
  ORDERED_LIST = "ORDERED_LIST",
  BULLETED_LIST = "BULLETED_LIST",
  LIST_ITEM = "LIST_ITEM",
  BLOCKQUOTE = "BLOCKQUOTE",
  TABLE = "TABLE",
  TABLE_ROW = "TABLE_ROW",
  TABLE_CELL = "TABLE_CELL",
  DIVIDER = "DIVIDER",
  CODE_BLOCK = "CODE_BLOCK",
  COLLAPSIBLE_LIST = "COLLAPSIBLE_LIST",
  COLLAPSIBLE_ITEM = "COLLAPSIBLE_ITEM",
  COLLAPSIBLE_ITEM_TITLE = "COLLAPSIBLE_ITEM_TITLE",
  COLLAPSIBLE_ITEM_BODY = "COLLAPSIBLE_ITEM_BODY",
}

export enum FontSizeUnit {
  PX = "px",
  EM = "em",
  REM = "rem",
  PERCENT = "%",
}

export enum InitialExpandedItems {
  FIRST = "FIRST",
  ALL = "ALL",
  NONE = "NONE",
}

export enum Direction {
  LTR = "LTR",
  RTL = "RTL",
}

export enum DividerLineStyle {
  SINGLE = "SINGLE",
  DOUBLE = "DOUBLE",
  DASHED = "DASHED",
  DOTTED = "DOTTED",
}

export enum DividerWidth {
  SMALL = "SMALL",
  MEDIUM = "MEDIUM",
  LARGE = "LARGE",
}

export type TextStyle = {
  textAlignment?: RicosAlignment;
  lineHeight?: string;
};

export type ContainerData = {
  alignment: RicosAlignment;
  width: { size: string };
};

export type MediaData = {
  src: { id: string; url?: string };
  width?: number;
  height?: number;
};

export type RicosDecoration = {
  type: DecorationType;
  linkData?: { link?: { url: string } };
  colorData?: { background?: string; foreground?: string };
  fontWeightValue?: number;
  italicData?: boolean;
  underlineData?: boolean;
  anchorData?: { anchor?: string };
  fontSizeData?: { value: number; unit: FontSizeUnit };
};

export type RicosNode = {
  type: RicosNodeType;
  id: string;
  textData?: { text: string; decorations: RicosDecoration[] };
  headingData?: { level: number; textStyle?: TextStyle };
  style?: { paddingTop?: string; paddingBottom?: string };
  paragraphData?: { textStyle?: TextStyle; indentation?: number };
  blockquoteData?: { indentation?: number };
  nodes: RicosNode[];
  imageData?: {
    image: MediaData;
    containerData: ContainerData;
    altText?: string;
  };
  gifData?: {
    width?: number;
    height?: number;
    original: { gif?: string; mp4?: string };
    containerData: ContainerData;
  };
  videoData?: { video: MediaData; containerData: ContainerData };
  orderedListData?: { start?: string; offset?: string };
  bulletedListData?: { offset?: string };
  tableData?: {
    dimensions: {
      colsWidthRatio: number[];
      rowsHeight: number[];
      colsMinWidth: number[];
    };
  };
  codeBlockData?: { textStyle?: TextStyle };
  collapsibleListData?: {
    initialExpandedItems: InitialExpandedItems;
    direction: Direction;
  };
  dividerData?: {
    lineStyle?: DividerLineStyle;
    width?: DividerWidth;
    alignment?: RicosAlignment;
  };
};
