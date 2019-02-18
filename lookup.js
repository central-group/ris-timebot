const dns = require('dns')

module.exports = async dnsName => {
  return new Promise((resolve, reject) => {
    dns.lookup(dnsName, (err, address, family) => {
      if (err) return reject(err)
      resolve({ address, family })
    })
  })
}
