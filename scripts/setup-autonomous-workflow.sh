#!/bin/bash

# Setup script for autonomous PR management workflow
# This script helps configure the repository for complete automation

set -e

echo "🤖 Setting up Autonomous PR Management Workflow"
echo "=============================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

# Check if we're in a git repository
if [ ! -d ".git" ]; then
    print_error "This script must be run from the root of a git repository"
    exit 1
fi

# Check if GitHub CLI is available
if ! command -v gh &> /dev/null; then
    print_warning "GitHub CLI not found. Some features may not work."
    print_info "Install GitHub CLI: https://cli.github.com/"
else
    print_status "GitHub CLI is available"
fi

# Verify required files exist
print_info "Checking required files..."

required_files=(
    ".github/workflows/autonomous-pr-management.yml"
    ".github/branch-protection-config.json"
    "tests/bot-manager.test.js"
    "tests/server.test.js"
)

for file in "${required_files[@]}"; do
    if [ -f "$file" ]; then
        print_status "Found: $file"
    else
        print_error "Missing: $file"
        exit 1
    fi
done

# Test the current setup
print_info "Running validation tests..."
if npm test; then
    print_status "All tests pass - system is ready for autonomous operation"
else
    print_error "Tests failed - please fix issues before enabling autonomous workflow"
    exit 1
fi

# Check if branch protection should be enabled
if command -v gh &> /dev/null && gh auth status &> /dev/null; then
    echo
    read -p "Enable branch protection rules for main branch? (y/n): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        print_info "Setting up branch protection..."
        
        # Enable branch protection (this requires admin access)
        gh api repos/:owner/:repo/branches/main/protection \
            --method PUT \
            --input .github/branch-protection-config.json || {
            print_warning "Could not set branch protection (may require admin access)"
        }
    fi
fi

# Create .env.example if it doesn't exist
if [ ! -f ".env.example" ]; then
    print_info "Creating .env.example..."
    cat > .env.example << EOF
# Environment variables for autonomous workflow
NODE_ENV=production
PORT=3000

# GitHub Actions secrets (set these in repository settings)
# GITHUB_TOKEN=<automatically provided>
# HEROKU_API_KEY=<your-heroku-api-key>
# HEROKU_APP_NAME=<your-heroku-app-name>
# HEROKU_EMAIL=<your-heroku-email>
# VERCEL_TOKEN=<your-vercel-token>
# ORG_ID=<your-vercel-org-id>
# PROJECT_ID=<your-vercel-project-id>

# Stripe settings (if using payment features)
# STRIPE_SECRET_KEY=<your-stripe-secret-key>
# STRIPE_PUBLISHABLE_KEY=<your-stripe-publishable-key>
# STRIPE_WEBHOOK_SECRET=<your-stripe-webhook-secret>
EOF
    print_status "Created .env.example"
fi

# Update .gitignore
if [ -f ".gitignore" ]; then
    if ! grep -q "# Autonomous workflow" .gitignore; then
        print_info "Updating .gitignore..."
        cat >> .gitignore << EOF

# Autonomous workflow
.env
*.log
coverage/
.nyc_output/
test-results/
EOF
        print_status "Updated .gitignore"
    fi
fi

echo
print_status "Autonomous PR management workflow setup complete!"
echo
print_info "Next steps:"
echo "1. 🔧 Configure repository secrets in GitHub Settings > Secrets and variables > Actions"
echo "2. 🛡️  Review branch protection settings if you have admin access"
echo "3. 🚀 Create a test PR with '[auto]' in the title to test the workflow"
echo "4. 📊 Monitor the Actions tab to see autonomous workflow execution"
echo
print_info "The workflow will now:"
echo "   • ✅ Automatically test all PRs"
echo "   • 🔍 Run security scans"
echo "   • 🤖 Auto-approve and merge passing PRs"
echo "   • 🚀 Deploy to production automatically"
echo "   • 🧹 Clean up and maintain the repository"
echo
print_warning "Important: Review the workflow settings in .github/workflows/autonomous-pr-management.yml"
print_warning "Make sure you're comfortable with the automation level before enabling in production!"