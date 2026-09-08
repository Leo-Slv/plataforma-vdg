import Link from 'next/link';

import { cn } from '@/lib/utils';
import { appRoutes } from '@/lib/routes/app-routes';
import { formatRoleNames } from '@/features/admin/lib/format-role-names';
import { formatDateBr } from '@/features/admin/lib/format-date-br';
import { UserAreaChips } from '@/features/admin/components/user-area-chips';
import type { User } from '@/features/admin/model/user';
import type { Area } from '@/features/admin/model/area';

type UsersTableProps = {
	users: User[];
	areas: Area[];
};

const COLUMNS = 'grid-cols-[2fr_1fr_1.6fr_1fr_1fr]';

function UsersTable({ users, areas }: UsersTableProps) {
	if (users.length === 0) {
		return (
			<p className="py-12 text-center font-sans text-sm font-light text-white/45">
				Nenhum usuário encontrado.
			</p>
		);
	}

	return (
		<div>
			<div
				className={cn(
					'grid gap-4 border-b border-white/12 pb-3 font-heading text-[10px] tracking-[0.14em] text-white/40 uppercase',
					COLUMNS,
				)}
			>
				<span>Usuário</span>
				<span>Papel</span>
				<span>Áreas liberadas</span>
				<span>Status</span>
				<span>Cadastro</span>
			</div>

			{users.map((user) => (
				<Link
					key={user.id}
					href={appRoutes.admin.userEdit(user.id)}
					className={cn(
						'grid items-center gap-4 border-b border-white/7 py-4 font-sans text-[13px] text-white/75 hover:bg-white/3',
						COLUMNS,
					)}
				>
					<div>
						<div className="font-heading text-[14px] text-[#f2f2f0]">
							{user.name}
						</div>
						<div className="mt-1 font-sans text-[11px] font-light text-white/35">
							{user.email}
						</div>
					</div>
					<span className="text-white/55">
						{formatRoleNames(user.roleNames)}
					</span>
					<UserAreaChips
						userId={user.id}
						roleNames={user.roleNames}
						areas={areas}
					/>
					<span
						className={cn(
							user.emailVerifiedAt
								? 'text-[oklch(0.75_0.1_248)]'
								: 'text-white/40',
						)}
					>
						{user.emailVerifiedAt ? 'Confirmado' : 'Pendente'}
					</span>
					<span className="text-white/40">{formatDateBr(user.createdAt)}</span>
				</Link>
			))}
		</div>
	);
}

export { UsersTable };
