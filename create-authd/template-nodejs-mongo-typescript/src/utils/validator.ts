class Validator {
  isEmail(email: any) {
    if (typeof email === "string") {
      let trimmed_email = email.trim();
      const re = new RegExp(
        /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
      );
      return re.test(trimmed_email);
    }
    return false;
  }

  isString(item: any) {
    return typeof item === "string";
  }

  isNumber(item: any) {
    return typeof item === "number";
  }

  isName(name: string) {
    return typeof name === "string" && name.length > 3;
  }
}

export default new Validator();
