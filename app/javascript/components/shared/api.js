export const makePutRequest = (data) => {
  return fetch(data.url, {
    body: JSON.stringify(data.body),
    method: 'PUT',
    headers: {
      'X-CSRF-Token': csrfToken(),
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    },
    'credentials': 'same-origin'
  }).then((response) => {
      if (response.statusText === 'No Content') {
        return { data: {}, status: response.status }
      } else {
        return response.json().then(data => {
            if (response.status >= 400 && response.status < 500) {
              return Promise.reject(data);
            } else {
              return {
                data: data
              }
            }
          })
      }
    }
  )
}

export const makePostRequest = (data) => {
  return fetch(data.url, {
    body: JSON.stringify(data.body),
    method: 'POST',
    headers: {
      'X-CSRF-Token': csrfToken(),
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    },
    'credentials': 'same-origin'
  }).then((response) => (
      response.json().then(data => {
          if (response.status >= 400 && response.status < 500) {
            return Promise.reject(data);
          } else {
            return {
              data: data
            }
          }
        })
    )
  )
}

export const makeGetRequest = (data) => {
  return fetch(data.url, {
    headers: {
      'X-CSRF-Token': csrfToken(),
      'Accept': 'application/json',
      'Content-Type': 'application/json',
    },
    'credentials': 'same-origin'
  }).then((response) =>
    response.json().then(data => ({
      data: data,
      status: response.status
    }))
  ).catch(() => {
    alert('There was an error trying to get data')
  })
}

export const makeDeleteRequest = (data) => {
  return fetch(data.url, {
    method: 'DELETE',
    headers: {
      'X-CSRF-Token': csrfToken(),
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    },
    'credentials': 'same-origin'
  })
}

const csrfToken = () => {
  let csrf = document.getElementsByName('csrf-token')[0]

  if (csrf) {
    return csrf.content;
  } else {
    return ''
  }
}
