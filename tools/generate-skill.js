#!/usr/bin/env node

/**
 * Skill.md 文件生成工具
 *
 * 根据模板快速生成新的Skill.md文件
 *
 * 使用方法：
 * node generate-skill.js <skill-name> [template]
 * 或
 * npm run generate -- <skill-name> [template]
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');

// 模板定义
const TEMPLATES = {
  minimal: {
    name: 'minimal',
    description: '最小模板 - 包含必需的基本结构',
    file: '../templates/minimal-skill.md'
  },
  detailed: {
    name: 'detailed',
    description: '详细模板 - 包含所有推荐部分',
    file: '../templates/detailed-skill.md'
  },
  team: {
    name: 'team',
    description: '团队规范模板 - 适合团队开发规范',
    file: '../templates/team-standard.md'
  },
  component: {
    name: 'component',
    description: '组件封装模板 - 适合UI组件封装规范',
    file: '../.claude/skills/component-wrapper.skill.md'
  },
  form: {
    name: 'form',
    description: '表单生成模板 - 适合表单组件生成',
    file: '../.claude/skills/form-generator.skill.md'
  },
  crud: {
    name: 'crud',
    description: 'CRUD模板 - 适合业务CRUD模块',
    file: '../.claude/skills/crud-template.skill.md'
  }
};

// 交互式创建
async function createSkillInteractive() {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  console.log('🎯 创建新的Skill.md文件\n');

  // 获取Skill名称
  const skillName = await askQuestion(rl, '1. 输入Skill名称（如：用户管理规范）: ');

  // 选择模板
  console.log('\n2. 选择模板:');
  Object.values(TEMPLATES).forEach((template, index) => {
    console.log(`   ${index + 1}. ${template.name} - ${template.description}`);
  });

  const templateChoice = await askQuestion(rl, `\n选择模板 (1-${Object.values(TEMPLATES).length}): `);
  const templateIndex = parseInt(templateChoice) - 1;

  if (isNaN(templateIndex) || templateIndex < 0 || templateIndex >= Object.values(TEMPLATES).length) {
    console.error('❌ 无效的模板选择');
    rl.close();
    return;
  }

  const selectedTemplate = Object.values(TEMPLATES)[templateIndex];

  // 获取输出路径
  const defaultPath = `./${skillName.replace(/\s+/g, '-').toLowerCase()}.skill.md`;
  const outputPath = await askQuestion(rl, `\n3. 输出文件路径 [${defaultPath}]: `) || defaultPath;

  // 确认信息
  console.log('\n📋 创建信息:');
  console.log(`   Skill名称: ${skillName}`);
  console.log(`   使用模板: ${selectedTemplate.name}`);
  console.log(`   输出路径: ${outputPath}`);

  const confirm = await askQuestion(rl, '\n确认创建？(y/N): ');
  if (confirm.toLowerCase() !== 'y') {
    console.log('❌ 已取消');
    rl.close();
    return;
  }

  rl.close();

  // 生成文件
  generateSkillFile(skillName, selectedTemplate.file, outputPath);
}

// 生成Skill文件
function generateSkillFile(skillName, templatePath, outputPath) {
  console.log(`\n🔧 正在生成Skill文件...`);

  try {
    // 读取模板
    const absoluteTemplatePath = path.join(__dirname, templatePath);
    if (!fs.existsSync(absoluteTemplatePath)) {
      console.error(`❌ 模板文件不存在: ${templatePath}`);
      return;
    }

    let content = fs.readFileSync(absoluteTemplatePath, 'utf-8');

    // 替换Skill名称
    content = content.replace(/^# Skill: \[技能名称\]/m, `# Skill: ${skillName}`);

    // 替换占位符
    content = content.replace(/\[技能名称\]/g, skillName);
    content = content.replace(/\[团队名称\]/g, '你的团队名称');
    content = content.replace(/\[负责人姓名\]/g, '负责人姓名');

    // 添加生成信息
    const generationInfo = `\n\n<!--\n生成信息:\n- 生成时间: ${new Date().toISOString()}\n- 使用模板: ${path.basename(templatePath)}\n- 工具: generate-skill.js\n-->`;

    content = content.replace(/(\n<!--)/, generationInfo + '$1');

    // 确保目录存在
    const outputDir = path.dirname(outputPath);
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    // 写入文件
    fs.writeFileSync(outputPath, content, 'utf-8');

    console.log(`✅ 成功生成: ${outputPath}`);
    console.log(`📏 文件大小: ${content.length} 字符`);

    // 显示下一步建议
    console.log('\n💡 下一步建议:');
    console.log('   1. 编辑生成的文件，补充具体内容');
    console.log('   2. 运行验证工具检查格式:');
    console.log(`      node tools/validate-skill.js ${outputPath}`);
    console.log('   3. 将文件放入 .claude/skills/ 目录使用');

  } catch (error) {
    console.error(`❌ 生成失败: ${error.message}`);
  }
}

// 批量生成示例
function generateExamples() {
  console.log('📚 生成示例Skill文件...\n');

  const examples = [
    {
      name: 'React组件开发规范',
      template: 'detailed',
      path: './examples/react-component.skill.md'
    },
    {
      name: 'API接口规范',
      template: 'team',
      path: './examples/api-standard.skill.md'
    },
    {
      name: '移动端H5开发规范',
      template: 'detailed',
      path: './examples/mobile-h5.skill.md'
    },
    {
      name: '微前端架构规范',
      template: 'team',
      path: './examples/micro-frontend.skill.md'
    }
  ];

  examples.forEach((example, index) => {
    console.log(`生成示例 ${index + 1}: ${example.name}`);
    const template = TEMPLATES[example.template];
    if (template) {
      generateSkillFile(example.name, template.file, example.path);
      console.log('');
    }
  });

  console.log('✅ 示例生成完成！');
}

// 辅助函数：提问
function askQuestion(rl, question) {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer.trim());
    });
  });
}

// 显示帮助信息
function showHelp() {
  console.log('🚀 Skill.md 生成工具\n');
  console.log('使用方法:');
  console.log('  node generate-skill.js                     交互式创建');
  console.log('  node generate-skill.js <name> [template]  快速创建');
  console.log('  node generate-skill.js --examples         生成示例文件');
  console.log('  node generate-skill.js --help             显示帮助\n');
  console.log('可用模板:');
  Object.values(TEMPLATES).forEach(template => {
    console.log(`  ${template.name.padEnd(12)} ${template.description}`);
  });
  console.log('\n示例:');
  console.log('  node generate-skill.js "用户表单规范" form');
  console.log('  node generate-skill.js "团队开发规范" team');
  console.log('  node generate-skill.js --examples');
}

// 主函数
function main() {
  const args = process.argv.slice(2);

  if (args.length === 0 || args[0] === '--interactive' || args[0] === '-i') {
    createSkillInteractive();
  } else if (args[0] === '--examples' || args[0] === '-e') {
    generateExamples();
  } else if (args[0] === '--help' || args[0] === '-h') {
    showHelp();
  } else if (args.length >= 1) {
    const skillName = args[0];
    const templateName = args[1] || 'minimal';
    const template = TEMPLATES[templateName];

    if (!template) {
      console.error(`❌ 未知模板: ${templateName}`);
      console.log('可用模板:', Object.keys(TEMPLATES).join(', '));
      return;
    }

    const outputPath = `./${skillName.replace(/\s+/g, '-').toLowerCase()}.skill.md`;
    generateSkillFile(skillName, template.file, outputPath);
  }
}

// 执行
if (require.main === module) {
  main();
}

module.exports = {
  generateSkillFile,
  createSkillInteractive,
  generateExamples,
  TEMPLATES
};