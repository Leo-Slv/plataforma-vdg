import { authPermissions } from '@/lib/auth/auth-permissions';
import type { Permission } from '@/features/admin/model/role-detail';

type PermissionLabel = { label: string; description: string };

const PERMISSION_LABELS: Record<string, PermissionLabel> = {
	[authPermissions.manageCourses]: {
		label: 'Cursos e depoimentos',
		description: 'Criar e editar cursos, módulos, aulas e depoimentos.',
	},
	[authPermissions.manageAreas]: {
		label: 'Áreas',
		description: 'Criar e editar as áreas que agrupam os cursos.',
	},
	[authPermissions.manageUsers]: {
		label: 'Usuários',
		description: 'Ver e editar contas e liberar ou remover acesso a cursos.',
	},
	[authPermissions.manageVideos]: {
		label: 'Vídeos',
		description: 'Enviar, trocar e publicar os vídeos das aulas.',
	},
	[authPermissions.readAudit]: {
		label: 'Auditoria',
		description: 'Consultar o histórico de ações feitas no painel.',
	},
	[authPermissions.readProgress]: {
		label: 'Progresso dos alunos',
		description: 'Consultar o progresso dos alunos nos cursos.',
	},
	[authPermissions.readVisitors]: {
		label: 'Primeira vez (ver)',
		description: 'Ver quem preencheu o formulário de primeira vez.',
	},
	[authPermissions.manageVisitors]: {
		label: 'Primeira vez (marcar contato)',
		description:
			'Marcar visitantes como contatados. Precisa também de "Primeira vez (ver)".',
	},
};

// `roles.manage` exists in the catalog but is not enforced anywhere: role
// management is Admin-only. Hiding it avoids a switch that does nothing.
const HIDDEN_PERMISSION_KEYS = new Set<string>([authPermissions.manageRoles]);

function describePermission(permission: Permission): PermissionLabel {
	return (
		PERMISSION_LABELS[permission.key] ?? {
			label: permission.name,
			description: permission.description,
		}
	);
}

function listAssignablePermissions(permissions: Permission[]): Permission[] {
	return permissions.filter(
		(permission) => !HIDDEN_PERMISSION_KEYS.has(permission.key),
	);
}

export { describePermission, listAssignablePermissions };
