const rp = require('request-promise')
const chalk = require('chalk')
const moment = require('moment')
const lookup = require('./lookup')

let obj = {
  append: (...msg) => {
    process.stdout.write(msg.join(' '))
    return obj
  },
  end: () => {
    process.stdout.write(`\n`)
  }
}
const debug = {
  log: (...msg) => {
    process.stdout.write(` ${chalk.yellow('[debug]')} ${chalk.gray(moment().format('YYYY-MM-DD HH:mm:ss:SSS') + ' |')} ${msg.join(' ')}`)
    return obj
  },
  append: obj.append
}

const request = rp.defaults({
  method: 'POST',
  json: true,
  headers: {
    'Accept': 'application/json, text/javascript, */*; q=0.01',
    'Content-Type': 'application/json',
    'Cookie': 'ASP.NET_SessionId=obmcbss0rt3rj4tcw5y5bb34',
    'Host': 'rshdtimessrv01',
    'Origin': 'http://rshdtimessrv01',
    'Referer': 'http://rshdtimessrv01/Timereport/login.aspx',
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/71.0.3578.98 Safari/537.36',
    'X-Requested-With': 'XMLHttpRequest'
  }
})

const getUserLogin = async (User, Password) => {
  let res = await request({
    uri: 'http://rshdtimessrv01/Timereport/Login.aspx/GetUserLogin',
    body: { User, Password }
  })
  if (!res.d) throw new Error(`Timereport GetUserLogin is undefined.`)
  if (res.d !== 'Success') throw new Error(`Can't Login.`)
  return res.d === 'Success'
}

const getPeriod = async () => {
  let res = await request({
    uri: 'http://rshdtimessrv01/Timereport/TimeReport/timereportV2.1.aspx/GetPeriod'
  })
  if (!res.d) throw new Error('Timereport GetPeriod is undefined.')
  return res.d.match(/value='(.+?)'/ig).map(period => /value='(.+?)'/ig.exec(period)[1])
}

const getUser = async (User) => {
  let res = await request({
    uri: 'http://rshdtimessrv01/Timereport/TimeReport/timereportV2.1.aspx/GetUser',
    body: { User }
  })
  if (!res.d) throw new Error('Timereport GetUser is undefined.')
  let [ , name, depart, approver ] = /:(.*?)&.*?:(.*?)&.*?:(.*)/ig.exec(res.d) || []
  return {
    name: name.trim(),
    depart: depart.trim(),
    approver: approver.trim()
  }
}

let username = '18000922'
let password = '18000922'
lookup('rshdtimessrv01').then(async dns => {
  debug.log(`Server 'rshdtimessrv01' Login IPv${dns.family}: ${chalk.blue(dns.address)}`).end()
  debug.log(`GetUserLogin: `)
  await getUserLogin(username, password)
  let user = await getUser(username)
  debug.append(chalk.green('SUCCESS')).end()
  debug.log(`Welcome: ${chalk.cyan(user.name)} Department: ${chalk.cyan(user.depart)}`).end()
  debug.log(`Approver: ${chalk.cyan(user.approver)}`).end()
  debug.log(`GetPeriod checking approved: `)
  let period = await getPeriod()
  for (const option of period) {
    let date = moment(option)
    if (date > moment().startOf('day')) continue
    debug.append(chalk.cyan(option)).end()

    break
  }
}).catch(ex => {
  debug.append(`${chalk.red('FAIL')} (${ex.message})`).end()
})
