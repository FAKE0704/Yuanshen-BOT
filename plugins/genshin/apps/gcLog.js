import plugin from '../../../lib/plugins/plugin.js'
import puppeteer from '../../../lib/puppeteer/puppeteer.js'
import fs from 'node:fs'
import GachaLog from '../model/gachaLog.js'
import ExportLog from '../model/exportLog.js'

export class gcLog extends plugin {
  constructor () {
    super({
      name: '抽卡记录',
      dsc: '抽卡记录数据统计',
      event: 'message',
      priority: 300,
      rule: [
        {
          reg: '(.*)authkey=(.*)',
          fnc: 'logUrl'
        },
        {
          reg: '#日志文件导入记录',
          fnc: 'logFile'
        },
        {
          reg: '^#*(抽卡|抽奖|角色|武器|常驻|up)池*(记录|祈愿|分析)$',
          fnc: 'getLog'
        },
        {
          reg: '^#*导出记录(excel|xlsx|json)*$',
          event: 'message.private',
          fnc: 'exportLog'
        }
      ]
    })
  }

  async init () {
    let file = './data/gachaJson'
    if (!fs.existsSync(file)) {
      fs.mkdirSync(file)
    }
  }

  accept () {
    if (this.e.file && this.e.file.name.includes('txt')) {
      this.e.msg = '#日志文件导入记录'
      return true
    }
  }

  /** 抽卡记录链接 */
  async logUrl () {
    if (!this.e.isPrivate) {
      this.e.reply('请私聊发送链接', false, { at: true })
      return true
    }

    let data = await new GachaLog(this.e).logUrl()
    if (!data) return

    let img = await puppeteer.screenshot('gachaLog', data)
    if (img) await this.reply(img)
  }

  async logFile () {
    if (!this.e.isPrivate) {
      await this.e.reply('请私聊发送日志文件', false, { at: true })
      return true
    }

    if (!this.e.file || !this.e.file.name.includes('txt')) {
      await this.e.reply('请发送日志文件')
    }

    let data = await new GachaLog(this.e).logFile()

    let img = await puppeteer.screenshot('gachaLog', data)
    if (img) await this.reply(img)
  }

  /** #抽卡记录 */
  async getLog () {
    let data = await new GachaLog(this.e).getLogData()
    if (!data) return

    let img = await puppeteer.screenshot('gachaLog', data)
    if (img) await this.reply(img)
  }

  async exportLog () {
    let exportLog = new ExportLog(this.e)

    if (this.e.msg.includes('json')) {
      return await exportLog.exportJson()
    } else {
      return await exportLog.exportXlsx()
    }
  }
}
