import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { getUserRegisteredEvent, registerEvent } from "../controllers/eventRegister.controller.js";

const router = Router();
router.use(verifyJWT); // Apply verifyJWT middleware to all routes in this file

router.route("/c/:eventId").post(registerEvent);
router.route("/getregisterdEvent").get(verifyJWT,getUserRegisteredEvent)


export default router;