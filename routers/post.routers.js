var express = require('express')
const Post = require('../models/Post')
var router = express.Router()

// middleware that is specific to this router
/*
 router.use(function (req, res, next) {
  console.log(
    'Post route. Run time: ',
    new Intl.DateTimeFormat('uk-UA', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    }).format(Date.now())
  )
  next()
})
*/

/** повертає перелік статей в програмі
 * запит: метод - GET; шлях - //api/post/
 * повертає 200 [{id, title, author, date, short,comments}], де author - ім'я автора, comments - кількість коментарів
 * або 500
 */
router.get('/', async function (req, res) {
  try {
    const posts = await Post.getPosts()
    res.send(JSON.stringify(posts))
  } catch (error) {
    console.log('GET /api/post error: ', error)
    res.status(500).send(
      JSON.stringify({
        source: 'GET /api/post',
        message: error.message,
      })
    )
  }
})

/**
 * get //api/post/search/:searchStr
 */
router.get('/search/:searchStr', async function (req, res) {
  try {
    const searchStr = req.params.searchStr
    const posts = await Post.findPosts(searchStr)
    res.send(JSON.stringify(posts))
  } catch (error) {
    console.log(`GET /api/post/search/:searchStr error: `, error)
    res.status(500).send(
      JSON.stringify({
        source: `GET /api/post/:${postId}`,
        message: error.message,
      })
    )
  }
})

// get //api/post/:postId (postId = req.params.postId)
// повертає 200 {id, title, author, date, short, author_id, comments, content},
// де author - ім'я автора, comments - кількість коментарів
// або 404 Стаття з ідентифікатором ${postId} не знайдена.
// або 500
router.get('/:postId', async function (req, res) {
  try {
    const postId = req.params.postId
    const post = await Post.getPost(postId)
    if (Object.keys(post).length === 0) {
      res.status(404).send(
        JSON.stringify({
          source: `GET /api/post/${postId}`,
          message: `Стаття з ідентифікатором ${postId} не знайдена.`,
        })
      )
      return
    }
    res.send(JSON.stringify(post))
  } catch (error) {
    console.log(`GET /api/post/:${postId} error: `, error)
    res.status(500).send(
      JSON.stringify({
        source: `GET /api/post/:${postId}`,
        message: error.message,
      })
    )
  }
})

// post //api/post/
// повертає 201 (id) - ідентифікатор створеного запису
// або 403 "Операція можлива виключно для авторизованих користувачів."
// або 500
router.post('/', async function (req, res) {
  try {
    const post = req.body
    if (!req.currentUser) {
      res.status(403).send(
        JSON.stringify({
          source: 'POST /api/post',
          message: 'Операція можлива виключно для авторизованих користувачів.',
        })
      )
      return
    }
    post.author = req.currentUser
    const postId = await Post.newPost(post)
    res.status(201).send(JSON.stringify({ postId }))
  } catch (error) {
    console.log('POST /api/post error: ', error)
    res.status(500).send(
      JSON.stringify({
        source: 'POST /api/post',
        message: error.message,
      })
    )
  }
})

router.put('/:postId', async function (req, res) {
  try {
    const postId = req.params.postId
    const { title, short, content } = req.body
    if (!req.currentUser) {
      res.status(403).send(
        JSON.stringify({
          source: 'PUT /api/post',
          message: 'Операція можлива виключно для авторизованих користувачів.',
        })
      )
      return
    }
    /**
     * const post - {id, title, author, date, short, author_id, comments, content }
     */
    const post = await Post.getPost(postId)
    if (Object.keys(post).length === 0) {
      res.status(404).send(
        JSON.stringify({
          source: `PUT /api/post/${postId}`,
          message: `Стаття з ідентифікатором ${postId} не знайдена.`,
        })
      )
      return
    }
    if (req.currentUser !== post.author_id) {
      res.status(403).send(
        JSON.stringify({
          source: 'PUT /api/post',
          message: 'Змінювати можно виключно свої статті.',
        })
      )
      return
    }
    const result = await Post.updatePost(postId, { title, short, content })
    if (result > 0) {
      res.status(200).send(JSON.stringify(true))
    } else {
      throw new Error('Не вдалось змінити жодного запису.')
    }
  } catch (error) {
    console.log('PUT /api/post error: ', error)
    res.status(500).send(
      JSON.stringify({
        source: 'PUT /api/post',
        message: error.message,
      })
    )
  }
})

// delete //api/post/:postId
//  повертає 200 affectedRows
// або 403 "Операція можлива виключно для авторизованих користувачів."
// або 403 "Видаляти можна тільки власні повідомлення."
// або 404 `Стаття з ідентифікатором ${postId} не знайдена.`
// або 500
router.delete('/:postId', async function (req, res) {
  try {
    const postId = req.params.postId
    if (!req.currentUser) {
      res.status(403).send(
        JSON.stringify({
          source: `DELETE /api/post/${postId}`,
          message: 'Операція можлива виключно для авторизованих користувачів.',
        })
      )
      return
    }
    const post = await Post.getPost(postId)
    if (Object.keys(post).length === 0) {
      res.status(404).send(
        JSON.stringify({
          source: `DELETE /api/post/${postId}`,
          message: `Стаття з ідентифікатором ${postId} не знайдена.`,
        })
      )
      return
    }
    if (req.currentUser !== post.author_id) {
      res.status(403).send(
        JSON.stringify({
          source: `delete /api/post/:${postId}`,
          message: 'Видаляти можна тільки власні повідомлення.',
        })
      )
      return
    }
    result = await Post.deletePost(postId)
    res.send(JSON.stringify(result))
  } catch (error) {
    console.log(`delete /api/post/${req.params.postId} error: `, error)
    res.status(500).send(
      JSON.stringify({
        source: `delete /api/post/${req.params.postId}`,
        message: error.message,
      })
    )
  }
})

module.exports = router
