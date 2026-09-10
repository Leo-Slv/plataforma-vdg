'use client';

import { useState } from 'react';

type AvatarImageProps = {
	src: string | null;
	fallbackSrc: string;
	alt?: string;
	className?: string;
};

/**
 * Same reasoning as CoverImage — an admin/user-typed URL with nothing
 * validating it resolves to an actual image. Falls back to fallbackSrc
 * (a bundled brand asset, always loadable) instead of the browser's
 * broken-image icon.
 */
function AvatarImage({
	src,
	fallbackSrc,
	alt = '',
	className,
}: AvatarImageProps) {
	const [failed, setFailed] = useState(false);
	const resolvedSrc = !src || failed ? fallbackSrc : src;

	return (
		// eslint-disable-next-line @next/next/no-img-element -- external, unconfigured media host
		<img
			key={src ?? 'fallback'}
			src={resolvedSrc}
			alt={alt}
			className={className}
			onError={() => setFailed(true)}
		/>
	);
}

export { AvatarImage };
