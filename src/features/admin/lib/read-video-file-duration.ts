/**
 * Reads a local video file's duration client-side via a throwaway <video>
 * element — no upload needed just to know how long the file is.
 */
function readVideoFileDuration(file: File): Promise<number> {
	return new Promise((resolve, reject) => {
		const video = document.createElement('video');
		const objectUrl = URL.createObjectURL(file);

		video.preload = 'metadata';
		video.onloadedmetadata = () => {
			URL.revokeObjectURL(objectUrl);
			resolve(video.duration);
		};
		video.onerror = () => {
			URL.revokeObjectURL(objectUrl);
			reject(new Error('Could not read the video file.'));
		};

		video.src = objectUrl;
	});
}

export { readVideoFileDuration };
