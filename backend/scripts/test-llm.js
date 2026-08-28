/**
 * 临时验证脚本：检查豆包 LLM 是否可用并真实调用一次
 * 运行：$env:ARK_API_KEY="..." ; node scripts/test-llm.js
 */
process.chdir(__dirname + '/..')
const { loadEnv } = require('../src/config/env.js')
loadEnv()
const llm = require('../src/services/llmService.js')

async function main() {
  console.log('isAvailable:', llm.isAvailable())
  if (!llm.isAvailable()) {
    console.log('未配置 ARK_API_KEY —— 后端将自动使用规则引擎，不报错。')
    return
  }
  console.log('正在调用豆包 LLM（chat）...')
  const reply = await llm.chat('我今天有点累，上了一天课，脑子转不动了', { userName: '测试' })
  console.log('chat 回复:', reply ? JSON.stringify(reply) : '(null)')

  console.log('正在调用豆包 LLM（analyzeEmotion）...')
  const emotion = await llm.analyzeEmotion('今天好焦虑，明天要汇报，紧张得睡不着')
  console.log('情绪分析:', emotion ? JSON.stringify(emotion) : '(null)')
}

main().catch(e => { console.error(e); process.exit(1) })
