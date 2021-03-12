import {Express} from 'express';
import helmet from 'helmet';
import compression from 'compression';

export default function (app: Express) {
	app.use(helmet());
	app.use(compression());
}
