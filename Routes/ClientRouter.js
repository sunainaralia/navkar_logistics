import { Router } from "express";
import { signUpClinet, LoginClient, getClientProfile, editClient, changePassword, forgotPassword, resetPassword } from "../Controllers/ClientController.js";
import VerifyToken from "../Controllers/VerifyToken.js";
export const clientRouter = Router();
clientRouter.route('/')
  .post(signUpClinet)
  .get(VerifyToken, getClientProfile)
  .patch(VerifyToken, editClient)
clientRouter.route('/change-password/')
  .patch(VerifyToken, changePassword)
clientRouter.route('/login/')
  .post(LoginClient)
clientRouter.route('/forgot-password/')
  .post(forgotPassword)
clientRouter.route('/reset-password/:token/')
  .patch(resetPassword)