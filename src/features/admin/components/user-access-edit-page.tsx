'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import { appRoutes } from '@/lib/routes/app-routes';
import { authPermissions } from '@/lib/auth/auth-permissions';
import { useRequirePermission } from '@/lib/auth/use-require-permission';
import { isApiError } from '@/lib/http/api-error';
import { queryKeys } from '@/lib/constants/query-keys';
import { LoadingScreen } from '@/components/loading-screen';
import {
	useUserQuery,
	useUpdateUserMutation,
	useRolesQuery,
	useAssignUserRoleMutation,
	useRemoveUserRoleMutation,
	useAreasQuery,
	useUserAreaAccessQuery,
	useGrantUserAreaAccessMutation,
	useRevokeUserAreaAccessMutation,
	useGrantedCourseAccessQuery,
	useGrantCourseAccessMutation,
	useCoursesQuery,
} from '@/features/admin/hooks/admin.queries';
import { AdminSidebar } from '@/features/admin/components/admin-sidebar';
import { StatusToggle } from '@/features/admin/components/status-toggle';
import { AreaAccessToggleList } from '@/features/admin/components/area-access-toggle-list';
import { RoleAccessToggleList } from '@/features/admin/components/role-access-toggle-list';
import { GrantedCoursesPanel } from '@/features/admin/components/granted-courses-panel';
import { GrantCourseAccessModal } from '@/features/admin/components/grant-course-access-modal';

const GENERIC_ERROR_MESSAGE =
	'Não foi possível concluir a ação. Tente novamente.';

type UserAccessEditPageProps = {
	userId: string;
};

