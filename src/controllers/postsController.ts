import { Request, Response, Router } from 'express';
import mongoose from 'mongoose';
import PostMessage from '../models/postMessage';

const router = Router();

router.get('/', async (req: Request, res: Response) => {
	try {
		const postMessages = await PostMessage.find();

		res.status(200).json(postMessages);
	} catch (error) {
		res.status(404).json({ message: error.message });
	}
});

router.post('/', async (req: Request, res: Response) => {
	const post = req.body;
	try {
		const newPost = new PostMessage(post);
		await newPost.save();

		res.status(200).json(newPost);
	} catch (error) {
		res.status(400).json({ message: error.message });
	}
});

router.patch('/:id', async (req: Request, res: Response) => {
	const { id: _id } = req.params;
	const post = req.body;

	if (!mongoose.Types.ObjectId.isValid(_id))
		return res.status(404).send(`No post with id ${_id}`);

	const updatedPost = await PostMessage.findByIdAndUpdate(_id, post, {
		new: true,
	});
	res.json(updatedPost);
});

router.delete('/:id', async (req: Request, res: Response) => {
	const { id } = req.params;

	if (!mongoose.Types.ObjectId.isValid(id))
		return res.status(404).send(`No post with id ${id}`);

	await PostMessage.findByIdAndDelete(id);

	res.json({ message: 'Post deleted successfully' });
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
