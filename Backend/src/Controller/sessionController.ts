import { Request, Response } from "express";
import { Types } from "mongoose";
import { chatClient, streamClient } from "../lib/Stream.js";
import Session from "../Models/Session.js";

type Difficulty = "easy" | "medium" | "hard";

interface AuthenticatedUser {
  _id: Types.ObjectId | string;
  clerkId: string;
}

interface CreateSessionBody {
  problem: string;
  difficulty: Difficulty;
}

interface SessionParams {
  id?: string;
}

interface AuthenticatedRequest<P = Record<string, string>, B = unknown> extends Request<P, unknown, B> {
  user?: AuthenticatedUser;
}

interface SessionDocumentLike {
  _id: Types.ObjectId | string;
  host: Types.ObjectId | string;
  participant: Types.ObjectId | string | null;
  status: "active" | "completed";
  callId: string;
  save(): Promise<unknown>;
}

const getErrorMessage = (error: unknown) => {
  return error instanceof Error ? error.message : "Unknown error";
};

const buildChannelData = (problem: string, clerkId: string) => {
  return {
    name: `${problem} Session`,
    created_by_id: clerkId,
    members: [clerkId],
  } as any;
};

export async function createSession(req: AuthenticatedRequest<Record<string, string>, CreateSessionBody>, res: Response) {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const { problem, difficulty } = req.body;
    const userId = req.user._id;
    const clerkId = req.user.clerkId;

    if (!problem || !difficulty) {
      return res.status(400).json({ message: "Problem and difficulty are required" });
    }

    // generate a unique call id for stream video
    const callId = `session_${Date.now()}_${Math.random().toString(36).substring(7)}`;

    // create session in db
    const session = (await Session.create({ problem, difficulty, host: userId, callId })) as unknown as SessionDocumentLike;

    // create stream video call
    await streamClient.video.call("default", callId).getOrCreate({
      data: {
        created_by_id: clerkId,
        custom: { problem, difficulty, sessionId: session._id.toString() },
      },
    });

    // chat messaging
    const channel = chatClient.channel("messaging", callId, buildChannelData(problem, clerkId));

    await channel.create();

    return res.status(201).json({ session });
  } catch (error) {
    console.log("Error in createSession controller:", getErrorMessage(error));
    return res.status(500).json({ message: "Internal Server Error" });
  }
}

export async function getActiveSessions(_req: Request, res: Response) {
  try {
    const sessions = await Session.find({ status: "active" })
      .populate("host", "name profileImage email clerkId")
      .populate("participant", "name profileImage email clerkId")
      .sort({ createdAt: -1 })
      .limit(20);

    return res.status(200).json({ sessions });
  } catch (error) {
    console.log("Error in getActiveSessions controller:", getErrorMessage(error));
    return res.status(500).json({ message: "Internal Server Error" });
  }
}

export async function getMyRecentSessions(req: AuthenticatedRequest, res: Response) {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const userId = req.user._id;

    // get sessions where user is either host or participant
    const sessions = await Session.find({
      status: "completed",
      $or: [{ host: userId }, { participant: userId }],
    })
      .sort({ createdAt: -1 })
      .limit(20);

    return res.status(200).json({ sessions });
  } catch (error) {
    console.log("Error in getMyRecentSessions controller:", getErrorMessage(error));
    return res.status(500).json({ message: "Internal Server Error" });
  }
}

export async function getSessionById(req: Request<SessionParams>, res: Response) {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ message: "Session id is required" });
    }

    const session = await Session.findById(id)
      .populate("host", "name email profileImage clerkId")
      .populate("participant", "name email profileImage clerkId");

    if (!session) return res.status(404).json({ message: "Session not found" });

    return res.status(200).json({ session });
  } catch (error) {
    console.log("Error in getSessionById controller:", getErrorMessage(error));
    return res.status(500).json({ message: "Internal Server Error" });
  }
}

export async function joinSession(req: AuthenticatedRequest<SessionParams>, res: Response) {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ message: "Session id is required" });
    }

    const userId = req.user._id;
    const clerkId = req.user.clerkId;

    const session = (await Session.findById(id)) as SessionDocumentLike | null;

    if (!session) return res.status(404).json({ message: "Session not found" });

    if (session.status !== "active") {
      return res.status(400).json({ message: "Cannot join a completed session" });
    }

    if (session.host.toString() === userId.toString()) {
      return res.status(400).json({ message: "Host cannot join their own session as participant" });
    }

    // check if session is already full - has a participant
    if (session.participant) return res.status(409).json({ message: "Session is full" });

    session.participant = userId;
    await session.save();

    const channel = chatClient.channel("messaging", session.callId);
    await channel.addMembers([clerkId]);

    return res.status(200).json({ session });
  } catch (error) {
    console.log("Error in joinSession controller:", getErrorMessage(error));
    return res.status(500).json({ message: "Internal Server Error" });
  }
}

export async function endSession(req: AuthenticatedRequest<SessionParams>, res: Response) {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ message: "Session id is required" });
    }

    const userId = req.user._id;

    const session = (await Session.findById(id)) as SessionDocumentLike | null;

    if (!session) return res.status(404).json({ message: "Session not found" });

    // check if user is the host
    if (session.host.toString() !== userId.toString()) {
      return res.status(403).json({ message: "Only the host can end the session" });
    }

    // check if session is already completed
    if (session.status === "completed") {
      return res.status(400).json({ message: "Session is already completed" });
    }

    // delete stream video call
    const call = streamClient.video.call("default", session.callId);
    await call.delete({ hard: true });

    // delete stream chat channel
    const channel = chatClient.channel("messaging", session.callId);
    await channel.delete();

    session.status = "completed";
    await session.save();

    return res.status(200).json({ session, message: "Session ended successfully" });
  } catch (error) {
    console.log("Error in endSession controller:", getErrorMessage(error));
    return res.status(500).json({ message: "Internal Server Error" });
  }
}
