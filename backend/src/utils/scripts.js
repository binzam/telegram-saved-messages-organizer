import Session from "../models/Session.js";

export const clearAllSessions = async () => {
  try {
    const result = await Session.deleteMany({});
    console.log(`Deleted ${result.deletedCount} Sessions.`);
  } catch (error) {
    console.error("Error deleting Ssesions:", error);
  }
};
