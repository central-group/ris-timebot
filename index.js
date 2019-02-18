const rp = require('request-promise')
const chalk = require('chalk')
const moment = require('moment')
const lookup = require('./lookup')

let obj = {
  log: (...msg) => {
    process.stdout.write(` ${chalk.yellow('[debug]')} ${chalk.gray(moment().format('YYYY-MM-DD HH:mm:ss:SSS') + ' |')} ${msg.join(' ')}`)
    return obj
  },
  append: (...msg) => {
    process.stdout.write(msg.join(' '))
    return obj
  },
  end: () => {
    process.stdout.write(`\n`)
    return obj
  }
}
const debug = {
  log: obj.log,
  append: obj.append,
  end: obj.end
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

const getFirstTimesheetID = async (User, Period) => {
  let res = await request({
    uri: 'http://rshdtimessrv01/Timereport/TimeReport/timereportV2.1.aspx/GetFirstTimesheetID',
    body: { User, Period }
  })
  if (!res.d) throw new Error('Timereport getFirstTimesheetID is undefined.')
  return res.d
}

const getStatusTimesheet = async (TimeSheetID) => {
  let res = await request({
    uri: 'http://rshdtimessrv01/Timereport/TimeReport/timereportV2.1.aspx/GetStatusTimesheet',
    body: { TimeSheetID }
  })
  if (!res.d) throw new Error('Timereport GetStatusTimesheet is undefined.')

  const status = {
    '11_': 'OK',
    '14_': 'Approved'
  }
  return {
    id: res.d,
    state: status[res.d]
  }
}

const getSearchJobMaster = async (User, TimeSheetID) => {
  let res = await request({
    uri: 'http://rshdtimessrv01/Timereport/TimeReport/timereportV2.1.aspx/GetSearchJobMaster',
    body: { User, TimeSheetID }
  })
  if (!res.d) throw new Error('Timereport GetSearchJobMaster is undefined.')
  return (res.d.match(/<option.*?option>/ig) || []).map(period => {
    let [ , value, label ] = /value='(.+?)'.*?>(.+?)</ig.exec(period)
    return { value, label }
  })
}

const getTJobInTimeSheet = async (TimeSheetID) => {
  let res = await request({
    uri: 'http://rshdtimessrv01/Timereport/TimeReport/timereportV2.1.aspx/GetTJobInTimeSheet',
    body: { TimeSheetID }
  })
  if (!res.d) throw new Error('Timereport GetTJobInTimeSheet is undefined.')
  return (res.d.match(/<option.*?option>/ig) || []).map(period => {
    let [ , value, label ] = /value='(.+?)'.*?>(.+?)</ig.exec(period)
    return { value, label }
  })
}
const getTimeSheetData = async (TimeSheetID, PeriodID, Status, User) => {
  let res = await request({
    uri: 'http://rshdtimessrv01/Timereport/TimeReport/timereportV2.1.aspx/GetTimeSheetData',
    body: { TimeSheetID, PeriodID, Status, User }
  })
  if (!res.d) throw new Error('Timereport GetTimeSheetData is undefined.')
  return res.d
}

const insertJobTimeSheetDetail = async (TimeSheetID, ProjectID, PeriodID, Status, User, RowIndex) => {
  let res = await request({
    uri: 'http://rshdtimessrv01/Timereport/TimeReport/timereportV2.1.aspx/InsertJobTimeSheetDetail',
    body: { TimeSheetID, ProjectID, PeriodID, Status, User, RowIndex }
  })
  if (!res.d) throw new Error('Timereport InsertJobTimeSheetDetail is undefined.')
  return res.d
}
let username = '18000922'
let password = '18000922'
let job = '14P120001'
lookup('rshdtimessrv01').then(async dns => {
  debug.log(`Server 'rshdtimessrv01' Login IPv${dns.family}: ${chalk.blue(dns.address)}`).end()
  debug.log(`GetUserLogin: `)
  await getUserLogin(username, password)
  let user = await getUser(username)
  debug.append(chalk.green('SUCCESS')).end()
  debug.log(`Welcome: ${chalk.cyan(user.name)} Department: ${chalk.cyan(user.depart)}`).end()
  debug.log(`Approver: ${chalk.cyan(user.approver)}`).end()
  debug.log(`GetPeriod checking: `)
  let period = await getPeriod()
  for (const option of period) {
    // let date = moment(option)
    // if (date > moment().startOf('day')) continue
    debug.append(chalk.cyan(option))
    let id = await getFirstTimesheetID(username, option)
    let status = await getStatusTimesheet(id)
    if (status.state === 'OK') {
      let master = await getSearchJobMaster(username, id)
      debug.end()
      debug.log(`SearchJobMaster: ${job} `)
      let getMaster = master[master.map(o => o.value).indexOf(job)]
      let table = await getTJobInTimeSheet(id)
      if (getMaster) {
        debug.append(`- ${getMaster.label}`).end()
        // insertJobTimeSheetDetail
        let bugRowId = 2
        await insertJobTimeSheetDetail(id, job, option, status.id, username, table.length + 1 + bugRowId)
      } else {
        let getUser = table[table.map(o => o.value).indexOf(job)]
        if (!getUser) {
          debug.append(`is ${chalk.red(`not found`)} in master jobs or user job.`).end()
          throw new Error('JobID worng.')
        }
        debug.append(`- ${getUser.label}`).end()
      }
      // updateTimeSheetTable
      debug.log(`${chalk.green('System all green')}, Automation is begin...`).end()
      // get data table
      await getTimeSheetData(id, option, status.id, username)
    } else {
      debug.append(` >> ${chalk.underline.yellow(status.state)}.`).end()
    }
    break
  }
}).catch(ex => {
  debug.end().log(`CATCH >> ${chalk.red('FAIL')} (${ex.message})`).end()
  debug.append('  ' + chalk.gray(ex.stack))
})
