export default function isDateValidObject(date) {
    return date instanceof Date && !isNaN(date.valueOf());
}