const config = require('config')
const User = require('../models/User')
module.exports = async (req, res, next) => {
  // console.log(req.originalUrl)
  // console.log(req.baseUrl)
  // console.log(req.path)
  // console.log(req.method)
  // next();
  if (req.method === 'OPTIONS') {
    return next()
  }
  try {
    const authorization = req.headers.authorization
    if (authorization) {
      const uuid = authorization.split(' ')[1] //Bearer uuid
      const user = await User.getUser(uuid)
      if (Object.keys(user).length != 0) {
        req.currentUser = uuid
      }
    }
    next()
  } catch (error) {
    console.log('auth middleware error: ', error)
    next()
  }
}
