export default class Validator {
  constructor(object) {
    this.object = object;
    this.errors = {};
  }

  validatePresenceOf(...names) {
    names.forEach((name) => {
      if ([undefined, null, '', false].includes(this.object[name])) {
        this.errors[name] = [I18n.t(`activerecord.errors.models.hardware.attributes.${name}.blank`)];
      }
    });
  }

  validateIsGreaterOrEqual(leftOperand, ...rightOperands) {
    rightOperands.forEach((rightOperand) => {
      if (this.object[leftOperand] < this.object[rightOperand]) {
        if (!this.errors[leftOperand]) {
          this.errors[leftOperand] = [];
        }
        this.errors[leftOperand].push(I18n.t(
          `activerecord.errors.models.hardware.attributes.${leftOperand}.greater_than_or_equal_to`,
          { date: I18n.t(`apps.hardware_devices.${rightOperand}`) },
        ));
      }
    });
  }

  get isValid() {
    return Object.keys(this.errors).length === 0;
  }
}
