// create right error format
// of joi errors
const getFormattedError = (error) => {
  let errors = {};

  error.details.forEach(err => {
    errors = {
      ...errors,
      [err.context.key]: err.message
    }
  })

  // return error new format
  return errors;
}



// export
module.exports = {
  getFormattedError
}