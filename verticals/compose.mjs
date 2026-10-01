// Compose a kit template: verticals/blank/project (the CLI's blank scaffold plus the extender's
// additions) + the vertical deployed into it by tooling/deploy.mjs + its package-lock.json →
// astro/kit-<vertical>/, the folder templates.json points at and `wix headless init` clones.
//
//   node verticals/compose.mjs [<vertical> …] [--relock] [--lock-from <package-lock.json>]
//
// The sources live in the repository's layout (verticals/<v>, rest/<v>, verticals/shared); the
// install scripts read the legacy layout (<root>/<v>/{app,app-astro,seed,rest}, shared, blank), so
// the sources are assembled into a temp tree first and deploy is pointed at it.
import { cpSync, existsSync, mkdtempSync, mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { basename, dirname, join, resolve } from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { syncLockRoot } from "./tooling/lock.mjs";

const VERTICALS = dirname(fileURLToPath(import.meta.url));
const REPO = resolve(VERTICALS, "..");
const REST = join(REPO, "rest");
const OUT = join(REPO, "astro");
const PREFIX = "kit-";
const DEPLOY = join(VERTICALS, "tooling", "deploy.mjs");
const argv = process.argv.slice(2);
const flag = (n) => { const i = argv.indexOf(`--${n}`); return i !== -1 && argv[i + 1] && !argv[i + 1].startsWith("--") ? argv[i + 1] : null; };
const relock = argv.includes("--relock");
const lockFrom = flag("lock-from");
const skip = new Set(["--relock", "--lock-from", lockFrom].filter(Boolean));
const requested = argv.filter((a) => !skip.has(a));
const all = readdirSync(VERTICALS, { withFileTypes: true })
  .filter((d) => d.isDirectory() && !["shared", "blank", "tooling"].includes(d.name) && existsSync(join(VERTICALS, d.name, "app")))
  .map((d) => d.name).sort();
const verticals = requested.length ? requested : all;
for (const v of verticals) if (!all.includes(v)) { console.error(`unknown vertical "${v}" — ${all.join(", ")}`); process.exit(1); }
if (lockFrom && verticals.length !== 1) { console.error("--lock-from takes exactly one vertical"); process.exit(1); }

// The legacy tree the install scripts read, assembled from the repository's layout.
const legacy = mkdtempSync(join(tmpdir(), "kit-compose-"));
for (const d of readdirSync(VERTICALS, { withFileTypes: true })) {
  if (!d.isDirectory() || d.name === "tooling") continue;
  cpSync(join(VERTICALS, d.name), join(legacy, d.name), { recursive: true });
  if (existsSync(join(REST, d.name))) cpSync(join(REST, d.name), join(legacy, d.name, "rest"), { recursive: true });
}
process.env.WIX_HEADLESS_KIT_TEMPLATES_DIR = legacy;

const canonical = (lock) => {
  for (const [key, p] of Object.entries(lock.packages ?? {})) {
    if (!key || !p.resolved || !/^https?:\/\//.test(p.resolved)) continue;
    const name = key.slice(key.lastIndexOf("node_modules/") + "node_modules/".length);
    p.resolved = `https://registry.npmjs.org/${name}/-/${basename(new URL(p.resolved).pathname)}`;
  }
  return lock;
};

let failed = false;
for (const v of verticals) {
  const project = join(OUT, `${PREFIX}${v}`);
  const lockPath = join(project, "package-lock.json");
  const kept = !relock && !lockFrom && existsSync(lockPath) ? readFileSync(lockPath, "utf8") : null;
  rmSync(project, { recursive: true, force: true });
  cpSync(join(VERTICALS, "blank", "project"), project, { recursive: true });
  const d = spawnSync("node", [DEPLOY, v, "--stack", "astro"], { cwd: project, encoding: "utf8", env: process.env });
  let deployed = {};
  try { deployed = JSON.parse(d.stdout); } catch { /* below */ }
  if (d.status !== 0 || deployed.error) { console.log(JSON.stringify({ vertical: v, error: deployed.error ?? (d.stderr || d.stdout).slice(-400) })); failed = true; continue; }
  let lock = "kept";
  if (kept) writeFileSync(lockPath, kept);
  else if (lockFrom) { cpSync(resolve(lockFrom), lockPath); lock = `from ${lockFrom}`; }
  else {
    const tmp = mkdtempSync(join(tmpdir(), "compose-"));
    cpSync(join(project, "package.json"), join(tmp, "package.json"));
    const r = spawnSync("npm", ["install", "--package-lock-only", "--ignore-scripts", "--no-audit", "--no-fund"], { cwd: tmp, encoding: "utf8", timeout: 600_000 });
    if (r.status !== 0) { console.log(JSON.stringify({ vertical: v, error: `lock resolution failed: ${(r.stderr || r.stdout).slice(-400)}` })); failed = true; rmSync(tmp, { recursive: true, force: true }); continue; }
    writeFileSync(lockPath, JSON.stringify(canonical(JSON.parse(readFileSync(join(tmp, "package-lock.json"), "utf8"))), null, 2) + "\n");
    rmSync(tmp, { recursive: true, force: true });
    lock = "resolved";
  }
  const sync = syncLockRoot(project);
  for (const f of ["wix.config.json", ".env.local", ".env", "AGENTS.md", "CLAUDE.md", ".gemini", "node_modules", ".wix", ".astro", "dist"]) rmSync(join(project, f), { recursive: true, force: true });
  const lockRoot = JSON.parse(readFileSync(lockPath, "utf8")).packages?.[""] ?? {};
  const pkg = JSON.parse(readFileSync(join(project, "package.json"), "utf8"));
  const diff = [];
  for (const field of ["dependencies", "devDependencies"]) {
    for (const [n, r] of Object.entries(pkg[field] ?? {})) if (lockRoot[field]?.[n] !== r) diff.push(`${n}: package.json ${r}, lock ${lockRoot[field]?.[n] ?? "absent"}`);
    for (const n of Object.keys(lockRoot[field] ?? {})) if (!(n in (pkg[field] ?? {}))) diff.push(`${n}: only in the lock`);
  }
  if (diff.length) failed = true;
  writeFileSync(join(project, ".composed"), `generated by verticals/compose.mjs from verticals/${v} — do not edit by hand; edit the sources and recompose\n`);
  console.log(JSON.stringify({ vertical: v, out: `astro/${PREFIX}${v}`, lock, promoted: sync?.promoted ?? [], packages: Object.keys(JSON.parse(readFileSync(lockPath, "utf8")).packages ?? {}).length, depsAdded: deployed.depsAdded, ...(diff.length ? { error: `lock root out of line: ${diff.join("; ")}` } : {}) }));
}
rmSync(legacy, { recursive: true, force: true });
process.exit(failed ? 1 : 0);
