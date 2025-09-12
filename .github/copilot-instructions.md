# GitHub Copilot Instructions

## Repository Overview

This is a dual-language project featuring both a **Node.js portfolio website** (primary) with payment processing capabilities and **Python utility components** for demonstrations and tooling.

## Project Structure

### Node.js Components (Primary)
- `server.js` - Express server with Stripe integration
- `package.json` - Node.js dependencies and scripts  
- `index.html`, `styles.css`, `script.js` - Frontend portfolio website
- `.env.example` - Environment variables template for Stripe keys

### Python Components (Secondary)
- `utils.py` - Python utility functions with type hints
- `test_utils.py` - Pytest test suite
- `requirements.txt` - Python dependencies for development tools
- `.flake8`, `pyproject.toml` - Python code quality configuration

### CI/CD Workflows
- `.github/workflows/deploy.yml` - Node.js deployment pipeline (Heroku/Vercel)
- `.github/workflows/ci.yml` - Python testing and code quality checks

## Development Guidelines

### Node.js Development (Primary Focus)
- Use modern Node.js (18.x+) - avoid deprecated versions
- Follow Express.js best practices for the server
- Use environment variables for sensitive data (Stripe keys)
- Test locally before deployment
- Payment processing uses Stripe - ensure secure API key handling

### Python Development (Supplementary)  
- Follow PEP 8 style guidelines (88-character line length)
- Use type hints consistently
- Write comprehensive tests with pytest
- Use Black for code formatting
- Use flake8 for linting
- All Python code should pass CI checks

### CI/CD Best Practices
- Node.js pipeline should test across supported versions (18.x, 20.x, 22.x)
- Python pipeline should test across Python 3.8-3.11
- Both pipelines should run on pull requests
- Deployment only triggers from main branch
- Use dependency caching for faster builds

## Security Considerations
- Never commit actual API keys or secrets
- Use environment variables for configuration
- Regularly audit dependencies for vulnerabilities
- Follow OWASP security guidelines for web applications

## Deployment Notes
- Primary deployment target is Heroku or Vercel for the Node.js app
- Python components are primarily for development/tooling
- Ensure all environment variables are configured in deployment platform
- Test payment processing in Stripe test mode first

## Code Review Focus Areas
1. Security - API key handling, input validation
2. Performance - Bundle size, dependency management
3. Code Quality - Linting, formatting, type safety
4. Testing - Coverage, edge cases, integration tests
5. Documentation - Clear README, inline comments where needed

## Common Commands

### Node.js
```bash
npm install          # Install dependencies
npm start           # Start production server
npm run dev         # Start development server with nodemon
npm test            # Run tests (currently placeholder)
npm audit           # Check for security vulnerabilities
```

### Python
```bash
pip install -r requirements.txt  # Install Python dev tools
python utils.py                  # Run utility demo
pytest -v                       # Run test suite
black .                         # Format code
flake8 .                        # Lint code
```

This project demonstrates modern full-stack development practices with proper CI/CD, security considerations, and code quality tooling.