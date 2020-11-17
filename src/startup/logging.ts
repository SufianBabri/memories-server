import { Express } from 'express';
import morgan from 'morgan';
import * as Sentry from '@sentry/node';
import 'express-async-errors';
import fs from 'fs';
import Tracer from 'tracer';

export const logger = Tracer.dailyfile({
	root: 'logs',
	allLogsFileName: 'daily-log',
	inspectOpt: {
		showHidden: false,
		depth: null,
	},
	maxLogFiles: 90,
	transport: function (data) {
		console.log(data.message);
	},
});

const uncaughtExceptionsLogger = Tracer.console({
	transport: function (data) {
		console.log(data.output);
		fs.appendFile(
			'./logs/uncaught-exceptions.log',
			data.rawoutput + '\n',
			(err) => {
				if (err) throw err;
				process.exit(1);
			}
		);
	},
});

process.on('unhandledRejection', (reason, promise) => {
	uncaughtExceptionsLogger.error(promise);
});

process.on('uncaughtException', (error) => {
	uncaughtExceptionsLogger.error(error);
});

export function logging(app: Express) {
	const environment = app.get('env');
	if (environment === 'development') {
		app.use(morgan('dev'));
		logger.log('Morgan enabled...');
	}

	Sentry.init({
		environment,
		dsn: process.env.MEMORIES_SENTRY_DSN,
	});
}
