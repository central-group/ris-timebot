const moment = require('moment')
const request = require('request-promise')

let lineMessage = ''

let logger = {
  log: (...msg) => {
    lineMessage += msg.join(' ')
    process.stdout.write(`${('[debug]')} ${(moment().format('YYYY-MM-DD HH:mm:ss:SSS') + ' |')} ${msg.join(' ')}`)
    return logger
  },
  append: (...msg) => {
    lineMessage += msg.join(' ')
    process.stdout.write(msg.join(' '))
    return logger
  },
  end: (type) => {
    let body = lineMessage
    lineMessage = ''
    request({
      url: `http://s-thcw-posdb95.pos.cmg.co.th/log/ris-timebot/schedule/${!type ? 'log' : type}/`,
      method: 'PUT',
      headers: { level: 3 },
      body: { text: body },
      json: true
    })
    process.stdout.write(`\n`)
    return logger
  }
}

module.exports = {
  log: logger.log,
  append: logger.append,
  end: logger.end
}
