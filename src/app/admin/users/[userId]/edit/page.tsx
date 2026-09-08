import { UserAccessEditPage } from '@/features/admin/components/user-access-edit-page';

export default async function UserAccessEdit({
	params,
}: PageProps<'/admin/users/[userId]/edit'>) {
	const { userId } = await params;
	return <UserAccessEditPage userId={userId} />;
}
