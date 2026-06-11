'use client';

import React from 'react';
import '@wix/ricos/css/all-plugins-viewer.css';
import { quickStartViewerPlugins, RicosViewer } from '@wix/ricos';
import { wixEventsV2 } from '@wix/events';

interface EventRichTextProps {
  richText?: wixEventsV2.RichContent | null;
  title?: React.ReactNode;
}

const EventRichText = ({ richText, title }: EventRichTextProps) => {
  if (!richText) {
    return null;
  }

  return (
    <>
      {title && <>{title}</>}
      <RicosViewer
        plugins={quickStartViewerPlugins()}
        content={richText as any}
      />
    </>
  );
};

export default EventRichText;
