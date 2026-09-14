/**
 * PUTs a file straight to a presigned storage URL (S3) — never through
 * apiFetch, since this request goes to a different origin with no auth
 * header and the presigned URL itself is the authorization.
 */
function uploadFileToStorage(
	uploadUrl: string,
	file: File,
	options: { onProgress?: (percent: number) => void } = {},
): Promise<void> {
	return new Promise((resolve, reject) => {
		const xhr = new XMLHttpRequest();
		xhr.open('PUT', uploadUrl);
		xhr.setRequestHeader('Content-Type', file.type);

		xhr.upload.onprogress = (event) => {
			if (event.lengthComputable && options.onProgress) {
				options.onProgress(Math.round((event.loaded / event.total) * 100));
			}
		};

		xhr.onload = () => {
			if (xhr.status >= 200 && xhr.status < 300) {
				resolve();
			} else {
				reject(new Error(`Upload failed with status ${xhr.status}.`));
			}
		};

		xhr.onerror = () => reject(new Error('Upload failed.'));
		xhr.onabort = () => reject(new Error('Upload was aborted.'));

		xhr.send(file);
	});
}

export { uploadFileToStorage };
