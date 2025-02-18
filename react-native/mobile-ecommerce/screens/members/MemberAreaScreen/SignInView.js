import { useLoginByWixManagedPages } from "../../../authentication/LoginHandler";
import { useWixSession } from "../../../authentication/session";
import { LoginForm } from "../../../components/Form/LoginForm";

export const SignInView = () => {
  const { sessionLoading } = useWixSession();
  const { openBrowser } = useLoginByWixManagedPages();

  return (
    <LoginForm
      loading={sessionLoading}
      disabled={sessionLoading}
      onWixLogin={() => {
        openBrowser();
      }}
    />
  );
};
