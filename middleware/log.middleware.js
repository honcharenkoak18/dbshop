module.exports = async (req, res, next) => {
  console.log(
    new Intl.DateTimeFormat('uk-UA', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    }).format(Date.now()),
    req.method,
    req.originalUrl
  )
  next()
}
