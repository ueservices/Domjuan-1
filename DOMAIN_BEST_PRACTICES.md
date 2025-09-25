# Domain Acquisition & Transfer Best Practices

## 1. Bot Setup & Task Management

- **Assign each bot a unique role:** nested, hidden, unexplored, unseen, unfound.
- **Automate search & acquisition:** Bots should scan registries/marketplaces for domains that fit their profile.
- **Rotate bot credentials and limit permissions for security.**

## 2. Domain Validation

- **Check domain status with official registries** (WHOIS, ICANN, registrar APIs).
- **Verify legitimacy:** Ensure domains are not blacklisted, compromised, or under dispute.
- **Automate validation:** Use scripts to confirm domain status before acquisition.

## 3. Payment Processing

- **Remove all non-domain payment features.**
- **Automate payments for domain purchase only.**
- **Log all transactions for auditing and reinvest all funds into domain acquisition.**

## 4. Secrets & Auth Codes

- **Obtain auth/transfer codes for each acquired domain.**
- **Store secrets in encrypted vaults or a cloud secret manager.**
- **Bulk export secrets for transfer:** Package domains and auth codes in a secure CSV or JSON, encrypt before transfer.

## 5. Bulk Packaging for Transfer/Sale

- **Format data as CSV for easy import/export.**
- **Include:** domain, bot, acquisition date, auth code, legitimacy check.
- **Encrypt files with strong algorithms (AES-256).**
- **Transfer via secure channels (SFTP, HTTPS, encrypted email).**

## 6. Automation & Monitoring

- **Automate the workflow:** Scripts or CI/CD for discovery, acquisition, validation, and secret packaging.
- **Monitor bot actions:** Track logs, set alerts for suspicious activity.
- **Regularly rotate credentials and secrets.**

## 7. Compliance & Security

- **Comply with ICANN and registrar policies.**
- **Do not store secrets in version control.**
- **Audit domain & secret portfolio regularly.**

## 8. Easiest Workflow

1. **Bots scan and discover domains.**
2. **Domains validated for legitimacy.**
3. **Bots acquire domains using secure payments.**
4. **Auth codes/transfer keys securely stored.**
5. **Domains and secrets bulk-packaged (CSV, encrypted) for transfer/sale.**
6. **All funds reinvested into new domains.**
7. **Old payment and non-domain features removed from codebase.**

## 9. Sample CSV Template

```csv
Domain,Bot,Task,Status,AuthCode/TransferKey,Legit,AcquisitionDate,Notes
hiddenasset.net,Bot2,Hidden,Acquired,KEY78910,Yes,2025-09-24,Hidden gem domain
exploreme.org,Bot3,Unexplored,Acquired,AUTH999999,Yes,2025-09-24,Potential for growth
```

---

**Tip:** Use open-source libraries for domain WHOIS checks, secret management, and CSV encryption.  
**Automation:** Shell scripts, Python, or Node.js are easiest for workflow automation.
