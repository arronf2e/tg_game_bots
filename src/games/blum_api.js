const axios = require('axios');
const schedule = require('node-schedule');
const {sleep} = require("../utils");
const {setDingMessage} = require("../utils/dingtalk");

class Blum {
  constructor(token) {
    this.token = token;
    this.apiGw = 'https://gateway.blum.codes'
    this.apiPre = 'https://game-domain.blum.codes/api'
    this.friends = [];
    this.headers = {
      "accept": "application/json, text/plain, */*",
      "accept-language": "zh-CN,zh;q=0.9",
      "authorization": `Bearer ${token}`,
      "cache-control": "no-cache",
      "pragma": "no-cache",
      "priority": "u=1, i",
      "sec-ch-ua": '"Google Chrome";v="125", "Chromium";v="125", "Not.A/Brand";v="24"',
      "sec-ch-ua-mobile": "?0",
      "sec-ch-ua-platform": "\"macOS\"",
      "sec-fetch-dest": "empty",
      "sec-fetch-mode": "cors",
      "sec-fetch-site": "same-site",
      "Referer": "https://telegram.blum.codes/",
      "Referrer-Policy": "strict-origin-when-cross-origin",
      "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36"
    }
  }

  // 2分钟调用一次
  getNow() {
    axios.get(`${this.apiPre}/v1/time/now`, {
      headers: this.headers,
    }).then((result) => {
      console.log(result.data, 'now')
    })
  }

  getMe() {
    return axios.get(`${this.apiGw}/v1/user/me`, {
      headers: this.headers,
    })
  }

  // 30-35秒调用一次
  getUserBalance(callback) {
    axios.get(`${this.apiPre}/v1/user/balance`, {
      headers: this.headers,
    }).then((result) => {
      console.log(result.data, 'balance')
      const { availableBalance, farming, playPasses } = result.data;
      if(farming?.endTime < +new Date()) {
        this.claimUserBalance(availableBalance, farming, playPasses)
      }
    })
  }

  claimUserBalance(availableBalance, farming, playPasses) {
    axios.post(`${this.apiPre}/v1/farming/claim`, {
      availableBalance: availableBalance + farming?.balance,
      playPasses: playPasses,
      timestamp: +new Date(),
    }, {
      headers: this.headers,
    }).then(async (result) => {
      console.log(result.data, 'claim success')
      await sleep(1000)
      this.startFarm(farming?.earningsRate)
    })
  }

  startFarm(earningsRate) {
    axios.post(`${this.apiPre}/v1/farming/claim`, {
      balance: '0',
      earningsRate,
      startTime: +new Date(),
      // endTime 比 startTime 大8小时
      endTime: +new Date() + 8 * 60 * 60 * 1000,
    }, {
      headers: this.headers,
    }).then(async (result) => {
      await sleep(1000)
      this.startFarm()
    })
  }

  getFriends(callback) {
    axios.get(`${this.apiGw}/v1/friends`, {
      headers: this.headers,
    }).then((result) => {
      console.log(result.data, 'friends')
    })
  }

  // 其他接口
  getMonitor() {
    const headers = Object.assign({}, this.headers);
    delete headers['authorization'];
    axios.get(`https://js.monitor.azure.com/scripts/b/ai.config.1.cfg.json`, {
      headers,
    }).then((result) => {
      console.log(result.data, 'monitor')
    })
  }

  getMeta() {
    const headers = Object.assign({}, this.headers);
    delete headers['authorization'];
    axios.get(`https://telegram.blum.codes/_dist/builds/meta/8893f319-0587-45bf-b259-4ef7ec0db636.json`, {
      headers,
    }).then((result) => {
      console.log(result.data, 'getMeta')
    })
  }

