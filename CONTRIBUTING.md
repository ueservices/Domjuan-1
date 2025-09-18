# Contributing to Portfolio Website

Thank you for your interest in contributing to this project! This guide will help you get started and ensure your contributions align with our standards and security practices.

## Getting Started

### Prerequisites
- Node.js 18 or higher
- npm package manager
- Stripe account for payment processing testing
- Basic understanding of Express.js and payment processing security

### Development Setup

1. **Fork and clone the repository**
   ```bash
   git clone https://github.com/your-username/Domjuan-1.git
   cd Domjuan-1
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your Stripe test keys
   ```

4. **Run development server**
   ```bash
   npm run dev
   ```

## GitHub Copilot Integration

This repository is optimized for GitHub Copilot Coding Agent assistance:

- **Configuration**: See `.github/copilot-instructions.md` for agent guidelines
- **Context**: The agent understands payment processing patterns and security requirements
- **Security**: Agent is configured to prioritize PCI compliance and secure coding practices

### Working with Copilot
- Use structured commit messages and PR descriptions
- Follow existing code patterns for consistency
- Security-sensitive changes will be flagged for human review

## Code Standards

### Linting and Quality
- Run `npm run lint` before committing
- Address linting warnings when possible
- Use `npm test` to run quality checks

### Security Requirements
- **Never commit secrets**: Use environment variables only
- **Payment validation**: Validate all payment amounts server-side
- **Input sanitization**: Sanitize and validate all user inputs
- **Error handling**: Don't expose sensitive information in error messages

### Code Style
- Follow existing patterns in the codebase
- Use meaningful variable and function names
- Add comments for complex payment processing logic
- Maintain existing indentation and formatting

## Contribution Process

### 1. Issue Creation
- Use issue templates for bugs, features, or security concerns
- For security issues, consider private reporting
- Reference existing code and provide clear reproduction steps

### 2. Pull Request Workflow
1. **Create feature branch**: `git checkout -b feature/your-feature-name`
2. **Make changes**: Follow code standards and security practices
3. **Test thoroughly**: Test payment flows with Stripe test cards
4. **Run quality checks**: `npm test` and `npm run lint`
5. **Create pull request**: Use the PR template
6. **Code review**: Address feedback from code owners

### 3. Review Requirements
- All PRs require approval from code owners (defined in CODEOWNERS)
- Security-sensitive changes need additional review
- CI/CD checks must pass (linting, security audit)
- Testing with Stripe test environment required for payment changes

## Testing Guidelines

### Manual Testing
- Test all payment flows with Stripe test cards
- Verify error handling and edge cases  
- Test responsive design on mobile devices
- Validate environment variable handling

### Test Cards
Use these Stripe test cards:
- **Success**: `4242424242424242`
- **Decline**: `4000000000000002`
- **Authentication required**: `4000002500003155`

### Security Testing
- Run `npm run security-check` for vulnerability scanning
- Test webhook signature verification
- Validate HTTPS requirements
- Test CSP and CORS configurations

## Security Considerations

### Payment Processing
- Always use Stripe test mode during development
- Never log sensitive payment information
- Implement proper webhook signature verification
- Follow PCI compliance guidelines

### Code Security
- Use parameterized queries (when applicable)
- Implement proper input validation
- Use security headers (already configured)
- Regular dependency updates via Dependabot

## Documentation

- Update README.md for significant changes
- Add inline comments for complex logic
- Update API documentation if endpoints change
- Maintain SECURITY.md for security-related changes

## Release Process

### Automated Updates
- Dependabot manages dependency updates
- Security patches are automatically prioritized
- GitHub Actions handles CI/CD pipeline

### Deployment
- Main branch automatically deploys to production
- Environment-specific configuration via hosting platform
- Pre-deployment security checks required

## Getting Help

- **Documentation**: Check README.md and SECURITY.md
- **Issues**: Search existing issues before creating new ones
- **Code Review**: Code owners will provide guidance during PR review
- **Security**: For security concerns, see SECURITY.md

## Code of Conduct

- Be respectful and professional in all interactions
- Focus on constructive feedback during code reviews
- Prioritize security and user experience
- Follow existing patterns and conventions

Thank you for contributing to making this project better and more secure!