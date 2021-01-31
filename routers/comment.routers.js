var express = require('express')
const Comment = require('../models/Comment')
var router = express.Router()

// middleware that is specific to this router
/*
 *  router.use(function (req, res, next) {
 *    console.log(
 *      'Comment route. Run time: ',
 *      new Intl.DateTimeFormat('uk-UA', {
 *        year: 'numeric',
 *        month: '2-digit',
 *        day: '2-digit',
 *        hour: '2-digit',
 *        minute: '2-digit',
 *        second: '2-digit',
 *      }).format(Date.now())
 *    )
 *    next()
 *  })
 */

// get /api/comment/post/:postId отримання коментарів для post з postId
// повертає [{comment.id, author_id, user_name, post_id, comment_date, content}]
// або 500
router.get('/post/:postId', async function (req, res) {
  try {
    const postId = req.params.postId
    const comments = await Comment.getCommentsByPost(postId)
    res.send(JSON.stringify(comments))
  } catch (error) {
    console.log(`get /api/comment/post/${req.params.postId} error: `, error)
    res.status(500).send(
      JSON.stringify({
        source: `get /api/comment/post/${req.params.postId}`,
        message: error.message,
      })
    )
  }
})

// get /api/comment/:commentId отримання кометнаря за його Id
// повертає 200 {id, author_id, user_name, post_id, comment_date, content}
// або 404 `Коментар з id = ${req.params.commentId} не знайдений`
// або 500
router.get('/:commentId', async function (req, res) {
  try {
    const commentId = req.params.commentId
    const comment = await Comment.getComment(commentId)
    if (Object.keys(comment).length === 0) {
      console.log(`get /api/comment/${req.params.commentId}: `, 'Не знайдено')
      res.status(404).send(
        JSON.stringify({
          source: `get /api/comment/${req.params.commentId}`,
          message: `Коментар з id = ${req.params.commentId} не знайдений`,
        })
      )
      return
    }
    res.send(JSON.stringify(comment))
  } catch (error) {
    console.log(`get /api/comment/${req.params.commentId} error: `, error)
    res.status(500).send(
      JSON.stringify({
        source: `get /api/comment/${req.params.commentId}`,
        message: error.message,
      })
    )
  }
})
// post /api/comment -- створення коментаря
// повертає
// або 403 "Операція можлива виключно для авторизованих користувачів."
// або 500
router.post('/', async function (req, res) {
  try {
    const comment_content = req.body // { post_id, content}
    if (!req.currentUser) {
      res.status(403).send(
        JSON.stringify({
          source: 'POST /api/comment',
          message: 'Операція можлива виключно для авторизованих користувачів.',
        })
      )
      return
    }
    comment_content.author = req.currentUser
    const commentId = await Comment.newComment(comment_content)
    res.send(JSON.stringify(commentId))
  } catch (error) {
    console.log('POST /api/comment error: ', error)
    res.status(500).send(
      JSON.stringify({
        source: 'POST /api/comment',
        message: error.message,
      })
    )
  }
})

// put /api/comment/:commentId оновлення Id
router.put('/:commentId', async function (req, res) {
  try {
    const commentId = req.params.commentId
    const newData = req.body // { id, content }
    if (!req.currentUser) {
      res.status(403).send(
        JSON.stringify({
          source: `put /api/comment/${req.params.commentId}`,
          message: 'Операція можлива виключно для авторизованих користувачів.',
        })
      )
      return
    }

    const comment = await Comment.getComment(commentId)
    if (Object.keys(comment).length === 0) {
      console.log(`put /api/comment/${req.params.commentId}: `, 'Не знайдено')
      res.status(404).send(
        JSON.stringify({
          source: `put /api/comment/${req.params.commentId}`,
          message: `Коментар з id = ${req.params.commentId} не знайдений`,
        })
      )
      return
    }
    if (req.currentUser !== comment.author_id) {
      res.status(403).send(
        JSON.stringify({
          source: `delete /api/comment/:${req.params.commentId}`,
          message: 'Змінювати можна тільки власні коментарі.',
        })
      )
      return
    }
    comment.content = newData.content
    const result = await Comment.updateComment(comment)
    if (result > 0) {
      res.send(JSON.stringify(true))
    } else {
      res.send(JSON.stringify(false))
    }
  } catch (error) {
    console.log(`put /api/comment/${req.params.commentId} error: `, error)
    res.status(500).send(
      JSON.stringify({
        source: `put /api/comment/${req.params.commentId}`,
        message: error.message,
      })
    )
  }
})
// delete //api/comment/:commentId
//  повертає 200 affectedRows
// або 403 "Операція можлива виключно для авторизованих користувачів."
// або 403 "Видаляти можна тільки власні повідомлення."
// або 404 `коментар з ідентифікатором ${commentId} не знайдений.`
// або 500
router.delete('/:commentId', async function (req, res) {
  try {
    const commentId = req.params.commentId
    if (!req.currentUser) {
      res.status(403).send(
        JSON.stringify({
          source: `DELETE /api/comment/${req.params.commentId}`,
          message: 'Операція можлива виключно для авторизованих користувачів.',
        })
      )
      return
    }
    const comment = await Comment.getComment(commentId)
    if (Object.keys(comment).length === 0) {
      res.status(404).send(
        JSON.stringify({
          source: `DELETE /api/comment/${req.params.commentId}`,
          message: `Коментар з ідентифікатором ${req.params.commentId} не знайдений.`,
        })
      )
      return
    }
    if (req.currentUser !== comment.author_id) {
      res.status(403).send(
        JSON.stringify({
          source: `delete /api/comment/:${req.params.commentId}`,
          message: 'Видаляти можна тільки власні коментарі.',
        })
      )
      return
    }
    result = await Comment.deleteComment(commentId)
    res.send(JSON.stringify(result))
  } catch (error) {
    console.log(`delete /api/comment/${req.params.commentId} error: `, error)
    res.status(500).send(
      JSON.stringify({
        source: `DELETE /api/comment/${req.params.commentId}`,
        message: error.message,
      })
    )
  }
})

module.exports = router
