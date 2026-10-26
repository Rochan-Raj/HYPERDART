export const validName = (name) =>
  typeof name === "string" &&
  name.length <= 214 &&
  /^(?:@[a-z0-9._-]+\/)?[a-z0-9][a-z0-9._-]*$/.test(name);
export function interpret(searchData, fallback = "") {
  const data = (Array.isArray(searchData) ? searchData[0] : searchData) || {};
  const query = data.query || fallback;
  const intent = /alternatives?|similar to|packages? like/i.test(query)
    ? "alternatives"
    : /compare|\bvs\b|versus/i.test(query)
      ? "compare"
      : "details";
  const names = [
    ...new Set(
      (data.entities || [])
        .filter(
          (e) =>
            e.collectionName === "NPM_PACKAGES" ||
            e.collectionType === "HD_PACKAGES",
        )
        .map((e) => e.sourceID),
    ),
  ];
  if (!names.length || names.some((n) => !validName(n)))
    throw new Error(
      "Search for a valid npm package, for example: npm express.",
    );
  if (intent === "compare" && (names.length < 2 || names.length > 3))
    throw new Error("Compare two or three distinct packages.");
  return {
    query,
    intent,
    names: intent === "compare" ? names : names.slice(0, 1),
  };
}
