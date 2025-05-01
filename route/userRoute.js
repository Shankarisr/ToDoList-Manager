import {create,fetch,update,deleteTodo} from "../controller/todoController.js";
import express from "express";

const route = express.Router();

route.get("/",fetch);
route.post("/",create);
route.put("/:id",update);
route.delete("/:id",deleteTodo);

export default route;