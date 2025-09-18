# Best Practices Cheat Sheet

## 1. Node.js & JavaScript Code Quality

- **Use ESLint**: Integrate ESLint to catch errors and enforce consistent style.
- **Modern JavaScript**: Use ES6+ features like const/let, arrow functions, template literals.
- **Error Handling**: Use try-catch blocks and proper error responses.
- **Write Tests**: Use Jest, Mocha, or similar testing frameworks.
- **Avoid Code Duplication**: Create reusable functions and modules.
- **Document Code**: Use JSDoc comments for functions and complex logic.
- **Security First**: Validate inputs, sanitize data, use parameterized queries.

## 2. GitHub Actions & Workflows

- **Pin Action Versions**: Use fixed versions (e.g., `@v2.0.0`) for reliability.
- **Use Matrix Builds**: Test across multiple Python versions and OSes.
- **Cache Dependencies**: Speed up CI using cache actions.
- **Fail Fast**: Set up jobs to fail on errors, and use `continue-on-error: false`.
- **Artifacts & Logs**: Upload test results and logs for debugging.
- **Secrets Management**: Use GitHub Secrets for sensitive values.

## 3. Writing Workflows

- **Keep Steps Atomic**: Each step should do one thing (e.g., install, lint, test).
- **Use Descriptive Names**: Name jobs and steps clearly.
- **Optimize for Speed**: Use caching, parallel jobs, and minimal environments.
- **Use Conditionals**: Only run jobs/steps when necessary (`if:`).
- **Auto-format Code**: Integrate tools like `black` or `autopep8`.

## 4. Security

- **Least Privilege**: Restrict permissions for workflows and tokens.
- **Dependabot Alerts**: Enable automated security updates.
- **Review Third-party Actions**: Audit external actions before use.
- **Secrets Rotation**: Regularly change and audit secrets.
- **Static Analysis**: Use security scanners (e.g., `bandit` for Python).
- **Branch Protection**: Require reviews and CI passes before merging.

## 5. General Software Engineering

- **Version Control**: Use feature branches and pull requests for changes.
- **Code Reviews**: Always review code before merging.
- **Automated Testing**: Integrate tests in CI/CD pipelines.
- **Documentation**: Maintain up-to-date README and usage docs.
- **Issue Tracking**: Use GitHub Issues for bugs, feature requests, and tasks.
- **Continuous Improvement**: Refactor code and workflows regularly.

---

_Apply these practices to your repositories for reliable, secure, and maintainable software!_

## 6. GitHub Copilot Best Practices

### Working with Copilot
- **Clear Context**: Provide clear, descriptive comments about what you want to achieve.
- **Review Suggestions**: Always review and test Copilot suggestions before accepting.
- **Security Review**: Pay special attention to security implications of generated code.
- **Iterative Refinement**: Use Copilot for initial implementation, then refine and optimize.
- **Documentation**: Use Copilot to help generate comprehensive documentation.

### Code Generation Guidelines
- **Start with Comments**: Write detailed comments describing functionality before coding.
- **Use Descriptive Names**: Clear variable and function names help Copilot understand context.
- **Provide Examples**: Include example inputs/outputs in comments for complex functions.
- **Break Down Complex Tasks**: Split large tasks into smaller, manageable pieces.
- **Test Generated Code**: Always write tests for Copilot-generated code.

### Copilot for this Project
- **Payment Security**: Be extra cautious with payment-related code generation.
- **Environment Variables**: Ensure secrets are never hardcoded in generated code.
- **Error Handling**: Verify proper error handling in all generated endpoints.
- **Input Validation**: Double-check that all inputs are properly validated.
- **Stripe Integration**: Follow Stripe best practices in all generated payment code.

### Quality Assurance
- **Code Review**: Have human review of all Copilot-generated code.
- **Testing**: Write comprehensive tests for generated functionality.
- **Security Scanning**: Run security tools on generated code.
- **Performance**: Monitor performance impact of generated solutions.
- **Maintainability**: Ensure generated code follows project patterns and is maintainable.