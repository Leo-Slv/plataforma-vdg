const CONTENT_TYPE_LABELS: Record<string, string> = {
	'application/pdf': 'PDF',
	'application/msword': 'DOC',
	'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
		'DOCX',
	'application/vnd.ms-powerpoint': 'PPT',
	'application/vnd.openxmlformats-officedocument.presentationml.presentation':
		'PPTX',
	'application/vnd.ms-excel': 'XLS',
	'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'XLSX',
	'application/zip': 'ZIP',
	'image/png': 'PNG',
	'image/jpeg': 'JPEG',
};

function formatMaterialType(contentType: string): string {
	return CONTENT_TYPE_LABELS[contentType] ?? 'Arquivo';
}

export { formatMaterialType };
