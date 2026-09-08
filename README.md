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

- **Landing page** (`/`) — página pública de entrada. Estatísticas do
  hero, grade "Áreas de ensino", painel "Formação em destaque" e
  depoimentos vêm de `GET /api/courses/public-summary` e
  `GET /api/testimonials/public` (ambos `[AllowAnonymous]`, sem token
  necessário). Os 3 cards "Comece por aqui" continuam com copy editorial
  fixa (preço/duração/módulos não vêm no endpoint público — de propósito,
  por segurança) e só ganham capa/link reais quando o slug bate com um
  curso publicado de verdade. Qualquer seção com dado real (stats, grade
  de áreas, formação em destaque, depoimentos) some por completo se
  ainda não carregou, deu erro, ou veio vazia — nunca mostra algo
  fabricado nem um estado de erro visível numa página pública. Spec em
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
  módulos/aulas e a lista de módulos, cada um linkando pra sua primeira
  aula. Spec em `Docs/specs/catalog/course-detail.md`.
- **Player de aula** (`/courses/[slug]/lessons/[lessonId]`) — mostra
  título/descrição da aula, progresso real do curso
  (`GET /api/progress/courses/{id}`) e um botão "Marcar aula como
  assistida" que chama `POST /api/progress/lessons` de verdade. Sem
  acesso ao curso, redireciona pra `/courses/[slug]`. O player de vídeo
  em si é um placeholder inerte — nenhuma rota do backend resolve o
  vídeo de uma aula ainda. Spec em `Docs/specs/catalog/lesson-player.md`.
- **Meus cursos** (`/my-courses`) — dashboard com os cursos que a conta
  já possui: um card "continue de onde parou" para o curso em andamento
  assistido mais recentemente, e a grade completa com contagem real de
  aulas e percentual real por curso. Montada a partir de três chamadas
  já usadas por outras telas (catálogo filtrado + detalhes/progresso por
  curso possuído) — nenhum endpoint novo. Sem duração ou certificado em
  lugar nenhum. Spec em `Docs/specs/catalog/my-courses.md`.

- **Admin — Áreas** (`/admin/areas`, `/admin/areas/new`,
  `/admin/areas/[areaId]/edit`) — lista todas as áreas (`GET /api/areas`)
  com contagem real de cursos, ordem de exibição e status, e permite
  criar/editar (nome, descrição, cor de destaque, ordem, ativa/inativa) —
  o slug é sempre calculado a partir do nome, nunca digitado à mão.
  "Excluir área" desativa a área (`PUT` com `Active: false`), já que o
  backend não tem um delete de verdade. Acesso restrito a quem tem a
  claim de permissão `areas.manage` no token (decodificada client-side);
  quem não tem é redirecionado para `/catalog`. Specs em
  `Docs/specs/admin/areas-list.md` e `Docs/specs/admin/area-form.md`.
- **Admin — Cursos** (`/admin/courses`) — tela originalmente pulada em
  2026-09-04 por falta de endpoint admin de cursos e de audit log; ambos
  existem agora. Lista todos os cursos (`GET /api/courses`, publicados +
  rascunho) com áreas, cobrança e status reais, um resumo "Áreas ativas"
  na sidebar e um painel "Últimas ações auditadas"
  (`GET /api/audit-logs`) — como o audit log só guarda IDs, o painel
  resolve nome de curso/área quando já tem esse dado carregado na
  própria tela e cai para `{Ação} · {Tipo} #{id curto}` no resto. "Novo
  curso" e as linhas da tabela linkam para a tela de criar/editar. Spec
  em `Docs/specs/admin/courses-panel.md`.
- **Admin — Curso, criar/editar** (`/admin/courses/new`,
  `/admin/courses/[courseId]/edit`) — título, descrição, capa (URL, sem
  upload), modelo de cobrança (gratuito/pago/por inscrição), área,
  status, ordem, "emitir certificado" e "curso em destaque" (este
  último não está no mockup — adicionado porque é um campo real que a
  landing page já usa). Como `PUT /api/courses/{id}` não tem campo de
  status, trocar Publicado/Rascunho dispara uma chamada separada para
  `.../publish` ou `.../unpublish` depois do PUT principal. "Excluir
  curso" despublica, mesma lógica de "Excluir área". "Gerenciar
  módulos →" linka para a tela de módulos. Spec em
  `Docs/specs/admin/course-form.md`.
