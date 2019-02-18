const chalk = require('chalk')
const args = require('args')
const moment = require('moment')
const lookup = require('./lib/lookup')
const debug = require('./lib/debug')
const request = require('./lib/request')

const getUserLogin = async (User, Password) => {
  let res = await request('GetUserLogin', { User, Password }, 'Login.aspx')
  if (!res.d) throw new Error(`Timereport GetUserLogin is undefined.`)
  if (res.d !== 'Success') throw new Error(`Can't Login.`)
  return res.d === 'Success'
}

const getPeriod = async () => {
  let res = await request('GetPeriod')
  if (!res.d) throw new Error('Timereport GetPeriod is undefined.')
  return res.d.match(/value='(.+?)'/ig).map(period => /value='(.+?)'/ig.exec(period)[1])
}

const getUser = async (User) => {
  let res = await request('GetUser', { User })
  if (!res.d) throw new Error('Timereport GetUser is undefined.')
  let [ , name, depart, approver ] = /:(.*?)&.*?:(.*?)&.*?:(.*)/ig.exec(res.d) || []
  return {
    name: name.trim(),
    depart: depart.trim(),
    approver: approver.trim()
  }
}

const getFirstTimesheetID = async (User, Period) => {
  let res = await request('GetFirstTimesheetID', { User, Period })
  if (!res.d) throw new Error('Timereport getFirstTimesheetID is undefined.')
  return res.d
}

const getStatusTimesheet = async (TimeSheetID) => {
  let res = await request('GetStatusTimesheet', { TimeSheetID })
  if (!res.d) throw new Error('Timereport GetStatusTimesheet is undefined.')

  const status = { '11_': 'OK', '14_': 'Approved' }
  return { id: res.d, state: status[res.d] }
}

const getSearchJobMaster = async (User, TimeSheetID) => {
  let res = await request('GetSearchJobMaster', { User, TimeSheetID })
  if (!res.d) throw new Error('Timereport GetSearchJobMaster is undefined.')
  return (res.d.match(/<option.*?option>/ig) || []).map(period => {
    let [ , value, label ] = /value='(.+?)'.*?>(.+?)</ig.exec(period)
    return { value, label }
  })
}

const getTJobInTimeSheet = async (TimeSheetID) => {
  let res = await request('GetTJobInTimeSheet', { TimeSheetID })
  if (!res.d) throw new Error('Timereport GetTJobInTimeSheet is undefined.')
  return (res.d.match(/<option.*?option>/ig) || []).map(period => {
    let [ , value, label ] = /value='(.+?)'.*?>(.+?)</ig.exec(period)
    return { value, label }
  })
}
const getTimeSheetData = async (TimeSheetID, PeriodID, Status, User, OptionID) => {
  let res = await request('GetTimeSheetData', { TimeSheetID, PeriodID, Status, User })
  if (!res.d) throw new Error('Timereport GetTimeSheetData is undefined.')
  let data = res.d.match(/<td.*?td>/ig).filter(opt => {
    let regex = new RegExp(`<td.class=''.*?R_${OptionID}`, 'ig')
    return regex.test(opt)
  }).map(opt => {
    let [ , value, colLabel, rowLabel, colValue, rowValue ] = /value='(.*?)'.*?CalculateAndSaveData\("(.*?)".*?"(.*?)".*?"(.*?)".*?"(.*?)"/ig.exec(opt) || []
    return { val: value, col: colValue, row: rowValue, colLabel, rowLabel }
  })
  if (!data || data.length === 0) throw new Error('Timereport GetTimeSheetData column CalculateAndSaveData is undefined.')
  return data
}

const insertJobTimeSheetDetail = async (TimeSheetID, ProjectID, PeriodID, Status, User, RowIndex) => {
  let res = await request('InsertJobTimeSheetDetail', { TimeSheetID, ProjectID, PeriodID, Status, User, RowIndex })
  if (!res.d) throw new Error('Timereport InsertJobTimeSheetDetail is undefined.')
  return res.d
}

const updateTimeSheetLineTrans = async (Value, LindID, Column) => {
  let res = await request('UpdateTimeSheetLineTrans', { Value, LindID, Column })
  if (!res.d) throw new Error('Timereport UpdateTimeSheetLineTrans is undefined.')
  return res.d === 'Success'
}

let username = '18000922'
let password = '18000922'
let job = '14P120001'
let hour = '8'

 
args.option('employee', 'timereport username', 0)
args.option('job', 'timesheet job id', '')
args.option('hour', 'hour append to job', 8)
const flags = args.parse(process.argv)

console.log('employee:', flags.employee)
console.log('job:', flags.job)
console.log('hour:', flags.hour)
// lookup('rshdtimessrv01').then(async dns => {
//   debug.log(`Server 'rshdtimessrv01' Login IPv${dns.family}: ${chalk.blue(dns.address)}`).end()
//   debug.log(`GetUserLogin: `)
//   await getUserLogin(username, password)
//   let user = await getUser(username)
//   debug.append(chalk.green('SUCCESS')).end()
//   debug.log(`Welcome: ${chalk.cyan(user.name)} Department: ${chalk.cyan(user.depart)}`).end()
//   debug.log(`Approver: ${chalk.cyan(user.approver)}`).end()
//   debug.log(`GetPeriod checking: `)
//   let period = await getPeriod()
//   for (const option of period) {
//     let date = moment(option)
//     if (date > moment().startOf('day')) continue

//     debug.append(chalk.cyan(option))
//     let id = await getFirstTimesheetID(username, option)
//     let status = await getStatusTimesheet(id)
//     if (status.state === 'OK') {
//       let master = await getSearchJobMaster(username, id)
//       debug.end()
//       debug.log(`SearchJobMaster: ${job} `)
//       let getMaster = master[master.map(o => o.value).indexOf(job)]
//       let table = await getTJobInTimeSheet(id)
//       if (getMaster) {
//         debug.append(`- ${getMaster.label}`).end()
//         // insertJobTimeSheetDetail
//         let bugRowId = 2
//         await insertJobTimeSheetDetail(id, job, option, status.id, username, table.length + 1 + bugRowId)
//       } else {
//         let getUser = table[table.map(o => o.value).indexOf(job)]
//         if (!getUser) {
//           debug.append(`is ${chalk.red(`not found`)} in master jobs or user job.`).end()
//           throw new Error('JobID worng.')
//         }
//         debug.append(`- ${getUser.label}`).end()
//       }
//       // updateTimeSheetTable
//       debug.log(`${chalk.green('System all green')}, Automation is begin...`).end()
//       // get data table
//       let input = await getTimeSheetData(id, option, status.id, username, job)
//       for (const data of input) {
//         if (data.val === '') {
//           let res = await updateTimeSheetLineTrans(hour, data.row, data.col)
//           if (!res) {
//             debug.log(`Automation timesheet update ${chalk.red('fail')}.`).end()
//             throw new Error(`at Col:${data.colLabel} Row:${data.rowLabel}`)
//           }
//         }
//       }

//       // Approved call api.
//       debug.log(`Automation timesheet update ${chalk.green('successful')}.`).end()
//     } else {
//       debug.append(` >> ${chalk.underline.yellow(status.state)}.`).end()
//     }
//     break
//   }
// }).catch(ex => {
//   debug.end().log(`CATCH >> ${chalk.red('FAIL')} (${ex.message})`).end()
//   debug.append('  ' + chalk.gray(ex.stack))
// })
