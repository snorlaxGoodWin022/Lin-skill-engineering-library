#!/usr/bin/env node

/**
 * Skill.md 文件验证工具
 *
 * 验证Skill.md文件是否符合规范格式
 *
 * 使用方法：
 * node validate-skill.js <skill-file-path>
 * 或
 * npm run validate -- <skill-file-path>
 */

const fs = require('fs');
const path = require('path');

// Skill.md 必需的部分
const REQUIRED_SECTIONS = [
  '# Skill:',
  '## 使用场景',
  '## 技术栈约定',
  '## 输出要求'
];

// 建议的部分
const RECOMMENDED_SECTIONS = [
  '## 项目结构规范',
  '## 代码规范',
  '## 业务逻辑模板',
  '## 常见场景处理',
  '## 测试规范',
  '## 部署配置',
  '## 版本更新记录'
];

// 验证函数
function validateSkillFile(filePath) {
  console.log(`🔍 验证文件: ${filePath}`);

  if (!fs.existsSync(filePath)) {
    console.error(`❌ 文件不存在: ${filePath}`);
    return false;
  }

  const content = fs.readFileSync(filePath, 'utf-8');
  const lines = content.split('\n');

  let hasErrors = false;
  const foundSections = [];
  const missingRequired = [];
  const missingRecommended = [];

  // 检查必需部分
  for (const section of REQUIRED_SECTIONS) {
    if (content.includes(section)) {
      foundSections.push(section);
    } else {
      missingRequired.push(section);
      hasErrors = true;
    }
  }

  // 检查建议部分
  for (const section of RECOMMENDED_SECTIONS) {
    if (content.includes(section)) {
      foundSections.push(section);
    } else {
      missingRecommended.push(section);
    }
  }

  // 检查文件扩展名
  if (!filePath.endsWith('.skill.md') && !filePath.endsWith('.skill.md')) {
    console.warn('⚠️  建议使用 .skill.md 作为文件扩展名');
  }

  // 检查是否包含代码示例
  const hasCodeExamples = content.includes('```typescript') || content.includes('```javascript') || content.includes('```jsx');

  // 输出结果
  console.log('\n📊 验证结果:');
  console.log(`📁 文件: ${path.basename(filePath)}`);
  console.log(`📏 大小: ${content.length} 字符, ${lines.length} 行`);

  if (foundSections.length > 0) {
    console.log('\n✅ 找到的部分:');
    foundSections.forEach(section => {
      console.log(`  - ${section}`);
    });
  }

  if (missingRequired.length > 0) {
    console.log('\n❌ 缺失的必需部分:');
    missingRequired.forEach(section => {
      console.log(`  - ${section}`);
    });
  }

  if (missingRecommended.length > 0) {
    console.log('\n⚠️  缺失的建议部分:');
    missingRecommended.forEach(section => {
      console.log(`  - ${section}`);
    });
  }

  console.log(`\n💻 代码示例: ${hasCodeExamples ? '✅ 有' : '⚠️  无'}`);

  // 检查Skill名称格式
  const skillNameMatch = content.match(/^# Skill:\s*(.+)$/m);
  if (skillNameMatch) {
    const skillName = skillNameMatch[1].trim();
    console.log(`🏷️  Skill名称: ${skillName}`);

    if (!skillName || skillName === '[技能名称]') {
      console.warn('⚠️  Skill名称需要自定义，不能使用占位符');
    }
  } else {
    console.error('❌ 未找到Skill名称（# Skill: 标题）');
    hasErrors = true;
  }

  // 检查使用场景描述
  const usageScenarioMatch = content.match(/## 使用场景\s*\n([^#]+)/);
  if (usageScenarioMatch) {
    const scenarioText = usageScenarioMatch[1].trim();
    const scenarioLines = scenarioText.split('\n').filter(line => line.trim());

    if (scenarioLines.length < 2) {
      console.warn('⚠️  使用场景描述过于简单，建议详细说明适用场景');
    }
  }

  // 检查技术栈约定
  const techStackMatch = content.match(/## 技术栈约定\s*\n([^#]+)/);
  if (techStackMatch) {
    const techStackText = techStackMatch[1].trim();

    // 检查是否包含版本号
    const hasVersions = techStackText.match(/\d+\.\d+/g);
    if (!hasVersions || hasVersions.length < 2) {
      console.warn('⚠️  技术栈建议包含版本号，如：React 18.x, TypeScript 5.x');
    }
  }

  // 检查输出要求
  const outputRequirementsMatch = content.match(/## 输出要求\s*\n([^#]+)/);
  if (outputRequirementsMatch) {
    const requirementsText = outputRequirementsMatch[1].trim();
    const requirementLines = requirementsText.split('\n').filter(line => line.trim().startsWith('1.') || line.trim().startsWith('-'));

    if (requirementLines.length < 3) {
      console.warn('⚠️  输出要求建议至少包含3条具体要求');
    }
  }

  // 总结
  console.log('\n📋 验证总结:');
  if (hasErrors) {
    console.error('❌ 验证失败：缺少必需部分');
    console.error('   必需修复以上错误才能使用该Skill');
    return false;
  } else if (missingRecommended.length > 3) {
    console.warn('⚠️  验证通过，但建议补充缺失的部分');
    return true;
  } else {
    console.log('✅ 验证通过！');
    return true;
  }
}

// 批量验证目录
function validateSkillDirectory(dirPath) {
  console.log(`📂 验证目录: ${dirPath}`);

  if (!fs.existsSync(dirPath)) {
    console.error(`❌ 目录不存在: ${dirPath}`);
    return;
  }

  const files = fs.readdirSync(dirPath);
  const skillFiles = files.filter(file => file.endsWith('.skill.md'));

  if (skillFiles.length === 0) {
    console.log('ℹ️  目录中没有找到 .skill.md 文件');
    return;
  }

  console.log(`📄 找到 ${skillFiles.length} 个Skill文件:\n`);

  let passed = 0;
  let failed = 0;

  for (const file of skillFiles) {
    const filePath = path.join(dirPath, file);
    const isValid = validateSkillFile(filePath);

    if (isValid) {
      passed++;
    } else {
      failed++;
    }

    console.log('─'.repeat(50) + '\n');
  }

  console.log('📈 批量验证结果:');
  console.log(`✅ 通过: ${passed} 个文件`);
  console.log(`❌ 失败: ${failed} 个文件`);
  console.log(`📊 总计: ${skillFiles.length} 个文件`);

  return failed === 0;
}

// 主函数
function main() {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    console.log('📝 Skill.md 验证工具');
    console.log('\n使用方法:');
    console.log('  node validate-skill.js <skill-file-path>    验证单个文件');
    console.log('  node validate-skill.js --dir <directory>    验证目录下的所有文件');
    console.log('\n示例:');
    console.log('  node validate-skill.js ./my-skill.skill.md');
    console.log('  node validate-skill.js --dir ./.claude/skills');
    return;
  }

  if (args[0] === '--dir' || args[0] === '-d') {
    const dirPath = args[1] || '.';
    validateSkillDirectory(dirPath);
  } else {
    const filePath = args[0];
    validateSkillFile(filePath);
  }
}

// 执行
if (require.main === module) {
  main();
}

module.exports = {
  validateSkillFile,
  validateSkillDirectory,
  REQUIRED_SECTIONS,
  RECOMMENDED_SECTIONS
};