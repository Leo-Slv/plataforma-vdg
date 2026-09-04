# Plataforma VDG

## Objetivo

Frontend web do [CourseCore](https://github.com/Leo-Slv/CourseCore) — a
aplicação que os alunos e o administrador usam para se registrar, navegar pelo
catálogo de áreas/cursos e consumir o conteúdo liberado para eles. Consome a
API do CourseCore via HTTP/JSON.

## Stack

- Next.js 16 (App Router)
- React 19
- TypeScript
- Tailwind CSS 4
- shadcn/ui
- TanStack Query
- React Hook Form + Zod

## Estrutura

```text
src/app/         # Rotas (App Router) — ficam finas, delegam para src/features
src/components/  # ui/ (shadcn) + composables compartilhados entre features
src/features/    # Uma pasta por funcionalidade de negócio (ver src/features/README.md)
src/lib/         # HTTP client, auth, React Query, rotas, env
public/
```

## Módulos ativos

- **Landing page** (`/`) — página pública de entrada, com conteúdo estático
  (sem chamada à API do CourseCore ainda). Spec em
  `Docs/specs/landing/landing-page.md`.
- **Cadastro** (`/register`) — formulário público de registro (nome, e-mail,
  senha, CAPTCHA Cloudflare Turnstile), chama `POST /api/auth/register`.
  Spec em `Docs/specs/auth/register.md`.
- **Login** (`/login`) — formulário de acesso (e-mail, senha), chama
  `POST /api/auth/login` e redireciona para `/catalog` (rota stub) no
  sucesso. Spec em `Docs/specs/auth/login.md`.
- **Confirmação de e-mail** (`/confirm-email`) — primeira página com gate de
  autenticação real (redireciona pra `/login` sem token salvo); permite
  colar o código recebido por e-mail, reenviar ou (stub) trocar o e-mail.
  Spec em `Docs/specs/auth/confirm-email.md`.
- **Catálogo de cursos** (`/catalog`) — lista áreas e cursos via
  `GET /api/courses/available`, com filtro por área e busca (ambos
  client-side). Só usa o que a API realmente retorna — sem preço,
  duração, progresso ou certificado, que o backend ainda não expõe. Spec
  em `Docs/specs/catalog/course-catalog.md`.
- **Página do curso** (`/courses/[slug]`) — a primeira rota dinâmica do
  projeto. Sem acesso ao curso, `GET /api/courses/{id}` nem chega a ser
  chamado (retornaria 403 pra requisição inteira) — a tela usa só o que
  o catálogo já sabe. Com acesso, mostra descrição, contagem real de
  módulos/aulas e a lista de módulos. Spec em
  `Docs/specs/catalog/course-detail.md`.

Demais funcionalidades são adicionadas seguindo o workflow descrito em
`CLAUDE.md`.

## Como rodar localmente

1. Copie `.env.example` para `.env.local` e ajuste `NEXT_PUBLIC_API_URL` se
   necessário. `NEXT_PUBLIC_TURNSTILE_SITE_KEY` pode ficar vazia em
   desenvolvimento — veja `Docs/specs/auth/register.md`, "Known gap".
2. Rode o backend do CourseCore localmente (`dotnet run`, ambiente
   Development) — veja `CLAUDE.md` para detalhes do contrato da API.
3. `npm install`
4. `npm run dev`

## Scripts

- `npm run dev` — desenvolvimento local com Turbopack.
- `npm run build` — build de produção.
- `npm run lint` — ESLint.
- `npm run format` — Prettier.
- `npm run typecheck` — checagem de tipos sem emitir arquivos.
- `npm run test` — testes unitários (`*.spec.ts` colocados junto do código).

## Observações

- Este frontend não é autoridade de autorização: o backend (CourseCore)
  continua sendo a fonte de verdade para autenticação e permissões.
