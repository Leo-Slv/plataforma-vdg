'use client';

import { useState } from 'react';

import { cn } from '@/lib/utils';

type UserAvatarProps = {
	avatarUrl: string | null;
	initials: string;
	className?: string;
};

/**
 * Same failed-load fallback behavior as AvatarImage, but the fallback is
 * the initials circle used across the app instead of a bundled image —
 * there's no sensible static asset to fall back to for a user's own photo.
 */
function UserAvatar({ avatarUrl, initials, className }: UserAvatarProps) {
	const [failed, setFailed] = useState(false);

	if (avatarUrl && !failed) {
		return (
			// eslint-disable-next-line @next/next/no-img-element -- external, unconfigured media host
			<img
				key={avatarUrl}
				src={avatarUrl}
				alt=""
				className={cn('flex-none rounded-full object-cover', className)}
				onError={() => setFailed(true)}
			/>
		);
	}

	return (
		<span
			className={cn(
				'flex flex-none items-center justify-center rounded-full bg-surface-3 font-heading',
				className,
			)}
		>
			{initials}
		</span>
	);
}

export { UserAvatar };
