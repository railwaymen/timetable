export const presence = (value) => {
  if (value === null || value === undefined || value === '') {
    return ['can\'t be blank']
  }
}

export const greaterThan = (number, value) => {
  if (value <= number) {
    return ['must be greater than ' + number]
  }
}
