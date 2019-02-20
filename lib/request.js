const rp = require('request-promise')

module.exports = (name, data, uri) => {
  return rp.defaults({
    method: 'POST',
    json: true,
    headers: {
      'Accept': 'application/json, text/javascript, */*; q=0.01',
      'Content-Type': 'application/json',
      'Cookie': 'ASP.NET_SessionId=obmcbss0rt3rj4tcw5y5bb34',
      'Host': 'rshdtimessrv01',
      'Origin': 'http://rshdtimessrv01',
      'Referer': `http://rshdtimessrv01/Timereport/${uri ? 'login.aspx' : 'TimeReport/timereportV2.1.aspx'}`,
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/71.0.3578.98 Safari/537.36',
      'X-Requested-With': 'XMLHttpRequest'
    }
  })({
    uri: `http://rshdtimessrv01/Timereport/${uri || 'TimeReport/timereportV2.1.aspx'}/${name}`,
    body: data
  })
}
