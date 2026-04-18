import { requireAuth, getAuth } from "@clerk/express";
import User from "../Models/User.js";
import { Request,Response,NextFunction } from "express";

interface AuthRequest extends Request { user?: unknown }

export const protectRoute = [
    requireAuth(),
    async (req: AuthRequest, res: Response, next: NextFunction) => {
        try{
            const { userId: clerkId } = getAuth(req);
            if(!clerkId){
                return res.status(401).json({ message: "Unauthorized" });
            }

            const user = await User.findOne({ clerkId });
            if(!user){
                return res.status(401).json({ message: "Unauthorized" });
            }
            req.user = user;
            next();
        }
        catch(error){
            console.error("Error in protectRoute middleware", error);
            return res.status(500).json({ message: "Internal Server Error" });
        }
    }
]