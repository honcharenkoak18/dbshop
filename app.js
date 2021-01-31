const express = require('express')
const app = express()
const config = require('config')
const authMiddleware = require('./middleware/auth.middleware')
const logMiddleware = require('./middleware/log.middleware')

app.use(express.json({}))

app.use(authMiddleware)
app.use(logMiddleware)

app.use('/api/auth', require('./routers/auth.routers'))
app.use('/api/post', require('./routers/post.routers'))
app.use('/api/comment', require('./routers/comment.routers'))

app.use(express.static(__dirname))

const PORT = config.get('port')
app.listen(PORT, () => {
  console.log(`Server started at port ${PORT}...`)
})
