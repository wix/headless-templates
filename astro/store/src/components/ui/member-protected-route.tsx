import { ReactNode } from 'react';
import { useMember } from '@/integrations';
import { SignIn } from '@/components/ui/sign-in';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

interface SignInProps {
  title?: string;
  message?: string;
  className?: string;
  cardClassName?: string;
  buttonClassName?: string;
  buttonText?: string;
}

interface LoadingSpinnerProps {
  message?: string;
  className?: string;
  spinnerClassName?: string;
}

interface MemberProtectedRouteProps {
  children: ReactNode;

  // Simple props for quick customization
  messageToSignIn?: string;
  messageToLoading?: string;
  signInTitle?: string;
  signInClassName?: string;
  loadingClassName?: string;

  // Advanced prop objects for full customization
  signInProps?: Partial<SignInProps>;
  loadingSpinnerProps?: Partial<LoadingSpinnerProps>;
}

export function MemberProtectedRoute({
  children,
  messageToSignIn = "Please sign in to access this page.",
  messageToLoading = "Loading page...",
  signInTitle = "Sign In Required",
  signInClassName = "",
  loadingClassName = "",
  signInProps = {},
  loadingSpinnerProps = {}
}: MemberProtectedRouteProps) {
  const { isAuthenticated, isLoading } = useMember();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <LoadingSpinner
          message={messageToLoading}
          className={loadingClassName}
          {...loadingSpinnerProps}
        />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <SignIn
          title={signInTitle}
          message={messageToSignIn}
          className={signInClassName}
          {...signInProps}
        />
      </div>
    );
  }

  return <>{children}</>;
}
