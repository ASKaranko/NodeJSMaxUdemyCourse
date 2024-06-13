import express from 'express';

// the name must be the same
// the name can be any for default export
import { resHandler } from './responseHandler.js';

const app = express();

app.get('/', resHandler);

app.listen(3000);
