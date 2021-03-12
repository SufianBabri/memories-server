import express from 'express';
import dotenvFlow from 'dotenv-flow';
import {logger, logging} from './startup/logging';
import prod from './startup/prod';
import routes from './startup/routes';
import db from './startup/db';

const app = express();
dotenvFlow.config();

logging(app);
db();
prod(app);
routes(app);

const PORT = process.env.PORT;
app.listen(PORT, () => logger.log(`Server running on port: ${PORT}`));
