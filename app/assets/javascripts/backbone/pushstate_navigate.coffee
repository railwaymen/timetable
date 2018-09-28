$(document).delegate("a[data-navigate]", "click", (evt) ->
  # Get the anchor href and protcol
  href = $(this).attr("href")
  protocol =  "#{this.protocol}//"

  # Ensure the protocol is not part of URL, meaning its relative.
  # Stop the event bubbling to ensure the link will not cause a page refresh.
  if href.slice(protocol.length) != protocol
    evt.preventDefault()

    # Note by using Backbone.history.navigate, router events will not be
    # triggered.  If this is a problem, change this to navigate on your
    # router.
    Backbone.history.navigate(href, true)
 )