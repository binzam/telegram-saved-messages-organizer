import { Request, Response, NextFunction } from "express";
import Session, { ISession } from "../models/Session.js";

export interface AuthRequest extends Request {
  sessionDoc?: ISession;
}

export async function requireAuth(
  req: AuthRequest,
  res: Response,
  next: NextFunction,
): Promise<void | Response> {
  try {
    const sess = await Session.findOne();

    if (!sess || !sess.session) {
      return res
        .status(401)
        .json({ error: "Unauthorized: No active session." });
    }

    // Attach the session to the request object
    req.sessionDoc = sess;

    next();
  } catch (err) {
    console.error("Auth middleware error:", err);
    return res
      .status(500)
      .json({ error: "Internal server error during authentication." });
  }
}
