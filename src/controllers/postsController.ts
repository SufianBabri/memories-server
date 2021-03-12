import {Request, Response, Router} from 'express';
import mongoose from 'mongoose';
import * as _ from 'underscore';
import {logger} from '../startup/logging';
import PostMessage from '../models/postMessage';
import {ImageUploader, UploaderResponse} from '../models/imageUploader';
import {getFileSizeInKB} from '../utils/systemUtils';

const router = Router();

router.get('/', async (req: Request, res: Response) => {
	try {
		const postMessages = await PostMessage.find().select(['-image.publicId', '-__v']);

		_.each(postMessages, (p: any) => {
			return p.image = p.image.url;
		});

		res.status(200).json(postMessages);
	} catch (e) {
		logger.error(e);
		res.status(404).json({message: e.message});
	}
});

router.post('/', async (req: Request, res: Response) => {
	const post = req.body;
	try {
		let uploaderRes: UploaderResponse = {};

		const imageBase64 = post.imageBase64;
		if (!imageBase64) {
			return res.status(400).json('No image sent!');
		}

		if (!isImageFileSizeAcceptable(imageBase64)) {
			return res
				.status(400)
				.json('Filesize of the image exceeds the limit');
		}

		uploaderRes = await ImageUploader().uploadImage(imageBase64);

		if (uploaderRes.error) {
			return res.status(400).json(uploaderRes.error);
		}

		const newPost = new PostMessage({
			...post,
			image: {
				url: uploaderRes.url,
				publicId: uploaderRes.publicId
			}
		});
		await newPost.save();

		(newPost as any).image = (newPost as any).image.url;

		res.status(200).json(_.omit(newPost.toJSON(), ['__v']));
	} catch (e) {
		logger.error(e);
		res.status(400).json({message: e.message});
	}
});

router.delete('/:id', async (req: Request, res: Response) => {
	const { id } = req.params;

	if (!mongoose.Types.ObjectId.isValid(id))
		return res.status(404).send(`No post with id ${id}`);

	await PostMessage.findByIdAndDelete(
		id,
		null,
		async (err: any, doc: any) => {
			if (!doc) {
				return res.json({ message: 'Post deleted successfully' });
			}

			const imagePublicId = (doc as any).imagePublicId;
			if (imagePublicId) {
				await ImageUploader().deleteImage(imagePublicId);
			}

			res.json({ message: 'Post deleted successfully' });
		}
	);
});

router.patch('/:id/like', async (req: Request, res: Response) => {
	const { id } = req.params;

	if (!mongoose.Types.ObjectId.isValid(id))
		return res.status(404).send(`No post with id ${id}`);

	const updatedPost = await PostMessage.findByIdAndUpdate(
		id,
		{
			$inc: { likeCount: 1 },
		},
		{ new: true }
	);

	res.json(updatedPost);
});

function isImageFileSizeAcceptable(base64String: string | undefined) {
	const MAX_ALLOWED_FILE_SIZE_IN_KB = 2000;
	return (
		base64String === undefined ||
		getFileSizeInKB(base64String) <= MAX_ALLOWED_FILE_SIZE_IN_KB
	);
}

export default router;
