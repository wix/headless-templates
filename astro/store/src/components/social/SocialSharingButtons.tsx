import React, { useState } from 'react';
import {
  FacebookShareButton,
  LinkedinShareButton,
  TwitterShareButton,
} from 'react-share';

interface SocialSharingButtonsProps {
  url?: string;
  title?: string;
  description?: string;
  hashtags?: string[];
  className?: string;
}

export const SocialSharingButtons: React.FC<SocialSharingButtonsProps> = ({
  url = typeof window !== 'undefined' ? window.location.href : '',
  title = 'Check out this amazing product',
  className = '',
}) => {
  const [copySuccess, setCopySuccess] = useState(false);

  const copyToClipboard = async (url: string): Promise<boolean> => {
    try {
      await navigator.clipboard.writeText(url);
      return true;
    } catch (err) {
      console.error('Failed to copy to clipboard:', err);
      return false;
    }
  };

  const handleCopyLink = async () => {
    const success = await copyToClipboard(url);
    if (success) {
      setCopySuccess(true);
      // Reset the success state after 2 seconds
      setTimeout(() => {
        setCopySuccess(false);
      }, 2000);
    }
  };
  return (
    <div
      className={`flex items-center gap-3 pt-2 border-t border-social-subtle ${className}`}
    >
      <span className="text-social-muted text-sm">Share:</span>
      <div className="flex items-center gap-2">
        <FacebookShareButton url={url} title={title}>
          <div className="w-8 h-8 rounded-full bg-surface-primary hover:bg-surface-hover border border-surface-primary flex items-center justify-center transition-all duration-200 hover:scale-105">
            <svg
              className="w-4 h-4 text-content-secondary hover:text-content-primary transition-colors"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
            </svg>
          </div>
        </FacebookShareButton>
        <TwitterShareButton url={url} title={title}>
          <div className="w-8 h-8 rounded-full bg-surface-primary hover:bg-surface-hover border border-surface-primary flex items-center justify-center transition-all duration-200 hover:scale-105">
            <svg
              className="w-4 h-4 text-content-secondary hover:text-content-primary transition-colors"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M14.095479,10.316482L22.286354,1h-1.940718l-7.115352,8.087682L7.551414,1H1l8.589488,12.231093L1,23h1.940717  l7.509372-8.542861L16.448587,23H23L14.095479,10.316482z M11.436522,13.338465l-0.871624-1.218704l-6.924311-9.68815h2.981339  l5.58978,7.82155l0.867949,1.218704l7.26506,10.166271h-2.981339L11.436522,13.338465z" />
            </svg>
          </div>
        </TwitterShareButton>
        <LinkedinShareButton url={url} title={title}>
          <div className="w-8 h-8 rounded-full bg-surface-primary hover:bg-surface-hover border border-surface-primary flex items-center justify-center transition-all duration-200 hover:scale-105">
            <svg
              className="w-4 h-4 text-content-secondary hover:text-content-primary transition-colors"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
            </svg>
          </div>
        </LinkedinShareButton>
        <CopyLinkButton
          handleCopyLink={handleCopyLink}
          copySuccess={copySuccess}
        />
      </div>
      {copySuccess && (
        <span className="text-social-link text-xs animate-fade-in">
          Copied!
        </span>
      )}
    </div>
  );
};

export const CopyLinkButton = ({
  handleCopyLink,
  copySuccess,
}: {
  handleCopyLink: () => void;
  copySuccess: boolean;
}) => {
  return (
    <button
      onClick={handleCopyLink}
      className="w-8 h-8 rounded-full bg-surface-primary hover:bg-surface-hover border border-surface-primary flex items-center justify-center transition-all duration-200 hover:scale-105"
      title="Copy link"
    >
      {copySuccess ? (
        <svg
          className="w-4 h-4 text-status-success transition-colors"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M5 13l4 4L19 7"
          />
        </svg>
      ) : (
        <svg
          className="w-4 h-4 text-content-secondary hover:text-content-primary transition-colors"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3"
          />
        </svg>
      )}
    </button>
  );
};

export default SocialSharingButtons;
