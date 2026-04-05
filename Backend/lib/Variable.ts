import dotenv from 'dotenv';

dotenv.config();


const VARIABLES: Record<string, any> = {
    isPRODUCTION: process.env.PRODUCTION === 'TRUE',
    PORT: process.env.PORT || 5000
}

export default VARIABLES;