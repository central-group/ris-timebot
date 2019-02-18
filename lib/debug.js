const chalk = require('chalk')
const moment = require('moment')

let logger = {
  log: (...msg) => {
    process.stdout.write(` ${chalk.yellow('[debug]')} ${chalk.gray(moment().format('YYYY-MM-DD HH:mm:ss:SSS') + ' |')} ${msg.join(' ')}`)
    return logger
  },
  append: (...msg) => {
    process.stdout.write(msg.join(' '))
    return logger
  },
  end: () => {
    process.stdout.write(`\n`)
    return logger
  }
}

module.exports = {
  log: logger.log,
  append: logger.append,
  end: logger.end
}