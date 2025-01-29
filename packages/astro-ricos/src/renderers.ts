import { renderNodeStyle, renderTextStyle } from "./styles";
import { DecorationType, type RicosNode, RicosNodeType } from "./types";
import { renderTag } from "./utils";

const renderSpanNode = (node: RicosNode): string =>
  renderTag({
    tag: "span",
    children: renderRicosNode(node.nodes),
  });

const renderCollapsibleItemNode = (
  node: RicosNode,
  isOpen: boolean,
  collapsibleListData?: any
): string => {
  const titleNode = node.nodes.find(
    (child) => child.type === RicosNodeType.COLLAPSIBLE_ITEM_TITLE
  );
  const bodyNode = node.nodes.find(
    (child) => child.type === RicosNodeType.COLLAPSIBLE_ITEM_BODY
  );
  const title = titleNode ? renderRicosNode([titleNode]) : "";
  const body = bodyNode ? renderRicosNode([bodyNode]) : "";

  return renderTag({
    tag: "details",
    attributes: {
      ...(isOpen && { open: "true" }),
      ...(collapsibleListData.direction && {
        dir: collapsibleListData.direction.toLowerCase(),
      }),
    },
    children:
      renderTag({
        tag: "summary",
        children: title,

        style: {
          "list-style-position": "unset",
        },
      }) + body,
  });
};

