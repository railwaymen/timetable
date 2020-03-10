export const showLoader = () => {
  $('#RBS-Scheduler-root').children('tbody').addClass('faded')
  $('#RBS-Scheduler-root').prepend("<div class='waiting'></div>")
};

export const hideLoader = () => {
  $('.waiting').remove();
  $('#RBS-Scheduler-root').children('tbody').removeClass('faded');
};