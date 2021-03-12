export default class Validator {
  constructor(object) {
    this.object = object;
    this.errors = {};
  }

  validatePresenceOf(...names) {
    names.forEach((name) => {
      if ([undefined, null, '', false].includes(this.object[name])) {
        this.errors[name] = ['can\'t be blank'];
      }
    });
  }

  get isValid() {
    return Object.keys(this.errors).length === 0;
  }
}
