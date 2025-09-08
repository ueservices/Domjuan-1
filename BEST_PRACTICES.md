# Best Practices Cheat Sheet

## 1. Python Code Quality

- **Use Linters**: Integrate tools like `pylint` or `flake8` to catch errors and enforce style.
- **Type Annotations**: Use type hints for function signatures and variables.
- **Follow PEP 8**: Stick to official Python style guidelines.
- **Write Tests**: Use `pytest` or `unittest` for thorough test coverage.
- **Avoid Code Duplication**: Use functions and modules to reuse logic.
- **Document Code**: Use docstrings for modules, classes, and functions.

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