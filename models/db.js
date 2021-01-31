const mysql = require('mysql2/promise')
const config = require('config')

let _db = null
async function testConnection() {
  if (_db === null) {
    return false
  }
  try {
    await _db.execute('select 1')
    return true
  } catch (error) {
    _db = null
    return false
  }
}

async function getDb() {
  if (await testConnection()) {
    return _db
  }
  try {
    _db = await mysql.createConnection(config.get('db'))
  } catch (error) {
    _db = null
    console.log('DB Error: ', error.message)
    throw error
  }
  return _db
}

module.exports = getDb
