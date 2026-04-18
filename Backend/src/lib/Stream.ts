import { StreamChat } from 'stream-chat';
import VARIABLES from './Variable.js';


if (!VARIABLES.STREAM_API_KEY || !VARIABLES.STREAM_API_SECRET) {
    throw new Error('Stream API key and secret must be defined in environment variables');
}

interface StreamUserData {
    id: string;
    name: string;
    image: string;
}
export const chatClient = StreamChat.getInstance(VARIABLES.STREAM_API_KEY, VARIABLES.STREAM_API_SECRET);

export const upsertStreamUser = async (userData : StreamUserData) => {
    try {
        await chatClient.upsertUser(userData);
    } catch (error) {
        console.error('Error upserting user to Stream:', error);
    }
}

export const deleteStreamUser = async (userId: string) => {
    try {
        await chatClient.deleteUser(userId);
    } catch (error) {
        console.error('Error deleting user from Stream:', error);
    }
}