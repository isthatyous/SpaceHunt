import express from "express"
import {verifyToken} from '../middleware/verifyToken.js'
import { addPost, deletePost, getPost, getPosts, updatePost } from "../controllers/post.controller.js";

const router = express.Router();

router.get("/",getPosts);
router.get("/:id",getPost);
router.post("/",verifyToken,addPost);
router.delete("/:id",verifyToken,deletePost);
router.put("/:id",verifyToken,updatePost);



export default router;