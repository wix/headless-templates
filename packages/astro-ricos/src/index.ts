import { media } from "@wix/sdk";
import { renderRicosNode } from "./renderers";
import type { RicosNode } from "./types";

export const ricosToHtml = async (content: {
  nodes: RicosNode[];
}): Promise<string> => {
  const helpers = { media };

  return renderRicosNode(content.nodes, helpers);
};
