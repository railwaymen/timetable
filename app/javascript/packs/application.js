/* eslint no-console:0 */
// This file is automatically compiled by Webpack, along with any other files
// present in this directory. You're encouraged to place your actual application logic in
// a relevant structure within app/javascript and only use these pack files to reference
// that code so it'll be compiled.
//
// To reference this file, add <%= javascript_pack_tag 'application' %> to the appropriate
// layout file, like app/views/layouts/application.html.erb

// Support component names relative to this directory:

import moment from 'moment';

const componentRequireContext = require.context('components', true);
const ReactRailsUJS = require('react_ujs');

ReactRailsUJS.useContext(componentRequireContext);

// TODO: Refactor
// Used to show modal on work time history
$(document).on('click', '.action-item.history', () => {
  $('#modal-info').addClass('active visible');
});

// Used to hide modal on work time history when click cancel or outside modal
$(document).on('click', '#modal-info .button.cancel, .modal-backdrop', () => {
  $('#modal-info').removeClass('active visible');
});

// Used to hide dropdown for month/project selection on timesheet when clicking outside of it
$(document).on('click', (e) => {
  const klass = $(e.target).attr('class') || '';
  const parent = $(e.target).parent().attr('class') || '';
  if (!(klass.match('dropdown') || klass.match('menu') || parent.match('dropdown'))) {
    $('.dropdown .menu').hide();
  }
});

// Used to open dropdown for month/project selection on timesheet
$(document).on('click', '.dropdown', function openDropDown() {
  $(this).find('.menu').toggle();
});

// Used to open modal for generating accounting periods
$(document).on('click', '#generate, .modal-backdrop', () => {
  $('#modal').add('.unique-modal-class:visible').toggle();
});

// Used to add higlight when editing work time on timeshet
$(document).on('edit-entry', (e) => {
  const { detail } = e;
  if (detail.success) {
    const element = $(`#work-time-${detail.id}`);
    element.addClass('hotline-bling');
    setTimeout(() => {
      element.removeClass('hotline-bling');
    }, 2500);
  } else {
    const element = $(`#work-time-${detail.id}`).parent().parent().find('.error-tooltip');
    element.css({
      display: 'block',
    });
    setTimeout(() => {
      element.css({
        display: '',
      });
    }, 2300);
  }
});

// Adds new class for new work time for animation effect
$(document).on('push-entry', (e) => {
  $(`#work-time-${e.detail.id}`).addClass('new');
  setTimeout(() => {
    $(`#work-time-${e.detail.id}`).removeClass('new');
  }, 600);
});

moment.dateFormat = 'YYYY-MM-DD';
moment.timeFormat = 'YYYY-MM-DD HH:mm';

moment.fn.formatDate = function formatDate() {
  return this.format(moment.dateFormat);
};

moment.fn.formatTime = function formatTime() {
  return this.format(moment.timeFormat);
};
