var express = require('express')
const bcrypt = require('bcrypt')
const User = require('../models/User')
var router = express.Router()
const multer = require('multer')
const config = require('config')

/**виконує процедуру входу користувача за значенням email та паролем
 * запит: метод - POST; шлях - /api/auth/login
 * повертає статус - 200 та
 * об'єкт { uuid: user.uuid, email: user.email, user_name: user.user_name, role: user.role, avatar: user.avatar }
 * або помилку 403 (Помилка авторизації)
 * або помилку 500
 */
router.post('/login', async function (req, res) {
  try {
    const { email, password } = req.body
    const user = await User.getUserByEmail(email)
    if (Object.keys(user).length === 0) {
      res.status(403).send(
        JSON.stringify({
          source: 'POST /api/auth/login error: ',
          message: 'Помилка авторизації',
        })
      )
      return
    }
    const match = await bcrypt.compare(password, user.password)
    if (!match) {
      res.status(403).send(
        JSON.stringify({
          source: 'POST /api/auth/login error: ',
          message: 'Помилка авторизації',
        })
      )
      return
    }

    res.send(
      JSON.stringify({
        uuid: user.uuid,
        email: user.email,
        user_name: user.user_name,
        role: user.role,
        avatar: user.avatar,
      })
    )
    return
  } catch (error) {
    console.log('POST /api/auth/login error: ', error)
    res.status(500).send(
      JSON.stringify({
        source: 'POST /api/auth/login error: ',
        message: error.message,
      })
    )
  }
})

/**виконує процедуру реєстрації користувача
 * запит: метод - POST; шлях - /api/auth/register
 * req.body містить { email, user_name, password, role }
 * // повертає 201 { uuid: user.uuid, email: user.email, user_name: user.user_name, role: user.role, avatar: user.avatar }
 * або помилку 500
 */
router.post('/register', async function (req, res) {
  try {
    const { email, user_name, password, role } = req.body
    // запис користувача в базу user -> {uuid, email, user_name, role}
    const uuid = await User.newUser({
      email,
      user_name,
      password,
      role,
    })
    const user = await User.getUser(uuid)
    res.status(201).send(
      JSON.stringify({
        uuid: user.uuid,
        email: user.email,
        user_name: user.user_name,
        role: user.role,
        avatar: user.avatar,
      })
    ) // 201 статус, коли щось створюється
  } catch (error) {
    console.log('POST /api/auth/register error: ', error)
    res.status(500).send(
      JSON.stringify({
        source: 'POST /api/auth/register error: ',
        message: error.message,
      })
    )
  }
})

/**Перевіряє унікальність (наявність) email
 * запит: метод - GET; шлях - /api/auth/email/:email
 * email = req.params.email
 * повертає статус - 200 та true | false
 * або помилку 500
 */
router.get('/email/:email', async function (req, res) {
  try {
    const user = await User.getUserByEmail(req.params.email)
    if (Object.keys(user).length !== 0) {
      res.send(JSON.stringify(true))
    } else {
      res.send(JSON.stringify(false))
    }
  } catch (error) {
    console.log(`GET /api/auth/exist/${req.params.email} error: `, error)
    res.status(500).send(
      JSON.stringify({
        source: `GET /api/auth/exist/${req.params.email}`,
        message: error.message,
      })
    )
  }
})

/**Повертає дані користувача за його uuid
 * запит: метод - GET; шлях - /api/auth/user/:uuid
 * uuid = req.params.uuid
 * повертає статус - 200 та
 * { uuid: user.uuid, email: user.email, user_name: user.user_name, role: user.role, avatar: user.avatar }
 * або помилку 404 'Користувача не знайдено'
 * або помилку 500
 */
router.get('/user/:uuid', async function (req, res) {
  const uuid = req.params.uuid
  try {
    const user = await User.getUser(uuid)
    if (Object.keys(user).length === 0) {
      res.status(404).send(
        JSON.stringify({
          source: `GET /api/auth/user/${req.params.uuid} error: `,
          message: 'Користувача не знайдено',
        })
      )
      return
    }
    res.send(JSON.stringify(user))
  } catch (error) {
    console.log(`GET /api/auth/user/${req.params.uuid} error: `, error)
    res.status(500).send(
      JSON.stringify({
        source: `GET /api/auth/user/${req.params.uuid}`,
        message: error.message,
      })
    )
  }
})

