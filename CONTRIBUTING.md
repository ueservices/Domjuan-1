# Contributing to Portfolio Website

Thank you for your interest in contributing to this portfolio website project! This guide will help you get started.

## 🚀 Quick Start

### Prerequisites
- Node.js (version 18 or higher)
- npm or yarn
- Git
- Stripe account for testing (test mode)

### Development Setup

1. **Fork and Clone**
   ```bash
   git clone https://github.com/ueservices/Domjuan-1.git
   cd Domjuan-1
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   ```bash
   cp .env.example .env
   # Edit .env with your Stripe test keys
   ```

4. **Start Development Server**
   ```bash
   npm run dev
   ```

5. **Verify Setup**
   - Visit `http://localhost:3000`
   - Test payment flow with Stripe test cards

## 📋 Development Guidelines

### Code Style
- Use 2 spaces for indentation
- Use semicolons
- Prefer `const` and `let` over `var`
- Use template literals for string interpolation
- Follow existing naming conventions

### Commit Messages
Follow the conventional commits format:
- `feat:` for new features
- `fix:` for bug fixes
- `docs:` for documentation changes
- `style:` for formatting changes
- `refactor:` for code refactoring
- `test:` for adding tests
- `security:` for security-related changes

Example: `feat: add new service type for mobile app development`

### Branch Naming
- Feature branches: `feature/description`
- Bug fixes: `fix/issue-description`
- Documentation: `docs/update-readme`

## 🧪 Testing

### Manual Testing
1. **Payment Flow Testing**
   ```bash
   npm start
   ```
   - Test with Stripe test cards:
     - Success: `4242424242424242`
     - Decline: `4000000000000002`
     - Requires authentication: `4000000000003220`

2. **Security Testing**
   - Verify CSP headers are working
   - Test input validation
   - Check for exposed secrets

### Adding Tests
Currently, the project uses basic testing. To add proper tests:

1. **Install Testing Framework**
   ```bash
   npm install --save-dev jest supertest
   ```

2. **Create Test Files**
   - Place tests in `__tests__/` directory
   - Name test files with `.test.js` suffix

3. **Update package.json**
   ```json
   "scripts": {
     "test": "jest",
     "test:watch": "jest --watch"
   }
   ```

## 🔒 Security Guidelines

### Payment Processing
- **Never** expose Stripe secret keys
- Always validate payments server-side
- Use webhook signature verification
- Implement proper error handling without exposing sensitive data

### Environment Variables
- Use `.env` files for local development only
- Never commit `.env` files to version control
- Use platform environment variables for production
- Validate required environment variables at startup

### Input Validation
- Validate all user inputs
- Sanitize data before processing
- Use parameterized queries (if database is added)
- Implement rate limiting for production

## 📝 Documentation

### Code Documentation
- Use JSDoc comments for functions
- Document complex business logic
- Include examples for public APIs
- Update README.md for significant changes

### API Documentation
When adding new endpoints:
- Document request/response formats
- Include example requests
- Document error responses
- Update API section in README.md

## 🚀 Deployment

### Pre-deployment Checklist
- [ ] All tests pass
- [ ] Security audit completed (`npm audit`)
- [ ] Environment variables configured
- [ ] Stripe webhooks configured (if applicable)
- [ ] HTTPS certificate in place
- [ ] Error monitoring set up

### Deployment Process
1. **Staging Deployment**
   - Deploy to staging environment first
   - Test all functionality thoroughly
   - Verify payment processing with test data

2. **Production Deployment**
   - Switch to live Stripe keys
   - Update webhook endpoints
   - Monitor deployment logs
   - Verify all services are working

## 🐛 Issue Reporting

### Bug Reports
Include:
- Steps to reproduce
- Expected vs actual behavior
- Browser and OS information
- Screenshots if applicable
- Console error messages

### Feature Requests
Include:
- Clear description of the feature
- Use case or business justification
- Proposed implementation approach
- Any security considerations

## 📊 Performance Guidelines

### Frontend Performance
- Optimize images and assets
- Minimize HTTP requests
- Use efficient CSS selectors
- Avoid blocking JavaScript

### Backend Performance
- Implement proper caching strategies
- Use database indexing (if applicable)
- Monitor response times
- Implement pagination for large datasets

## 🤝 Code Review Process

### Before Submitting PR
- [ ] Code follows style guidelines
- [ ] All tests pass
- [ ] Documentation updated
- [ ] Security review completed
- [ ] Manual testing performed

### PR Review Checklist
- [ ] Code quality and readability
- [ ] Security implications reviewed
- [ ] Tests cover new functionality
- [ ] Documentation is adequate
- [ ] Performance impact considered

## 🎯 Project Roadmap

### Planned Features
- Enhanced testing suite
- Performance monitoring
- Additional payment methods
- Mobile app support
- Analytics integration

### Technical Debt
- Add comprehensive test coverage
- Implement proper logging
- Add monitoring and alerting
- Optimize build process
- Enhance error handling

## 💬 Getting Help

- **Documentation**: Check README.md and project wiki
- **Issues**: Search existing issues before creating new ones
- **Discussions**: Use GitHub Discussions for questions
- **Security**: Email security issues privately to maintainers

## 📜 License

By contributing to this project, you agree that your contributions will be licensed under the MIT License.

---

Thank you for contributing to make this project better! 🎉