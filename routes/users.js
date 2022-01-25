// include library
const router = require('express').Router();
const moment = require('moment');
const fs = require('fs');
const {
  registerSchema,
  loginSchema,
  changePasswordSchema
} = require('./../validations/userSchema');

const { getFormattedError } = require('./../helpers/validation');

const {
  getHashedPassword,
  isPasswordMatch,
  getJWTToken
} = require('./../helpers/auth');

const User = require('./../models/user');

const storage = require('./storage');

// middleware setup

// default route
// Access: public
// url: http://localhost:500/api/v1/users/
// method: GET
router.get(
  '/',
  (req, res) => {
    return res.status(200).json(
      {
        "status": true,
        "message": "User default route."
      }
    );
  }
);


// user register route
// Access: public
// url: http://localhost:500/api/v1/users/register
// method: POST
router.post(
  '/register',
  (req, res) => {

    // validate form data using Joi
    const { error, value } = registerSchema.validate(req.body);

    // if validation error occur
    if (error) {
      return res.status(400).json({
        "status": false,
        "error": getFormattedError(error),
        "message": "Form validation error..."
      });
    }

    // check email already exists or not
    User.findOne({ email: req.body.email }).then(user => {

      // check user
      if (user) {

        return res.status(409).json({
          "status": false,
          error: {
            "email": "validation.email_exists"
          },
          "message": "User email already exists"
        });

      } else {

        // create user object from user model
        const newUser = new User({
          email: req.body.email,
          username: req.body.username,
          password: getHashedPassword(req.body.password)
        });

        // insert new user
        newUser.save().then(result => {

          return res.status(200).json({
            "status": true,
            "user": result
          });

        }).catch(error => {

          return res.status(502).json({
            "status": false,
            "error": {
              "db_error": "validation.db_error"
            }
          });

        });
      }
    }).catch(error => {
      return res.status(502).json({
        "status": false,
        "error": {
          "db_error": "validation.db_error"
        }
      });
    });

  }
);

// user profile pic upload route
// Access: private
// url: http://localhost:500/api/v1/users/uploadProfilePic
// method: POST
router.post(
  '/uploadProfilePic',
  (req, res) => {
    let upload = storage.getProfilePicUpload();

    upload(req, res, (error) => {

      // If profile pic upload has errors
      if (error) {
        return res.status(400).json({
          "status": false,
          "error": {
            "profile_pic": "validation.profile_pic_error"
          },
          "message": "File upload fail..."
        });
      }

      // if profile pic not uploaded
      if (!req.file) {
        return res.status(400).json({
          "status": false,
          "error": {
            "profile_pic": "validation.profile_pic_empty"
          },
          "message": "Please upload profile pic..."
        });
      }

      let temp = {
        profile_pic: req.file.filename,
        updatedAt: moment().format("DD/MM/YYYY") + ";" + moment().format("hh:mm:ss")
      };

      // store new profile pic name to user document
      User.findOneAndUpdate({ _id: req.user.id }, { $set: temp })
        .then(user => {

          if (user.profile_pic != 'empty-avatar.jpg') {
            // remove old image
            fs.unlinkSync("./public/profile_pic/" + user.profile_pic);
          }

          return res.status(200).json({
            "status": true,
            "message": "File upload success",
            "user": {
              "username": user.username,
              "email": user.email,
              "id": user._id,
              "profile_pic": req.file.filename
            }
          });

        })
        .catch(error => {
          return res.status(502).json({
            "status": false,
            "error": {
              "db_error": "validation.db_error"
            },
            "message": "Database error..."
          });
        });
    });
  }
);


// user login route
// Access: public
// url: http://localhost:500/api/v1/users/login
// method: POST
router.post(
  '/login',
  (req, res) => {
    // validate login form data
    const { error, value } = loginSchema.validate(req.body);

    // if login form data validation error
    if (error) {
      return res.status(400).json({
        "status": false,
        "error": getFormattedError(error),
        "message": "Form validation error..."
      });
    }

    User.findOne({ email: req.body.email })
      .then((user) => {

        // if user dont exist
        if (!user) {
          return res.status(404).json({
            "status": false,
            "error": {
              "email": "validation.email_not_exists"
            },
            "message": "User don't exists"
          });
        } else {

          // match user password
          let isMatch = isPasswordMatch(req.body.password, user.password);

          // check is not password match
          if (!isMatch) {
            return res.status(400).json({
              "status": false,
              "error": {
                "password": "validation.password_not_match"
              },
              "message": "Password don't match..."
            });
          }

          // JSON Web Token Generate
          const payload = {
            id: user._id,
            email: user.email
          };

          // create JSON web Token
          const token = getJWTToken(payload);

          // if login success
          return res.status(200).json({
            "status": true,
            "message": "User login success",
            "token": token,
            "user": {
              "email": user.email,
              "username": user.username,
              "profile_pic": user.profile_pic,
              "id": user._id
            }
          });
        }

      }).catch((error) => {
        return res.status(502).json({
          "status": false,
          "error": {
            "db_error": "validation.db_error"
          },
          "message": "Database error..."
        });
      });
  }
);



// user change password route
// Access: private
// url: http://localhost:500/api/v1/users/change_password
// method: PUT
router.put(
  '/change_password',
  (req, res) => {
    // validate form data
    const { error, value } = changePasswordSchema.validate(req.body);

    // check form validation error
    if (error) {
      return res.status(400).json({
        "status": false,
        "error": getFormattedError(error),
        "message": "Form validation error..."
      });
    }

    // check email already exists or not
    User.findOne({ _id: req.user.id }).then(user => {

      // check old password match with password in database
      const isMatch = isPasswordMatch(req.body.oldPassword, user.password);

      if (!isMatch) {
        return res.status(400).json({
          "status": false,
          error: {
            "oldPassword": "validation.oldPassword_not_match"
          },
          "message": "Old password not match in database."
        });
      }

      // update new password
      const newData = {
        username: req.body.username,
        password: getHashedPassword(req.body.newPassword),
        updatedAt: moment().format("DD/MM/YYYY") + ";" + moment().format("hh:mm:ss")
      }

      User.findOneAndUpdate({ _id: req.user.id }, { $set: newData }, { new: true }).then(user => {
        return res.status(200).json({
          "status": true,
          "user": {
            "username": user.username,
            "email": user.email,
            "profile_pic": user.profile_pic,
            "id": user._id
          }
        });
      }).catch(error => {
        return res.status(502).json({
          "status": false,
          "error": {
            "db_error": "validation.db_error"
          }
        });
      })

    }).catch(error => {
      return res.status(502).json({
        "status": false,
        "error": {
          "db_error": "validation.db_error"
        }
      });
    });

  }
);


module.exports = router;