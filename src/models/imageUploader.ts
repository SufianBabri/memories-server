import {v2 as cloudinary} from 'cloudinary';
import {logger} from '../startup/logging';

export function ImageUploader() {
	cloudinary.config({
		cloud_name: process.env.MEMORIES_CLOUDINARY_CLOUD_NAME,
		api_key: process.env.MEMORIES_CLOUDINARY_API_KEY,
		api_secret: process.env.MEMORIES_CLOUDINARY_API_SECRET
	});

	const uploadImage = async (
		imageFile: string
	): Promise<UploaderResponse> => {
		try {
			const {
				secure_url: url,
				public_id: publicId
			} = await cloudinary.uploader.upload(imageFile, {
				folder: process.env.MEMORIES_CLOUDINARY_FOLDER_NAME
			});
			return {url, publicId};
		} catch (e) {
			logger.error(e);
			return {error: 'Could not upload the image'};
		}
	};

	const deleteImage = async (publicId: string): Promise<void> => {
		try {
			await cloudinary.uploader.destroy(publicId);
		} catch (e) {
			logger.error(
				`Error occurred when deleting file with publicId ${publicId}`,
				e
			);
		}
	};
	const updateImage = async (
		newImageFile: string,
		oldPublicId: string
	): Promise<UploaderResponse> => {
		const image = await uploadImage(newImageFile);
		await deleteImage(oldPublicId);
		return image;
	};

	return {
		uploadImage,
		deleteImage,
		updateImage
	};
}

export interface UploaderResponse {
	url?: string;
	publicId?: string;
	error?: string;
}
