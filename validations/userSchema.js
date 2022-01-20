const joi = require('joi');

// register form validation schema
const registerSchema = joi.object({
  username: joi.string()
    .trim()
    .required()
    .messages({
      'string.empty': 'validation.username_empty',
      'any.required': 'validation.username_empty'
    }),
  password: joi.string()
    .trim()
    .required()
    .messages({
      'string.empty': 'validation.password_empty',
      'any.required': 'validation.password_empty'
    }),
  password2: joi.string()
    .trim()
    .required()
    .valid(joi.ref('password'))
    .messages({
      'string.empty': 'validation.password2_empty',
      'any.required': 'validation.password2_empty',
      'any.only': 'validation.password2_not_same'
    }),
  email: joi.string()
    .trim()
    .email()
    .messages({
      'string.email': 'validation.invalid_email',
      'string.empty': 'validation.invalid_email'
    })
});


// login form validation schema
const loginSchema = joi.object({
  password: joi.string()
    .trim()
    .required()
    .messages({
      'string.empty': 'validation.password_empty',
      'any.required': 'validation.password_empty'
    }),
  email: joi.string()
    .trim()
    .email()
    .messages({
      'string.email': 'validation.invalid_email',
      'string.empty': 'validation.invalid_email'
    })
});


// change password form validation schema
const changePasswordSchema = joi.object({
  username: joi.string()
    .trim()
    .required()
    .messages({
      'string.empty': 'validation.username_empty',
      'any.required': 'validation.username_empty'
    }),
  newPassword: joi.string()
    .trim()
    .required()
    .messages({
      'string.empty': 'validation.password_empty',
      'any.required': 'validation.password_empty'
    }),
  newPassword2: joi.string()
    .trim()
    .required()
    .valid(joi.ref('newPassword'))
    .messages({
      'string.empty': 'validation.password2_empty',
      'any.required': 'validation.password2_empty',
      'any.only': 'validation.password2_not_same'
    }),
  oldPassword: joi.string()
    .trim()
    .required()
    .messages({
      'string.empty': 'validation.password_empty',
      'any.required': 'validation.password_empty'
    })
});



// export
module.exports = {
  registerSchema,
  loginSchema,
  changePasswordSchema
}