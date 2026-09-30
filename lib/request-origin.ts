import "server-only";

const productionOrigin = "https://feaseweb.fr";
const localOrigins = new Set(["http://localhost:3000", "http://127.0.0.1:3000"]);

function allowedOrigins() {
  if (process.env.NODE_ENV === "production") return new Set([productionOrigin]);
  return new Set([productionOrigin, ...localOrigins]);
}

export function isAllowedRequestOrigin(origin: string | null) {
  if (!origin) return false;
  try {
    const parsed = new URL(origin);
    return parsed.origin === origin && allowedOrigins().has(parsed.origin);
  } catch {
    return false;
  }
}

export function validateRequestOrigin(request: Request) {
  if (isAllowedRequestOrigin(request.headers.get("origin"))) return null;
  return Response.json({ error: "Origine de requête interdite." }, { status: 403 });
}
