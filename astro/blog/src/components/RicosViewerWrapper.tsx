import React from "react";
import { quickStartViewerPlugins, RicosViewer } from "@wix/ricos";
import "@wix/ricos/css/all-plugins-viewer.css";

const RicosViewerWrapper = ({ content, ...otherProps }) => {
  const pluginsConfig = quickStartViewerPlugins();

  return (
    <RicosViewer content={content} plugins={pluginsConfig} {...otherProps} />
  );
};

export default RicosViewerWrapper;
