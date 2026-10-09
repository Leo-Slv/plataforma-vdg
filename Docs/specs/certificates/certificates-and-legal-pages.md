# Certificates, legal pages and footer links

## Why

The price card promises "Certificado ao concluir 100%" and the menu had a "Certificados" label, but nothing in the app listed or delivered a certificate even though CourseCore already issues them (`GET /api/certificates/mine`). The register form's "termos de uso" link was `href="#"` and the landing footer showed "Termos · Privacidade · Suporte" as plain text with no destination.

## Behavior

### Certificates

- `/certificates` (menu items "Certificados" in the top nav, avatar menu and mobile drawer): the student's certificates (course title, issue date, "Ver e imprimir"). Empty state explains that finishing 100% of a course that issues one makes it appear, with a link to "Meus cursos".
- `/certificates/{id}`: the certificate itself (student name, course, long issue date, certificate code) and **Imprimir / salvar PDF**, which opens the browser's print dialog. The page hides the app chrome when printing and asks for A4 landscape; the document keeps its own light look so it prints identically in dark mode.
- The backend only lists certificates (no PDF endpoint), so the PDF is the browser's "Save as PDF". Generating it server-side was considered and left out.

### Terms and privacy

- `/termos` and `/privacidade` render structured texts from `features/legal/lib/legal-content.ts`. They describe what the platform really does (data collected, Stripe/Resend/Turnstile as processors, cookies, LGPD rights) but are **drafts**: every page shows "Minuta em revisão" until the church's legal review replaces or approves the text.
- The register form links both pages (new tab); the footer links them too.

### Footer

- "Termos" and "Privacidade" are links.
- "Suporte" is configurable: `NEXT_PUBLIC_SUPPORT_WHATSAPP` (digits with country code → `https://wa.me/…`, wins) or `NEXT_PUBLIC_SUPPORT_EMAIL` (→ `mailto:`). With neither set the link is omitted instead of showing a dead label. Set them in the Vercel project settings.

## Acceptance

- [x] "Certificados" is a working link everywhere it appears.
- [x] A certificate opens on a hard load and prints as a standalone landscape page.
- [x] No `href="#"` or label-only link remains in the register form or footer.
- [x] "Suporte" appears only when a channel is configured.
- [x] `npm run test`, `npm run typecheck`, `npm run lint` pass.

## Open item (not engineering)

The legal texts need review by whoever is legally responsible for the church before the "Minuta" notice is removed.
