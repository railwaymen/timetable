import AttachmentModel from './attachment-model';

export default class HardwareDeviceModel {
  constructor({
    id,
    brand = '',
    type = '',
    model = '',
    os_version = '',
    cpu = '',
    ram = '',
    storage = '',
    serial_number = '',
    state = '',
    images = [],
    user_id = null,
    year_of_production = '',
    year_bought = '',
    used_since = '',
    category,
    note = '',
    archived = false,
  }) {
    this.id = id;
    this.brand = brand;
    this.type = type;
    this.model = model;
    this.user_id = user_id;
    this.serial_number = serial_number;
    this.state = state;
    this.images = images.map((image) => new AttachmentModel(image));
    this.year_of_production = year_of_production;
    this.year_bought = year_bought;
    this.category = category || 'other';
    this.used_since = used_since;
    this.note = note;
    this.name = `${brand} - ${model}`;
    this.archived = archived;

    this.os_version = os_version;
    this.cpu = cpu;
    this.ram = ram;
    this.storage = storage;
  }
}
