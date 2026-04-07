# SSO Plan (OIDC/SAML)

## Phase 1
- OIDC login for enterprise tenants
- Domain-to-tenant mapping
- JIT provisioning (optional)

## Phase 2
- SAML support
- SCIM provisioning/deprovisioning
- Group-to-role mapping

## Security Requirements
- Signed assertions/tokens only
- Strict audience validation
- Session timeout + re-auth for admin actions
