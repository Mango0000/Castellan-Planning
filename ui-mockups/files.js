/* Demo file system used by the file explorer and file tabs. */
window.MOCK_FILES = {
  tree: {
    name: "codingPlatform",
    type: "dir",
    children: [
      {
        name: ".console",
        type: "dir",
        children: [
          { name: "dashboard.json", type: "file", path: "/.console/dashboard.json" }
        ]
      },
      {
        name: "app",
        type: "dir",
        children: [
          {
            name: "api",
            type: "dir",
            children: [
              {
                name: "auth",
                type: "dir",
                children: [
                  { name: "route.ts", type: "file", path: "/app/api/auth/route.ts" }
                ]
              }
            ]
          },
          { name: "globals.css", type: "file", path: "/app/globals.css" },
          { name: "layout.tsx", type: "file", path: "/app/layout.tsx" }
        ]
      },
      {
        name: "components",
        type: "dir",
        children: [
          { name: "Hero.tsx", type: "file", path: "/components/Hero.tsx" },
          { name: "LoginForm.tsx", type: "file", path: "/components/LoginForm.tsx" }
        ]
      },
      {
        name: "public",
        type: "dir",
        children: [
          { name: "app.css", type: "file", path: "/public/app.css" },
          { name: "app.js", type: "file", path: "/public/app.js" },
          { name: "index.html", type: "file", path: "/public/index.html" },
          { name: "og-card.svg", type: "file", path: "/public/og-card.svg" }
        ]
      },
      { name: "README.md", type: "file", path: "/README.md" },
      { name: "package.json", type: "file", path: "/package.json" }
    ]
  },
  files: {
    "/README.md": {
      kind: "markdown",
      size: "2.4 KB",
      content: [
        "# codingPlatform",
        "",
        "A self-hosted console for **one coding agent**.",
        "",
        "## What is in here",
        "",
        "- `app/` — Next.js routes and the server entrypoints",
        "- `components/` — the shell and task UI",
        "- `public/` — static assets, including the demo site",
        "- `.console/` — workspace dashboard and runtime state",
        "",
        "## Run locally",
        "",
        "```bash",
        "npm install",
        "npm run dev",
        "```",
        "",
        "> Everything in this rail is read-only. The agent writes through approvals.",
        "",
        "## Context rail",
        "",
        "Click a file to open it in a tab. Markdown renders, images preview, and HTML runs in a sandboxed frame.",
        "",
        "| Surface | Behavior |",
        "| --- | --- |",
        "| Markdown | rendered preview |",
        "| Images | fit-to-pane preview |",
        "| HTML | sandboxed site |",
        "| Code | read-only text |",
        "",
        "The location bar tracks the folder you are browsing."
      ].join("\n")
    },
    "/package.json": {
      kind: "code",
      language: "json",
      size: "780 B",
      content: [
        "{",
        '  "name": "coding-platform",',
        '  "private": true,',
        '  "scripts": {',
        '    "dev": "next dev",',
        '    "build": "next build",',
        '    "test": "vitest run"',
        "  },",
        '  "dependencies": {',
        '    "next": "15.1.0",',
        '    "react": "19.0.0"',
        "  }",
        "}"
      ].join("\n")
    },
    "/.console/dashboard.json": {
      kind: "code",
      language: "json",
      size: "420 B",
      content: [
        "{",
        '  "version": 3,',
        '  "widgets": [',
        '    { "type": "dev-server", "span": 2 },',
        '    { "type": "active-task" },',
        '    { "type": "recent-changes" },',
        '    { "type": "description" }',
        "  ]",
        "}"
      ].join("\n")
    },
    "/app/api/auth/route.ts": {
      kind: "code",
      language: "ts",
      size: "1.1 KB",
      content: [
        'import { NextResponse } from "next/server";',
        'import { z } from "zod";',
        "",
        "export async function POST(req: Request) {",
        "  const schema = z.object({",
        '    email: z.string().email(),',
        '    password: z.string().min(8)',
        "  });",
        "",
        "  const parsed = schema.safeParse(await req.json());",
        "  if (!parsed.success) {",
        "    return NextResponse.json(",
        '      { error: "Invalid email or password" },',
        "      { status: 400 }",
        "    );",
        "  }",
        "",
        "  const user = await findUserByEmail(parsed.data.email);",
        "  if (!user || !(await verifyPassword(user, parsed.data.password))) {",
        "    return NextResponse.json({ error: \"Unauthorized\" }, { status: 401 });",
        "  }",
        "",
        "  return NextResponse.json({ ok: true });",
        "}"
      ].join("\n")
    },
    "/app/globals.css": {
      kind: "code",
      language: "css",
      size: "640 B",
      content: [
        "@tailwind base;",
        "@tailwind components;",
        "@tailwind utilities;",
        "",
        ":root {",
        "  --paper: #f4f0e6;",
        "  --ink: #1b1a17;",
        "  --green: #17604b;",
        "  --line: #ded6c6;",
        "}",
        "",
        "body {",
        "  background: var(--paper);",
        "  color: var(--ink);",
        "  font-family: Inter, system-ui, sans-serif;",
        "}"
      ].join("\n")
    },
    "/app/layout.tsx": {
      kind: "code",
      language: "tsx",
      size: "580 B",
      content: [
        'import type { Metadata } from "next";',
        'import "./globals.css";',
        "",
        "export const metadata: Metadata = {",
        '  title: "console",',
        '  description: "A coding platform you own"',
        "};",
        "",
        "export default function RootLayout({",
        "  children",
        "}: Readonly<{ children: React.ReactNode }>) {",
        "  return (",
        '    <html lang="en">',
        "      <body>{children}</body>",
        "    </html>",
        "  );",
        "}"
      ].join("\n")
    },
    "/components/LoginForm.tsx": {
      kind: "code",
      language: "tsx",
      size: "1.6 KB",
      content: [
        '"use client";',
        "",
        'import { useState } from "react";',
        'import { signIn } from "@/lib/auth";',
        "",
        "export function LoginForm() {",
        '  const [email, setEmail] = useState("");',
        '  const [password, setPassword] = useState("");',
        "  const [error, setError] = useState<string | null>(null);",
        "",
        "  async function submit(e: React.FormEvent) {",
        "    e.preventDefault();",
        "    const { error } = await signIn(email, password);",
        "    if (!error) window.location.assign('/app');",
        "    else setError(error);",
        "  }",
        "",
        "  return (",
        '    <form onSubmit={submit} className="login">',
        '      <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" />',
        '      <input value={password} onChange={(e) => setPassword(e.target.value)} type="password" placeholder="Password" />',
        '      {error && <p className="error">{error}</p>}',
        '      <button type="submit">Sign in</button>',
        "    </form>",
        "  );",
        "}"
      ].join("\n")
    },
    "/components/Hero.tsx": {
      kind: "code",
      language: "tsx",
      size: "520 B",
      content: [
        "export function Hero() {",
        "  return (",
        '    <section className="hero">',
        '      <span className="eyebrow">acme-web</span>',
        "      <h1>Ship small. Own everything.</h1>",
        "      <p>A static page rendered inside the context rail.</p>",
        '      <a className="cta" href="/app">Start a task</a>',
        "    </section>",
        "  );",
        "}"
      ].join("\n")
    },
    "/public/app.css": {
      kind: "code",
      language: "css",
      size: "1.2 KB",
      content: [
        ":root { --paper: #f4f0e6; --ink: #143f33; --accent: #17604b; }",
        "* { box-sizing: border-box; }",
        "body { margin: 0; background: var(--paper); color: var(--ink); font-family: Inter, system-ui, sans-serif; }",
        ".wrap { min-height: 100vh; display: grid; place-content: center; gap: 14px; padding: 28px; }",
        ".eyebrow { font-family: ui-monospace, monospace; font-size: 10px; letter-spacing: .16em; text-transform: uppercase; color: #5d756b; }",
        "h1 { margin: 0; font-family: Georgia, serif; font-size: clamp(30px, 7vw, 54px); line-height: 1.02; letter-spacing: -.03em; }",
        "p { margin: 0; max-width: 32ch; color: #4d665c; font-size: 14px; line-height: 1.6; }",
        ".cta { justify-self: start; border: 0; border-radius: 999px; background: var(--accent); color: #f4f0e6; padding: 10px 16px; font: 12px ui-monospace, monospace; cursor: pointer; }",
        ".note { font: 11px ui-monospace, monospace; color: #5d756b; }"
      ].join("\n")
    },
    "/public/app.js": {
      kind: "code",
      language: "js",
      size: "460 B",
      content: [
        "const button = document.querySelector('#cta');",
        "const note = document.querySelector('#note');",
        "if (button && note) {",
        "  button.addEventListener('click', () => {",
        "    note.hidden = false;",
        "    note.textContent = 'Queued. One agent at a time.';",
        "  });",
        "}"
      ].join("\n")
    },
    "/public/index.html": {
      kind: "html",
      size: "2.1 KB",
      content: [
        "<!doctype html>",
        '<html lang="en">',
        "<head>",
        '  <meta charset="utf-8">',
        '  <meta name="viewport" content="width=device-width, initial-scale=1">',
        "  <title>acme-web — static preview</title>",
        "  <style>",
        "    :root { --paper: #f4f0e6; --ink: #143f33; --accent: #17604b; }",
        "    * { box-sizing: border-box; }",
        "    body { margin: 0; background: var(--paper); color: var(--ink); font-family: Inter, system-ui, sans-serif; }",
        "    .wrap { min-height: 100vh; display: grid; align-content: center; gap: 14px; padding: 28px; }",
        "    .eyebrow { font: 10px ui-monospace, monospace; letter-spacing: .16em; text-transform: uppercase; color: #5d756b; }",
        "    h1 { margin: 0; font-family: Georgia, serif; font-size: clamp(30px, 8vw, 54px); line-height: 1.02; letter-spacing: -.03em; }",
        "    p { margin: 0; max-width: 34ch; color: #4d665c; font-size: 14px; line-height: 1.6; }",
        "    .cta { justify-self: start; border: 0; border-radius: 999px; background: var(--accent); color: #f4f0e6; padding: 10px 16px; font: 12px ui-monospace, monospace; cursor: pointer; }",
        "    .note { font: 11px ui-monospace, monospace; color: #5d756b; }",
        "    .grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 7px; margin-top: 14px; }",
        "    .tile { height: 54px; border-radius: 8px; background: #e5ddcc; border: 1px solid #d8ccb8; }",
        "  </style>",
        "</head>",
        "<body>",
        '  <main class="wrap">',
        '    <span class="eyebrow">acme-web / public</span>',
        "    <h1>Ship small.<br>Own everything.</h1>",
        "    <p>A static page rendered inside the context rail. HTML, CSS and JS run in a sandbox.</p>",
        '    <button class="cta" id="cta">Start a task</button>',
        '    <span class="note" id="note" hidden></span>',
        '    <div class="grid"><span class="tile"></span><span class="tile"></span><span class="tile"></span></div>',
        "  </main>",
        "  <script>",
        "    const button = document.querySelector('#cta');",
        "    const note = document.querySelector('#note');",
        "    button.addEventListener('click', () => { note.hidden = false; note.textContent = 'Queued. One agent at a time.'; });",
        "  </script>",
        "</body>",
        "</html>"
      ].join("\n")
    },
    "/public/og-card.svg": {
      kind: "image",
      size: "3.4 KB",
      content: `<svg xmlns="http://www.w3.org/2000/svg" width="640" height="400" viewBox="0 0 640 400" role="img" aria-label="Teal and cream abstract card">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#f4f0e6"/>
      <stop offset="1" stop-color="#e8e2d2"/>
    </linearGradient>
    <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#0f4d3d"/>
      <stop offset="1" stop-color="#2a7a60"/>
    </linearGradient>
  </defs>
  <rect width="640" height="400" fill="url(#bg)"/>
  <circle cx="512" cy="74" r="150" fill="url(#g)" opacity=".95"/>
  <path d="M0 320 C140 250 250 350 390 290 C490 246 570 292 640 250 V400 H0Z" fill="#d6cbb4"/>
  <path d="M0 352 C150 300 260 390 420 330 C510 296 580 330 640 306 V400 H0Z" fill="#c5b89e" opacity=".7"/>
  <g fill="none" stroke="#123f33" stroke-width="2" opacity=".7">
    <path d="M48 56h64M48 72h104M48 88h38"/>
  </g>
  <text x="48" y="132" font-family="Georgia, 'Times New Roman', serif" font-size="38" fill="#133f33">Ship small.</text>
  <text x="48" y="174" font-family="Georgia, 'Times New Roman', serif" font-size="38" fill="#133f33">Own everything.</text>
  <text x="48" y="206" font-family="ui-monospace, SFMono-Regular, Menlo, monospace" font-size="12" fill="#4d665c" letter-spacing="1.4">A STATIC CARD FROM /public</text>
  <rect x="48" y="238" width="132" height="32" rx="16" fill="#123f33"/>
  <text x="114" y="258" text-anchor="middle" font-family="ui-monospace, SFMono-Regular, Menlo, monospace" font-size="11" fill="#f4f0e6">640 × 400</text>
</svg>`
    }
  }
};