/**Повертає дані профіля користувача за його uuid
 * запит: метод - GET; шлях - /api/auth/profile/:uuid
 * uuid = req.params.uuid
 * повертає статус - 200 та { uuid: profile.uuid, userName: profile.user_name, description: profile.description,
 * avatar: profile.avatar,}
 */
router.get('/profile/:uuid', async function (req, res) {
  const uuid = req.params.uuid
  try {
    const profile = await User.getProfile(uuid)
    if (Object.keys(profile).length === 0) {
      res.status(404).send(
        JSON.stringify({
          source: `GET /api/auth/profile/${req.params.uuid} error: `,
          message: 'Профіль користувача не знайдено',
        })
      )
      return
    }
    res.send(
      JSON.stringify({
        uuid: profile.uuid,
        userName: profile.user_name,
        description: profile.description,
        avatar: profile.avatar,
      })
    )
  } catch (error) {
    console.log(`GET /api/auth/profile/${req.params.uuid} error: `, error)
    res.status(500).send(
      JSON.stringify({
        source: `GET /api/auth/profile/${req.params.uuid}`,
        message: error.message,
      })
    )
  }
})

const folders = config.get('folders')
const upload = multer({ dest: folders.clientBase + folders.uploads })
/**завантажуе файл аватара та повертає шлях до файлу
 * запит: метод - post; шлях - /api/auth/avatar/upload/
 * повертає статус - 200 та шлях до файлу
 */
router.post(
  '/avatar/upload/',
  upload.single('avatar'),
  async function (req, res) {
    try {
      const filedata = req.file

      console.log(filedata)
      if (!filedata) {
        res.send(
          JSON.stringify({
            source: `PUT /api/auth/avatar/upload/`,
            message: 'Помилка завантаження файлу',
          })
        )
      } else {
        res.send(
          JSON.stringify({
            fileName: filedata.filename,
          })
        )
      }
    } catch (error) {
      console.log(`PUT /api/auth/avatar/upload/ error: `, error)
      res.status(500).send(
        JSON.stringify({
          source: `PUT /api/auth/avatar/upload/`,
          message: error.message,
        })
      )
    }
  }
)

/**завантажуе нові дані профіля до бд та повертає записані в БД дані
 * запит: метод - put; шлях - /api/auth/profile/:uuid
 * повертає статус - 200 та повертає записані в БД дані
 * або 404(Профіль користувача не знайдено)
 * або 500
 */
router.put('/profile/:uuid', async function (req, res) {
  try {
    const uuid = req.params.uuid
    /** @const oldProfile {({uuid, user_name, description, avatar} | {})} */
    const oldProfile = await User.getProfile(uuid)
    if (Object.keys(oldProfile).length === 0) {
      res.status(404).send(
        JSON.stringify({
          source: `PUT /api/auth/profile/${req.params.uuid}`,
          message: 'Профіль користуваача не знайдено',
        })
      )
      return
    }
    const { user_name, description, avatarFileName } = req.body
    const result = User.updateProfile({
      uuid,
      user_name,
      description,
      avatarFileName,
    })
    if (result === 0) {
      throw new Error(' Зміни не відбулися')
    }
    const profile = await User.getProfile(uuid)
    if (Object.keys(oldProfile).length === 0) {
      res.status(404).send(
        JSON.stringify({
          source: `PUT /api/auth/profile/${req.params.uuid}`,
          message: 'Оновлений профіль користуваача не знайдено',
        })
      )
      return
    }

    res.status(201).send(JSON.stringify(profile))
  } catch (error) {
    console.log(`PUT /api/auth/profile/${req.params.uuid} error: `, error)
    res.status(500).send(
      JSON.stringify({
        source: `PUT /api/auth/profile/${req.params.uuid}`,
        message: error.message,
      })
    )
  }
})
module.exports = router
