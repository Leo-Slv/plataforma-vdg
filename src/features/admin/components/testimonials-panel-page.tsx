'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import { authPermissions } from '@/lib/auth/auth-permissions';
import { useRequirePermission } from '@/lib/auth/use-require-permission';
import { appRoutes } from '@/lib/routes/app-routes';
import { isApiError } from '@/lib/http/api-error';
import { queryKeys } from '@/lib/constants/query-keys';
import { LoadingScreen } from '@/components/loading-screen';
import {
	useTestimonialsQuery,
	useCoursesQuery,
	usePublishTestimonialMutation,
	useUnpublishTestimonialMutation,
} from '@/features/admin/hooks/admin.queries';
import { AdminSidebar } from '@/features/admin/components/admin-sidebar';
import { AdminSelect } from '@/features/admin/components/admin-select';
import { TestimonialsTable } from '@/features/admin/components/testimonials-table';

const GENERIC_ERROR_MESSAGE =
	'Não foi possível concluir a ação. Tente novamente.';

type StatusFilter = 'pending' | 'published' | 'all';

const FILTER_OPTIONS: { value: StatusFilter; label: string }[] = [
	{ value: 'pending', label: 'Pendentes' },
	{ value: 'published', label: 'Publicados' },
	{ value: 'all', label: 'Todos' },
];

function TestimonialsPanelPage() {
	const router = useRouter();
	const queryClient = useQueryClient();
	const ready = useRequirePermission(authPermissions.manageCourses);

	const [filter, setFilter] = useState<StatusFilter>('pending');
	const [pendingId, setPendingId] = useState<string | null>(null);

	const testimonialsQuery = useTestimonialsQuery({ enabled: ready });
	const coursesQuery = useCoursesQuery({ enabled: ready });
	const publishMutation = usePublishTestimonialMutation();
	const unpublishMutation = useUnpublishTestimonialMutation();

	useEffect(() => {
		if (
			testimonialsQuery.isError &&
			isApiError(testimonialsQuery.error) &&
			testimonialsQuery.error.status === 401
		) {
			router.replace(appRoutes.auth.login);
		}
	}, [testimonialsQuery.isError, testimonialsQuery.error, router]);

	if (!ready) {
		return <LoadingScreen />;
	}

	function invalidateTestimonials() {
		queryClient.invalidateQueries({ queryKey: queryKeys.admin.testimonials });
	}

	function handlePublish(testimonialId: string) {
		setPendingId(testimonialId);
		publishMutation.mutate(testimonialId, {
			onSuccess: () => {
				invalidateTestimonials();
				toast.success('Depoimento publicado.');
			},
			onError: () => toast.error(GENERIC_ERROR_MESSAGE),
			onSettled: () => setPendingId(null),
		});
	}

	function handleUnpublish(testimonialId: string) {
		setPendingId(testimonialId);
		unpublishMutation.mutate(testimonialId, {
			onSuccess: () => {
				invalidateTestimonials();
				toast.success('Depoimento despublicado.');
			},
			onError: () => toast.error(GENERIC_ERROR_MESSAGE),
			onSettled: () => setPendingId(null),
		});
	}

	const testimonials = testimonialsQuery.data ?? [];
	const pendingCount = testimonials.filter((item) => !item.published).length;
	const visibleTestimonials = testimonials.filter((item) => {
		if (filter === 'pending') {
			return !item.published;
		}
		if (filter === 'published') {
			return item.published;
		}
		return true;
	});

	return (
		<div className="grid min-h-screen grid-cols-[236px_1fr] bg-[#0a0a0b] text-[#f2f2f0]">
			<AdminSidebar active="testimonials" />

			<div className="p-8.5">
				<div className="flex items-end justify-between">
					<div>
						<h1 className="font-heading text-[34px] font-extralight">
							Depoimentos
						</h1>
						<p className="mt-2.5 font-sans text-[13.5px] font-light text-white/45">
							{testimonialsQuery.isSuccess
								? `${pendingCount} pendentes de revisão · depoimentos só aparecem no site depois de publicados`
								: ' '}
						</p>
					</div>
					<AdminSelect
						label="Filtrar"
						value={filter}
						onChange={(event) => setFilter(event.target.value as StatusFilter)}
						className="w-40"
					>
						{FILTER_OPTIONS.map((option) => (
							<option key={option.value} value={option.value}>
								{option.label}
							</option>
						))}
					</AdminSelect>
				</div>

				<div className="mt-8.5">
					{testimonialsQuery.isPending ? (
						<p className="py-16 text-center font-sans text-sm font-light text-white/50">
							Carregando…
						</p>
					) : testimonialsQuery.isError ? (
						isApiError(testimonialsQuery.error) &&
						testimonialsQuery.error.status === 401 ? null : (
							<div className="flex flex-col items-center gap-4 py-16 text-center">
								<p className="font-sans text-sm font-light text-white/60">
									Não foi possível carregar os depoimentos agora.
								</p>
								<button
									type="button"
									onClick={() => testimonialsQuery.refetch()}
									className="rounded-full border border-white/20 px-6 py-3 font-sans text-[13px] text-[#f2f2f0]"
								>
									Tentar novamente
								</button>
							</div>
						)
					) : (
						<TestimonialsTable
							testimonials={visibleTestimonials}
							courses={coursesQuery.data ?? []}
							pendingId={pendingId}
							onPublish={handlePublish}
							onUnpublish={handleUnpublish}
						/>
					)}
				</div>
			</div>
		</div>
	);
}

export { TestimonialsPanelPage };
