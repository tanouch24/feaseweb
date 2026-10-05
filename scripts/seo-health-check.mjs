#!/usr/bin/env node

const EXPECTED_PRODUCTION_HOST = "feaseweb.fr";
const EXPECTED_SITEMAP_COUNT = 25;
const PRIVATE_PATH = /^\/(?:admin|api|auth)(?:\/|$)/;
const OLD_CONTENT = /fease\.fr|(?:39|78)\s*€(?:\s*\/\s*mois)?|(?:SEO|option)\s+en\s+option|\+39/i;

function argument(name, fallback) {
  const prefix = `--${name}=`;
  const value = process.argv.find((item) => item.startsWith(prefix));
  return value ? value.slice(prefix.length) : fallback;
}

function attributeString(tag) {
  return tag.replace(/^<[^\s>]+\s*|\s*\/?>(?:\s*)$/g, "");
}

function getAttribute(tag, name) {
  const match = attributeString(tag).match(new RegExp(`\\b${name}\\s*=\\s*["']([^"']*)["']`, "i"));
  return match?.[1] ?? "";
}

function getMeta(html, key, attribute = "name") {
  const tags = html.match(/<meta\b[^>]*>/gi) ?? [];
  return getAttribute(tags.find((tag) => getAttribute(tag, attribute).toLowerCase() === key.toLowerCase()) ?? "", "content");
}

function getCanonical(html) {
  const tags = html.match(/<link\b[^>]*>/gi) ?? [];
  return getAttribute(tags.find((tag) => getAttribute(tag, "rel").toLowerCase().split(/\s+/).includes("canonical")) ?? "", "href");
}

function textContent(value) {
  return value.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
}

function parsePage(html, url, baseUrl) {
  const path = new URL(url).pathname;
  const title = textContent((html.match(/<title\b[^>]*>([\s\S]*?)<\/title>/i) ?? [])[1] ?? "");
  const description = getMeta(html, "description");
  const canonical = getCanonical(html);
  const robots = getMeta(html, "robots");
  const h1 = [...html.matchAll(/<h1\b[^>]*>([\s\S]*?)<\/h1>/gi)].map((match) => textContent(match[1]));
  const links = [...html.matchAll(/<a\b[^>]+href=["']([^"']+)["'][^>]*>/gi)].map((match) => match[1]);
  const internalLinks = [...new Set(links.map((href) => {
    try {
      const parsed = new URL(href, baseUrl);
      return parsed.origin === new URL(baseUrl).origin ? parsed.pathname : null;
    } catch {
      return null;
    }
  }).filter(Boolean))];
  const schemas = [...html.matchAll(/<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)];
  const schemaErrors = [];
  for (const [, raw] of schemas) {
    try { JSON.parse(raw); } catch { schemaErrors.push("invalid JSON-LD"); }
  }
  const htmlLang = getAttribute((html.match(/<html\b[^>]*>/i) ?? [""])[0], "lang");
  const viewport = getMeta(html, "viewport");
  const ogUrl = getMeta(html, "og:url", "property");
  return { path, title, description, canonical, robots, h1, internalLinks, schemaCount: schemas.length, schemaErrors, htmlLang, viewport, ogUrl, oldContent: OLD_CONTENT.test(html) };
}

async function fetchPage(url, options = {}) {
  const response = await fetch(url, { redirect: options.redirect ?? "follow" });
  return { response, html: await response.text() };
}

function normalizeBaseUrl(value) {
  const raw = value.trim();
  if (!raw) throw new Error("MISSING_TARGET_SITE: set SEO_BASE_URL or pass --base-url=<url>");

  let parsed;
  try {
    parsed = new URL(raw);
  } catch {
    throw new Error(`INVALID_TARGET_URL: ${raw}`);
  }
  if (!["http:", "https:"].includes(parsed.protocol)) {
    throw new Error(`INVALID_TARGET_URL: only http:// and https:// are supported (${raw})`);
  }
  if (parsed.username || parsed.password) throw new Error("INVALID_TARGET_URL: credentials are not allowed");
  return parsed.origin.replace(/\/$/, "");
}

function sitemapLocations(html, baseUrl) {
  return [...html.matchAll(/<loc>([^<]+)<\/loc>/gi)].map((match) => new URL(match[1].trim(), baseUrl));
}

function hasFeaseWebBrand(html) {
  return /feaseweb/i.test(html) && /<title\b[^>]*>[^<]*feaseweb/i.test(html);
}

function targetSignals(baseUrl, homepageHtml, locations = []) {
  const target = new URL(baseUrl);
  const homepagePage = parsePage(homepageHtml, baseUrl, baseUrl);
  let canonicalHost = "";
  try {
    canonicalHost = homepagePage.canonical ? new URL(homepagePage.canonical, baseUrl).hostname : "";
  } catch {
    canonicalHost = "";
  }
  return {
    productionDomain: target.hostname === EXPECTED_PRODUCTION_HOST,
    brand: hasFeaseWebBrand(homepageHtml),
    canonical: canonicalHost === EXPECTED_PRODUCTION_HOST,
    expectedSitemap: locations.length === EXPECTED_SITEMAP_COUNT,
    sitemapDomain: locations.length > 0 && locations.every((location) => location.hostname === EXPECTED_PRODUCTION_HOST),
  };
}

function wrongTargetError(signals) {
  return new Error(`WRONG_TARGET_SITE: target does not match FeaseWeb (signals: ${Object.entries(signals).filter(([, value]) => value).map(([key]) => key).join(", ") || "none"})`);
}

