import mongoose from 'mongoose';
import validator from 'validator';
const customerSchema = new mongoose.Schema({
  customerId: {
    type: String,
    required: false,
  },
  fullName: {
    type: String,
    required: [true, "Full name is required"]
  },
  businessName: {
    type: String,
    required: [true, "Business name is required"],
    unique:true
  },
  email: {
    type: String,
    required: [true, "email is required"],
    unique: true,
    lowercase: true,
    validate: [validator.isEmail, "please enter a valid email"]
  },
  phoneNumber: {
    type: String,
    required: [true, "Mobile number is required"]
  },
  shift: {
    type: String,
    required: true
  },
  address1: {
    type: String,
    required: [true, "Address is required"]
  },
  address2: {
    type: String,
  },
  city: {
    type: String,
    required: [true, "City is required"]
  },
  province: {
    type: String,
    required: [true, "Province is required"]
  },
  postalCode: {
    type: String,
    required: [true, "Postal Code is required"]
  },
  message: {
    type: String
  },
  services: {
    type: [String],
  },
  orderFile: {
    type: String,
  }
}, { timestamps: true });

const CustomerOrder = mongoose.model('CustomerOrder', customerSchema);

export default CustomerOrder;
