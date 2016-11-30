import fetch from 'isomorphic-fetch'

// ------------------------------------
// Constants
// ------------------------------------
export const FETCHED_DATA = 'FETCHED_DATA'
export const FETCHING_DATA = 'FETCHING_DATA'

// ------------------------------------
// Actions
// ------------------------------------
export function startFetching () {
  return {
    type: FETCHING_DATA
  }
}

export function fetchedData (data) {
  return {
    type: FETCHED_DATA,
    payload: data
  }
}

export const fetchData = () => {
  return (dispatch) => {
    dispatch(startFetching())

    return fetch('https://jsonplaceholder.typicode.com/posts/1')
      .then(response => response.json())
      .then(data => {
        return dispatch(fetchedData(data))
      })
  }
}

export const actions = {
  fetchData
}

// ------------------------------------
// Action Handlers
// ------------------------------------
const ACTION_HANDLERS = {
  [FETCHING_DATA]: (state, action) => ({ ...state, fetching: true }),
  [FETCHED_DATA]: (state, action) => ({ ...state, fetching: false, fetchedData: action.payload })
}

// ------------------------------------
// Reducer
// ------------------------------------
const initialState = {fetching: false, fetchedData: {}}
export default function asyncReducer (state = initialState, action) {
  const handler = ACTION_HANDLERS[action.type]

  return handler ? handler(state, action) : state
}
