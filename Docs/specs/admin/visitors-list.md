# Admin — Visitantes "Primeira vez"

## Why

`/primeira-vez` coleta nome, telefone, e-mail e endereço de quem visita a igreja, mas ninguém da equipe conseguia ver esses cadastros nem saber quem já recebeu contato. Esta tela lista os visitantes e deixa a equipe marcar quem já foi contatado.

Backend: `CourseCore/Docs/specs/visitors/visitor-contact-tracking.md`.

## Goals

- Listar os visitantes (mais recentes primeiro), paginado e pesquisável por nome, e-mail ou telefone.
- Marcar/desmarcar "contatado" com um checkbox por linha.
- Filtrar por **Pendentes de contato** (padrão), **Já contatados** ou **Todos**.
- Visível só para quem tem acesso administrativo.

## Non-goals

Editar ou excluir visitantes, anotações por visitante, exportar a lista, atribuir visitante a alguém da equipe.

## Behavior

- Rota `/admin/visitors`, item "Primeira vez" no menu lateral do admin.
- Acesso: exige a permissão `visitors.read` (claim do JWT; o Admin a recebe). Sem ela, redireciona para o catálogo. A autorização real é do backend (`ReadVisitors` para listar, `ManageVisitors` para marcar).
- Colunas: checkbox "Contatado" (com data/hora do contato embaixo quando marcado), visitante (nome riscado quando contatado, e-mail embaixo), telefone com máscara, endereço (— quando vazio) e data/hora do cadastro.
- O checkbox só fica habilitado para quem tem `visitors.manage`; fica desabilitado enquanto a requisição daquela linha está em andamento. Ao marcar/desmarcar, a lista é revalidada — no filtro "Pendentes" a linha some ao ser marcada.
- A busca tem debounce de 300 ms e volta para a página 1; o filtro também.

## Acceptance

- [x] A lista mostra os visitantes cadastrados com todos os campos.
- [x] Marcar e desmarcar persiste (recarregar a página mantém o estado) e mostra a data do contato.
- [x] O filtro padrão mostra só os pendentes; "Já contatados" e "Todos" funcionam.
- [x] Usuário sem permissão não acessa a tela.
- [x] `npm run test`, `npm run typecheck`, `npm run lint` passam.
