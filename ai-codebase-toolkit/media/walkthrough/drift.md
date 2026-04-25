# Drift detection

Every generated file embeds a hash of your project state. When you change
`package.json`, `tsconfig.json`, or restructure folders, the toolkit notices
that your AI files no longer match — and offers to regenerate them.

You'll see a `$(sync~spin) N stale` badge in the status bar when drift is
detected. Click it to see exactly which files are out of date.
