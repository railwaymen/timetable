String.leftPad = (s) ->
  val = parseInt(s)
  zero = ''

  zero = '0' if(val < 10)

  zero + val

window.timeUtils =
  DEFAULT_TIME_FORMAT: 'HH:mm'

  softToTimeOfDay: (value) ->
    if !value
      return

    value = $.trim(value)

    if value.indexOf(':') == -1
      value = if /\d{4}/.test(value) then value.slice(0, 2) + ':' + value.slice(2) else if /\d{3}/.test(value) then value.charAt(0) + ':' + value.slice(1) else value + ':00'

    if !value
      return

    moment(value, @DEFAULT_TIME_FORMAT).toDate()

  mergeTimeAndDate: (time, date) ->
    if !(date instanceof moment)
      date = moment(date)

    moment(time).year(date.year()).dayOfYear date.dayOfYear()

  changeDate: (time, date) ->
    if !(date instanceof moment)
      date = moment(date, 'DD/MM/YYYY')

    moment(time, "HH:mm").set({'year': date.year(), 'month': date.month(), 'date': date.date()})

  timeOfDayFormat: ->
    moment().format timeUtils.DEFAULT_TIME_FORMAT

  secondsToHhmmss: (s, withoutSeconds) ->
    aTime = ~~s;

    hours = Math.floor(aTime / 3600)
    minutes = Math.floor((aTime % 3600) / 60)
    seconds = Math.floor(aTime % 60)

    if (skip_seconds)
      if (!hours)
        return minutes + ' min'

      return [hours, 'h ', String.leftPad(minutes), ' min'].join('')


    if (!hours)
      if (!minutes)
        return seconds + ' sec'

      seconds = String.leftPad(seconds)
      minutes = String.leftPad(minutes)
      return minutes + ':' + seconds + ' min'

    minutes = String.leftPad(minutes)
    seconds = String.leftPad(seconds)
    hours = String.leftPad(hours)

    "#{hours}:#{minutes}:#{seconds}"

  secondsToSmallHhmm: (sum) ->
    Math.floor(sum / 3600) + ':' + String.leftPad('' + Math.floor(sum % 3600 / 60))