- **Admin — Módulos e aulas** (`/admin/courses/[courseId]/modules`) —
  lista os módulos de um curso (`GET /api/courses/{id}/modules`, um
  endpoint que não existia quando a tela de curso foi feita) com suas
  aulas aninhadas; cria/edita/exclui/reordena módulo por modais simples
  (sem rota própria) e setas ↑↓ no lugar do arrastar do mockup (sem
  biblioteca de drag-and-drop no projeto). Cria aula pelo mesmo tipo de
  modal; "Editar" de uma aula agora navega para a tela de edição de aula
  (abaixo) em vez de abrir modal. Excluir módulo fica desabilitado
  enquanto ele tiver aulas (o backend rejeitaria com 409); excluir aula
  não dá pra prever (progresso de aluno não aparece na listagem), então
  o 409 vira um erro inline na própria aula. Vídeo de aula aparece só
  como status (tem/não tem, duração) — anexar/trocar vídeo é feito na
  tela de edição de aula. Spec em `Docs/specs/admin/course-modules.md`.
- **Admin — Editar aula** (`/admin/courses/[courseId]/modules/[moduleId]/lessons/[lessonId]/edit`)
  — título, descrição/transcrição, "aula gratuita" e "publicada", mais um
  painel de vídeo (ver/registrar/substituir/remover, via
  `GET/PUT/DELETE /api/videos/lessons/{lessonId}`). Só existe hospedagem
  "por link" (YouTube não listado) — sem upload de arquivo — então o
  formulário de vídeo pede ID do vídeo no YouTube, não um arquivo; depois
  de registrar, o front chama `POST /api/videos/{id}/ready` na hora, já
  que vídeo do YouTube não passa por nenhum processamento no CourseCore.
  Módulo e ordem aparecem só como leitura (mockup mostra como editável,
  mas não existe endpoint para mover aula de módulo nem para setar ordem
  direto). Painel de vídeo exige a permissão `videos.manage`, separada da
  `courses.manage` que já gate a tela inteira. "Excluir aula" reaparece
  aqui e volta para a lista de módulos. Spec em
  `Docs/specs/admin/lesson-editor.md`.
- **Admin — Usuários** (`/admin/users`) — lista paginada e pesquisável
  (nome/e-mail) de `GET /api/users`, com contagem real de cadastrados/
  confirmados no cabeçalho. Coluna "Papel" vem pronta no próprio
  `UserResponse` (`RoleNames`); "Áreas liberadas" não tem endpoint em
  lote (só `GET /api/access/user-area/{userId}`, um por usuário), então
  cada linha da página atual busca a própria — um admin (`RoleNames`
  inclui "Admin") mostra "Todas" sem chamada, já que o bypass de área é
  por papel, não por concessão individual. O cabeçalho "E-mail" do
  mockup na verdade desenha Confirmado/Pendente — a coluna real virou
  "Status" com esse valor, e o e-mail passou a ser uma segunda linha sob
  o nome do usuário. "Convidar usuário" cria a conta na hora
  (`POST /api/users`, senha mínima de 12 caracteres) — sem fluxo de
  convite por e-mail nem atribuição de papel na criação. Linhas navegam
  para a tela de editar acesso (abaixo). Spec em
  `Docs/specs/admin/users-list.md`.
- **Admin — Editar acesso do usuário** (`/admin/users/[userId]/edit`) —
  papel (só leitura — não existe endpoint para listar papéis nem
  descobrir o id de um papel, então os endpoints de atribuir/remover
  papel existem mas não têm como ser chamados de uma UI), toggle por
  área liberada, painel de "Cursos pagos concedidos"
  (`GET /api/access/requests/users/{userId}/granted`, resolvido para
  título via a lista de cursos já carregada) com "+ Conceder acesso a um
  curso pago" (`POST /api/access/requests/grant`, dispara na hora, não
  entra no "Salvar"), e status da conta (Ativa/Bloqueada, um toggle — o
  botão "Bloquear usuário" do mockup foi removido por editar o mesmo
  campo). Não existe endpoint em lote para conceder/revogar área, então
  os toggles de área e o status ficam em estado local até "Salvar
  alterações", que compara com o que foi carregado e dispara só as
  chamadas necessárias. Toda ação aqui (`UsersController`,
  `AreasController`'s user-area routes, `AccessRequestsController`'s
  grant route) cai na mesma claim `users.manage` da tela — conferido no
  código do backend antes de supor o contrário, então não precisou de
  uma segunda permissão como a tela de aula. Spec em
  `Docs/specs/admin/user-access-edit.md`.

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
