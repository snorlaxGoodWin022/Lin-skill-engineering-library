/**
 * 构建前脚本：将 .claude/skills 复制到 web/skills-data/
 * 确保 Vercel 部署时能访问技能文件
 */
const fs = require('fs')
const path = require('path')

const src = path.join(__dirname, '..', '..', '.claude', 'skills')
const dest = path.join(__dirname, '..', 'skills-data')

if (!fs.existsSync(src)) {
  console.warn('[copy-skills] 源目录不存在:', src)
  process.exit(0)
}

fs.rmSync(dest, { recursive: true, force: true })
fs.cpSync(src, dest, { recursive: true })

// 统计复制结果
const count = countFiles(dest)
console.log(`[copy-skills] 复制了 ${count} 个技能文件到 ${dest}`)

function countFiles(dir) {
  let n = 0
  for (const item of fs.readdirSync(dir, { withFileTypes: true })) {
    if (item.isDirectory()) n += countFiles(path.join(dir, item.name))
    else if (item.name.endsWith('.md') && item.name !== 'readme.md') n++
  }
  return n
}
