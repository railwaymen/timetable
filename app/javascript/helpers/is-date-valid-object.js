export default function isDateValidObject(date) {
  return date instanceof Date && !Number.isNaN(date.valueOf());
}
