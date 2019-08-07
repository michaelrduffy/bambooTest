$($(document).ready(() => {
  $('#sendButton').on('click', () => {
    alert('sending')
    let recipient = $('#sendUsername').val()
    let amount = $('#sendAmount').val()
    let data = { recipient: recipient, amount: amount }
    $.post('/send', data, (res) => {
      if (res === 'ERR') {
        alert(res)
      } else {
        alert(res)
      }
    })
  })

  $('#signOut').on('click', () => {
    $.get('/signOut', (res) => {
      location.reload()
    })
  })
}))
