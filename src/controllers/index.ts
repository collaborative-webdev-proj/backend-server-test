import { Router, Request, Response } from "express";
import { signup } from "@controllers/auth/signup";
import validateSignupRequest from "@models/app/auth/signup";
import { getDatabaseVersion } from "@controllers/healthcheck/db";
import { getAllIso639 } from "@controllers/iso-639/get-iso-639";
import { ServerState } from "@models/app/server_state_model"; // Adjust import if necessary

const createRouter = (serverState: ServerState) => {
  const router = Router();

  // basic server healthcheck
  router.get("/healthcheck", (req: Request, res: Response) => {
    const startTime = process.hrtime(); // Start timing
    try {
      res.send(`${serverState.serverConfig.serverName} up and good to go!`);
    } catch (error) {
      console.log("ERROR:", error);
      res.status(500).json({ error: "Internal Server Error" });
    } finally {
      const endTime = process.hrtime(startTime); // End timing
      const durationMs = endTime[0] * 1000 + endTime[1] / 1e6; // Convert to milliseconds
      console.log(`healthcheck took ${durationMs.toFixed(3)} ms`);
    }
  });

  // database healthcheck
  router.get("/healthcheck/db", (req: Request, res: Response) => {
    return getDatabaseVersion(req, res);
  });

  // signup
  router.post(
    "/auth/signup",
    validateSignupRequest,
    (req: Request, res: Response) => {
      return signup(req, res);
    },
  );

  // get all iso-639 codes
  router.get("/iso-639/get-all", (req: Request, res: Response) => {
    return getAllIso639(req, res, serverState);
  });

  return router;
};

export default createRouter;
