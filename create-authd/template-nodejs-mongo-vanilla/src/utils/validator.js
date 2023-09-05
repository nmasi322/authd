class Validator {
  isEmail(email) {
    if (typeof email === "string") {
      let trimmed_email = email.trim();
      const re = new RegExp(
        /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
      );
      return re.test(trimmed_email);
    }
    return false;
  }

  isString(item) {
    return typeof item === "string";
  }

  isNumber(item) {
    return typeof item === "number";
  }

  isName(name) {
    return typeof name === "string" && name.length > 3;
  }
}

export default new Validator();
