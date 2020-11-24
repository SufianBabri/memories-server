const BYTES_IN_KILO_BYTE = 1000;

export function getFileSizeInKB(base64Data: string) {
	// https://stackoverflow.com/a/53229045/
	const padding = getPaddingInBase64Data(base64Data);
	return ((base64Data.length * 3) / 4 - padding) / BYTES_IN_KILO_BYTE;
}

function getPaddingInBase64Data(data: string) {
	if (data.endsWith('==')) return 2;
	else if (data.endsWith('=')) return 1;
	return 0;
}
