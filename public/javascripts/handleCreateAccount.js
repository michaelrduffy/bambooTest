$($(document).ready(() => {
  $('#createAccountButton').on('click', () => {
    let username = $('#username').val()
    let password = $('#password').val()
    let hash = sha512(password)
    let data = { username: username, hash: hash }
    $.post('/createAccount', data, (res) => {
      if (res === 'ERR') {
        alert(res)
      } else {
        alert(res)
      }
    })
  })
}))
