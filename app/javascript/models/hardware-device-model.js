import moment from 'moment';
import AttachmentModel from './attachment-model';

function isPresent(value) {
  return ![null, undefined, ''].includes(value);
}

function resolveUsedSince(used_since, user_id) {
  if (!isPresent(used_since) && (isPresent(user_id) && user_id !== 'unassigned')) {
    return moment().format('YYYY-MM-DD');
  }

  return used_since;
}

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
    device_type = '',
    price = 0,
    archived = false,
    invoice = '',
  }) {
    this.id = id;
    this.brand = brand;
    this.type = type;
    this.model = model;
    this.user_id = user_id;
    this.serial_number = serial_number;
    this.state = state || 'good';
    this.images = images.map((image) => new AttachmentModel(image));
    this.year_of_production = year_of_production;
    this.year_bought = year_bought;
    this.category = category || 'other';
    this.used_since = resolveUsedSince(used_since, user_id);
    this.note = note;
    this.name = `${brand} ${model && `- ${model}`}`;
    this.archived = archived;
    this.device_type = device_type;
    this.price = price;
    this.invoice = invoice;

    this.os_version = os_version;
    this.cpu = cpu;
    this.ram = ram;
    this.storage = storage;
  }
}
