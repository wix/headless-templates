export function readFailureResponse(e: unknown, what: string): Response {
  console.error(`${what} failed to load`, e);
  return new Response(null, { status: 500 });
}
