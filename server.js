const express = require('express')
const expressLayouts = require('express-ejs-layouts')
const colors = require('colors')
const connectDB = require('./config/db')
const dotenv = require('dotenv')
 
const indexRouter = require('./routes/index')

dotenv.config()

const app = express()

connectDB()

const PORT = 3000

app.set('view engine', 'ejs')
app.set('views', __dirname + '/views')
app.set('layout', 'layouts/layout')
app.use(expressLayouts)
app.use(express.static('public'))

app.use('/', indexRouter)

app.listen(process.env.PORT || 3000)

app.listen(console.log(`Server running on port ${PORT}`.yellow.bold))