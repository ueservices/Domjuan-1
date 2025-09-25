# Best Practices Cheat Sheet

## 1. JavaScript/Node.js Code Quality

- **Use Linters**: Integrate `eslint` to catch errors and enforce consistent code style.
- **Code Formatting**: Use `prettier` for consistent code formatting across the project.
- **Follow Standards**: Adhere to modern JavaScript (ES2021+) and Node.js best practices.
- **Write Tests**: Use testing frameworks like `jest`, `mocha`, or built-in Node.js test runner.
- **Avoid Code Duplication**: Use modules, functions, and classes to reuse logic.
- **Document Code**: Use JSDoc comments for functions, classes, and modules.
- **Error Handling**: Implement proper try-catch blocks and error middleware for Express.js.
- **Security**: Use `helmet` for security headers, validate inputs, and sanitize data.

## 2. GitHub Actions & Workflows

- **Pin Action Versions**: Use fixed versions (e.g., `@v4`) for reliability and security.
- **Use Matrix Builds**: Test across multiple Node.js versions and operating systems.
- **Cache Dependencies**: Speed up CI using `actions/cache` for `node_modules`.
- **Fail Fast**: Set up jobs to fail on errors, and use `continue-on-error: false`.
- **Artifacts & Logs**: Upload test results and logs for debugging.
- **Secrets Management**: Use GitHub Secrets for sensitive values like API keys.
- **Security Scanning**: Include `npm audit` in your CI/CD pipeline.
- **Docker Integration**: Build and test Docker images in your workflows.

## 3. Writing Workflows

- **Keep Steps Atomic**: Each step should do one thing (e.g., install, lint, test, build).
- **Use Descriptive Names**: Name jobs and steps clearly to improve readability.
- **Optimize for Speed**: Use caching, parallel jobs, and minimal Docker images.
- **Use Conditionals**: Only run jobs/steps when necessary using `if:` conditions.
- **Auto-format Code**: Integrate `prettier` and `eslint --fix` in your workflows.
- **Environment Variables**: Use `.env` files locally and GitHub Secrets in CI/CD.
- **Health Checks**: Include application health checks in deployment workflows.

## 4. Security

- **Least Privilege**: Restrict permissions for workflows and tokens.
- **Dependabot Alerts**: Enable automated security updates for dependencies.
- **Review Third-party Actions**: Audit external GitHub Actions before use.
- **Secrets Rotation**: Regularly change and audit API keys and secrets.
- **Static Analysis**: Use security scanners like `npm audit` and `eslint-plugin-security`.
- **Branch Protection**: Require reviews and CI passes before merging.
- **Input Validation**: Always validate and sanitize user inputs in your applications.
- **Security Headers**: Use `helmet` middleware for Express.js applications.
- **Environment Variables**: Never commit secrets to version control; use `.env` files.

## 5. General Software Engineering

- **Version Control**: Use feature branches and pull requests for changes.
- **Code Reviews**: Always review code before merging.
- **Automated Testing**: Integrate tests in CI/CD pipelines.
- **Documentation**: Maintain up-to-date README and usage docs.
- **Issue Tracking**: Use GitHub Issues for bugs, feature requests, and tasks.
- **Continuous Improvement**: Refactor code and workflows regularly.

---

_Apply these practices to your repositories for reliable, secure, and maintainable software!_
