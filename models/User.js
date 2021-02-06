const fs = require('fs/promises')
const path = require('path')
const sharp = require('sharp')
const db = require('./db')
const bcrypt = require('bcrypt')
const { v4: uuidv4 } = require('uuid')
const validator = require('validator')
const config = require('config')
const dbName = config.get('db').database
const User = {
  errors: [],

  async validate({ uuid, email, user_name, password, role }, isNew) {
    this.errors = []
    if (!validator.isUUID(uuid, 4)) {
      this.errors.push({ field: 'uuid', message: 'Помилка UUID.' })
    }
    if (validator.isEmpty(email, { ignore_whitespace: true })) {
      this.errors.push({
        field: 'email',
        message: 'Адреса email не може бути пустою.',
      })
    } else {
      if (!validator.isEmail(email)) {
        this.errors.push({ field: 'email', message: 'Некоректний email.' })
      } else {
        try {
          const user = await this.getUserByEmail(email)
          const checkExist = Object.keys(user).length !== 0
          if (isNew && checkExist) {
            this.errors.push({
              field: 'email',
              message: 'Такий email вже використовується.',
            })
          }
          if (!isNew && uuid !== user.uuid) {
            this.errors.push({
              field: 'email',
              message: 'Такий email вже використовується.',
            })
          }
        } catch (error) {
          this.errors.push({ field: 'all', message: error.message })
        }
      }
    }
    if (validator.isEmpty(user_name, { ignore_whitespace: true })) {
      this.errors.push({
        field: 'user_name',
        message: 'Ім`я користувача не може бути пустим.',
      })
    } else {
      if (!validator.isLength(user_name, { min: 6 })) {
        this.errors.push({
          field: 'user_name',
          message: 'Ім`я користувача має бути не менше ніж 6 символів',
        })
      }
    }
    if (validator.isEmpty(password, { ignore_whitespace: true })) {
      this.errors.push({
        field: 'password',
        message: 'Пароль не може бути пустим.',
      })
    }
    if (!validator.isIn(role, ['admin', 'user'])) {
      this.errors.push({ field: 'role', message: 'Не вірна назва ролі.' })
    }

    return this.errors.length === 0
  },
  async profileValidate(
    { uuid, user_name, description = '', avatarFilename = '' },
    isNew
  ) {
    return true
  },
  async getUsers() {
    try {
      const connection = await db()
      const queryUsers = 'SELECT * FROM `' + dbName + '`.`user_info` as usr '
      const [rows] = await connection.query(queryUsers)
      return rows
    } catch (error) {
      throw error
    }
  },

  async getUser(uuid) {
    try {
      const connection = await db()
      const queryUser =
        'SELECT * FROM `' +
        dbName +
        '`.`user_info` as usr ' +
        'WHERE usr.uuid = ?'
      const [rows] = await connection.query(queryUser, [uuid])
      if (rows.length === 0) {
        return {}
      }
      return rows[0]
    } catch (error) {
      console.log('getUser error: ', error)
      throw error
    }
  },

  async getUserByEmail(email) {
    try {
      const connection = await db()
      const queryUsers =
        'SELECT * FROM `' +
        dbName +
        '`.`user_info` as usr ' +
        'WHERE usr.email = ?'

      const [rows] = await connection.query(queryUsers, [email])
      if (rows.length === 0) {
        return {}
      }
      return rows[0]
    } catch (error) {
      throw error
    }
  },

  updateUser(uuid, userData) {},

  async updateProfile({
    uuid,
    user_name,
    description = '',
    avatarFileName = '',
  }) {
    try {
      console.log({
        uuid,
        user_name,
        description,
        avatarFileName,
      })
      const connection = await db()
      console.log('connection')
      let sql = ''
      let avatar = null
      let result
      let fileName
      if (avatarFileName.length !== 0) {
        console.log('avatar filename')
        fileName = path.resolve(
          __dirname,
          `..\\client\\public\\uploads\\${avatarFileName}`
        )
        console.log(fileName)
        avatar = await sharp(fileName).png().resize(128, 128).toBuffer()
        sql =
          'update `' +
          dbName +
          '`.`profile` set `user_name` = ?, `description` = ?, `avatar` = ? ' +
          'WHERE BIN_TO_UUID(uuid) = ?'
        result = await connection.query(sql, [
          user_name,
          description,
          avatar,
          uuid,
        ])
      } else {
        console.log('no avatar filename')
        sql =
          'update `' +
          dbName +
          '`.`profile` set `user_name` = ?, `description` = ? ' +
          'WHERE BIN_TO_UUID(uuid) = ?'
        console.log(sql)
        result = await connection.query(sql, [user_name, description, uuid])
      }
      return result[0].affectedRows
    } catch (error) {
      throw error
    }
  },

  async newUser({ email, user_name, password, role }) {
    const newUUID = uuidv4()
    if (role === '') {
      role = 'user'
    }
    const candidate = {
      uuid: newUUID,
      email,
      user_name,
      password,
      role,
    }
    try {
      const connection = await db()
      const isValid = await this.validate(candidate, true)
      if (!isValid) {
        throw new Error(JSON.stringify(this.errors))
      }
      const saltRounds = 10 // я не знаю, яке значення вибирати
      const hashedPassword = await bcrypt.hash(candidate.password, saltRounds)
      const avatarFilename = path.resolve(
        __dirname,
        '..\\images\\defaultuseravatar.png'
      )
      const avatar = await sharp(avatarFilename)
        .png()
        .resize(256, 256)
        .toBuffer()
      connection.beginTransaction()
      try {
        //`user_name`,  candidate.user_name,
        let sql =
          'INSERT INTO `' +
          dbName +
          '`.`user` (`uuid`, `email`, `password`, `role`) VALUES (UUID_TO_BIN(?), ?, ?, ?);'
        await connection.query(sql, [
          candidate.uuid,
          candidate.email,
          hashedPassword,
          candidate.role,
        ])
        sql =
          'INSERT INTO `' +
          dbName +
          '`.`profile` (`uuid`,`user_name`, `avatar`) VALUES (UUID_TO_BIN(?), ?, ?);'
        await connection.query(sql, [
          candidate.uuid,
          candidate.user_name,
          avatar,
        ])
        connection.commit()
        return candidate.uuid
      } catch (error) {
        connection.rollback()
        throw error
      }
    } catch (error) {
      throw error
    }
  },

  async getProfile(uuid) {
    try {
      const connection = await db()
      const sql =
        'SELECT BIN_TO_UUID(prf.uuid) as uuid, prf.user_name, prf.description, prf.avatar FROM `' +
        dbName +
        '`.`profile` as prf ' +
        'WHERE BIN_TO_UUID(prf.uuid) = ?'
      const [rows] = await connection.query(sql, [uuid])
      if (rows.length === 0) {
        return {}
      }
      return rows[0]
    } catch (error) {
      console.log('getProfile error: ', error)
      throw error
    }
  },
}
module.exports = User
