const SOURCE_LABELS: Record<string, string> = {
	Manual: 'Concedido',
	Purchase: 'Comprado',
	Migrated: 'Migrado',
};

function formatCourseAccessSource(source: string): string {
	return SOURCE_LABELS[source] ?? source;
}

export { formatCourseAccessSource };
