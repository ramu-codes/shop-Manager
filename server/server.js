import 'dotenv/config';

import { validateEnv } from './config/env.js';
import connectDB from './config/db.js';
import createApp from './app.js';

validateEnv();

await connectDB();

const app = createApp();
const PORT = Number(process.env.PORT) || 5000;

app.listen(PORT, () => {
  console.log(`EasyShop server listening on port ${PORT}`);
});
