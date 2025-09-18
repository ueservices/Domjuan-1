# Local Development Setup Guide

This guide will help you set up a complete local development environment for the Portfolio Website project.

## Prerequisites

### Required Software
- **Node.js** (version 18 or higher)
  ```bash
  # Check version
  node --version
  
  # Install via nvm (recommended)
  curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
  nvm install 18
  nvm use 18
  ```

- **npm** (comes with Node.js)
  ```bash
  npm --version
  ```

- **Git**
  ```bash
  git --version
  ```

### Recommended Tools
- **Visual Studio Code** with extensions:
  - ESLint
  - Prettier
  - JavaScript (ES6) code snippets
  - Node.js Extension Pack
  - Thunder Client (for API testing)

## Initial Setup

### 1. Clone and Setup Repository
```bash
# Clone the repository
git clone https://github.com/ueservices/Domjuan-1.git
cd Domjuan-1

# Install dependencies
npm install

# Create environment file
cp .env.example .env
```

### 2. Stripe Account Setup
1. Create a Stripe account at [stripe.com](https://stripe.com)
2. Navigate to Dashboard → Developers → API keys
3. Copy your test keys (they start with `pk_test_` and `sk_test_`)
4. Update your `.env` file:

```env
STRIPE_SECRET_KEY=sk_test_your_actual_secret_key_here
STRIPE_PUBLISHABLE_KEY=pk_test_your_actual_publishable_key_here
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_here
PORT=3000
NODE_ENV=development
```

### 3. Verify Installation
```bash
# Run tests
npm test

# Check code quality
npm run lint

# Start development server
npm run dev
```

## Development Workflow

### Daily Development Process
1. **Start Development Session**
   ```bash
   # Update from main branch
   git checkout main
   git pull origin main
   
   # Create feature branch
   git checkout -b feature/your-feature-name
   
   # Start development server
   npm run dev
   ```

2. **During Development**
   - Server runs at `http://localhost:3000`
   - Server auto-reloads on file changes
   - Check console for errors
   - Use browser dev tools for debugging

3. **Before Committing**
   ```bash
   # Check code quality
   npm run lint
   npm run lint:fix  # Auto-fix issues
   
   # Run tests
   npm test
   
   # Test manually in browser
   npm run dev
   ```

### Testing Payment Integration

#### Test Cards (Stripe Test Mode)
- **Success**: `4242424242424242`
- **Decline**: `4000000000000002`
- **Requires 3D Secure**: `4000000000003220`
- **Insufficient funds**: `4000000000009995`

#### Test Process
1. Start development server: `npm run dev`
2. Navigate to `http://localhost:3000`
3. Select a service and click "Purchase"
4. Use test card numbers above
5. Check Stripe Dashboard → Payments for transactions

### Code Quality Standards

#### ESLint Configuration
The project uses ESLint for code quality:
```bash
# Check for issues
npm run lint

# Auto-fix formatting issues
npm run lint:fix
```

#### Key Rules
- 2-space indentation
- Single quotes for strings
- Semicolons required
- No unused variables (prefix with `_` if intentional)
- Prefer `const` and `let` over `var`

### Testing

#### Running Tests
```bash
# Run all tests
npm test

# Run tests in watch mode (reruns on changes)
npm run test:watch

# Run tests with coverage
npm test -- --coverage
```

#### Test Structure
- Unit tests in `__tests__/` directory
- Server endpoint tests in `__tests__/server.test.js`
- Payment logic tests in `__tests__/payment.test.js`
- Mocked Stripe API to avoid network calls

#### Writing Tests
```javascript
// Example test
describe('Feature Name', () => {
  test('should do something specific', async () => {
    const response = await request(app)
      .get('/endpoint')
      .expect(200);
    
    expect(response.body).toHaveProperty('expectedField');
  });
});
```

## Project Structure Deep Dive

### Frontend Files
- `index.html`: Main portfolio page with service selection
- `styles.css`: Responsive CSS with mobile-first design
- `script.js`: Client-side JavaScript with Stripe integration

### Backend Files
- `server.js`: Express server with payment endpoints
- `package.json`: Dependencies and scripts
- `.env.example`: Environment variable template

### Configuration Files
- `.eslintrc.json`: ESLint configuration
- `.gitignore`: Git ignore patterns
- `__tests__/setup.js`: Jest test environment setup

### Documentation
- `README.md`: Main project documentation
- `CONTRIBUTING.md`: Contributor guidelines
- `SECURITY.md`: Security practices and deployment
- `BEST_PRACTICES.md`: Code quality and development practices
- `.github/copilot-instructions.md`: Copilot coding guidelines

## Troubleshooting

### Common Issues

#### Port Already in Use
```bash
# Kill process using port 3000
lsof -ti:3000 | xargs kill -9

# Or use different port
PORT=3001 npm run dev
```

#### Stripe Key Issues
- Verify keys are correctly copied (no extra spaces)
- Ensure using test keys (start with `pk_test_` and `sk_test_`)
- Check Stripe dashboard for key status

#### Module Not Found Errors
```bash
# Clear npm cache and reinstall
rm -rf node_modules package-lock.json
npm install
```

#### Test Failures
```bash
# Run tests with verbose output
npm test -- --verbose

# Run specific test file
npm test -- __tests__/server.test.js
```

### Environment Issues

#### Node.js Version
```bash
# Check current version
node --version

# Update to required version
nvm install 18
nvm use 18
```

#### npm Permissions
```bash
# Fix npm permissions (macOS/Linux)
sudo chown -R $(whoami) ~/.npm
```

### Debugging Tips

#### Server Debugging
1. Check console output from `npm run dev`
2. Verify environment variables: `console.log(process.env.STRIPE_SECRET_KEY)`
3. Use browser dev tools Network tab
4. Check server logs for error details

#### Frontend Debugging
1. Open browser dev tools (F12)
2. Check Console tab for JavaScript errors
3. Check Network tab for failed requests
4. Use Elements tab to inspect DOM changes

#### Payment Debugging
1. Check Stripe Dashboard → Logs
2. Verify webhook endpoints (if using)
3. Test with different card numbers
4. Check payment intent status in Stripe

## Advanced Development

### VS Code Setup
Create `.vscode/settings.json`:
```json
{
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "javascript.preferences.quoteStyle": "single",
  "typescript.preferences.quoteStyle": "single"
}
```

### Git Hooks (Optional)
Install husky for pre-commit hooks:
```bash
npm install --save-dev husky
npx husky install
npx husky add .husky/pre-commit "npm run lint && npm test"
```

### Database Setup (Future Enhancement)
The project is ready for database integration:
```bash
# Example MongoDB setup
npm install mongoose
# Configure DATABASE_URL in .env
```

### Monitoring Setup (Production)
```bash
# Example monitoring setup
npm install --save morgan winston
# Add logging middleware to server.js
```

## Getting Help

### Resources
- [Node.js Documentation](https://nodejs.org/docs/)
- [Express.js Guide](https://expressjs.com/guide/)
- [Stripe Documentation](https://stripe.com/docs)
- [Jest Testing Framework](https://jestjs.io/docs/getting-started)

### Community
- Project Issues: [GitHub Issues](https://github.com/ueservices/Domjuan-1/issues)
- Stripe Community: [Stripe Discord](https://discord.gg/stripe)
- Node.js Community: [Node.js Discord](https://discord.gg/nodejs)

### Support
For project-specific questions:
1. Check existing documentation
2. Search GitHub issues
3. Create detailed issue with reproduction steps
4. Include environment details and error messages

---

Happy coding! 🚀