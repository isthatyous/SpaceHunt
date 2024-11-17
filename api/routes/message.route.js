import express from "express"
import {  } from "../controllers/chat.controller.js";
import { verifyToken } from "../middleware/verifyToken.js";
import {addMessage} from "../controllers/message.controller.js"

const router = express.Router();


router.post("/:chatId",verifyToken,addMessage);  // jb bhi profile page to jae to sare chat read hone chahiye 



export default router;