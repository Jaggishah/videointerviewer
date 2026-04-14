import mongoose from 'mongoose';
import VARIABLES from './Variable';
const connectDB = async () => {
    try {
        if (!VARIABLES.DB) {
            throw new Error('Database URL is not defined in environment variables');
        }
        const conn = await mongoose.connect(VARIABLES.DB);
        console.log(`MongoDB Connected: ${conn.connection.host}`);
    }
    catch (error) {
        console.error('Error connecting to the database:', error);
        process.exit(1);
    }
};
export default connectDB;
