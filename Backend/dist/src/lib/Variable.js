import dotenv from 'dotenv';
dotenv.config();
const VARIABLES = {
    isPRODUCTION: process.env.PRODUCTION === 'TRUE',
    PORT: process.env.PORT || 3001,
    DB: process.env.DB_URL,
    CLIENT_URL: process.env.CLIENT_URL,
    INNGEST_EVENT_KEY: process.env.INNGEST_EVENT_KEY,
    INNGEST_SIGNING_KEY: process.env.INNGEST_SIGNING_KEY,
    STREAM_API_KEY: process.env.STREAM_API_KEY,
    STREAM_API_SECRET: process.env.STREAM_API_SECRET,
};
export default VARIABLES;
