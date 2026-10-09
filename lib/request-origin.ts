import "server-only";

// feaseweb.fr et www.feaseweb.fr servent le même site : une action lancée
// depuis l'une ou l'autre ne doit pas être refusée (403).
const productionOrigins = ["https://feaseweb.fr", "https://www.feaseweb.fr"];
const localOrigins = ["http://localhost:3000", "http://127.0.0.1:3000"];

function configuredAppOrigin() {
  try {
    return process.env.NEXT_PUBLIC_APP_URL ? new URL(process.env.NEXT_PUBLIC_APP_URL).origin : null;
  } catch {
    return null;
  }
}

function allowedOrigins() {
  const origins = new Set(productionOrigins);
  const appOrigin = configuredAppOrigin();
  if (appOrigin?.startsWith("https://")) origins.add(appOrigin);
  if (process.env.NODE_ENV !== "production") localOrigins.forEach((origin) => origins.add(origin));
  return origins;
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
