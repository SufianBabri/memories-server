import { Request, Response, Router } from 'express';
import mongoose from 'mongoose';
import { logger } from '../startup/logging';
import PostMessage from '../models/postMessage';
import { ImageUploader, UploaderResponse } from '../models/imageUploader';

const router = Router();

router.get('/', async (req: Request, res: Response) => {
	try {
		const postMessages = await PostMessage.find().select([
			'-imagePublicId',
		]);

		res.status(200).json(postMessages);
	} catch (e) {
		logger.error(e);
		res.status(404).json({ message: e.message });
	}
});

router.post('/', async (req: Request, res: Response) => {
	const post = req.body;
	try {
		let uploaderRes: UploaderResponse = {};

		if (req.body.imageFile) {
			uploaderRes = await ImageUploader().uploadImage(req.body.imageFile);
		}

		if (uploaderRes.error) {
			return res.status(400).json(uploaderRes.error);
		}

		const newPost = new PostMessage({
			...post,
			imageUrl: uploaderRes.url,
			imagePublicId: uploaderRes.publicId,
		});
		await newPost.save();

		res.status(200).json(newPost);
	} catch (e) {
		logger.error(e);
		res.status(400).json({ message: e.message });
	}
});

router.patch('/:id', async (req: Request, res: Response) => {
	const { id: _id } = req.params;
	const updatedPost = req.body;

	if (!mongoose.Types.ObjectId.isValid(_id))
		return res.status(404).send(`No post with id ${_id}`);

	const { imagePublicId: oldImagePublicId } = (await PostMessage.findById(
		_id
	).select(['imagePublicId'])) as any;

	if (req.body.imageFile) {
		const uploaderResponse = await ImageUploader().updateImage(
			req.body.imageFile,
			oldImagePublicId
		);
		updatedPost.imageUrl = uploaderResponse.url;
		updatedPost.imagePublicId = uploaderResponse.publicId;
	}

	await PostMessage.findByIdAndUpdate(_id, updatedPost, {
		new: true,
	});
	res.json(updatedPost);
});

router.delete('/:id', async (req: Request, res: Response) => {
	const { id } = req.params;

	if (!mongoose.Types.ObjectId.isValid(id))
		return res.status(404).send(`No post with id ${id}`);

	await PostMessage.findByIdAndDelete(id, async (err, doc) => {
		const imagePublicId = (doc as any).imagePublicId;
		if (imagePublicId) {
			await ImageUploader().deleteImage(imagePublicId);
		}

		res.json({ message: 'Post deleted successfully' });
	});
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

export default router;
