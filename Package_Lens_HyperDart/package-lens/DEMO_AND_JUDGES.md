# 2–3 minute demo
0:00–0:20: “Package Lens helps developers inspect npm dependencies, compare options and discover alternatives in hyperDart.” Show official sandbox.
0:20–0:55: Run npm express. Explain real metadata and weekly period. Show npm request deprecation notice if available.
0:55–1:30: Compare express, fastify and koa. Explain version, license, Node requirement and download period. Downloads are usage signals, not a best-package verdict.
1:30–2:05: Show alternatives to moment. Explain shared keywords and heuristic score. Click Compare with original.
2:05–2:30: Show unknown package or offline error, sidebar width and dark theme.
2:30–2:50: Show withHD entry, query.js and api.js. Explain partial failures, timeout, cache and stale-result guard.

# Technical explanation
hyperDart supplies recognized package entities. I normalize searchData and use sourceID, then classify query intent with small rules. Concurrent public npm requests populate normalized cards. Metadata failures remain visible per package; missing download data never becomes zero. Discovery ranks real npm search candidates with an explicit formula. The component retains the official wrapper, sandbox and publishing validator.

# Small live changes to practice
Add another comparison field from verified metadata; change a trigger keyword; adjust candidate count; explain why one missing API response does not discard the other fields. Be ready to trace query → interpret → loadPackage → React render.