  getTrack() {
    const now = new Date();
    const headers = Object.assign({}, this.headers);
    delete headers['authorization'];
    axios.post('https://japaneast-1.in.applicationinsights.azure.com/v2/track', [{
        "time": now.toISOString(),
        "iKey": "e7b96e51-49ba-4f08-88ea-b65b7cde4828",
        "name": "Microsoft.ApplicationInsights.e7b96e5149ba4f0888eab65b7cde4828.Pageview",
        "tags": {
          "ai.user.id": "1Vg0bkNTgro1avn/hQN7Sa",
          "ai.session.id": "q4H63mxleYtQT701NgFr0U",
          "ai.device.id": "browser",
          "ai.device.type": "Browser",
          "ai.operation.name": "/",
          "ai.operation.id": "1a0c1bc1e5c74f0ca06b28bf8e8ddf7e",
          "ai.internal.sdkVersion": "javascript:3.2.0",
          "ai.internal.snippet": "-"
        },
        "data": {
          "baseType": "PageviewData",
          "baseData": {
            "ver": 2,
            "name": "not_specified",
            "url": "https://telegram.blum.codes/#tgWebAppData=query_id=AAH1GvViAgAAAPUa9WK9ciUT&user={%22id%22:5955197685,%22first_name%22:%22Majin%22,%22last_name%22:%22Zz%22,%22language_code%22:%22zh-hans%22,%22allows_write_to_pm%22:true}&auth_date=1716885478&hash=e3499ff954ff5006ea193149cc1206af7d37c755300f6d208db1a9a277276772&tgWebAppVersion=7.2&tgWebAppPlatform=web&tgWebAppThemeParams={%22bg_color%22:%22#ffffff%22,%22button_color%22:%22#3390ec%22,%22button_text_color%22:%22#ffffff%22,%22hint_color%22:%22#707579%22,%22link_color%22:%22#00488f%22,%22secondary_bg_color%22:%22#f4f4f5%22,%22text_color%22:%22#000000%22,%22header_bg_color%22:%22#ffffff%22,%22accent_text_color%22:%22#3390ec%22,%22section_bg_color%22:%22#ffffff%22,%22section_header_text_color%22:%22#3390ec%22,%22subtitle_text_color%22:%22#707579%22,%22destructive_text_color%22:%22#df3f40%22}",
            "duration": "00:00:03.001",
            "properties": {"refUri": "https://telegram.blum.codes/"},
            "measurements": {},
            "id": "1a0c1bc1e5c74f0ca06b28bf8e8ddf7e"
          }
        }
      }, {
        "time": now.toISOString(),
        "iKey": "e7b96e51-49ba-4f08-88ea-b65b7cde4828",
        "name": "Microsoft.ApplicationInsights.e7b96e5149ba4f0888eab65b7cde4828.PageviewPerformance",
        "tags": {
          "ai.user.id": "1Vg0bkNTgro1avn/hQN7Sa",
          "ai.session.id": "q4H63mxleYtQT701NgFr0U",
          "ai.device.id": "browser",
          "ai.device.type": "Browser",
          "ai.operation.name": "/",
          "ai.operation.id": "1a0c1bc1e5c74f0ca06b28bf8e8ddf7e",
          "ai.internal.sdkVersion": "javascript:3.2.0"
        },
        "data": {
          "baseType": "PageviewPerformanceData", "baseData": {
            "ver": 2,
            "name": "not_specified",
            "url": "https://telegram.blum.codes/#tgWebAppData=query_id=AAH1GvViAgAAAPUa9WK9ciUT&user={%22id%22:5955197685,%22first_name%22:%22Majin%22,%22last_name%22:%22Zz%22,%22language_code%22:%22zh-hans%22,%22allows_write_to_pm%22:true}&auth_date=1716885478&hash=e3499ff954ff5006ea193149cc1206af7d37c755300f6d208db1a9a277276772&tgWebAppVersion=7.2&tgWebAppPlatform=web&tgWebAppThemeParams={%22bg_color%22:%22#ffffff%22,%22button_color%22:%22#3390ec%22,%22button_text_color%22:%22#ffffff%22,%22hint_color%22:%22#707579%22,%22link_color%22:%22#00488f%22,%22secondary_bg_color%22:%22#f4f4f5%22,%22text_color%22:%22#000000%22,%22header_bg_color%22:%22#ffffff%22,%22accent_text_color%22:%22#3390ec%22,%22section_bg_color%22:%22#ffffff%22,%22section_header_text_color%22:%22#3390ec%22,%22subtitle_text_color%22:%22#707579%22,%22destructive_text_color%22:%22#df3f40%22}",
            "duration": "00:00:03.001",
            "perfTotal": "00:00:03.001",
            "networkConnect": "00:00:00.009",
            "sentRequest": "00:00:00.109",
            "receivedResponse": "00:00:00.004",
            "domProcessing": "00:00:02.873",
            "properties": {},
            "measurements": {"duration": 3001.4000000059605}
          }
        }
      }]
      , {
        headers,
      }).then((result) => {
      console.log(result.data, 'getTrack')
    })
  }
}


const startBots = async (token) => {
  const blum = new Blum(token);
  // 进入游戏
  // blum.getNow()
  blum.getMonitor();
  blum.getMeta();
  blum.getTrack();
  blum.getNow();
  await sleep(300)
  blum.getUserBalance()
  // 定时任务，2分钟一次，cron怎么写？
  let timenowJob = schedule.scheduleJob('*/2 * * * *', () => {
    blum.getNow();
  });
  // 设置每30秒执行一次
  let banlanceJob = schedule.scheduleJob('*/30 * * * * *', () => {
    blum.getUserBalance();
  });
  const me = await blum.getMe();
  // console.log(`Blum: ${me?.data?.username}登录成功`)
  await sleep(1000)
  // setDingMessage(`Blum: ${me?.data?.username}登录成功`);
  // blum.getFriends();
}

startBots('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJoYXNfZ3Vlc3QiOmZhbHNlLCJ0eXBlIjoiQUNDRVNTIiwiaXNzIjoiYmx1bSIsInN1YiI6IjQyYjMyNGU5LTNkMzQtNDM3ZS1iZjM1LTc0NmYzOTY5ZTJiYSIsImV4cCI6MTcxNjkwMDE3NywiaWF0IjoxNzE2ODk2NTc3fQ.CLJkzmpy1m4E_1gQOevEGu0xKg-yP_NFpblFZG69ZoQ')
