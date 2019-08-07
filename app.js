var createError = require('http-errors')
var express = require('express')
var path = require('path')
var cookieParser = require('cookie-parser')
var logger = require('morgan')

var session = require('express-session')
var SHA512 = require("crypto-js/sha512")

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
    res.render('index', { title: 'Express' })
  }
})

app.post('/signIn', (req, res) => {
  console.log(req)
  MongoClient.connect(mongoUrl, function (err, client) {
    if (err) {
      res.send('ERR')
    } else {
      console.log('Connected successfully to server')
      const db = client.db(dbName)
      client.close()
      req.session.signedIn = true
      res.send('signed In')
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
