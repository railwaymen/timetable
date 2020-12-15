import ColorHash from 'color-hash';

const colorHash = new ColorHash();

export default class ColorizeHelper {
  static colorizeArray(collection, { resolveField = 'name', to = 'color', includeHash = false } = {}) {
    return collection.map((element) => ({
      ...element,
      [to]: ColorizeHelper.colorizeElement(element[resolveField], { includeHash }),
    }));
  }

  static colorizeElement(element, { includeHash = false }) {
    const foundColor = colorHash.hex(element);

    return includeHash ? foundColor : foundColor.replace('#', '');
  }

  static isColorDark = (hex) => {
    const { r, g, b } = ColorizeHelper.hexToRgb(hex);

    return r + g + b / 3 >= 128;
  }

  static colorText = (hex) => (ColorizeHelper.isColorDark(hex) ? '#fff' : '#000');

  static hexToRgb = (hex) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);

    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16),
    } : {
      r: 0,
      g: 0,
      b: 0,
    };
  }
}
