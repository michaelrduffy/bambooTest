$($(document).ready(() => {
  $('#signInButton').on('click', () => {
    let username = $('#username').val()
    let password = $('#password').val()
    let hash = sha512(password)
    let data = { username: username, hash: hash }
    $.post('/signIn', data, (res) => {
      location.reload()
    })
  })
}))
