'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

import { appRoutes } from '@/lib/routes/app-routes';
import { getAccessToken, getUserName } from '@/lib/auth/access-token';
import { isApiError } from '@/lib/http/api-error';
import { useCourseCatalogQuery } from '@/features/catalog/hooks/catalog.queries';
import {
	filterCourses,
	groupCoursesByArea,
} from '@/features/catalog/lib/filter-courses';
import {
	getDisplayName,
	getInitials,
} from '@/features/catalog/lib/user-display';
import { CatalogNav } from '@/features/catalog/components/catalog-nav';
import { CatalogPageHeader } from '@/features/catalog/components/catalog-page-header';
import { AreaSection } from '@/features/catalog/components/area-section';

type GateState =
	{ status: 'checking' } | { status: 'ready'; userName: string | null };

function CatalogPage() {
	const router = useRouter();
	const [gate, setGate] = useState<GateState>({ status: 'checking' });
	const [selectedAreaId, setSelectedAreaId] = useState<string | null>(null);
	const [search, setSearch] = useState('');

	useEffect(() => {
		if (!getAccessToken()) {
			router.replace(appRoutes.auth.login);
			return;
		}

		// localStorage doesn't exist during SSR, so this read (and the auth
		// gate above) can only happen after mount — deferring it to render
		// instead would make the server/client first paint disagree.
		// eslint-disable-next-line react-hooks/set-state-in-effect
		setGate({ status: 'ready', userName: getUserName() });
	}, [router]);

	const query = useCourseCatalogQuery({ enabled: gate.status === 'ready' });

	useEffect(() => {
		if (
			query.isError &&
			isApiError(query.error) &&
			query.error.status === 401
		) {
			router.replace(appRoutes.auth.login);
		}
	}, [query.isError, query.error, router]);

	if (gate.status !== 'ready') {
		return <div className="min-h-full bg-[#0a0a0b]" />;
	}

	const displayName = getDisplayName(gate.userName);
	const initials = getInitials(gate.userName);

	return (
		<div className="min-h-full bg-[#0a0a0b] text-[#f2f2f0]">
			<CatalogNav displayName={displayName} initials={initials} />

			{query.isPending ? (
				<p className="px-5 py-16 text-center font-sans text-sm font-light text-white/50 sm:px-10">
					Carregando catálogo…
				</p>
			) : query.isError ? (
				isApiError(query.error) && query.error.status === 401 ? null : (
					<div className="flex flex-col items-center gap-4 px-5 py-16 text-center sm:px-10">
						<p className="font-sans text-sm font-light text-white/60">
							Não foi possível carregar o catálogo agora.
						</p>
						<button
							type="button"
							onClick={() => query.refetch()}
							className="rounded-full border border-white/20 px-6 py-3 font-sans text-[13px] text-[#f2f2f0]"
						>
							Tentar novamente
						</button>
					</div>
				)
			) : (
				<>
					<CatalogPageHeader
						areas={query.data.areas}
						selectedAreaId={selectedAreaId}
						onSelectArea={setSelectedAreaId}
						search={search}
						onSearchChange={setSearch}
						courseCount={query.data.courses.length}
						areaCount={query.data.areas.length}
					/>

					<div className="px-5 pb-16 sm:px-10">
						{(() => {
							const groups = groupCoursesByArea(
								query.data.areas,
								filterCourses(query.data.courses, {
									areaId: selectedAreaId,
									search,
								}),
							);

							if (groups.length === 0) {
								return (
									<p className="py-12 text-center font-sans text-sm font-light text-white/45">
										Nenhum curso encontrado.
									</p>
								);
							}

							return groups.map((group, index) => (
								<AreaSection
									key={group.area.id}
									group={group}
									position={index + 1}
									onSelectArea={setSelectedAreaId}
								/>
							));
						})()}
					</div>
				</>
			)}
		</div>
	);
}

export { CatalogPage };
