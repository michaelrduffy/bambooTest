$($(document).ready(() => {
  $('#signInButton').on('click', () => {
    let username = $('#username').val()
    let password = $('#password').val()
    let data = { username: username, password: password }
    $.post('/signIn', data, (res) => {
      alert(res)
    })
  })
}))
