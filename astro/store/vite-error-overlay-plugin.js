export class ErrorOverlay {
  static MESSAGE_TITLE = `We're having trouble displaying this page`;
  static MESSAGE_DESCRIPTION = `Something didn't load correctly on our end.`;

  static getOverlayHTML() {
    return `
      <link rel="stylesheet" href="https://static.parastorage.com/services/picasso-editor-page/f8267b91c2f1bf1ea5fa81a2788ab7b0acb2e6663c71a4cf74417530/569.chunk.min.css">
      <style>
        .error-overlay {
          align-items: center;
          justify-content: center;
          width: 100%;
          height: 100%;
          background: white;
          z-index: 99999;
          display: flex;
          flex-direction: column;
        }

        .error-image-container {
          width: 100%;
          display: flex;
          justify-content: center;
          margin-top: 90px;
        }

        .error-image {
          width: 180px;
          height: 126px;
          user-select: none;
          pointer-events: none;
        }

        .error-content {
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          padding: 0 32px;
          padding-top: 8px;
          padding-bottom: 32px;
          margin-top: 36px;
        }

        .error-title {
          color: var(--wds-color-text-standard-primary, #131720);
          text-align: center;
          margin-bottom: 8px;

          /* Text - Medium/Normal */
          font-family: var(--wds-font-family-default, "Wix Madefor Text");
          font-size: var(--wds-font-size-body-medium, 16px);
          font-style: normal;
          font-weight: 500;
          line-height: var(--wds-font-line-height-body-medium, 24px); /* 150% */
          letter-spacing: var(--wds-font-letter-spacing-0, 0px);
        }

        .error-description {
          color: var(--wds-color-text-standard-secondary, #42454C);
          text-align: center;

          /* Text - Small/Thin */
          font-family: var(--wds-font-family-default, "Wix Madefor Text");
          font-size: var(--wds-font-size-body-small, 14px);
          font-style: normal;
          font-weight: 400;
          line-height: var(--wds-font-line-height-body-small, 20px); /* 142.857% */
          letter-spacing: var(--wds-font-letter-spacing-0, 0px);
          margin: 0;
        }
      </style>

      <div class="error-overlay">
        <!-- Image container (centered, with top margin like ErrorPage) -->
        <div class="error-image-container">
          <img
            src="/error.svg"
            alt="Error illustration"
            class="error-image"
            loading="lazy"
          />
        </div>

        <!-- Content container (matching ErrorPage styling) -->
        <div class="error-content">
          <!-- Main title (matching ErrorPage) -->
          <h1 class="error-title">
            ${ErrorOverlay.MESSAGE_TITLE}
          </h1>

          <!-- Description paragraphs (matching ErrorPage) -->
          <p class="error-description error-description-1">
            ${ErrorOverlay.MESSAGE_DESCRIPTION}
          </p>

        </div>
      </div>
    `;
  }

  static async sendErrorToParent(err, type) {
    // Send error to parent using framewire
    const isDev = import.meta.env?.DEV ?? false;
    const isIframe = window.self !== window.top;

    if (!isDev || !isIframe) {
      return;
    }

    try {
      const loadFramewire = (await import("framewire.js")).default;
      await loadFramewire();
      const { sendMessageToParent, EditorEventMessages } = globalThis.framewire;
      sendMessageToParent({
        type: EditorEventMessages.CLIENT_ERROR,
        clientErrorData: {
          errorType: type,
          message: err?.message || 'Unknown error',
          stack: err?.stack || 'No stack trace available',
        }
      });
    } catch (error) {
      console.warn('Failed to send error to parent via framewire:', error?.message);
    }
  }

	constructor(err) {
		console.log('ErrorPage-style overlay constructor called with:', err);

    // Call editor frame with the error (via post message)
    ErrorOverlay.sendErrorToParent(err, 'build');

    // Create the overlay element using HTML template
		const overlay = document.createElement('div');
		overlay.innerHTML = ErrorOverlay.getOverlayHTML();

		// Add to DOM
		document.body.appendChild(overlay);
	}
}

function getOverlayCode() {
	return `
		${ErrorOverlay.toString()}
	`;
}

function patchOverlay(code) {
  return code.replace('class ErrorOverlay', getOverlayCode() + '\nclass OldErrorOverlay');
}

// See https://github.com/withastro/astro/blob/main/packages/astro/src/vite-plugin-astro-server/plugin.ts#L157
export default function customErrorOverlayPlugin() {
	return {
		name: 'custom-error-overlay',
		transform(code, id, opts = {}) {
			if (opts?.ssr) return;

			if (!id.includes('vite/dist/client/client.mjs')) return;

			// Replace the Vite overlay with ours
			return patchOverlay(code);
		},
	};
}
