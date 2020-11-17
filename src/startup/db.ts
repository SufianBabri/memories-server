import mongoose from 'mongoose';
import { logger } from './logging';

export default function () {
	mongoose
		.connect(process.env.MEMORIES_CONNECTION_URL, {
			useNewUrlParser: true,
			useUnifiedTopology: true,
		})
		.then(() => logger.log('DB connected...'))
		.catch((error) => logger.log(error));

	mongoose.set('useFindAndModify', false);
}
