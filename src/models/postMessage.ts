import mongoose from 'mongoose';

const postSchema = new mongoose.Schema({
	creator: String,
	title: String,
	message: String,
	tags: [String],
	imageUrl: String,
	imagePublicId: String,
	likeCount: {
		type: Number,
		default: 0,
	},
	createdAt: {
		type: Date,
		default: new Date(),
	},
});

const PostMessage = mongoose.model('PostMessage', postSchema);

export default PostMessage;
