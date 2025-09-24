# GitHub Repository Configuration for Copilot Agents

This document provides guidance for repository administrators on configuring GitHub settings to optimize Copilot Coding Agent functionality.

## Branch Protection Rules

Configure the following branch protection rules for the `main` branch:

### Required Settings
- ✅ **Require a pull request before merging**
  - Required approvals: 1
  - Require review from code owners: ✅
  - Dismiss stale reviews when new commits are pushed: ✅

- ✅ **Require status checks to pass before merging**
  - Required status checks:
    - `test` (from deploy.yml workflow)
    - `lint` (from linting checks)
    - `security-check` (from npm audit)

- ✅ **Require branches to be up to date before merging**
- ✅ **Require linear history**
- ✅ **Include administrators** (recommended)

### Optional but Recommended
- ✅ **Allow force pushes** → ❌ (disable for security)
- ✅ **Allow deletions** → ❌ (disable for security)

## Repository Settings

### General Settings
```yaml
# Repository visibility
visibility: public  # or private based on needs

# Features
has_issues: true
has_projects: true
has_wiki: false  # using README.md instead
has_discussions: true  # recommended for community input

# Pull Requests
allow_squash_merge: true
allow_merge_commit: false  # maintain clean history
allow_rebase_merge: true
delete_branch_on_merge: true
```

### Security Settings
```yaml
# Automated security fixes
enable_automated_security_fixes: true

# Vulnerability reporting
enable_private_vulnerability_reporting: true

# Dependency graph
enable_dependency_graph: true

# Dependabot alerts
enable_dependabot_alerts: true
```

## Required Secrets

Configure these repository secrets for CI/CD:

### Deployment Secrets
- `HEROKU_API_KEY`: Heroku deployment key
- `HEROKU_APP_NAME`: Application name
- `HEROKU_EMAIL`: Heroku account email

### Alternative Deployment (Vercel)
- `VERCEL_TOKEN`: Vercel deployment token
- `ORG_ID`: Organization ID
- `PROJECT_ID`: Project ID

### Environment Secrets (for testing)
- `STRIPE_SECRET_KEY`: Test mode Stripe secret key
- `STRIPE_PUBLISHABLE_KEY`: Test mode Stripe publishable key
- `STRIPE_WEBHOOK_SECRET`: Webhook signing secret

## Environment Variables

### Repository Variables
These are non-sensitive configuration values:
- `NODE_ENV`: `production`
- `PORT`: `3000`

## Actions Permissions

### Workflow Permissions
```yaml
# Contents: read and write for automated commits
contents: write

# Pull requests: write for automated PR creation
pull-requests: write

# Issues: write for automated issue management
issues: write

# Checks: write for status reporting
checks: write
```

## Code Scanning

### GitHub Advanced Security
If using GitHub Advanced Security, enable:
- ✅ **CodeQL analysis**
- ✅ **Secret scanning**
- ✅ **Dependency review**

### Configuration
```yaml
# .github/workflows/codeql-analysis.yml (optional)
name: "CodeQL"

on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]
  schedule:
    - cron: '0 6 * * 1'  # Monday at 6 AM UTC

languages: ['javascript']
```

## Copilot-Specific Settings

### GitHub Copilot for Organizations
If using GitHub Copilot for Business/Enterprise:

```yaml
# Organization-level settings
copilot:
  # Allow Copilot suggestions
  suggestions_enabled: true
  
  # Public code matching
  public_code_suggestions: "block"  # for security-sensitive repos
  
  # Copilot Chat
  chat_enabled: true
```

### Repository-Specific Configuration
- Enable GitHub Copilot for repository collaborators
- Configure agent instructions in `.github/copilot-instructions.md`
- Set up context files for better suggestions

## Notifications

### Required Notifications
Configure these notifications for repository maintainers:

- ✅ **Security alerts**: Email + GitHub notifications
- ✅ **Dependabot alerts**: Email notifications
- ✅ **Failed workflow runs**: GitHub notifications
- ✅ **Pull request reviews**: GitHub notifications

## Teams and Access

### Recommended Team Structure
```yaml
teams:
  # Core maintainers with admin access
  maintainers:
    permission: admin
    members: ["@ueservices"]
  
  # Contributors with write access
  contributors:
    permission: write
    
  # External reviewers with triage access
  reviewers:
    permission: triage
```

### Outside Collaborators
- Configure specific permissions for external contributors
- Require 2FA for all collaborators
- Regular access review (quarterly recommended)

## Compliance and Auditing

### Audit Log
- Enable organization-level audit logging
- Monitor access to sensitive settings
- Review branch protection rule changes

### Compliance Checks
- Regular review of CODEOWNERS file
- Validate branch protection enforcement
- Audit secret usage and rotation

## Monitoring and Alerts

### GitHub Insights
Monitor these metrics:
- Pull request review time
- Failed workflow rates
- Security alert resolution time
- Contributor activity

### Custom Alerts
Consider setting up alerts for:
- Long-running pull requests without review
- Failed security scans
- Dependency vulnerabilities
- Unusual access patterns

## Implementation Checklist

Repository administrators should verify:

- [ ] Branch protection rules configured
- [ ] Required secrets added securely
- [ ] Dependabot enabled and configured
- [ ] Code owners file in place
- [ ] Issue and PR templates configured
- [ ] Security scanning enabled
- [ ] Workflow permissions configured
- [ ] Team access properly configured
- [ ] Notification settings configured
- [ ] Compliance monitoring in place

## Maintenance Schedule

### Weekly
- [ ] Review Dependabot PRs
- [ ] Check failed workflow runs
- [ ] Review new security alerts

### Monthly  
- [ ] Audit team access and permissions
- [ ] Review branch protection rules
- [ ] Update documentation as needed

### Quarterly
- [ ] Rotate secrets and API keys
- [ ] Review code owners assignments
- [ ] Audit compliance settings
- [ ] Update security configurations

This configuration ensures optimal security, automation, and Copilot agent effectiveness while maintaining compliance with best practices.