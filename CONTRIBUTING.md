# Contributing to Portfolio Website

Thank you for your interest in contributing to this project! This guide will help you get started with contributing effectively.

## Getting Started

### Prerequisites

Before you begin, make sure you have:
- Node.js (version 18.0.0 or higher)
- npm (comes with Node.js)
- Git
- A Stripe account (free test account)
- Basic knowledge of JavaScript, HTML, CSS

### Development Setup

1. **Fork the repository** on GitHub
2. **Clone your fork locally**:
   ```bash
   git clone https://github.com/YOUR_USERNAME/Domjuan-1.git
   cd Domjuan-1
   ```
3. **Set up the development environment**:
   ```bash
   npm install
   cp .env.example .env
   # Edit .env with your Stripe test keys
   ```
4. **Read the development guide**: See `DEVELOPMENT.md` for detailed setup instructions

## Development Workflow

### Before Making Changes

1. **Create a new branch** from `main`:
   ```bash
   git checkout main
   git pull origin main
   git checkout -b feature/your-feature-name
   ```

2. **Run the test suite** to ensure everything works:
   ```bash
   npm test
   npm run validate
   ```

### Making Changes

1. **Follow the coding standards** described in `.github/copilot-instructions.md`
2. **Write secure code** following guidelines in `SECURITY.md`
3. **Test thoroughly** with both success and error scenarios
4. **Update documentation** if your changes affect usage or setup

### Code Style Guidelines

#### JavaScript
- Use modern ES6+ syntax
- Prefer `const` and `let` over `var`
- Use descriptive variable and function names
- Add JSDoc comments for complex functions
- Handle errors gracefully with try-catch blocks
- Use async/await instead of .then() for promises

#### Security
- **Never commit secrets** or API keys
- Validate all user inputs on the server side
- Use HTTPS for all external requests
- Follow OWASP security guidelines
- Test with Stripe test keys only

#### HTML/CSS
- Write semantic HTML
- Ensure accessibility (ARIA labels, alt text)
- Mobile-first responsive design
- Follow existing CSS patterns and naming

### Testing Your Changes

#### Manual Testing Checklist
- [ ] Homepage loads without errors
- [ ] All navigation works correctly
- [ ] Payment forms function properly
- [ ] Test with Stripe test cards:
  - Success: `4242424242424242`
  - Declined: `4000000000000002`
- [ ] Error handling works correctly
- [ ] Mobile responsive design functions
- [ ] No console errors in browser developer tools

#### Automated Testing
```bash
# Run all tests
npm test

# Run specific test categories
npm run test:basic
npm run test:security
npm run test:syntax

# Validate entire codebase
npm run validate
```

#### Payment Testing
Always test payment flows with these test cards:
- **Success**: `4242424242424242` (Visa)
- **Declined**: `4000000000000002` (Generic decline)
- **Insufficient Funds**: `4000000000009995`
- **Expired Card**: `4000000000000069`

### Submitting Changes

1. **Run the full test suite**:
   ```bash
   npm run validate
   ```

2. **Commit your changes** with descriptive messages:
   ```bash
   git add .
   git commit -m "feat: add new payment service option"
   ```

3. **Push to your fork**:
   ```bash
   git push origin feature/your-feature-name
   ```

4. **Create a Pull Request** on GitHub:
   - Use a descriptive title
   - Explain what changes you made and why
   - Include screenshots for UI changes
   - Reference any related issues

## Types of Contributions

### Bug Fixes
- Fix existing functionality that isn't working
- Improve error handling
- Security vulnerability fixes
- Performance improvements

### New Features
- New payment service options
- UI/UX improvements
- New API endpoints
- Enhanced security features

### Documentation
- Improve README, setup guides, or code comments
- Add examples or tutorials
- Fix typos or unclear instructions

### Testing
- Add test cases for existing functionality
- Improve test coverage
- Add integration tests

## Pull Request Guidelines

### PR Title Format
Use conventional commit format:
- `feat: description of new feature`
- `fix: description of bug fix`
- `docs: description of documentation change`
- `test: description of test addition/change`
- `refactor: description of code refactoring`
- `security: description of security improvement`

### PR Description Template
```markdown
## Changes Made
Brief description of what was changed and why.

## Testing
- [ ] Manual testing completed
- [ ] Payment flows tested with test cards
- [ ] Automated tests pass
- [ ] Security scan completed

## Screenshots (if applicable)
Include screenshots for UI changes.

## Related Issues
Fixes #issue_number (if applicable)
```

## Code Review Process

### What We Look For
- **Security**: Are there any security vulnerabilities?
- **Testing**: Are changes properly tested?
- **Documentation**: Is documentation updated?
- **Code Quality**: Does code follow our standards?
- **Performance**: Does this impact site performance?

### Review Timeline
- Simple fixes: 1-2 days
- New features: 3-5 days
- Major changes: 1-2 weeks

## Development Best Practices

### Working with GitHub Copilot
- Review all AI-generated code carefully
- Test AI suggestions thoroughly
- Ensure security practices are maintained
- Verify code fits project patterns
- Add appropriate comments and documentation

### Security Considerations
- Always use test Stripe keys during development
- Never commit `.env` files
- Validate user inputs server-side
- Use HTTPS for all external communications
- Follow the security guidelines in `SECURITY.md`

### Performance Tips
- Optimize images for web
- Minimize HTTP requests
- Use appropriate caching headers
- Test on various devices and connections

## Getting Help

### Resources
- **Development Guide**: `DEVELOPMENT.md`
- **Security Guidelines**: `SECURITY.md`
- **Best Practices**: `BEST_PRACTICES.md`
- **Copilot Instructions**: `.github/copilot-instructions.md`

### Community
- Create an issue for questions or suggestions
- Check existing issues before creating new ones
- Be respectful and constructive in discussions

### Debugging
1. Check browser console for JavaScript errors
2. Review server logs in terminal
3. Verify environment variables are set correctly
4. Test API endpoints with curl or Postman
5. Check Stripe dashboard for payment issues

## Recognition

Contributors will be:
- Listed in commit history
- Mentioned in release notes for significant contributions
- Given credit in documentation improvements

## License

By contributing to this project, you agree that your contributions will be licensed under the same MIT License that covers the project.