function validateHomepageTarget(baseUrl, homepageHtml) {
  const signals = targetSignals(baseUrl, homepageHtml);
  if (!signals.productionDomain && !(signals.brand && signals.canonical)) {
    throw wrongTargetError(signals);
  }
}

function validateTarget(baseUrl, homepageHtml, locations) {
  const signals = targetSignals(baseUrl, homepageHtml, locations);
  const identitySignals = [signals.brand, signals.canonical, signals.expectedSitemap || signals.sitemapDomain].filter(Boolean).length;
  const isValid = signals.productionDomain ? identitySignals >= 2 : signals.brand && signals.canonical && identitySignals >= 2;
  if (!isValid) {
    throw wrongTargetError(signals);
  }
}

async function main() {
  const requestedBaseUrl = argument("base-url", process.env.SEO_BASE_URL ?? process.env.BASE_URL ?? "");
  process.stdout.write(`SEO TARGET: ${requestedBaseUrl.trim() || "<missing>"}\n`);
  const baseUrl = normalizeBaseUrl(requestedBaseUrl);
  const homepageResult = await fetchPage(baseUrl);
  if (!homepageResult.response.ok) throw new Error(`TARGET_FETCH_FAILED: homepage ${homepageResult.response.status}: ${baseUrl}`);
  validateHomepageTarget(baseUrl, homepageResult.html);

  const sitemapUrl = `${baseUrl}/sitemap.xml`;
  const sitemapResult = await fetchPage(sitemapUrl);
  if (!sitemapResult.response.ok) throw new Error(`Sitemap ${sitemapResult.response.status}: ${sitemapUrl}`);

  const sitemapLocationUrls = sitemapLocations(sitemapResult.html, baseUrl);
  validateTarget(baseUrl, homepageResult.html, sitemapLocationUrls);

  const urls = sitemapLocationUrls.map((location) => `${baseUrl}${location.pathname}`);
  const canonicalOrigin = sitemapLocationUrls[0] ? sitemapLocationUrls[0].origin : baseUrl;
  const normalized = urls.map((url) => url.replace(/\/$/, ""));
  const duplicateUrls = normalized.filter((url, index) => normalized.indexOf(url) !== index);
  const pages = [];
  const failures = [];
  const warnings = [];

  for (const url of urls) {
    const result = await fetchPage(url);
    const page = parsePage(result.html, url, baseUrl);
    pages.push({ ...page, status: result.response.status });
    const expectedCanonical = `${canonicalOrigin}${page.path}`.replace(/\/$/, "");
    if (result.response.status !== 200) failures.push(`${page.path}: HTTP ${result.response.status}`);
    if (!page.title) failures.push(`${page.path}: missing title`);
    if (!page.description) failures.push(`${page.path}: missing meta description`);
    if (page.canonical.replace(/\/$/, "") !== expectedCanonical) failures.push(`${page.path}: canonical ${page.canonical || "missing"}`);
    if (page.h1.length !== 1) failures.push(`${page.path}: ${page.h1.length} H1`);
    if (page.robots.toLowerCase().includes("noindex")) failures.push(`${page.path}: noindex in sitemap`);
    if (page.oldContent) failures.push(`${page.path}: legacy domain or offer detected`);
    if (page.schemaErrors.length) failures.push(`${page.path}: invalid JSON-LD`);
    if (page.htmlLang !== "fr") warnings.push(`${page.path}: html lang is ${page.htmlLang || "missing"}`);
    if (!page.viewport) warnings.push(`${page.path}: viewport metadata missing`);
    if (page.ogUrl && page.ogUrl.replace(/\/$/, "") !== expectedCanonical) warnings.push(`${page.path}: og:url mismatch`);
  }

  const titleGroups = Object.groupBy(pages, (page) => page.title);
  const descriptionGroups = Object.groupBy(pages, (page) => page.description);
  for (const [title, group] of Object.entries(titleGroups)) if (title && group.length > 1) failures.push(`duplicate title: ${title}`);
  for (const [description, group] of Object.entries(descriptionGroups)) if (description && group.length > 1) failures.push(`duplicate meta description: ${description}`);

  const pathSet = new Set(pages.map((page) => page.path));
  const incoming = new Map(pages.map((page) => [page.path, 0]));
  for (const page of pages) {
    for (const target of page.internalLinks) {
      if (PRIVATE_PATH.test(target)) warnings.push(`${page.path}: private route linked internally (${target})`);
      if (pathSet.has(target)) incoming.set(target, incoming.get(target) + 1);
      else {
        const check = await fetchPage(new URL(target, baseUrl).toString(), { redirect: "manual" });
        if (check.response.status >= 400) failures.push(`${page.path}: broken internal link ${target} (${check.response.status})`);
        if ([301, 302, 307, 308].includes(check.response.status)) warnings.push(`${page.path}: internal link redirects ${target}`);
      }
    }
  }
  for (const [path, count] of incoming) if (count === 0) warnings.push(`orphan sitemap URL: ${path}`);
  for (const page of pages) if (PRIVATE_PATH.test(page.path)) failures.push(`private URL in sitemap: ${page.path}`);

  const report = {
    baseUrl,
    sitemap: { url: sitemapUrl, status: sitemapResult.response.status, count: urls.length, duplicateUrls },
    pages: pages.map(({ path, status, title, description, canonical, robots, h1, schemaCount, htmlLang, viewport, ogUrl }) => ({ path, status, title, description, canonical, robots, h1Count: h1.length, schemaCount, htmlLang, viewport: Boolean(viewport), ogUrl })),
    failures,
    warnings,
  };
  console.log(JSON.stringify(report, null, 2));
  if (failures.length) process.exitCode = 1;
}

main().catch((error) => { console.error(error.message); process.exitCode = 1; });
