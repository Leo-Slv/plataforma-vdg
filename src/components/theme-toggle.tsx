'use client';

import { useTheme } from 'next-themes';
import { MoonIcon, SunIcon } from '@phosphor-icons/react';

function ThemeToggle() {
	const { resolvedTheme, setTheme } = useTheme();

	function toggleTheme() {
		setTheme(resolvedTheme === 'light' ? 'dark' : 'light');
	}

	return (
		<button
			type="button"
			onClick={toggleTheme}
			aria-label="Alternar tema claro/escuro"
			className="flex size-7.5 items-center justify-center rounded-full text-foreground/50 hover:bg-foreground/6 hover:text-foreground"
		>
			<SunIcon className="hidden size-4 dark:block" />
			<MoonIcon className="size-4 dark:hidden" />
		</button>
	);
}

export { ThemeToggle };
