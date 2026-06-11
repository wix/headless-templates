import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useMember } from '@/integrations';

interface SignInProps {
  title?: string;
  message?: string;
  className?: string;
  cardClassName?: string;
  buttonClassName?: string;
  buttonText?: string;
}

export function SignIn({
  title = "Sign In Required",
  message = "Please sign in to access this content.",
  className = "min-h-screen flex items-center justify-center px-4 ",
  cardClassName = "w-fit max-w-xl mx-auto text-foreground",
  buttonClassName = "w-full h-10 max-w-sm mx-auto",
  buttonText = "Sign In"
}: SignInProps) {
  const { actions } = useMember();

  return (
    <div className={className}>
      <Card className={cardClassName}>
        <CardHeader className="text-center space-y-4 py-10 px-10">
          <CardTitle className="">{title}</CardTitle>
          <CardDescription className="">{message}</CardDescription>
        </CardHeader>
        <CardContent className="text-center px-10 pb-10">
          <Button onClick={actions.login} className={buttonClassName}>
            {buttonText}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
