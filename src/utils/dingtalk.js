const axios = require('axios')
const crypto = require('crypto')
const BOT = 'https://oapi.dingtalk.com/robot/send?access_token=72185f999b490f6707d7707307b7d35393dc6777e6ac75fc101213e6c8ae4b8d'
const setDingMessage = (message) => {
  const [timestamp, sign] = dingHashKey()
  axios.post(`${BOT}&timestamp=${timestamp}&sign=${sign}`, {
    msgtype: 'text',
    text: {
      content: message
    },
    at: {
      isAtAll: true,
    }
  }, {
    headers: {
      'Content-Type': 'application/json;charset=utf-8',
    }
  }).then(res => {
    console.log(res?.data, 'send')
  }).catch(err => {
    console.error(err,'send error')
  })
}

const dingHashKey = () => {
  const secret = "SEC436ec1afd666fd11d2868c9a40d7d79b47c55e175867ed64465265241d546e6e";
  const timestamp = Math.round(Date.now() * 1000).toString();
  const stringToSign = `${timestamp}\n${secret}`;
  const hmacCode = crypto.createHmac('sha256', secret).update(stringToSign, 'utf8').digest();
  const sign = encodeURIComponent(Buffer.from(hmacCode).toString('base64'));
  return [timestamp, sign];
}

module.exports = {
  setDingMessage,
  dingHashKey,
}
