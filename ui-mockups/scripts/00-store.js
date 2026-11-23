/* 00-store — state, workspace data, DOM refs and small helpers */

  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var shell = $(".mock-shell") || $(".app");
  if (!shell) return;

  /* ------------------------------------------------------------------ data */

  var WS = {
    "acme-web": {
      name: "acme-web", branch: "main", path: "/home/manuel/Downloads/random_projects/codingPlatform",
      desc: "Marketing site for Acme. Next.js, Postgres and Stripe checkout.",
      tags: ["Next.js", "Postgres", "Stripe"],
      about: "The public site and customer account area. Auth lands here first; billing follows.",
      server: { running: true, port: 3000, cmd: "npm run dev", meta: "PID 4821 · 4h", busy: false },
      task: { title: "Implement authentication", pill: "Needs you", cls: "wait", meta: "task/auth-flow · 4m", view: "auth" },
      change: { file: "app/api/auth/route.ts", add: 64, del: 2 },
      diff: [
        ["c", "@@ -1,4 +1,9 @@"],
        ["a", "+ import { NextResponse } from \"next/server\";"],
        ["a", "+ import { z } from \"zod\";"],
        ["d", "- export async function GET() {"],
        ["a", "+ export async function POST(req: Request) {"],
        ["a", "+   const body = Body.safeParse(await req.json());"],
        ["c", ""]
      ],
      files: [
        {
          path: "components/LoginForm.tsx",
          code: "\"use client\";\n\nimport { useState } from \"react\";\nimport { signIn } from \"@/lib/auth\";\n\nexport function LoginForm() {\n  const [email, setEmail] = useState(\"\");\n  const [error, setError] = useState<string | null>(null);\n\n  async function submit(e: React.FormEvent) {\n    e.preventDefault();\n    const out = await signIn({ email, password });\n    if (!out.ok) setError(out.message);\n  }\n\n  return <form onSubmit={submit}>…</form>;\n}"
        },
        {
          path: "app/api/auth/route.ts",
          code: "import { NextResponse } from \"next/server\";\nimport { z } from \"zod\";\nimport { createSession } from \"@/lib/auth\";\n\nconst Body = z.object({\n  email: z.string().email(),\n  password: z.string().min(8),\n});\n\nexport async function POST(req: Request) {\n  const body = Body.safeParse(await req.json());\n  if (!body.success) {\n    return NextResponse.json({ error: \"Invalid\" }, { status: 400 });\n  }\n  // verify password, create session…\n}"
        },
        {
          path: "lib/auth.ts",
          code: "import { randomBytes } from \"node:crypto\";\nimport { db } from \"@/lib/db\";\n\nconst DAYS = 14;\n\nexport async function createSession(userId: string) {\n  const token = randomBytes(32).toString(\"hex\");\n  const expiresAt = new Date(Date.now() + DAYS * 864e5);\n  await db.session.create({ data: { token, userId, expiresAt } });\n  return { token, expiresAt };\n}"
        },
        {
          path: "package.json",
          code: "{\n  \"name\": \"acme-web\",\n  \"scripts\": { \"dev\": \"next dev\", \"test\": \"vitest run\" },\n  \"dependencies\": {\n    \"next\": \"15.x\",\n    \"react\": \"19.x\",\n    \"zod\": \"^3.23.0\"\n  }\n}"
        }
      ]
    },

    "api-core": {
      name: "api-core", branch: "main", path: "/home/manuel/Downloads/random_projects/codingPlatform/api-core",
      desc: "Public API for the Acme platform. FastAPI, Postgres and Redis for queues.",
      tags: ["FastAPI", "Postgres", "Redis"],
      about: "Rate limiting and request policy for every public endpoint. No product UI lives here.",
      server: { running: true, port: 4000, cmd: "uvicorn app:api --reload", meta: "PID 5120 · 2h", busy: false },
      task: { title: "Rate-limit the public API", pill: "Done", cls: "done", meta: "task/rate-limit · 12m", view: "rate" },
      change: { file: "middleware.ts", add: 18, del: 0 },
      diff: [
        ["c", "@@ -0,0 +1,18 @@"],
        ["a", "+ const WINDOW_MS = 60_000;"],
        ["a", "+ const LIMIT = 60;"],
        ["a", "+ const hits = new Map<string, number[]>();"],
        ["a", "+ export function middleware(req: Request) {"],
        ["a", "+   const ip = req.headers.get(\"x-forwarded-for\") ?? \"local\";"],
        ["c", ""]
      ],
      files: [
        {
          path: "middleware.ts",
          code: "import { NextResponse } from \"next/server\";\n\nconst WINDOW_MS = 60_000;\nconst LIMIT = 60;\nconst hits = new Map<string, number[]>();\n\nexport function middleware(req: Request) {\n  const ip = req.headers.get(\"x-forwarded-for\") ?? \"local\";\n  const now = Date.now();\n  const recent = (hits.get(ip) ?? []).filter((t) => now - t < WINDOW_MS);\n  recent.push(now);\n  hits.set(ip, recent);\n  if (recent.length > LIMIT) {\n    return NextResponse.json({ error: \"rate limited\" }, { status: 429 });\n  }\n}"
        },
        {
          path: "lib/rate-limit.ts",
          code: "const buckets = new Map<string, number[]>();\n\nexport function check(key: string, limit = 60, windowMs = 60_000) {\n  const now = Date.now();\n  const hits = (buckets.get(key) ?? []).filter((t) => now - t < windowMs);\n  hits.push(now);\n  buckets.set(key, hits);\n  return { ok: hits.length <= limit, remaining: Math.max(0, limit - hits.length) };\n}"
        },
        {
          path: "package.json",
          code: "{\n  \"name\": \"api-core\",\n  \"scripts\": { \"dev\": \"uvicorn app:api --reload\", \"test\": \"pytest\" },\n  \"dependencies\": { \"fastapi\": \"^0.115\", \"redis\": \"^5.0\" }\n}"
        }
      ]
    },

    "shop": {
      name: "shop", branch: "main", path: "/home/manuel/Downloads/random_projects/codingPlatform/shop",
      desc: "Checkout experiments. Next.js and Stripe test mode.",
      tags: ["Next.js", "Stripe"],
      about: "A sandbox for checkout flows. Stripe is in test mode; no production keys are mounted.",
      server: { running: false, port: 3002, cmd: "npm run dev", meta: "stopped", busy: false },
      task: null,
      change: { file: "app/checkout/page.tsx", add: 12, del: 3 },
      diff: [
        ["c", "@@ -8,6 +8,15 @@"],
        ["a", "+ import { PaymentForm } from \"@/components/PaymentForm\";"],
        ["d", "- <button>Pay</button>"],
        ["a", "+ <PaymentForm cart={cart} />"],
        ["c", ""]
      ],
      files: [
        {
          path: "app/checkout/page.tsx",
          code: "import { getCart } from \"@/lib/cart\";\nimport { PaymentForm } from \"@/components/PaymentForm\";\n\nexport default async function Checkout() {\n  const cart = await getCart();\n  return (\n    <main className=\"checkout\">\n      <h1>Checkout</h1>\n      <PaymentForm cart={cart} />\n    </main>\n  );\n}"
        },
        {
          path: "lib/cart.ts",
          code: "export async function getCart() {\n  return { items: [], total: 0 };\n}\n\nexport function addItem(cart: { items: unknown[] }, item: unknown) {\n  return { ...cart, items: [...cart.items, item] };\n}"
        },
        {
          path: "package.json",
          code: "{\n  \"name\": \"shop\",\n  \"scripts\": { \"dev\": \"next dev --port 3002\" },\n  \"dependencies\": { \"next\": \"15.x\", \"stripe\": \"^17.0.0\" }\n}"
        }
      ]
    },

    "docs": {
      name: "docs", branch: "main", path: "/home/manuel/Downloads/random_projects/codingPlatform/docs",
      desc: "Product docs and API reference. Mintlify, deployed on every merge.",
      tags: ["Mintlify", "MDX"],
      about: "The public documentation. Content is MDX; the deploy is a separate pipeline.",
      server: { running: false, port: 3001, cmd: "mintlify dev", meta: "stopped", busy: false },
      task: null,
      change: { file: "docs/intro.mdx", add: 8, del: 0 },
      diff: [
        ["c", "@@ -1,4 +1,12 @@"],
        ["a", "+ # Acme docs"],
        ["a", "+"],
        ["a", "+ Welcome to the Acme platform."],
        ["a", "+"],
        ["a", "+ ## Quick start"],
        ["c", ""]
      ],
      files: [
        {
          path: "docs/intro.mdx",
          code: "# Acme docs\n\nWelcome to the Acme platform.\n\n## Quick start\n\n1. Create an account\n2. Install the CLI\n3. Run `acme init`"
        },
        {
          path: "docs.json",
          code: "{\n  \"name\": \"Acme docs\",\n  \"theme\": \"mint\",\n  \"navigation\": [\n    { \"group\": \"Start\", \"pages\": [\"intro\"] }\n  ]\n}"
        }
      ]
    }
  };

  /* ----------------------------------------------------------------- state */

  var currentView = "auth";
  var currentWs = "acme-web";
  var dashboardWs = "acme-web";
  var activeComposer = null;
  var attachPop = null;
  var remotePop = null;
  var remoteBack = null;
  var localInput = null;
  var remoteSearch = "";
  var remotePending = [];
  var remoteDir = [];
  var remoteOpenDirs = {};
  var remoteWsId = "";
  var remoteClickTimer = null;
  var selectPop = null;
  var activeAttachBtn = null;
  var activeSelectBtn = null;
  var activeSelectKind = null;
  var ctxOpen = true;
  var ctxAvailable = true;
  var ctxTab = "explorer";
  var lastWorkspace = "acme-web";
  var openDirs = { "/components": true, "/public": true };
  var explorerWs = null;
  var ARCHIVED = [];
  var pendingArchiveKey = null;
  var archiveConfirmMode = "archive";
  var archiveConfirm = null;
  var archiveConfirmBtn = null;
  var ARCHIVE_META = {
    auth: { title: "Implement authentication", type: "task", ws: "acme-web", view: "auth" },
    rate: { title: "Rate-limit the public API", type: "task", ws: "api-core", view: "rate" },
    temp: { title: "Prisma P2002 seed question", type: "chat", ws: "temporary", view: "temp" }
  };
  var CTX_META = {
    explorer: { label: "Explorer", icon: "▤" },
    diff: { label: "Diff", icon: "±" },
    preview: { label: "Preview", icon: "◫" },
    terminal: { label: "Terminal", icon: "›_" }
  };
  var ctxTabs = [{ key: "explorer", kind: "explorer" }];
  var treeRoot = (window.MOCK_FILES && window.MOCK_FILES.tree) || null;
  var fileMap = (window.MOCK_FILES && window.MOCK_FILES.files) || {};

  var views = $$(".sm-views .sm-view", shell);
  var triggers = $$("button[data-sm-view]", shell);
  var shellmock = $("#shellmock", shell);
  var ctxPanel = $("#sm-context", shell);
  var navToggle = $("#sm-nav-toggle", shell);
  var navExpand = $("#sm-nav-expand", shell);

  /* --------------------------------------------------------------- helpers */

  function esc(s) {
    return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  }
  function hl(code) {
    return esc(code).replace(
      /(\/\/[^\n]*)|("(?:[^"\\\n]|\\.)*"|'(?:[^'\\\n]|\\.)*')|\b(const|let|var|import|from|export|default|async|await|function|return|if|else|new|type|interface|class|extends|try|catch|throw|true|false|null|undefined|for|of|in)\b|\b(\d+(?:\.\d+)?)\b/g,
      function (m, com, str, kw) {
        if (com) return '<span class="c-com">' + m + "</span>";
        if (str) return '<span class="c-str">' + m + "</span>";
        if (kw) return '<span class="c-kw">' + m + "</span>";
        return '<span class="c-num">' + m + "</span>";
      }
    );
  }
  function show(el, yes) { if (el) el.hidden = !yes; }

