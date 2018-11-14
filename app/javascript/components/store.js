import { createStore } from 'redux';
import { connect } from 'react-redux';

export const store = createStore(AppReducer, 'READ', window.currentUser)

function AppReducer (state = {}, action) {
  return Object.assign({}, state, {
    currentUser: action.user
  })
}
