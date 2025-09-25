# Security Policy

## Supported Versions

We actively maintain and provide security updates for the following versions:

| Version | Supported          |
| ------- | ------------------ |
| 1.x.x   | :white_check_mark: |
| < 1.0   | :x:                |

## Reporting a Vulnerability

We take security vulnerabilities seriously. If you discover a security vulnerability in the Domjuan Bot System, please report it responsibly:

### Private Reporting (Preferred)

1. **GitHub Security Advisories**: Use the "Security" tab in this repository to report vulnerabilities privately
2. **Email**: Send details to the repository maintainers (contact through GitHub issues)

### What to Include

When reporting a vulnerability, please include:

- Description of the vulnerability
- Steps to reproduce the issue
- Potential impact assessment
- Suggested fixes (if any)
- Your contact information

### Response Timeline

- **Initial Response**: Within 48 hours
- **Status Update**: Within 1 week
- **Resolution**: Depends on severity, typically within 30 days

### Security Best Practices

This project follows security best practices including:

- ✅ Automated dependency updates via Dependabot
- ✅ Regular security audits via `npm audit`
- ✅ Input validation and sanitization
- ✅ Secure headers via Helmet.js
- ✅ Environment variable protection
- ✅ Container security with non-root user
- ✅ Code quality enforcement via ESLint

### Disclosure Policy

- We will acknowledge receipt of vulnerability reports within 48 hours
- We will provide regular updates on our progress
- We will coordinate public disclosure after the vulnerability is fixed
- We appreciate responsible disclosure and will credit reporters (unless they prefer to remain anonymous)

## Security Features

### Environment Security
- All sensitive configuration uses environment variables
- No secrets stored in version control
- `.env.example` provides safe configuration templates

### Container Security
- Dockerfile uses non-root user
- Minimal base image (Alpine Linux)
- Health checks included
- Resource limits configured

### Application Security
- Express.js security headers via Helmet
- CORS protection
- Input validation for all endpoints
- Rate limiting capabilities
- Secure webhook handling

### Dependencies
- Regular dependency updates via Dependabot
- Automated security scanning
- Minimal dependency footprint
- Pinned versions for stability

Thank you for helping keep the Domjuan Bot System secure!