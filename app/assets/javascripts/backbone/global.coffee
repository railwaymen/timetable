$ ->
  $('.auto-focus').focus()
  $('body').on 'click', '.auto-focus', ->
    if !$(@).hasClass('description')
      $(@).select()
  moment.locale(App.currentUser.get('lang'))

window.eat = [
  'https://media2.giphy.com/media/RXJthjm1pofte/200.gif'
  'https://media3.giphy.com/media/JDYaNuLNsFQ0o/200.gif'
  'https://media3.giphy.com/media/WynKmCK0LwykM/200.gif'
  'https://media2.giphy.com/media/NAjPVFHtXyc6s/200.gif'
  'https://media2.giphy.com/media/rkIBOHQ35Zb9u/200.gif'
  'https://media4.giphy.com/media/14uXQbPS73Y3qU/200.gif'
]
