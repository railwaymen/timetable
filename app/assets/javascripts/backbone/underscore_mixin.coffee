_.mixin
  sum : (array) ->
    _.reduce array, (n, m) ->
      n + m
    , 0