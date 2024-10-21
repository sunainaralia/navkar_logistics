import { Client } from '../Models/ClientModel.js';
import pkg from 'jsonwebtoken';
import CustomErrorHandler from '../Utils/CustomErrorHandler.js';
import asyncFunHandler from '../Utils/asyncFunHandler.js';
import sendEmail from '../Utils/SendMail.js';
import crypto from 'crypto';
const { sign } = pkg;
///////////////////// genrate token ////////////////
const genrateToken = (id) => {
  return sign({ id }, process.env.SECRET_KEY, {
    expiresIn: process.env.EXPIRED_TIME
  })
};
/////////////////////// register the client ///////////////////
export const signUpClinet = asyncFunHandler(async (req, res, next) => {
  let user = await Client.create(req.body);
  let token = genrateToken(user._id);
  return res.status(201).json({
    success: true,
    msg: "user is created successfully",
    data: user,
    token,
  })

});
//////////////////////// login the client/////////////////////
export const LoginClient = asyncFunHandler(async (req, res, next) => {
  const email = req.body.email;
  const password = req.body.password;
  if (!email || !password) {
    let err = new CustomErrorHandler("email or password is not provided", 400)
    return next(err);
  }
  const user = await Client.findOne({ email })
  if (!user || !(await user.comparePasswordInDb(password, user.password))) {
    let err = new CustomErrorHandler("email or password is not correct", 400)
    return next(err);
  }
  let token = genrateToken(user._id)
  res.status(200).json({
    success: true,
    msg: "user is login successfully",
    data: user,
    token
  })
});

////////////////////////// get client profile //////////////////
export const getClientProfile = asyncFunHandler(async (req, res, next) => {
  const user = req.user;

  if (!user) {
    return next(new CustomErrorHandler("User not found", 404));
  }

  res.status(200).json({
    success: true,
    msg: "User profile fetched successfully",
    data: user
  });
});

//////////////// update the client profile //////////////////
export const editClient = asyncFunHandler(async (req, res) => {

  const getUserndUpdate = await Client.findByIdAndUpdate(req.user.id, req.body, { new: true, runValidators: true });

  res.status(200).json({
    success: true,
    msg: "user is updated succesfully",
    data: getUserndUpdate
  })
});


////////////////// change password//////////////////////
export const changePassword = asyncFunHandler(async (req, res, next) => {
  let user = await Client.findById(req.user._id)
  let savedPassword = user.password;
  let comparepassword = await user.comparePasswordInDb(req.body.currentPassword, savedPassword);
  if (!comparepassword) {
    let err = new CustomErrorHandler("old password is not correct", 403);
    return next(err)
  }
  user.password = req.body.password;
  user.confirmPassword = req.body.confirmPassword;
  await user.save();
  let token = genrateToken(user._id);
  res.status(200).json({
    success: true,
    msg: "password is changed successfully",
    token: token
  })
});

///////////////// forgot password ///////////////////////
export const forgotPassword = asyncFunHandler(async (req, res, next) => {
  const email = req.body.email;
  const user = await Client.findOne({ email })
  if (!user) {
    const err = new CustomErrorHandler("plz provide the valid email this is not registered", 404);
    next(err);
  }
  // send token to the user
  const resetToken = await user.resetPasswordToken();
  await user.save({ validateBeforeSave: false });
  const url = `${req.protocol}://${req.get('host')}/v1/api/user/resetPassword/${resetToken}/`;
  const message = `email is sent to your registered email plz reset your password by click on following link \n\n ${url}\n\n\n and this is valid upto ${user.resetTokenExpiresIn}`
  try {
    await sendEmail({
      message: message,
      email: user.email,
      subject: "email for reset password"
    })
    return res.status(200).json({
      success: true,
      msg: "email is sent to your registered mail"
    })
  } catch (err) {
    user.resetToken = undefined;
    user.resetTokenExpiresIn = undefined;
    await user.save({ validateBeforeSave: false });
    const errors = new CustomErrorHandler("some error has occured during sending the email", 500)
    return next(errors);
  }
});


///////////////// reset password////////////////////////
export const resetPassword = asyncFunHandler(async (req, res, next) => {
  let decodedtoken = crypto.createHash('sha256').update(req.params.token).digest('hex');
  let user = await Client.findOne({ resetToken: decodedtoken, resetTokenExpiresIn: { $gt: Date.now() } });
  if (!user) {
    let err = new CustomErrorHandler("your token provided is not valid or expired", 403);
    return next(err);
  };
  // setting the user password
  user.password = req.body.password;
  user.confirmPassword = req.body.confirmPassword;
  user.resetToken = undefined;
  user.resetTokenExpiresIn = undefined;
  await user.save();
  const loginToken = genrateToken(user._id);
  return res.status(200).json({
    success: true,
    msg: "password is changed successfully",
    token: loginToken
  })
});