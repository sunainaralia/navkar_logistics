import mongoose from "mongoose";
import validator from "validator";
import bcryptjs from 'bcryptjs';
import crypto from 'crypto';
const clientSchema = new mongoose.Schema(
  {
    userName: {
      type: String,
      required: [true, "username is required"]
    },
    phone_no: {
      type: Number,
      required: [true, "phone no is required"]
    },
    email: {
      type: String,
      required: [true, "email is required"],
      unique: true,
      lowercase: true,
      validate: [validator.isEmail, "please enter a valid email"]
    },
    city: {
      type: String,
    },
    province: {
      type: String
    },
    postal_code: {
      type: Number
    },
    business_name: {
      type: String
    },
    business_address: {
      type: String
    },
    active: {
      type: Boolean,
      default: true,
      select: false
    },
    password: {
      type: String,
      required: [true, "please enter a password"],
      minLength: 5
    },
    confirmPassword: {
      type: String,
      required: [true, "please confirm your password"],
      validate: {
        validator: function (value) {
          return value === this.password;
        },
        message: "password and confirm password are not the same"
      }
    },
    resetToken: String,
    resetTokenExpiresIn: Date,
  },
  {
    timestamps: true
  }
);

// hash the password
clientSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    return next();
  }
  this.password = await bcryptjs.hash(this.password, 12)
  this.confirmPassword = undefined;
  next();
});
// method to compare the password
clientSchema.methods.comparePasswordInDb = async function (pass, passInDb) {
  return await bcryptjs.compare(pass, passInDb);

}
// set reset password token
clientSchema.methods.resetPasswordToken = async function () {
  const token = crypto.randomBytes(32).toString('hex');
  this.resetToken = crypto.createHash('sha256').update(token).digest('hex');
  this.resetTokenExpiresIn = Date.now() + 10 * 60 * 1000;
  return token;
}
export const Client = mongoose.model('Client', clientSchema);

