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

  validateIsGreaterOrEqual(leftOperand, ...rightOperands) {
    this.errors[leftOperand] = [];
    
    rightOperands.forEach(rightOperand => {
      if (this.object[leftOperand] < this.object[rightOperand]) {
        this.errors[leftOperand].push(`must be greater than or equal to ${rightOperand}`);
      }
    });
  }

  get isValid() {
    return Object.keys(this.errors).length === 0;
  }
}
