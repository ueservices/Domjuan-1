#!/usr/bin/env node

/**
 * Validation script for autonomous workflow setup
 * Checks that all components are properly configured
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 Validating Autonomous Workflow Setup...\n');

let errors = 0;
let warnings = 0;

function checkFile(filePath, description, required = true) {
  if (fs.existsSync(filePath)) {
    console.log(`✅ ${description}: ${filePath}`);
    return true;
  } else {
    if (required) {
      console.log(`❌ Missing required file: ${filePath} (${description})`);
      errors++;
    } else {
      console.log(`⚠️  Optional file missing: ${filePath} (${description})`);
      warnings++;
    }
    return false;
  }
}

function checkDirectory(dirPath, description) {
  if (fs.existsSync(dirPath) && fs.statSync(dirPath).isDirectory()) {
    console.log(`✅ ${description}: ${dirPath}`);
    return true;
  } else {
    console.log(`❌ Missing directory: ${dirPath} (${description})`);
    errors++;
    return false;
  }
}

function checkPackageJson() {
  try {
    const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
    
    // Check scripts
    const requiredScripts = ['test', 'test:bot', 'test:server'];
    for (const script of requiredScripts) {
      if (packageJson.scripts && packageJson.scripts[script]) {
        console.log(`✅ Package.json script: ${script}`);
      } else {
        console.log(`❌ Missing package.json script: ${script}`);
        errors++;
      }
    }
    
    // Check dependencies
    const requiredDeps = ['express', 'socket.io', 'cors', 'helmet'];
    for (const dep of requiredDeps) {
      if (packageJson.dependencies && packageJson.dependencies[dep]) {
        console.log(`✅ Dependency: ${dep}`);
      } else {
        console.log(`❌ Missing dependency: ${dep}`);
        errors++;
      }
    }
    
  } catch (error) {
    console.log(`❌ Error reading package.json: ${error.message}`);
    errors++;
  }
}

// Main validation
console.log('📁 Checking required files and directories:\n');

// Core workflow files
checkFile('.github/workflows/autonomous-pr-management.yml', 'Main autonomous workflow');
checkFile('.github/branch-protection-config.json', 'Branch protection configuration');

// Test files
checkDirectory('tests', 'Tests directory');
checkFile('tests/bot-manager.test.js', 'Bot manager tests');
checkFile('tests/server.test.js', 'Server integration tests');

// Scripts
checkDirectory('scripts', 'Scripts directory');
checkFile('scripts/setup-autonomous-workflow.sh', 'Setup script');
checkFile('scripts/validate-setup.js', 'Validation script');

// Documentation
checkFile('AUTONOMOUS_WORKFLOW.md', 'Autonomous workflow documentation');
checkFile('README.md', 'Main README');

// Core application files
checkFile('server.js', 'Main server file');
checkFile('bots/botManager.js', 'Bot manager');
checkFile('package.json', 'Package configuration');

// Optional files
checkFile('.env.example', 'Environment template', false);
checkFile('.gitignore', 'Git ignore file', false);

console.log('\n📦 Checking package.json configuration:\n');
checkPackageJson();

console.log('\n🔧 Checking executable permissions:\n');
try {
  const setupScript = 'scripts/setup-autonomous-workflow.sh';
  const stats = fs.statSync(setupScript);
  const isExecutable = !!(stats.mode & parseInt('111', 8));
  
  if (isExecutable) {
    console.log(`✅ Setup script is executable: ${setupScript}`);
  } else {
    console.log(`⚠️  Setup script not executable: ${setupScript}`);
    console.log('   Run: chmod +x scripts/setup-autonomous-workflow.sh');
    warnings++;
  }
} catch (error) {
  console.log(`❌ Could not check setup script permissions: ${error.message}`);
  errors++;
}

// Summary
console.log('\n📊 Validation Summary:');
console.log(`==================`);

if (errors === 0 && warnings === 0) {
  console.log('🎉 Perfect! All components are properly configured.');
  console.log('✅ Autonomous workflow is ready for production use.');
} else if (errors === 0) {
  console.log(`⚠️  Setup is mostly complete with ${warnings} warning(s).`);
  console.log('✅ Autonomous workflow should work but check warnings above.');
} else {
  console.log(`❌ Setup incomplete with ${errors} error(s) and ${warnings} warning(s).`);
  console.log('🔧 Please fix the errors above before using the autonomous workflow.');
}

console.log('\n🚀 Next steps:');
console.log('1. Run: ./scripts/setup-autonomous-workflow.sh');
console.log('2. Configure GitHub repository secrets');
console.log('3. Test with a PR titled "[auto] Test workflow"');
console.log('4. Monitor the Actions tab for autonomous execution');

process.exit(errors > 0 ? 1 : 0);