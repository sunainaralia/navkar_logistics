import express from "express";
import CustomErrorHandler from "./Utils/CustomErrorHandler.js";
import ErrorHandling from "./Controllers/ErrorHandling.js";
import {clientRouter} from './Routes/ClientRouter.js';
const app = express();
app.use(express.json());
// routes for client
app.use('/api/v1/client/',clientRouter)
app.all("*", (req, res, next) => {
  let err =new CustomErrorHandler(`the given url ${req.originalUrl} is not present`, 400);
  next(err)
});
app.use(ErrorHandling);
export default app;
