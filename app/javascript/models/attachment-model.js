export default class AttachmentModel {
  constructor({
    id, added, source, file,
  }) {
    this.id = id || new Date();
    this.added = added;
    this.source = source;
    this.file = file;
    this.removed = false;
  }
}
