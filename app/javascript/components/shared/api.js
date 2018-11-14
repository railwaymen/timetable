export const makePutRequest = (data) => {
  return fetch(data.url, {
    body: JSON.stringify(data.body),
    method: 'PUT',
    headers: {
      'X-CSRF-Token': csrfToken(),
      'Accept': 'application/json',
      'Content-Type': 'application/json',
    }
  }).then((response) => {
      if (response.statusText === 'No Content') {
        return { data: {}, status: response.status }
      } else {
        return response.json().then(data => ({
          data: data,
          status: response.status
        }))
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
      'Content-Type': 'application/json',
    }
  }).then((response) =>
    response.json().then(data => ({
      data: data,
      status: response.status
    }))
  )
}

export const makeGetRequest = (data) => {
  return fetch(data.url, {
    headers: {
      'X-CSRF-Token': csrfToken(),
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    }
  }).then((response) =>
    response.json().then(data => ({
      data: data,
      status: response.status
    }))
  )
}

export const makeDeleteRequest = (data) => {
  return fetch(data.url, {
    method: 'DELETE',
    headers: {
      'X-CSRF-Token': csrfToken(),
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    }
  })
}

const csrfToken = () => {
  return document.getElementsByName('csrf-token')[0].content
}
