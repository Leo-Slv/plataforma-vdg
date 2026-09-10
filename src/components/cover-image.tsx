'use client';

import { useState } from 'react';

import { cn } from '@/lib/utils';

type CoverImageProps = {
	src: string | null;
	alt?: string;
	className?: string;
};

/**
 * Cover art (course/video thumbnails) is an admin-typed URL, not an
 * upload — nothing here validates it points at an actual image (vs. a
 * page URL, an expired link, a host that blocks hotlinking). Falls back
 * to the same diagonal-stripe placeholder used everywhere a thumbnail
 * is simply absent, rather than leaving the browser's broken-image icon
 * on screen. `key={src}` resets the fallback per distinct URL, so
 * fixing the URL and saving again gets a fresh attempt. Expects a
 * `relative`-positioned parent — both the image and the placeholder are
 * `absolute inset-0`.
 */
function CoverImage({ src, alt = '', className }: CoverImageProps) {
	const [failed, setFailed] = useState(false);

	if (!src || failed) {
		return (
			<div
				className={cn('absolute inset-0', className)}
				style={{
					backgroundImage:
						'repeating-linear-gradient(135deg, var(--stripe-1) 0 8px, var(--stripe-2) 8px 16px)',
				}}
			/>
		);
	}

	return (
		// eslint-disable-next-line @next/next/no-img-element -- external, unconfigured media host
		<img
			key={src}
			src={src}
			alt={alt}
			className={cn('absolute inset-0 size-full object-cover', className)}
			onError={() => setFailed(true)}
		/>
	);
}

export { CoverImage };
