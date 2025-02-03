export const renderNodeStyle = (
  style: Record<string, any>
): Record<string, string> => ({
  ...(style?.["paddingTop"] && { "padding-top": style["paddingTop"] }),
  ...(style?.["paddingBottom"] && { "padding-bottom": style["paddingBottom"] }),
});

export const renderTextStyle = (
  data: Record<string, any>
): Record<string, string> => ({
  ...(data?.["textStyle"]?.textAlignment && {
    "text-align": data["textStyle"].textAlignment.toLowerCase(),
  }),
  ...(data?.["textStyle"]?.lineHeight && {
    "line-height": data["textStyle"].lineHeight,
  }),
  ...(data?.["indentation"] && {
    "margin-inline-start": `${data["indentation"] * 40}px`,
  }),
});
