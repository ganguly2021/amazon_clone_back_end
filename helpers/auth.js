const bcryptjs = require('bcryptjs');
const jwt = require('jsonwebtoken');
const secret = process.env.SECRET;

// create password hash
const getHashedPassword = (password) => {
  // create salt
  const salt = bcryptjs.genSaltSync(10);

  // create hashed password
  return bcryptjs.hashSync(password, salt);
}

// check password match with hashed password
const isPasswordMatch = (password, hashedPassword) => {
  return bcryptjs.compareSync(password, hashedPassword);
}

// create auth json web token
const getJWTToken = (payload) => {
  return jwt.sign(payload, secret, { expiresIn: '1d' });
}

module.exports = {
  getHashedPassword,
  isPasswordMatch,
  getJWTToken
}