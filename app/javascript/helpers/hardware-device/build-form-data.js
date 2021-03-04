const FIELDS = [
  'brand',
  'type',
  'model',
  'os_version',
  'serial_number',
  'state',
  'year_of_production',
  'year_bought',
  'used_since',
  'note',
  'category',
];

export default function buildFormData({ device, accessories }) {
  const form = new FormData();

  FIELDS.forEach((field) => {
    form.append(`hardware_device[${field}]`, device[field]);
  });

  if (device.user_id) {
    form.append('hardware_device[user_id]', device.user_id);
  }

  device.images.forEach((image) => {
    if (image.removed) {
      form.append('hardware_device[remove_images_ids][]', image.id);
    }

    if (image.added) {
      form.append('hardware_device[images][]', image.file);
    }
  });

  accessories.forEach((accessory) => {
    if (accessory.id) {
      form.append('hardware_device[accessories_attributes][][id]', accessory.id);
    }
    form.append('hardware_device[accessories_attributes][][name]', accessory.name);
    form.append('hardware_device[accessories_attributes][][quantity]', accessory.quantity);
    form.append('hardware_device[accessories_attributes][][_destroy]', accessory.removed ? 1 : 0);
  });

  return form;
}
