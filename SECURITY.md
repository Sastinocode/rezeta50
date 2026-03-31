# Security Policy

## Supported Versions

| Version | Supported |
|---------|-----------|
| MVP (current) | ✅ |

## Reporting a Vulnerability

If you discover a security vulnerability in this project, please report it **privately** by emailing the development team. Do **not** open a public issue.

**Contact:** security@rezeta50.com (replace with actual address before launch)

We will acknowledge receipt within 48 hours and provide a timeline for resolution within 7 days.

## Security Measures

### Authentication
- Passwords hashed with bcrypt (12 rounds)
- Sessions managed via NextAuth v5 with secure JWT tokens
- HTTP-only cookies prevent XSS token theft
- Password change requires verification of current password

### Authorization
- Every API route validates the session before processing
- Athletes can only access their own data (enforced via `athleteId: session.user.id` in all DB queries)
- Role-based access: ATHLETE / COACH / ADMIN

### Input Validation
- All API endpoints validate request bodies with Zod schemas
- Enum values (body parts, pain types, evaluation types) are strictly validated
- Numeric ranges enforced (pain 1–10, RPE 1–10, etc.)
- String length limits on all text fields

### Rate Limiting
- All API routes are rate-limited to prevent brute force and abuse
- Auth routes have stricter limits than general API routes

### Data Protection
- Database credentials stored in environment variables, never committed to source control
- No sensitive data logged
- Input sanitization via Zod prevents injection in JSON payloads

### Dependencies
- Regularly update dependencies to patch known CVEs
- Run `npm audit` before each release

## Environment Variables

Never commit `.env` or `.env.local` to version control. Required secrets:

```
DATABASE_URL          # PostgreSQL connection string
NEXTAUTH_SECRET       # NextAuth signing secret (min 32 chars, use openssl rand -base64 32)
NEXTAUTH_URL          # Production URL (e.g. https://app.rezeta50.com)
```

## Pre-launch Checklist

- [ ] `NEXTAUTH_SECRET` is a strong random value (not the default)
- [ ] Database is not publicly accessible
- [ ] HTTPS enforced in production
- [ ] `NODE_ENV=production` set in deployment
- [ ] Rate limiting configured for production traffic levels
- [ ] Database backups enabled
- [ ] Dependency audit run (`npm audit`)
