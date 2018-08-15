
import dotenv from 'dotenv';

// loads .env
dotenv.config();
// loads api key
dotenv.config({
  path: require('path').join(__dirname, '.apikey'),
});

process.env.NODE_ENV = process.env.NODE_ENV || 'development';


const {
  LOG_LEVEL,
  TELEGRAM_BOT_TOKEN,
  TELEGRAM_BOT_ADMIN_ID,
} = {
  // defaults
  LOG_LEVEL: 5,
  // from env
  ...process.env,
};

export {
  LOG_LEVEL,
  TELEGRAM_BOT_TOKEN,
  TELEGRAM_BOT_ADMIN_ID
};