const renderNode = {
  [RicosNodeType.TEXT]: (node: RicosNode): string => {
    const { text, decorations } = node.textData ?? {};

    return (
      decorations?.reduce((result, decoration) => {
        const styles = {
          [DecorationType.BOLD]: {
            "font-weight": `${decoration.fontWeightValue}`,
          },
          [DecorationType.ITALIC]: {
            "font-style": decoration.italicData ? "italic" : "normal",
          },
          [DecorationType.UNDERLINE]: {
            "text-decoration": decoration.underlineData ? "underline" : "none",
          },
          [DecorationType.SPOILER]: {
            cursor: "pointer",
            filter: "blur(0.25em)",
          },
          [DecorationType.COLOR]: {
            ...(decoration.colorData?.background && {
              "background-color": decoration.colorData.background,
            }),
            ...(decoration.colorData?.foreground && {
              color: decoration.colorData.foreground,
            }),
          },
          [DecorationType.FONT_SIZE]: {
            "font-size": `${decoration.fontSizeData?.value}${decoration.fontSizeData?.unit}`,
          },
        }[decoration.type];

        const tag = {
          [DecorationType.BOLD]: "strong",
          [DecorationType.ITALIC]: "em",
          [DecorationType.UNDERLINE]: "u",
          [DecorationType.SPOILER]: "span",
          [DecorationType.LINK]: "a",
          [DecorationType.COLOR]: "span",
          [DecorationType.FONT_SIZE]: "span",
        }[decoration.type];

        return renderTag({
          tag,
          children: result,
          style: styles ?? {},
          attributes:
            decoration.type === DecorationType.LINK
              ? {
                  href: decoration.linkData?.link.url,
                  target: "_blank",
                  rel: "noopener noreferrer",
                }
              : {},
        });
      }, text) ?? text
    );
  },

  [RicosNodeType.HEADING]: (node: RicosNode) =>
    renderTag({
      tag: `h${node.headingData.level || 1}`,
      style: { ...renderTextStyle(node.headingData) },
      children: renderRicosNode(node.nodes!),
    }),

  [RicosNodeType.PARAGRAPH]: (node: RicosNode) =>
    renderTag({
      tag: "p",
      children: renderRicosNode(node.nodes),
      attributes: { id: node.id },
      style: {
        ...renderNodeStyle(node.style),
        ...renderTextStyle(node.paragraphData),
      },
    }),

  [RicosNodeType.ORDERED_LIST]: (node: RicosNode) =>
    renderTag({
      tag: "ol",
      attributes: {
        ...(node.orderedListData?.start && {
          start: node.orderedListData.start,
        }),
        "arial-level": node.orderedListData?.offset + 1 || "1",
      },
      children: renderRicosNode(node.nodes!),
    }),

  [RicosNodeType.BULLETED_LIST]: (node: RicosNode) =>
    renderTag({
      tag: "ul",
      attributes: { "arial-level": node.orderedListData?.offset + 1 || "1" },
      children: renderRicosNode(node.nodes!),
    }),

  [RicosNodeType.LIST_ITEM]: (node: RicosNode) =>
    renderTag({ tag: "li", children: renderRicosNode(node.nodes!) }),

  [RicosNodeType.CAPTION]: (node: RicosNode) =>
    renderTag({
      tag: "figcaption",
      children: renderRicosNode(node.nodes!),
      style: {
        ...renderNodeStyle(node.style),
      },
    }),

  [RicosNodeType.BLOCKQUOTE]: (node: RicosNode) =>
    renderTag({
      tag: "blockquote",
      children: renderRicosNode(node.nodes!),
      style: {
        ...renderNodeStyle(node.style),
        ...(node.blockquoteData?.indentation && {
          "margin-inline-start": `${node.blockquoteData.indentation * 1.5}em`,
        }),
      },
    }),

  [RicosNodeType.CODE_BLOCK]: (node: RicosNode) =>
    renderTag({
      tag: "pre",
      children: renderTag({
        tag: "code",
        children: renderRicosNode(node.nodes!),
      }),
      style: {
        ...renderNodeStyle(node.style),
        ...renderTextStyle(node.codeBlockData),
      },
    }),

  [RicosNodeType.DIVIDER]: (node: RicosNode) => {
    const { dividerData } = node;
    const { lineStyle, width, alignment } = dividerData;

    const styles = {
      LEFT: { "margin-left": "0" },
      RIGHT: { "margin-left": "auto" },
      CENTER: { margin: "0 auto" },
    };

    const widthStyles = {
      SMALL: { width: "10%;" },
      MEDIUM: { width: "40%;" },
      LARGE: { width: "100%;" },
    };

    const lineStyles = {
      SINGLE: { "border-top": "1px solid #000;" },
      DOUBLE: { "border-top": "3px double #000;" },
      DASHED: { "border-top": "1px dashed #000;" },
      DOTTED: { "border-top": "1px dotted #000;" },
    };

    return renderTag({
      tag: "div",
      style: {
        ...styles[alignment || "CENTER"],
        ...lineStyles[lineStyle || "SINGLE"],
        ...widthStyles[width || "LARGE"],
        padding: "14px 0",
      },
      attributes: { role: "separator", "aria-label": "divider" },
    });
  },

  [RicosNodeType.IMAGE]: (node: RicosNode, helpers: any) => {
    const { src, width, height } = node.imageData.image;
    const imageUrl = helpers.media.getImageUrl(
      `https://static.wixstatic.com/media/${src.id}`
    ).url;
    const alignment = node.imageData.containerData.alignment.toLowerCase();
    const caption = renderRicosNode(node.nodes!, helpers);

    return renderTag({
      tag: "figure",
      style: {
        "text-align": alignment,
        ...(node.imageData.containerData.width.size === "ORIGINAL" && {
          width: `${width}px`,
          height: `${height}px`,
        }),
      },
      children:
        `<img src="${imageUrl}" width="${width}" height="${height}" alt="${node.imageData.altText}" />` +
        (caption
          ? renderTag({
              tag: "figcaption",
              children: caption,
            })
          : ""),
    });
  },

  [RicosNodeType.GIF]: (node: RicosNode) => {
    const { width, height } = node.gifData;
    const url = node.gifData.original.gif || node.gifData.original.mp4;
    const alignment = node.gifData.containerData.alignment.toLowerCase();

    return renderTag({
      tag: "figure",
      style: {
        "text-align": alignment,
        width: `${width}px`,
        height: `${height}px`,
      },
      children: `<img src="${url}" width="${width}" height="${height}" />`,
    });
  },

  [RicosNodeType.VIDEO]: (node: RicosNode, helpers: any): string => {
    const { videoData } = node;
    const { src } = videoData.video;
    const alignment = videoData.containerData.alignment.toLowerCase();
    const isYouTube =
      src.url?.includes("youtube.com") || src.url?.includes("youtu.be");

    if (isYouTube) {
      const youtubeId =
        src.url.match(/[?&]v=([^&#]+)/)?.[1] || src.url.split("/").pop();
      return renderTag({
        tag: "figure",
        style: { "text-align": alignment },
        children: `
        <iframe
         loading="lazy"
          src="https://www.youtube.com/embed/${youtubeId}?autoplay=0" 
          frameborder="0" allow="accelerometer; encrypted-media; gyroscope; picture-in-picture" 
          allowfullscreen aria-label="Embedded YouTube video">
        </iframe>
      `,
      });
    } else {
      const videoUrl = helpers.media.getVideoUrl(
        `https://video.wixstatic.com/${src.id}`
      ).url;
      return renderTag({
        tag: "figure",
        style: { "text-align": alignment },
        children: `
        <video preload="none" controls>
          <source src="${videoUrl}" type="video/mp4">
          Your browser does not support the video tag.
        </video>
      `,
      });
    }
  },

  [RicosNodeType.COLLAPSIBLE_LIST]: (node: RicosNode): string => {
    const { initialExpandedItems } = node.collapsibleListData;

    const children = node.nodes
      .map((childNode, index) => {
        if (childNode.type === RicosNodeType.COLLAPSIBLE_ITEM) {
          return renderCollapsibleItemNode(
            childNode,
            initialExpandedItems === "FIRST" && index === 0,
            {
              ...node.collapsibleListData,
            }
          );
        }
        return "";
      })
      .join("");

    return renderTag({
      tag: "div",
      children,
    });
  },
  [RicosNodeType.COLLAPSIBLE_ITEM]: renderCollapsibleItemNode,

  [RicosNodeType.TABLE]: (node: RicosNode) => {
    const { colsWidthRatio, colsMinWidth } = node.tableData.dimensions;
    const colGroup = colsWidthRatio
      .map(
        (width, index) =>
          `<col style="${width ? "width: " + width + "px;" : ""} ${
            colsMinWidth[index]
              ? "min-width: " + colsMinWidth[index] + "px;"
              : ""
          }">`
      )
      .join("");
    const tableRows = renderRicosNode(node.nodes!);
    return renderTag({
      tag: "table",
      style: { width: "100%" },
      children: `<colgroup>${colGroup}</colgroup><tbody>${tableRows}</tbody>`,
    });
  },

  [RicosNodeType.TABLE_ROW]: (node: RicosNode) =>
    renderTag({ tag: "tr", children: renderRicosNode(node.nodes!) }),
  [RicosNodeType.TABLE_CELL]: (node: RicosNode) =>
    renderTag({ tag: "td", children: renderRicosNode(node.nodes!) }),
};

export const renderRicosNode = (nodes: RicosNode[], helpers?: any): string =>
  nodes
    ?.map((node) =>
      renderNode[node.type]
        ? renderNode[node.type](node, helpers)
        : renderSpanNode(node)
    )
    .join("");
