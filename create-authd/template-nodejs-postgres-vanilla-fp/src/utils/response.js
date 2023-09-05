function apiResponse(message, data = null, success = true) {
  return { message, data, success };
}

module.exports = apiResponse;
