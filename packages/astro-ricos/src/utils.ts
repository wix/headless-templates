export const objectToAttributes = (
  attributes: Record<string, string>
): string =>
  Object.entries(attributes)
    .map(([key, value]) => `${key}="${value}"`)
    .join(" ");

export const objectToStyle = (style: Record<string, string>): string =>
  Object.entries(style)
    .map(([key, value]) => `${key}: ${value}`)
    .join("; ");

export const renderTag = ({
  tag,
  attributes = {},
  children = "",
  style = {},
}: {
  tag: string;
  children?: string;
  attributes?: Record<string, string>;
  style?: Record<string, string>;
}): string => {
  const attributesString = Object.keys(attributes).length
    ? ` ${objectToAttributes(attributes)}`
    : "";
  const styleString = Object.keys(style).length
    ? ` style="${objectToStyle(style)}"`
    : "";

  return `<${tag}${attributesString}${styleString}>${children}</${tag}>`;
};
