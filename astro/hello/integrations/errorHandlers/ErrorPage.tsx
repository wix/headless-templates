import { useRouteError } from "react-router";
import { useEffect } from "react";
import { ErrorOverlay } from "../../vite-error-overlay-plugin";

export default function ErrorPage() {
  const error = useRouteError() as Error;

  useEffect(() => {
    ErrorOverlay.sendErrorToParent(error, 'runtime');
  }, [error]);

  return (
    <div className="w-full h-full bg-white flex items-center justify-center gap">
      <div dangerouslySetInnerHTML={{ __html: ErrorOverlay.getOverlayHTML() }} />
    </div>
  );
};
