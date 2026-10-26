import { validName } from "./query.js";
const cache = new Map();
export async function getJSON(url) {
  const cached = cache.get(url);
  if (cached && Date.now() - cached.time < 300000) return cached.data;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 12000);
  try {
    const response = await fetch(url, { signal: controller.signal });
    if (!response.ok)
      throw new Error(
        response.status === 404
          ? "Package not found"
          : response.status === 429
            ? "Rate limit reached. Try again shortly."
            : `Service returned HTTP ${response.status}`,
      );
    const data = await response.json();
    if (cache.size > 100) cache.clear();
    cache.set(url, { time: Date.now(), data });
    return data;
  } catch (error) {
    throw new Error(
      error.name === "AbortError"
        ? "Request timed out. Try again."
        : error.message,
    );
  } finally {
    clearTimeout(timer);
  }
}
export function safeURL(value) {
  if (typeof value !== "string") return null;
  try {
    const url = new URL(value.replace(/^git\+/, ""));
    return ["https:", "http:"].includes(url.protocol) ? url.href : null;
  } catch {
    return null;
  }
}
export async function loadPackage(name) {
  if (!validName(name)) throw new Error("Invalid package name");
  const encoded = encodeURIComponent(name);
  const results = await Promise.allSettled([
    getJSON(`https://registry.npmjs.org/${encoded}/latest`),
    getJSON(`https://registry.npmjs.org/${encoded}`),
    getJSON(`https://api.npmjs.org/downloads/point/last-week/${encoded}`),
  ]);
  const [latest, full, weekly] = results.map((r) =>
    r.status === "fulfilled" ? r.value : null,
  );
  const record = full?.versions?.[full?.["dist-tags"]?.latest];
  const meta = latest || record;
  if (!meta)
    throw new Error(results[0].reason?.message || "Metadata unavailable");
  return {
    name,
    description: meta.description,
    version: meta.version,
    date: full?.time?.[meta.version],
    license:
      typeof meta.license === "string" ? meta.license : meta.license?.type,
    repository: safeURL(
      typeof meta.repository === "string"
        ? meta.repository
        : meta.repository?.url,
    ),
    downloads: weekly?.downloads,
    period: weekly ? `${weekly.start} to ${weekly.end}` : null,
    deprecated: meta.deprecated,
    node: meta.engines?.node,
    types: meta.types || meta.typings ? "Declared types entry" : "Not verified",
    esm: meta.type === "module" ? "Declared type: module" : "Not verified",
    keywords: Array.isArray(meta.keywords) ? meta.keywords : [],
    issues: results
      .filter((r) => r.status === "rejected")
      .map((r) => r.reason.message),
  };
}
export function rankCandidates(items, original) {
  const keys = new Set(original.keywords.map((k) => String(k).toLowerCase()));
  const seen = new Set([original.name]);
  return items
    .flatMap((item) => {
      const p = item.package;
      if (!p || !validName(p.name) || seen.has(p.name)) return [];
      seen.add(p.name);
      const shared = (p.keywords || []).filter((k) =>
        keys.has(String(k).toLowerCase()),
      );
      return [
        {
          ...p,
          shared,
          score:
            shared.length * 2 +
            (item.score?.detail?.popularity || 0) +
            (item.searchScore ? item.searchScore / (1 + item.searchScore) : 0),
        },
      ];
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, 5);
}
export async function alternatives(original) {
  const terms =
    original.keywords.slice(0, 5).join(" ") ||
    original.description ||
    original.name;
  const data = await getJSON(
    `https://registry.npmjs.org/-/v1/search?text=${encodeURIComponent(terms)}&size=25`,
  );
  return Promise.all(
    rankCandidates(data.objects || [], original).map(async (candidate) => {
      try {
        return {
          ...(await loadPackage(candidate.name)),
          shared: candidate.shared,
        };
      } catch (error) {
        return {
          name: candidate.name,
          description: candidate.description,
          shared: candidate.shared,
          issues: [error.message],
        };
      }
    }),
  );
}
