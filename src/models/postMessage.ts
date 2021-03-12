import mongoose from 'mongoose';

const postSchema = new mongoose.Schema({
	creator: {type: String, required: true},
	title: {type: String, required: true},
	message: {type: String, required: true},
	tags: [{type: String, required: true}],
	image: {
		type: {
			url: {type: String, required: true},
			publicId: {type: String, required: true}
		},
		required: true
	},
	likeCount: {
		type: Number,
		default: 0
	},
	createdAt: {
		type: Date,
		default: new Date()
	}
});

const PostMessage = mongoose.model('PostMessage', postSchema);

export default PostMessage;
