const chalk = require('chalk')
const moment = require('moment')
const request = require('request-promise')

let lineMessage = ''

let logger = {
  log: (...msg) => {
    lineMessage += msg.join(' ')
    process.stdout.write(` ${chalk.yellow('[debug]')} ${chalk.gray(moment().format('YYYY-MM-DD HH:mm:ss:SSS') + ' |')} ${msg.join(' ')}`)
    return logger
  },
  append: (...msg) => {
    lineMessage += msg.join(' ')
    process.stdout.write(msg.join(' '))
    return logger
  },
  end: () => {
    let body = lineMessage
    lineMessage = ''
    request({
      url: `http://10.0.80.52:3001/api/logs/ris-timebot/schedule/log/`,
      method: 'PUT',
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
