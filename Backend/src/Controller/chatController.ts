import { chatClient } from "../lib/Stream.js";
import { Request, Response } from "express";

type AuthRequest = Request & { user?: any };

const getStreamToken = async (req: AuthRequest, res: Response) => {
    try {
    
        // Generate a Stream token for the user
        const token = chatClient.createToken(req.user.clerkId);

        res.status(200).json({
            token,
            userId: req.user.clerkId,
            userName: req.user.name,
            userImage: req.user.image,
            });
    } catch (error) {
        console.error("Error generating Stream token:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
}

export default getStreamToken;