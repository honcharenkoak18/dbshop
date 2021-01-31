const db = require('./db')
const validator = require('validator')
const config = require('config')
const dbName = config.get('db').database
const Comment = {
  errors: [],

  async getCommentsByPost(postId) {
    try {
      const connection = await db()
      const query =
        'select `comment`.`id`, BIN_TO_UUID(`comment`.`author_id`) as  author_id, `profile`.`user_name`,' +
        '  `comment`.`post_id`, `comment`.`comment_date`, `comment`.`content` ' +
        'from `' +
        dbName +
        '`.`comment` ' +
        'inner join `' +
        dbName +
        '`.`profile` on `comment`.`author_id` = `profile`.`uuid` ' +
        'where  `comment`.`post_id` = ? ' +
        'order by `comment`.`comment_date` DESC'
      const [rows] = await connection.query(query, [postId])
      return rows
    } catch (error) {
      console.log('getCommentsByPost: ', error)
      throw error
    }
  },

  async getComment(commentId) {
    try {
      const connection = await db()
      const sql =
        'select `comment`.`id`, BIN_TO_UUID(`comment`.`author_id`) as  author_id, `profile`.`user_name`,' +
        '  `comment`.`post_id`, `comment`.`comment_date`, `comment`.`content` ' +
        'from `' +
        dbName +
        '`.`comment` ' +
        'inner join `' +
        dbName +
        '`.`profile` on `comment`.`author_id` = `profile`.`uuid` ' +
        'where  `comment`.`id` = ? '
      const [rows] = await connection.query(sql, [commentId])
      if (rows.length !== 0) {
        return rows[0]
      } else {
        return {}
      }
    } catch (error) {
      console.log('getComment: ', error)
      throw error
    }
  },

  async newComment(comment) {
    try {
      const connection = await db()
      // const isValid = await this.validate(comment)
      // if (!isValid) {
      //   throw new Error(JSON.stringify(this.errors))
      // }
      const CURRENT_TIMESTAMP = {
        toSqlString: function () {
          return 'CURRENT_TIMESTAMP()'
        },
      }
      let sql =
        'INSERT INTO `' +
        dbName +
        '`.`comment` (`author_id`, `post_id`, `comment_date`, `content`) VALUES (UUID_TO_BIN(?), ?, ?, ?);'
      const result = await connection.query(sql, [
        comment.author,
        comment.post_id,
        CURRENT_TIMESTAMP,
        comment.content,
      ])
      const id = result[0].insertId
      return id
    } catch (error) {
      console.log('newComment: ', error)
      throw error
    }
  },

  async deleteComment(commentId) {
    try {
      const connection = await db()
      const sql = 'DELETE FROM `' + dbName + '`.`comment` WHERE id = ?'
      const result = await connection.query(sql, [commentId])
      return result[0].affectedRows
    } catch (error) {
      console.log('delete comment error: ', error)
      throw error
    }
  },

  /**
   *
   * @param {object} comment
   */
  async updateComment({ id, content }) {
    try {
      const connection = await db()
      const sql =
        'update `' + dbName + '`.`comment` set content = ? where id = ?'
      const result = await connection.query(sql, [content, id])
      return result[0].affectedRows
    } catch (error) {
      console.log('update comment error: ', error)
      throw error
    }
  },
}
module.exports = Comment