function UserAccessEditPage({ userId }: UserAccessEditPageProps) {
	const router = useRouter();
	const queryClient = useQueryClient();
	const ready = useRequirePermission(authPermissions.manageUsers);

	const userQuery = useUserQuery(userId, { enabled: ready });
	const rolesQuery = useRolesQuery({ enabled: ready });
	const areasQuery = useAreasQuery({ enabled: ready });
	const areaAccessQuery = useUserAreaAccessQuery(userId, { enabled: ready });
	const grantedCoursesQuery = useGrantedCourseAccessQuery(userId, {
		enabled: ready,
	});
	const coursesQuery = useCoursesQuery({ enabled: ready });

	const updateUserMutation = useUpdateUserMutation();
	const assignRoleMutation = useAssignUserRoleMutation();
	const removeRoleMutation = useRemoveUserRoleMutation();
	const grantAreaMutation = useGrantUserAreaAccessMutation();
	const revokeAreaMutation = useRevokeUserAreaAccessMutation();
	const grantCourseMutation = useGrantCourseAccessMutation();

	const [pendingAreaIds, setPendingAreaIds] = useState<Set<string> | null>(
		null,
	);
	const [pendingRoleIds, setPendingRoleIds] = useState<Set<string> | null>(
		null,
	);
	const [pendingActive, setPendingActive] = useState<boolean | null>(null);
	const [saveError, setSaveError] = useState<string | null>(null);
	const [isSaving, setIsSaving] = useState(false);
	const [showGrantModal, setShowGrantModal] = useState(false);
	const [grantError, setGrantError] = useState<string | null>(null);

	useEffect(() => {
		if (areaAccessQuery.data && pendingAreaIds === null) {
			// eslint-disable-next-line react-hooks/set-state-in-effect
			setPendingAreaIds(
				new Set(areaAccessQuery.data.map((access) => access.areaId)),
			);
		}
	}, [areaAccessQuery.data, pendingAreaIds]);

	useEffect(() => {
		if (userQuery.data && rolesQuery.data && pendingRoleIds === null) {
			const assignedIds = rolesQuery.data
				.filter((role) => userQuery.data.roleNames.includes(role.name))
				.map((role) => role.id);
			// eslint-disable-next-line react-hooks/set-state-in-effect
			setPendingRoleIds(new Set(assignedIds));
		}
	}, [userQuery.data, rolesQuery.data, pendingRoleIds]);

	useEffect(() => {
		if (userQuery.data && pendingActive === null) {
			// eslint-disable-next-line react-hooks/set-state-in-effect
			setPendingActive(userQuery.data.active);
		}
	}, [userQuery.data, pendingActive]);

	useEffect(() => {
		if (
			userQuery.isError &&
			isApiError(userQuery.error) &&
			userQuery.error.status === 401
		) {
			router.replace(appRoutes.auth.login);
		}
	}, [userQuery.isError, userQuery.error, router]);

	function invalidateAreaAccess() {
		queryClient.invalidateQueries({
			queryKey: queryKeys.admin.userAreaAccess(userId),
		});
	}

	function toggleArea(areaId: string) {
		setPendingAreaIds((current) => {
			const next = new Set(current ?? []);
			if (next.has(areaId)) {
				next.delete(areaId);
			} else {
				next.add(areaId);
			}
			return next;
		});
	}

	function toggleRole(roleId: string) {
		setPendingRoleIds((current) => {
			const next = new Set(current ?? []);
			if (next.has(roleId)) {
				next.delete(roleId);
			} else {
				next.add(roleId);
			}
			return next;
		});
	}

	async function handleSave() {
		if (
			!userQuery.data ||
			pendingAreaIds === null ||
			pendingRoleIds === null ||
			pendingActive === null
		) {
			return;
		}

		setSaveError(null);
		setIsSaving(true);

		const loadedAreaIds = new Set(
			(areaAccessQuery.data ?? []).map((access) => access.areaId),
		);
		const toGrant = [...pendingAreaIds].filter(
			(areaId) => !loadedAreaIds.has(areaId),
		);
		const toRevoke = [...loadedAreaIds].filter(
			(areaId) => !pendingAreaIds.has(areaId),
		);

		const loadedRoleIds = new Set(
			(rolesQuery.data ?? [])
				.filter((role) => userQuery.data.roleNames.includes(role.name))
				.map((role) => role.id),
		);
		const toAssign = [...pendingRoleIds].filter(
			(roleId) => !loadedRoleIds.has(roleId),
		);
		const toUnassign = [...loadedRoleIds].filter(
			(roleId) => !pendingRoleIds.has(roleId),
		);

		const tasks: Promise<unknown>[] = [
			...toGrant.map((areaId) =>
				grantAreaMutation.mutateAsync({ userId, areaId }),
			),
			...toRevoke.map((areaId) =>
				revokeAreaMutation.mutateAsync({ userId, areaId }),
			),
			...toAssign.map((roleId) =>
				assignRoleMutation.mutateAsync({ userId, roleId }),
			),
			...toUnassign.map((roleId) =>
				removeRoleMutation.mutateAsync({ userId, roleId }),
			),
		];

		if (pendingActive !== userQuery.data.active) {
			tasks.push(
				updateUserMutation.mutateAsync({
					userId,
					payload: {
						name: userQuery.data.name,
						email: userQuery.data.email,
						active: pendingActive,
					},
				}),
			);
		}

		const results = await Promise.allSettled(tasks);
		setIsSaving(false);

		if (results.some((result) => result.status === 'rejected')) {
			setSaveError(GENERIC_ERROR_MESSAGE);
			toast.error(GENERIC_ERROR_MESSAGE);
		} else if (tasks.length > 0) {
			toast.success('Alterações salvas.');
		}

		invalidateAreaAccess();
		queryClient.invalidateQueries({ queryKey: queryKeys.admin.user(userId) });
		// Partial key match invalidates every cached page/search combo of the
		// users list, not just the one that happened to be open last — role,
		// area, and active-status changes made here otherwise show stale on
		// /admin/users until a manual refresh.
		queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
	}

	function handleGrantCourse(courseId: string) {
		setGrantError(null);
		grantCourseMutation.mutate(
			{ userId, courseId },
			{
				onSuccess: () => {
					queryClient.invalidateQueries({
						queryKey: queryKeys.admin.grantedCourseAccess(userId),
					});
					invalidateAreaAccess();
					toast.success('Acesso ao curso concedido.');
					setShowGrantModal(false);
				},
				onError: (error) => {
					const message =
						isApiError(error) && (error.status === 409 || error.status === 404)
							? 'Não foi possível conceder acesso a este curso.'
							: GENERIC_ERROR_MESSAGE;
					setGrantError(message);
					toast.error(message);
				},
			},
		);
	}

	if (!ready) {
		return <LoadingScreen />;
	}

	const userLoaded = !userQuery.isPending;
	const notFound =
		userLoaded &&
		userQuery.isError &&
		isApiError(userQuery.error) &&
		userQuery.error.status === 404;

	if (notFound) {
		return (
			<div className="grid min-h-screen grid-cols-[236px_1fr] bg-background text-foreground">
				<AdminSidebar active="users" />
				<div className="flex flex-col items-center justify-center gap-4 text-center">
					<p className="font-sans text-sm font-light text-foreground/60">
						Usuário não encontrado.
					</p>
					<button
						type="button"
						onClick={() => router.push(appRoutes.admin.users)}
						className="rounded-full border border-foreground/20 px-6 py-3 font-sans text-[13px] text-foreground"
					>
						Voltar para usuários
					</button>
				</div>
			</div>
		);
	}

	const isLoading =
		!userLoaded ||
		rolesQuery.isPending ||
		areasQuery.isPending ||
		areaAccessQuery.isPending;
	const roles = rolesQuery.data ?? [];
	const areas = areasQuery.data ?? [];
	const courses = coursesQuery.data ?? [];
	const grantedCourseIds = (grantedCoursesQuery.data ?? []).map(
		(request) => request.courseId,
	);
	const eligibleCourses = courses.filter(
		(course) =>
			course.published &&
			course.pricingModel !== 'Free' &&
			!grantedCourseIds.includes(course.id),
	);

	return (
		<div className="grid min-h-screen grid-cols-[236px_1fr] bg-background text-foreground">
			<AdminSidebar active="users" />

			<div className="p-8.5">
				<div className="font-sans text-xs font-light text-foreground/40">
					Usuários / {userQuery.data?.name ?? '…'}
				</div>
				<div className="mt-3 flex items-end justify-between">
					<div className="flex items-center gap-3.5">
						<div>
							<h1 className="font-heading text-[30px] font-extralight">
								{userQuery.data?.name ?? '…'}
							</h1>
							<div className="mt-1 font-sans text-[13px] font-light text-foreground/45">
								{userQuery.data?.email}
							</div>
						</div>
					</div>
					<button
						type="button"
						onClick={handleSave}
						disabled={isLoading || isSaving}
						className="rounded-full bg-foreground px-5.5 py-3.25 font-sans text-[13px] text-background disabled:opacity-60"
					>
						{isSaving ? 'Salvando...' : 'Salvar alterações'}
					</button>
				</div>

				{saveError ? (
					<div
						role="alert"
						className="mt-6 rounded-md border border-foreground/12 bg-surface px-4 py-3 text-[13px] font-light text-foreground/70"
					>
						{saveError}
					</div>
				) : null}

				{isLoading ? (
					<p className="mt-16 py-16 text-center font-sans text-sm font-light text-foreground/50">
						Carregando…
					</p>
				) : (
					<div className="mt-8.5 grid grid-cols-[1.5fr_1fr] gap-11">
						<div className="flex flex-col gap-5.5">
							<div>
								<div className="mb-2.25 font-heading text-[10px] tracking-[0.14em] text-foreground/40 uppercase">
									Papel
								</div>
								<RoleAccessToggleList
									roles={roles}
									pendingRoleIds={pendingRoleIds ?? new Set()}
									onToggle={toggleRole}
								/>
							</div>
							<div>
								<div className="mb-2.25 font-heading text-[10px] tracking-[0.14em] text-foreground/40 uppercase">
									Áreas liberadas
								</div>
								<AreaAccessToggleList
									areas={areas}
									pendingGrantedAreaIds={pendingAreaIds ?? new Set()}
									onToggle={toggleArea}
								/>
							</div>
						</div>

						<div className="flex flex-col gap-5.5">
							<GrantedCoursesPanel
								grantedCourseIds={grantedCourseIds}
								courses={courses}
								onGrant={() => setShowGrantModal(true)}
							/>
							<StatusToggle
								label="Status da conta (Ativa)"
								checked={pendingActive ?? false}
								onChange={(checked) => setPendingActive(checked)}
							/>
						</div>
					</div>
				)}
			</div>

			{showGrantModal ? (
				<GrantCourseAccessModal
					eligibleCourses={eligibleCourses}
					onClose={() => setShowGrantModal(false)}
					onSubmit={handleGrantCourse}
					isSubmitting={grantCourseMutation.isPending}
					error={grantError}
				/>
			) : null}
		</div>
	);
}

export { UserAccessEditPage };
