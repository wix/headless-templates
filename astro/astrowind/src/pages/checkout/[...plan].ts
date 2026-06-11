import { redirects } from '@wix/redirects';
import type { APIRoute } from 'astro';

async function createCheckoutUrl(postFlowUrl: string, planId: string) {
  const { redirectSession } = await redirects.createRedirectSession({
    paidPlansCheckout: { planId },
    callbacks: {
      postFlowUrl,
    },
  });

  return redirectSession!.fullUrl!;
}

export const GET: APIRoute = async ({ redirect, request, params }) => {
  const checkoutUrl = await createCheckoutUrl(new URL(request.url).origin, params.plan!);

  return redirect(checkoutUrl);
};

export const prerender = false;
