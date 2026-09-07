import { AreaFormPage } from '@/features/admin/components/area-form-page';

export default async function EditArea({
	params,
}: PageProps<'/admin/areas/[areaId]/edit'>) {
	const { areaId } = await params;
	return <AreaFormPage mode="edit" areaId={areaId} />;
}
