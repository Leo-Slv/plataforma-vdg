# Landing Page

## Why

The landing page (`/`) is the first thing any visitor — church member or
not — sees. It has to explain what the platform offers (free and paid
courses from Igreja Viver da Graça's discipleship school), build enough
trust to justify creating an account, and route the visitor into either
signup or the course catalog. It replaces the current Next.js scaffold
placeholder at `src/app/page.tsx`.

## Source

Design reference: artboards `1a` ("Landing page — desktop") and `1b`
("Landing — mobile") in
[`Docs/design/mockups/Plataforma VDG.html`](../../design/mockups/Plataforma%20VDG.html).
Visual system per the mockup's own annotation: near-black / near-white
base, geometric sans (Jost) for headings, DM Sans for body text, a
restrained cool blue reserved for actions and progress indicators.

## Goals

- Communicate what the school is and who it's for, above the fold.
- Surface a small set of courses to make the offer concrete, not abstract.
- Explain the path from "visitor" to "watching a lesson" in a few steps,
  since course access is gated behind account creation + email
  confirmation (see CLAUDE.md, "Auth").
- Drive two primary actions: start a free account, or browse the catalog.
- Work as a single responsive page (no separate mobile route) covering
  the desktop (`1a`) and mobile (`1b`) layouts from the mockup.

## Non-goals

- Building the catalog, signup, login, or "about" pages — this spec
  covers `/` only. Nav links to those areas are out of scope (see "Open
  decisions" below).
- Any authenticated / personalized state on this page — the landing page
  always renders for an anonymous visitor.
- A CMS or admin UI for editing the page's copy or course picks — content
  is static for this iteration (see "Open decisions").

## Page content

### Header

- Brand: "Viver da Graça".
- Nav items: "Cursos", "Áreas", "Sobre a escola" — placeholders, no
  destination route yet (see "Open decisions").
- Actions: "Entrar" (login), "Criar conta" (signup) — both point to
  routes not built yet in this repo; link targets are TBD until the
  auth features are specced, but the buttons must exist and be visually
  wired per the mockup.

### Hero

- Eyebrow: "Escola de Discipulado · 2026".
- Headline: "Ensino que sustenta a sua caminhada."
- Subtext: "Cursos gratuitos e formações completas da Igreja Viver da
  Graça. Você começa hoje, no seu ritmo, com acompanhamento de quem já
  caminhou antes." (shortened on mobile per `1b`: "Cursos gratuitos e
  formações da Igreja Viver da Graça, no seu ritmo.")
- Primary CTA: "Começar gratuitamente" (→ signup).
- Secondary CTA: "Ver o catálogo" (→ catalog).
- Stat row: "6 áreas de ensino", "18 cursos publicados", "11 anos de
  igreja" — static editorial numbers (see "Open decisions").

### "Comece por aqui" (featured courses)

- Section header "Comece por aqui" with a "Todos os cursos →" link to
  the catalog.
- Three course cards, each with: cover image, duration/lesson-count
  meta, price badge, title, category · module count, and a status line.
  From the mockup:
  1. **Fundamentos da Fé** — Discipulado · 6 módulos, 24 aulas · 7h,
     Gratuito, "Aberto para toda a igreja".
  2. **Curso de Batismo** — Discipulado · 3 módulos, 9 aulas · 2h30,
     Gratuito, "Turmas novas todo mês".
  3. **Escola de Líderes** — Liderança · 8 módulos, 41 aulas · 12h,
     R$ 149, "2 aulas liberadas · certificado".
- These three are a fixed editorial pick, not a live query against the
  course catalog (see "Open decisions"). Cover images are real photos in
  the final page — the mockup's striped blocks are placeholders.

### "Como a escola funciona" (how it works)

Three numbered steps, matching the actual account/access flow already
documented in CLAUDE.md ("Auth"):

1. **01 — Crie sua conta**: "Nome, e-mail e senha. Leva menos de um
   minuto."
2. **02 — Confirme o e-mail**: "É o passo que libera o acesso às aulas."
3. **03 — Estude e avance**: "Seu progresso é salvo aula por aula, em
   qualquer aparelho."

### Footer

- "Igreja Viver da Graça" / "Escola de Discipulado".
- Links: "Termos", "Privacidade", "Suporte" — placeholders, same status
  as the header nav links (see "Open decisions").
- "© 2026".

## Responsive behavior

One page, two layouts per the mockup:

- **Desktop (`1a`)**: full header nav, three-stat hero row, three-column
  featured-course grid, three-column "how it works" row.
- **Mobile (`1b`)**: collapsed header (brand + presumably a menu
  affordance — not detailed beyond `1b`'s frame), stat row dropped from
  the hero, featured courses stacked as a single column, condensed hero
  copy as noted above.

No separate tablet breakpoint is specified by the mockup; standard
responsive scaling between the two documented states is expected.

## Open decisions

Resolved with the user on 2026-09-03:

- **Featured courses and hero stats have no public data source yet.**
  CourseCore requires auth for both course and area listing (`GET
  /api/courses/available` needs a Bearer token; `GET /api/areas` needs
  the `ManageAreas` policy) — there is no anonymous catalog or stats
  endpoint. **Decision: ship this content as static editorial data in
  the frontend for this iteration**, the same pattern already used for
  the missing `/auth/me` endpoint (see CLAUDE.md, "Auth"). Revisit once
  CourseCore exposes a public catalog/stats endpoint — that would need
  its own spec on the CourseCore side first.
- **Header nav ("Cursos", "Áreas", "Sobre a escola") and footer links
  ("Termos", "Privacidade", "Suporte") have no destination pages yet.**
  **Decision: out of scope for this spec.** They render as placeholders
  (non-navigating or `#`) until the catalog, areas, and legal/about pages
  are specced individually.

## Acceptance criteria

- `/` renders the header, hero, featured-courses, how-it-works, and
  footer sections described above, matching the mockup's copy verbatim.
- Layout matches the `1a` desktop / `1b` mobile mockup states, responsive
  between them.
- "Começar gratuitamente" and "Criar conta" both target the (not-yet-built)
  signup route; "Entrar" targets the (not-yet-built) login route; "Ver o
  catálogo" and "Todos os cursos →" target the (not-yet-built) catalog
  route. Routes may be stubbed until those features exist.
- No network call is made to CourseCore from this page.
- Placeholder nav/footer links do not throw or 404 the app — they render
  inert or `#`.
