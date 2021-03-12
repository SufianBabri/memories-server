import express, {Express} from 'express';
import cors from 'cors';
import postsController from '../controllers/postsController';

export default function (app: Express) {
	app.use(cors());
	app.use(express.json({limit: '50mb'}));
	app.use('/api/posts', postsController);
	app.get('/api', (req: express.Request, res: express.Response) => {
		res.send('Hello to Memories API');
	});
}
