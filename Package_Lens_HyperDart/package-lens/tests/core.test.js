import test from "node:test";
import assert from "node:assert/strict";
import { interpret, validName } from "../src/frontend/query.js";
import {
  loadPackage,
  rankCandidates,
  safeURL,
  getJSON,
} from "../src/frontend/api.js";
const input = (query, names) => ({
  query,
  entities: names.map((sourceID) => ({
    sourceID,
    collectionName: "NPM_PACKAGES",
  })),
});
for (const [q, n, intent] of [
  ["npm express", ["express"], "details"],
  ["compare express and fastify", ["express", "fastify"], "compare"],
  ["compare express, fastify, koa", ["express", "fastify", "koa"], "compare"],
  ["packages like express", ["express"], "alternatives"],
  ["npm @angular/core", ["@angular/core"], "details"],
])
  test(q, () => {
    assert.equal(interpret([input(q, n)]).intent, intent);
    assert.deepEqual(interpret(input(q, n)).names, n);
  });
test("invalid names and incomplete comparisons", () => {
  assert.equal(validName("../bad"), false);
  assert.throws(() => interpret(input("compare express", ["express"])));
});
test("unsafe repository URL rejected", () =>
  assert.equal(safeURL("javascript:alert(1)"), null));
test("ranking removes original and duplicates", () => {
  const p = { package: { name: "other", keywords: ["date"] } };
  assert.equal(
    rankCandidates([p, p, { package: { name: "moment" } }], {
      name: "moment",
      keywords: ["date"],
    }).length,
    1,
  );
});
test("partial API failure preserves metadata; scoped URL encoded", async () => {
  const old = global.fetch;
  const urls = [];
  global.fetch = async (url) => {
    urls.push(url);
    return url.includes("downloads")
      ? { ok: false, status: 429 }
      : {
          ok: true,
          json: async () => ({ name: "@test/pkg", version: "1.0.0" }),
        };
  };
  try {
    const p = await loadPackage("@test/pkg");
    assert.equal(p.version, "1.0.0");
    assert.equal(p.downloads, undefined);
    assert.ok(p.issues.length);
    assert.ok(urls[0].includes("%40test%2Fpkg"));
  } finally {
    global.fetch = old;
  }
});
test("404 and server failure are explicit", async () => {
  const old = global.fetch;
  try {
    global.fetch = async () => ({ ok: false, status: 404 });
    await assert.rejects(getJSON("https://test.invalid/missing"), /not found/);
    global.fetch = async () => ({ ok: false, status: 503 });
    await assert.rejects(getJSON("https://test.invalid/failure"), /503/);
  } finally {
    global.fetch = old;
  }
});
