var createError = require('http-errors')
var express = require('express')
var path = require('path')
var cookieParser = require('cookie-parser')
var logger = require('morgan')
var randomBytes = require('random-bytes')
var session = require('express-session')
var crypto = require('crypto-js')

var app = express()
var helmet = require('helmet')
app.use(helmet())

var MongoClient = require('mongodb').MongoClient
var mongoUrl = 'mongodb://localhost:27017'
var dbName = 'bambooDB'

// view engine setup
app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'pug')

// Change to secure: true when using https
app.use(session({
  secret: 'bambooSecret',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false }
}))

app.use(logger('dev'))
app.use(express.json())
app.use(express.urlencoded({ extended: false }))
app.use(cookieParser())
app.use(express.static(path.join(__dirname, 'public')))

/* GET home page. */
app.get('/', (req, res, next) => {
  if (!req.session.signedIn) {
    res.render('signIn', { title: 'Not Signed In' })
  } else {
    let id = req.session.userid
    let username = req.session.username
    MongoClient.connect(mongoUrl, (err, client) => {
      if (err) {
        throw err
      } else {
        const db = client.db(dbName)
        db.collection('users').find({ username: username }).toArray((err, result) => {
          if (err) {
            throw err
          } else {
            let bambeuros = result[0].bambeuros
            req.session.bambeuros = bambeuros
            res.render('index', { title: 'Express', username: username, bambeuros: bambeuros })
          }
        })
      }
    })
  }
})

app.get('/signOut', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      throw err
    }
  })
  res.send('signed out')
})

app.post('/send', (req, res) => {
  let id = req.session.userid
  let recipient = req.body.recipient
  let amount = parseInt(req.body.amount)
  console.log(id)

  MongoClient.connect(mongoUrl, (err, client) => {
    if (err) {
      res.send('ERR')
    } else {
      const db = client.db(dbName)
      db.collection('users').find({ username: recipient }).toArray((err, result) => {
        if (err) {
          throw err
        } else {
          if (result.length > 0) {
            let data = result[0]
            console.log(data['_id'])
            db.collection('users').updateOne({ _id: data['_id'] }, { $set: { bambeuros: (parseInt(data.bambeuros) + amount) } }, (err, response) => {
              if (err) throw err
            })
            let newAmount = (parseInt(req.session.bambeuros) - amount)
            console.log(newAmount)
            db.collection('users').updateOne({ username: req.session.username }, { $set: { bambeuros: newAmount } }, (err, response) => {
              if (err) throw err
              //console.log(response)
            })
          }
        }
      })
    }
  })
})

app.post('/createAccount', (req, res) => {
  let username = req.body.username
  let hash = req.body.hash
  let salt = randomBytes.sync(32).toString()
  hash = crypto.SHA512(salt + hash).toString()
  console.log(hash)
  MongoClient.connect(mongoUrl, (err, client) => {
    if (err) {
      throw err
    } else {
      const db = client.db(dbName)
      db.collection('users').insertOne({ username: username, salt: salt, hash: hash, bambeuros: 100 }, (err, response) => {
        if (err) {
          throw err
        } else {
          console.log(response)
          client.close()
          res.send('Account Created')
        }
      })
    }
  })
})

app.post('/signIn', (req, res) => {
  console.log(req)
  let username = req.body.username
  let hash = req.body.hash
  MongoClient.connect(mongoUrl, (err, client) => {
    if (err) {
      res.send('ERR')
    } else {
      const db = client.db(dbName)
      db.collection('users').find({ username: username }).toArray((err, result) => {
        if (err) {
          throw err
        } else {
          if (result.length > 0) {
            let data = result[0]
            let salt = data.salt
            console.log(salt)
            if (crypto.SHA512(salt + hash).toString() === data.hash) {
              console.log('SIGNED IN')
              req.session.signedIn = true
              req.session.userid = data['_id']
              req.session.username = data.username
              res.send('signed In')
            } else {
              res.send('ERR')
            }
          }
        }
      })
      client.close()
      if (req.session.signedIn) {
        res.send('signed In')
      }
    }
  })
})

// catch 404 and forward to error handler
app.use((req, res, next) => {
  next(createError(404))
})

// error handler
app.use((err, req, res, next) => {
  // set locals, only providing error in development
  res.locals.message = err.message
  res.locals.error = req.app.get('env') === 'development' ? err : {}

  // render the error page
  res.status(err.status || 500)
  res.render('error')
})

module.exports = app
