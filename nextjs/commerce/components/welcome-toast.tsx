"use client";

import { useEffect } from "react";
import { toast } from "sonner";

export function WelcomeToast() {
  useEffect(() => {
    // ignore if screen height is too small
    if (window.innerHeight < 650) return;
    if (!document.cookie.includes("welcome-toast=2")) {
      toast("🛍️ Welcome to Next.js Commerce!", {
        id: "welcome-toast",
        duration: Infinity,
        onDismiss: () => {
          document.cookie = "welcome-toast=2; max-age=31536000; path=/";
        },
        description: (
          <>
            This is a high-performance, SSR storefront powered by Wix, Next.js,
            and Vercel.{" "}
            <a
              href="https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fwix%2Fnextjs-commerce&env=COMPANY_NAME,WIX_CLIENT_ID,SITE_NAME,TWITTER_CREATOR,TWITTER_SITE&envDescription=Supply%20the%20Wix%20Client%20ID%20for%20your%20Wix%20Store.&envLink=https%3A%2F%2Fdev.wix.com%2Fdocs%2Fgo-headless%2Fgetting-started%2Fsetup%2Fauthorization%2Fcreate-an-o-auth-app-for-visitors-and-members&demo-title=Wix%20Store%20Demo&demo-description=A%20NextJS%20Commerce%20site%20working%20with%20Wix%20Stores&demo-url=https%3A%2F%2Fwix-nextjs-commerce.vercel.app%2F&demo-image=https%3A%2F%2Fstatic.wixstatic.com%2Fmedia%2F8dfd06_e9c49cd22b95454daac5e46a92bbad79~mv2.png"
              className="text-blue-600 hover:underline"
              target="_blank"
            >
              Deploy your own
            </a>
            .
          </>
        ),
      });
    }
  }, []);

  return null;
}
