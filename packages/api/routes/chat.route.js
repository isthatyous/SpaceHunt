import express from "express"
import { addChat, getChat, getChats, readChat } from "../controllers/chat.controller.js";
import { verifyToken } from "../middleware/verifyToken.js";

const router = express.Router();

router.get("/",verifyToken,getChats);
router.get("/:id",verifyToken,getChat);
router.post("/",verifyToken,addChat);
router.put("/read/:id",verifyToken,readChat);  // jb bhi profile page to jae to sare chat read hone chahiye 



export default router;