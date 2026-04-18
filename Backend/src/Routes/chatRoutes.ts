import express from "express";
import { protectRoute } from "../Middleware/protectRoute";
import getStreamToken from "../Controller/chatController";

const router = express.Router();

router.get("/token", protectRoute, getStreamToken);

export default router;