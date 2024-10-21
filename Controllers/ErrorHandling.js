const developmentError = (error, res) => {
  return res.status(error.errorStatus).json({
    status: error.errorStatus,
    msg: error.message,
    stackTrace: error.stack,
    error: error
  })
};
const productionError = (error, res) => {
  if (error.isOprationError) {
    return res.status(error.errorStatus).json({
      status: error.errorStatus,
      message: error.message,
    })
  } else {
    return res.status(500).json({
      status: "error",
      message: "something went wrong",
    })
  }
}
const castError = (error, res) => {
  const err = `your id ${error.value} is not correct for ${error.path} field`;
  return res.status(error.errorStatus).json({
    status: 400,
    message: err,
  })
}
const duplicateError = (error, res) => {
  let msg = `${error.keyValue.name} is used previoulsly ,${Object.keys(error.keyValue)[0]} is unique`;
  return res.status(400).json({
    status: 400,
    message: msg,
  })
};
const validationEror = (error, res) => {
  let msg = Object.values(error.errors)
  let err = msg.map(err => err.message)
  return res.status(400).json({
    status: 400,
    message: `validation Error:${err.join(". ")}`,
  })
};
const invalidTokenError = (error, res) => {
  return res.status(401).json({
    status: 401,
    message: `token is not valid plz provide the valid token`,
  })
};
const TokenExpiredError = (error, res) => {
  return res.status(401).json({
    status: 401,
    message: "token is expired"
  })
}
const ErrorHandling = (error, req, res, next) => {
  error.errorStatus = error.errorStatus || 500;
  error.status = error.status || 'error';
  if (process.env.NODE_ENV === "development") {
    developmentError(error, res)
  } else {
    if (error.name === "CastError") {
      castError(error, res)
    } if (error.code === 11000) {
      duplicateError(error, res)
    } if (error.name === "ValidationError") {
      validationEror(error, res)
    } if (error.name === "JsonWebTokenError") {
      invalidTokenError(error, res)
    } if (error.name === "TokenExpiredError") {
      TokenExpiredError(error, res)
    }
    productionError(error, res)
  }

}
export default ErrorHandling;