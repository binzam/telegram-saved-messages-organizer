import Session from "../models/Session.js";

export async function requireAuth(req, res, next) {
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
