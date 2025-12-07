# Security Policy

## Supported Versions

We actively support the following versions with security updates:

| Version | Supported          |
| ------- | ------------------ |
| Latest  | :white_check_mark: |
| < Latest| :x:                |

## Reporting a Vulnerability

We take the security of Augment UI seriously. If you believe you have found a security vulnerability, please report it to us as described below.

### How to Report

**Please do not report security vulnerabilities through public GitHub issues.**

Instead, please report them via one of the following methods:

1. **Email**: Open a security advisory on GitHub by going to the [Security tab](https://github.com/deptz/augment-ui/security/advisories) and clicking "Report a vulnerability"
2. **Private Issue**: If you cannot use the security advisory system, email the maintainers directly

### What to Include

When reporting a vulnerability, please include:

- Type of vulnerability (e.g., XSS, CSRF, authentication bypass)
- Full paths of source file(s) related to the vulnerability
- Location of the affected code (tag/branch/commit or direct URL)
- Step-by-step instructions to reproduce the issue
- Proof-of-concept or exploit code (if possible)
- Impact of the vulnerability

### What to Expect

- **Acknowledgment**: We will acknowledge receipt of your report within 48 hours
- **Initial Assessment**: We will provide an initial assessment within 7 days
- **Updates**: We will keep you informed of our progress
- **Resolution**: We will notify you when the vulnerability is resolved

### Disclosure Policy

- We will work with you to understand and resolve the issue quickly
- We will credit you for the discovery (unless you prefer to remain anonymous)
- We will not take legal action against security researchers who:
  - Act in good faith
  - Do not access more data than necessary
  - Do not cause harm to our users or systems
  - Report vulnerabilities promptly

### Security Best Practices

For users of Augment UI:

- **Always use HTTPS** in production environments
- **Never commit `.env` files** with actual credentials to version control
- **Keep dependencies up to date** by running `npm audit` regularly
- **Use strong authentication credentials** for JIRA API access
- **Review and validate** all generated content before committing to JIRA
- **Store credentials securely** - credentials are stored in browser localStorage (consider the security implications)

### Known Security Considerations

- **Credentials Storage**: The application stores JIRA API credentials in browser localStorage. While convenient, this means credentials are accessible to any JavaScript running on the same origin. Consider the security implications for your environment.
- **API Communication**: All API communication uses HTTP Basic Authentication. Ensure your backend API uses HTTPS in production.
- **Client-Side Logging**: Console logging is disabled in production builds to prevent information leakage.

## Security Updates

Security updates will be released as patches to the latest version. We recommend keeping your installation up to date.

## Additional Resources

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [GitHub Security Best Practices](https://docs.github.com/en/code-security)
- [Vue.js Security Guide](https://vuejs.org/guide/best-practices/security.html)

