const db = require('./db')
const validator = require('validator')
const config = require('config')
const dbName = config.get('db').database

const Post = {
  errors: [],

  async validate({ title, short, content }) {
    this.errors = []
    if (validator.isEmpty(title, { ignore_whitespace: true })) {
      this.errors.push({
        field: 'title',
        message: 'Заголовок статті не може бути пустим.',
      })
    }
    if (validator.isEmpty(short, { ignore_whitespace: true })) {
      this.errors.push({
        field: 'short',
        message: 'Короткий зміст не може бути пустим.',
      })
    }
    if (validator.isEmpty(content, { ignore_whitespace: true })) {
      this.errors.push({
        field: 'content',
        message: 'Стаття не може бути пустою.',
      })
    }
    return this.errors.length === 0
  },

  async getPosts() {
    try {
      const connection = await db()
      const query =
        'SELECT `post`.`id`, `post`.`title`, `profile`.`user_name` as author,' +
        ' `post`.`post_date` as date, `post`.`short_content` as short, `cmt`.`comments` FROM `' +
        dbName +
        '`.`post` ' +
        'inner join `' +
        dbName +
        '`.`profile` on `post`.`author_id` = `profile`.`uuid` ' +
        'left join (select `comment`.`post_id`,  count(*) as comments from `' +
        dbName +
        '`.`comment` group by `comment`.`post_id`) as cmt on `cmt`.post_id = `post`.`id`' +
        'order by `post`.`post_date` DESC'
      const [rows] = await connection.query(query)
      return rows
    } catch (error) {
      console.log('getPosts: ', error)
      throw error
    }
  },

  async findPosts(searchStr) {
    try {
      const connection = await db()
      const query =
        'SELECT `post`.`id`, `post`.`title`, `profile`.`user_name` as author,' +
        ' `post`.`post_date` as date, `post`.`short_content` as short, `cmt`.`comments` FROM `' +
        dbName +
        '`.`post` ' +
        'inner join `' +
        dbName +
        '`.`profile` on `post`.`author_id` = `profile`.`uuid` ' +
        'left join (select `comment`.`post_id`,  count(*) as comments from `' +
        dbName +
        '`.`comment` group by `comment`.`post_id`) as cmt on `cmt`.post_id = `post`.`id`' +
        'where (`post`.`title` like ' +
        connection.escape('%' + searchStr + '%') +
        ') OR (`post`.`short_content` like ' +
        connection.escape('%' + searchStr + '%') +
        ') OR (`post`.`post_content` like ' +
        connection.escape('%' + searchStr + '%') +
        ')'
      ;('order by `post`.`post_date` DESC')
      const [rows] = await connection.query(query)
      return rows
    } catch (error) {
      console.log('getPosts: ', error)
      throw error
    }
  },

  async getPost(postId) {
    try {
      const connection = await db()
      const query =
        'SELECT `post`.`id`, `post`.`title`, `profile`.`user_name` as author,' +
        ' `post`.`post_date` as date, `post`.`short_content` as short, BIN_TO_UUID(`post`.`author_id`) as author_id,' +
        ' `cmt`.`comments`,`post`.`post_content` as content' +
        ' FROM `' +
        dbName +
        '`.`post` ' +
        'inner join `' +
        dbName +
        '`.`profile` on `post`.`author_id` = `profile`.`uuid` ' +
        'left join (select `comment`.`post_id`,  count(*) as comments from `' +
        dbName +
        '`.`comment` group by `comment`.`post_id`) as cmt on `cmt`.post_id = `post`.`id`' +
        'where `post`.`id` = ?'
      const [rows] = await connection.query(query, [postId])
      let post = {}
      if (rows.length !== 0) {
        post = rows[0]
      }
      return post
    } catch (error) {
      console.log('getPost error: ', error)
      throw error
    }
  },

  async newPost(post) {
    try {
      const connection = await db()
      const isValid = await this.validate(post)
      if (!isValid) {
        throw new Error(JSON.stringify(this.errors))
      }
      const CURRENT_TIMESTAMP = {
        toSqlString: function () {
          return 'CURRENT_TIMESTAMP()'
        },
      }
      const sql =
        'INSERT INTO `' +
        dbName +
        '`.`post` (`title`, `author_id`, `post_date`, `short_content`, `post_content`) VALUES (?, UUID_TO_BIN(?), ?, ?, ?);'
      const result = await connection.query(sql, [
        post.title,
        post.author,
        CURRENT_TIMESTAMP,
        post.short,
        post.content,
      ])
      return result[0].insertId
    } catch (error) {
      console.log('newPost error: ', error)
      throw error
    }
  },

  async deletePost(postId) {
    try {
      const connection = await db()
      const sql = 'DELETE FROM `' + dbName + '`.`post` WHERE id = ?'
      const result = await connection.query(sql, [postId])
      return result[0].affectedRows
    } catch (error) {
      console.log('delete Post: ', error)
      throw error
    }
  },

  async updatePost(postId, { title, short, content }) {
    try {
      const connection = await db()
      const isValid = await this.validate({ title, short, content })
      if (!isValid) {
        throw new Error(JSON.stringify(this.errors))
      }
      const sql =
        'UPDATE `' +
        dbName +
        '`.`post` SET `title` = ?, `short_content` = ?, `post_content` = ?' +
        'WHERE `id` = ? '
      const result = await connection.query(sql, [
        title,
        short,
        content,
        postId,
      ])
      return result[0].affectedRows
    } catch (error) {
      console.log('updatePost error: ', error)
      throw error
    }
  },
}
module.exports = Post
