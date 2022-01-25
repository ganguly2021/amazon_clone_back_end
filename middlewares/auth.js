const User = require('./../models/user');
const expressJWT = require('express-jwt');
const api_version = process.env.API_VERSION;
const secret = process.env.SECRET;

// revoked token
const isRevoked = (req, payload, done) => {
  // if user is not admin
  // if (!payload.isAdmin){
  //   done(null, true);
  // }

  // everything ok
  done();
}

// decrypt json web token
// using express-jwt
const decryptJWT = () => {
  return expressJWT({
    secret: secret,
    algorithms: ['HS256'],
    isRevoked: isRevoked
  }).unless({
    path: [
      //{ url: `${api_version}/products`, methods: ['GET', 'OPTIONS'] },
      { url: /\/api\/v1\/products(.*)/, methods: ['GET', 'OPTIONS'] },
      { url: /\/api\/v1\/categories(.*)/, methods: ['GET', 'OPTIONS'] },
      { url: /\/public(.*)/, methods: ['GET', 'OPTIONS'] },
      `${api_version}/users/login`,
      `${api_version}/users/register`
    ]
  });
}

// check user exists in database or 
// not based on token decrypted payload
const validateJWTUser = (req, res, next) => {
  // if user exists in request object
  if (req.user !== undefined) {

    const payload = req.user;

    // find user in database with payload
    User.findOne({ _id: payload.id })
      .then(user => {
        // if not user
        if (!user) {
          // error response
          return res.status(404).json({
            "status": false,
            "message": "User don't exists..."
          });
        }

      }).catch(error => {
        // error response
        return res.status(502).json({
          "status": false,
          "message": "Database error..."
        });
      });
  }

  // everything ok call next
  next();
}

// handle JWT decrypt error
const handleJWTError = (error, req, res, next) => {
  // if error occur during
  // jwt decryption
  if (error) {
    if (error.name === 'UnauthorizedError') {
      // error response
      return res.status(error.status).json({
        "status": false,
        "code": error.status,
        "message": error.message,
        "type": error.name
      });
    }
  }

  // next middleware
  next();
}

// export
module.exports = {
  handleJWTError,
  validateJWTUser,
  decryptJWT
}