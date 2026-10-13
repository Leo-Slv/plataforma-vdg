# Permissões do backoffice (tela só do Admin)

Backend: `CourseCore/Docs/specs/access/role-permission-management.md`.

## Comportamento

### Tela `/admin/roles` ("Permissões")

- Só aparece no menu e só abre para quem tem o papel **Admin** (`useRequireAdmin`; os demais voltam ao catálogo). A barreira real é a policy `AdminOnly` do backend.
- Lista de papéis à esquerda (nome, quantas pessoas, selo "Sistema" para o Admin / "Inativo"). À direita, um interruptor por permissão (rótulos em português em `permission-labels.ts`) e **Salvar permissões** (envia o conjunto inteiro). Trocar de papel descarta alterações não salvas.
- **Novo papel** e **Editar papel** (nome, descrição, ativo). O papel Admin é fixo e só mostra um aviso.
- Depois de salvar permissões de um papel que já tem pessoas, o aviso lembra que elas precisam entrar de novo (o backend derruba a sessão delas).
- `roles.manage` é escondida: não tem efeito, quem gerencia papéis é só o Admin.

### Dar o papel a alguém

Em `/admin/users/{id}/edit` os interruptores de papel agora só existem para o Admin; quem só tem `users.manage` vê os papéis da pessoa em leitura.

### Menu e telas por papel

- `getAdminNavItems(claims)` (`features/admin/lib/admin-nav.ts`) é a fonte única do menu: cada item exige uma permissão (Cursos/Depoimentos → `courses.manage`, Áreas, Usuários, Vídeos, Auditoria, Primeira vez → `visitors.read`) e **Permissões** exige Admin. Quem não tem nada vê o painel vazio de itens.
- O link "Painel admin" aparece para qualquer um que tenha ao menos uma tela e leva para a **primeira tela liberada** (antes sempre ia para Cursos e jogava de volta ao catálogo quem não tinha `courses.manage`; e quem só tinha Primeira vez nem via o link).
- O papel Admin passa em qualquer `hasPermission`, como na policy do backend.
- Alunos continuam vendo exatamente o que viam.

### Detalhe do token

O JWT carrega o papel na chave `http://schemas.microsoft.com/ws/2008/06/identity/claims/role` (não em `role`); `isAdmin` lê as duas.

## Aceite

- [x] Admin cria papel, liga/desliga permissões e atribui a um usuário pela tela.
- [x] A pessoa com o papel entra e só vê as telas liberadas; digitar a URL de outra tela volta ao catálogo.
- [x] Quem não é Admin não vê "Permissões" nem os interruptores de papel.
- [x] `npm run test`, `npm run typecheck`, `npm run lint` passam.
