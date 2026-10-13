# CI/CD do front

Resumo; o fluxo completo (API + front, secrets e regras de branch) esta em `CourseCore/Docs/ci-cd.md`.

- **CI** (`.github/workflows/ci.yml`): `npm ci`, `typecheck`, `lint`, `test`, `build`, `npm audit` (nao bloqueia) e scan de secrets. Rode o mesmo localmente com `npm run typecheck && npm run lint && npm run test && npm run build`.
- **CD**: integracao Git da Vercel (PR = preview, merge na `master` = producao). Exija os checks do CI na regra de branch da `master` para a producao so sair com CI verde.
- Variaveis publicas ficam na Vercel (`.env.example` lista todas); nenhuma secret e necessaria no GitHub para o front.
