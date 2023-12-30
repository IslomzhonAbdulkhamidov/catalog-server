function onError(error, port) {
  if (error.syscall !== 'listen') {
    throw error
  }
  
  const bind = typeof port === 'string'
    ? 'Pipe ' + port
    : 'Port ' + port
  
  // handle specific listen errors with friendly messages
  switch (error.code) {
    case 'EACCES':
      console.error(bind + ' requires elevated privileges.')
      process.exit(1)
      break
    case 'EADDRINUSE':
      console.error(bind + ' is already in use. Server is being stopped.')
      process.exit(1)
      break
    default:
      throw error
  }
}


function normalizePort(val) {
  const port = parseInt(val, 10)
  
  if (isNaN(port)) {
    return val
  }
  if (port >= 0) {
    return port
  }
  return false
}


module.exports = {onError, normalizePort}
