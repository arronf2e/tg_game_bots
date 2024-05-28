const puppeteer = require('puppeteer');
const {tgLoginPage} = require("../constants");

(async () => {
  const gamePage = 'https://t.me/BlumCryptoBot/app?startapp=ref_EXUkfVxyYV'
  const gameHome = 'https://web.telegram.org/k/#@BlumCryptoBot'
  const browser = await puppeteer.launch({headless: false});
  const page = await browser.newPage();
  await page.goto(tgLoginPage);
  // 判断 page 中的某个图片是否完全加载完成再进行截图
  await page.waitForSelector('image', {
    timeout: 0,
  });
  await page.screenshot({path: `blum_login_${+new Date()}.png`});
  // 给钉钉机器人webhook发送消息,包含上面的截屏图片
  // 等待1分钟
  try {
    await page.waitForSelector('#LeftMainHeader');
    console.log('登录成功');
    await page.goto(gamePage);
    // 点击 launch 按钮
    await page.waitForSelector(".tgme_action_button_new");
    await page.click(".tgme_action_button_new")
    console.log('点击 launch 按钮');
    // 点击 popup 按钮打开应用
    await page.waitForSelector(".popup-button");
    await page.click(".popup-button:nth-child(1)")
    console.log('点击 popup 按钮打开应用');
    page.on('response', response => {
      console.log(response.url(), '接口返回')
    })
  } catch (e) {
    console.log(e);
  }
  // await browser.close();
})();
