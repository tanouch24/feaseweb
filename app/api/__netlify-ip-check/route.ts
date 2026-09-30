export function GET(request: Request) {
  return Response.json({
    headerPresent: Boolean(request.headers.get("x-nf-client-connection-ip")),
  });
}
