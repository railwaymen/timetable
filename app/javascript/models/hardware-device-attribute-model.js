export default class HardwareDeviceAttributeModel {
  constructor({
    id, name, quantity, uniqueId,
  }) {
    this.id = id;
    this.name = name;
    this.quantity = quantity;
    this.uniqueId = uniqueId || id;
    this.removed = false;
  }
}
