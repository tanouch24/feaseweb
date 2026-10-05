#!/usr/bin/env node

/**
 * IndexNow helps compatible engines discover changed URLs. It does not replace
 * Google Search Console, and it does not guarantee crawling, indexing, or rank.
 * Google Search Console remains the source of truth for Google.
 */

import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const SITE_ORIGIN = "https://feaseweb.fr";
const SITE_HOST = "feaseweb.fr";
const INDEXNOW_ENDPOINT = "https://api.indexnow.org/indexnow";
const INDEXNOW_KEY = "09a5588292bdb5314cf888e8b4e9ae97";
const KEY_FILE_NAME = `${INDEXNOW_KEY}.txt`;
const KEY_FILE_PATH = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "public", KEY_FILE_NAME);
const PRIVATE_PATH = /^\/(?:admin|api|auth|espace-client)(?:\/|$)/;

function fail(code, message) {
  throw new Error(`${code}: ${message}`);
}

function normalizeUrl(value) {
  let url;
  try {
    url = new URL(value);
  } catch {
    fail("INVALID_URL", value);
  }
  if (url.protocol !== "https:" || url.hostname !== SITE_HOST || url.port || url.username || url.password) {
    fail("WRONG_TARGET_SITE", `only https://${SITE_HOST} URLs are accepted (${value})`);
  }
  if (url.search || url.hash) fail("INVALID_URL", "query strings and fragments are not accepted");
  if (PRIVATE_PATH.test(url.pathname)) fail("PRIVATE_URL", url.pathname);
  return url;
}

function canonicalComparable(value) {
  const url = new URL(value);
  return `${url.origin}${url.pathname.replace(/\/$/, "") || "/"}`;
}

function getCanonical(html, pageUrl) {
  const match = html.match(/<link\b[^>]*\brel=["'][^"']*\bcanonical\b[^"']*["'][^>]*\bhref=["']([^"']+)["'][^>]*>/i)
    ?? html.match(/<link\b[^>]*\bhref=["']([^"']+)["'][^>]*\brel=["'][^"']*\bcanonical\b[^"']*["'][^>]*>/i);
  if (!match) fail("NOT_CANONICAL", pageUrl.pathname);
  return new URL(match[1], pageUrl).toString();
}

function hasNoindex(html, response) {
  const metaNoindex = /<meta\b[^>]*(?:name|property)=["']robots["'][^>]*content=["'][^"']*noindex/i.test(html)
    || /<meta\b[^>]*content=["'][^"']*noindex[^"']*["'][^>]*(?:name|property)=["']robots["']/i.test(html);
  return metaNoindex || /\bnoindex\b/i.test(response.headers.get("x-robots-tag") ?? "");
}

async function validateKeyFile() {
  const key = (await readFile(KEY_FILE_PATH, "utf8")).trim();
  if (key !== INDEXNOW_KEY) fail("INVALID_INDEXNOW_KEY", `public/${KEY_FILE_NAME} does not contain the configured key`);
  return key;
}

async function validateUrl(value) {
  const url = normalizeUrl(value);
  const response = await fetch(url, { redirect: "follow" });
  if (response.status !== 200) fail("URL_NOT_200", `${url} returned HTTP ${response.status}`);
  const html = await response.text();
  if (hasNoindex(html, response)) fail("URL_NOT_INDEXABLE", `${url} has noindex`);
  if (canonicalComparable(getCanonical(html, url)) !== canonicalComparable(url)) {
    fail("URL_NOT_CANONICAL", `${url} does not declare itself canonical`);
  }
  return url.toString();
}

async function main() {
  const argumentsList = process.argv.slice(2);
  const dryRun = argumentsList.includes("--dry-run");
  const urls = argumentsList.filter((argument) => argument !== "--dry-run");
  if (!urls.length) fail("USAGE", "npm run seo:indexnow -- [--dry-run] https://feaseweb.fr/path ...");
  if (urls.length > 100) fail("TOO_MANY_URLS", "submit at most 100 URLs per command");

  const key = await validateKeyFile();
  const validatedUrls = [];
  for (const url of urls) validatedUrls.push(await validateUrl(url));

  const keyLocation = `${SITE_ORIGIN}/${KEY_FILE_NAME}`;
  if (dryRun) {
    console.log(`INDEXNOW DRY RUN: ${validatedUrls.length} URL(s) validated`);
    console.log(`KEY VALID: public/${KEY_FILE_NAME}`);
    console.log(validatedUrls.join("\n"));
    return;
  }

  const keyResponse = await fetch(keyLocation, { redirect: "follow" });
  if (keyResponse.status !== 200) fail("KEY_NOT_PUBLIC", `${keyLocation} returned HTTP ${keyResponse.status}; deploy the public key before submitting`);

  const response = await fetch(INDEXNOW_ENDPOINT, {
    method: "POST",
    headers: { "content-type": "application/json; charset=utf-8" },
    body: JSON.stringify({ host: SITE_HOST, key, keyLocation, urlList: validatedUrls }),
  });
  const body = (await response.text()).trim();
  console.log(`INDEXNOW RESPONSE: HTTP ${response.status}`);
  console.log(`INDEXNOW ENDPOINT: ${INDEXNOW_ENDPOINT}`);
  if (body) console.log(body);
  if (!response.ok) fail("INDEXNOW_SUBMISSION_FAILED", `HTTP ${response.status}`);
}

main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
