export default class StringHelper {
  static isBlank(string) {
    return [null, '', undefined].includes(string);
  }
}
