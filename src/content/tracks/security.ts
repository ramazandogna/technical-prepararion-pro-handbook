import type { Track } from '@/types/content'

const track: Track = {
  id: 'security',
  code: 'Q',
  title: 'Web & API Security',
  summary: 'OWASP risks, authentication, sessions, CORS, CSP and secure API design.',
  rationale:
    'Full-stack interviewers routinely probe security through the features you build: login, sessions, file uploads, URL fetching and third-party scripts. You have shipped consent UIs, enterprise integrations and scrapers that fetch arbitrary URLs, so this track makes sure you can explain the attacks and defences precisely, including the common misconceptions (what CORS does not protect, why JWTs are not automatically more secure).',
  icon: 'ShieldCheck',
  phase: 3,
  modules: [
    {
      id: 'sec-browser',
      title: 'Browser-side attacks',
      summary: 'OWASP overview, XSS and CSP, CSRF and SameSite, and what CORS really does.',
      questions: [
        {
          id: 'sec-owasp-top10',
          title: 'The OWASP Top 10 for a web developer',
          type: 'concept',
          difficulty: 'foundation',
          priority: 'should',
          tags: ['owasp', 'access-control', 'injection', 'misconfiguration'],
          estMinutes: 5,
          roles: ['general', 'full-stack'],
          prompt: `**What is the OWASP Top 10, and which risks matter most for a typical Node.js + React/Vue SaaS?** Give one concrete example and defence for each risk you mention.`,
          hints: [
            'It is an awareness document, ranked from real-world data, not a checklist of bugs.',
            'The top category is not injection any more.',
            'Map each risk to something you have built: login, admin pages, uploads, URL fetchers, dependencies.',
          ],
          answer: `**The OWASP Top 10** is a regularly updated awareness list of the most critical web application security risk categories, based on data from real applications. It is a starting point for threat modelling, not a complete checklist.

**The categories most relevant to a typical SaaS, with an example and a defence each:**
- **Broken access control** (the top risk): changing \`/invoices/123\` to \`/invoices/124\` shows another customer's invoice (IDOR); a hidden admin route is only hidden in the UI. *Defence:* authorise every request on the server against the resource owner or tenant; deny by default; test it.
- **Cryptographic failures:** plaintext passwords, HTTP without TLS, sensitive data in logs. *Defence:* TLS everywhere with HSTS, slow password hashing (argon2id or bcrypt), encryption at rest for sensitive fields.
- **Injection** (SQL, NoSQL, command, and XSS, which is now grouped here): string-concatenated queries. *Defence:* parameterised queries, validation, output encoding.
- **Insecure design:** no rate limit on password reset, business logic flaws. *Defence:* threat modelling during design, abuse cases.
- **Security misconfiguration:** debug mode in production, default credentials, verbose error pages, permissive CORS, open S3 buckets. *Defence:* hardened defaults, security headers, config reviews.
- **Vulnerable and outdated components:** an old dependency with a known CVE. *Defence:* lockfiles, Dependabot or Renovate, \`npm audit\`, removing unused packages.
- **Identification and authentication failures:** no brute-force protection, session fixation, weak reset flows. *Defence:* rate limiting, MFA, session regeneration on login.
- **Software and data integrity failures:** unsigned updates, compromised CI, unsafe deserialisation. *Defence:* pinned and verified dependencies, protected pipelines.
- **Security logging and monitoring failures:** a breach discovered months later. *Defence:* audit logs for logins and permission changes, alerts.
- **SSRF:** a "fetch this URL" feature reaches \`http://169.254.169.254\` (cloud metadata). *Defence:* allow-lists and blocking private IP ranges after DNS resolution.

**How to say it in an interview:** pick 3–4, tie each to a feature you built, and lead with access control: it is the most common real-world bug and frameworks do not solve it for you.`,
          keyPoints: [
            'Awareness list based on real-world data, not a complete checklist',
            'Broken access control is the top risk: authorise every request server-side',
            'Injection (including XSS), misconfiguration and vulnerable components',
            'SSRF, authentication failures and missing logging',
            'Tie each risk to a concrete feature and defence',
          ],
          pitfalls: ['Reciting the list without examples or defences', 'Treating front-end route guards as access control'],
          followUps: ['How would you find IDOR bugs in an existing codebase?'],
          references: [{ label: 'OWASP Top 10', url: 'https://owasp.org/www-project-top-ten/' }],
        },
        {
          id: 'sec-xss-csp',
          title: 'XSS types and Content Security Policy',
          type: 'concept',
          difficulty: 'core',
          priority: 'must',
          tags: ['xss', 'csp', 'sanitization', 'v-html', 'dangerouslysetinnerhtml'],
          estMinutes: 7,
          roles: ['frontend', 'full-stack'],
          prompt: `**Explain the types of XSS, how React and Vue protect you and where they do not, and how a Content Security Policy limits the damage.** You are building a feature that renders user-written comments with formatting.`,
          hints: [
            'Where does the malicious script come from, and where is it executed?',
            'Frameworks escape text interpolation. Which APIs bypass that?',
            'CSP is a second line of defence, not the fix.',
          ],
          answer: `**XSS (cross-site scripting)** means an attacker gets their script to run in **your origin**, in a victim's browser. It can then read data the page can read, act as the user (call your API with their cookies), and capture keystrokes.

**Types:**
- **Stored:** the payload is saved (a comment, profile name) and served to every viewer. The most damaging.
- **Reflected:** the payload is in the request (\`?q=<script>\`) and echoed back in the response, triggered via a crafted link.
- **DOM-based:** client-side JavaScript reads attacker-controlled data (\`location.hash\`, \`postMessage\`) and writes it to a dangerous sink (\`innerHTML\`, \`eval\`, \`setAttribute('href', ...)\`). The server never sees it.

**What frameworks do:** React (\`{value}\`) and Vue (\`{{ value }}\`, \`v-bind\`) **escape interpolated text**, which prevents the common case.

**Where they do not protect you:**
- \`v-html\`, \`dangerouslySetInnerHTML\`, \`innerHTML\` and \`insertAdjacentHTML\`.
- **URLs:** \`<a :href="userUrl">\` with \`javascript:alert(1)\`. Validate the scheme (allow only http, https, mailto).
- Server-side rendered templates that build HTML strings, \`eval\` or \`new Function\` on user input, and third-party scripts.
- Injecting into \`<script>\` blocks (for example serialised SSR state), which needs proper JSON escaping.

**The comments feature:**
- Prefer a **restricted format** (Markdown) rendered to HTML and then **sanitised with an allow-list** sanitiser (DOMPurify): allowed tags and attributes, links forced to safe schemes with \`rel="noopener noreferrer"\`.
- Sanitise on output (or on both input and output); keep the original text.
- Never trust client-side sanitisation alone if other clients consume the API.

**Content Security Policy (defence in depth):** an HTTP header that tells the browser which sources may run scripts or load resources.
\`\`\`http
Content-Security-Policy: default-src 'self'; script-src 'self' 'nonce-r4nd0m' 'strict-dynamic';
  object-src 'none'; base-uri 'none'; frame-ancestors 'none'
\`\`\`
- Blocks inline scripts and \`eval\` unless explicitly allowed, so many injected payloads fail.
- Nonce- or hash-based policies are stronger than domain allow-lists (which are often bypassable through JSONP endpoints or CDNs).
- Roll it out with \`Content-Security-Policy-Report-Only\` first, then enforce it.
- \`frame-ancestors\` also prevents clickjacking.

**Also:** \`HttpOnly\` cookies so script cannot read session cookies (XSS can still make requests as the user), and Trusted Types for large apps.`,
          keyPoints: [
            'Stored, reflected and DOM-based XSS',
            'Frameworks escape text, but v-html, dangerouslySetInnerHTML and javascript: URLs bypass it',
            'Rich text: restricted format plus allow-list sanitisation (DOMPurify)',
            'CSP with nonces as defence in depth; report-only rollout',
            'HttpOnly cookies limit token theft but not actions taken as the user',
          ],
          pitfalls: [
            'Believing React or Vue make XSS impossible',
            'Writing a regex-based blacklist sanitiser',
            'Treating CSP as the primary fix',
          ],
          followUps: ['How would you safely support embedding YouTube videos in comments?', 'What are Trusted Types?'],
          personalAngle:
            'Your consent UIs and Chrome extension ran inside third-party pages: talk about how you avoided injecting unsafe HTML and how CSP on customer sites affected your scripts.',
          references: [{ label: 'OWASP XSS Prevention Cheat Sheet', url: 'https://cheatsheetseries.owasp.org/cheatsheets/Cross_Site_Scripting_Prevention_Cheat_Sheet.html' }, { label: 'MDN: Content Security Policy', url: 'https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP' }],
        },
        {
          id: 'sec-csrf-samesite',
          title: 'CSRF and SameSite cookies',
          type: 'concept',
          difficulty: 'core',
          priority: 'must',
          tags: ['csrf', 'cookies', 'samesite', 'sessions'],
          estMinutes: 6,
          roles: ['backend', 'full-stack'],
          prompt: `**What is CSRF, why does it work, and how do you prevent it today?** Does using SameSite cookies mean you no longer need CSRF tokens? Does a JWT in an Authorization header need CSRF protection?`,
          hints: [
            'The browser attaches cookies automatically, whoever started the request.',
            'SameSite has three values with different behaviour for top-level navigations.',
            '"Site" is not the same as "origin".',
          ],
          answer: `**CSRF (cross-site request forgery):** a malicious site makes the victim's browser send a request to **your** site. Because the browser **automatically attaches your cookies**, the request is authenticated as the victim. For example, an auto-submitting form on evil.com POSTs to \`bank.com/transfer\`. The attacker cannot read the response, but the side effect happens.

**It requires:** cookie-based (ambient) authentication, a state-changing endpoint, and no unpredictable parameter the attacker cannot know.

**Defences (layered):**
1. **SameSite cookies:**
   - \`Strict\`: never sent on cross-site requests, not even on clicking a link to your site (users appear logged out when arriving from email).
   - \`Lax\` (the default in modern browsers when unspecified): sent only on top-level **GET** navigations from other sites. Blocks cross-site POSTs, iframes and fetches.
   - \`None; Secure\`: always sent; needed for legitimate cross-site use (embedded widgets) and then CSRF tokens are essential.
2. **CSRF tokens:** a random token tied to the session (synchroniser pattern) or a double-submit cookie, sent in a header or form field and verified on every state-changing request.
3. **Check \`Origin\` (or \`Sec-Fetch-Site\`)** on state-changing requests and reject unexpected sites.
4. **Never change state on GET.**

**Is SameSite enough?** It is a strong baseline, but:
- **Same-site is not same-origin:** \`evil.example.com\` and \`app.example.com\` are the same *site*, so a compromised or user-controlled subdomain can still forge requests.
- Lax still allows top-level GETs, so any GET with side effects is exposed.
- Older browsers and \`SameSite=None\` cookies. For sensitive apps keep tokens or Origin checks as well.

**JWT in an Authorization header:** not vulnerable to CSRF, because the browser does not attach it automatically; the attacker's page cannot read it to add the header. But storing it in \`localStorage\` makes it readable by any XSS, so you trade CSRF risk for XSS token theft. If the JWT is stored **in a cookie**, it is ambient again and needs CSRF protection like any session cookie.

**CORS does not prevent CSRF:** simple cross-site form POSTs are sent without any preflight.`,
          keyPoints: [
            'CSRF exploits automatically attached cookies on cross-site requests',
            'SameSite Strict, Lax and None semantics',
            'Same-site ≠ same-origin; subdomains and GET side effects remain risks',
            'CSRF tokens and Origin or Sec-Fetch-Site checks as additional layers',
            'Header-based tokens avoid CSRF but are exposed to XSS if stored in JS-readable storage',
          ],
          pitfalls: ['Thinking CORS blocks CSRF', 'State-changing GET endpoints', 'Assuming a JWT in a cookie is CSRF-proof'],
          followUps: ['How would you protect a login form against login CSRF?'],
          references: [{ label: 'OWASP CSRF Prevention Cheat Sheet', url: 'https://cheatsheetseries.owasp.org/cheatsheets/Cross-Site_Request_Forgery_Prevention_Cheat_Sheet.html' }],
        },
        {
          id: 'sec-cors',
          title: 'What CORS does and does not protect',
          type: 'multiple-choice',
          difficulty: 'core',
          priority: 'must',
          tags: ['cors', 'same-origin-policy', 'preflight', 'credentials'],
          estMinutes: 4,
          roles: ['frontend', 'backend', 'full-stack'],
          prompt: `Your API at \`api.example.com\` returns \`Access-Control-Allow-Origin\` set to whatever \`Origin\` the request sends, plus \`Access-Control-Allow-Credentials: true\`. **Which statements are correct?** (Select all that apply.)`,
          choices: [
            {
              id: 'a',
              text: 'This lets any website make credentialed requests to the API with the user’s cookies **and read the responses**.',
              correct: true,
              explanation:
                'Reflecting any origin with credentials effectively disables the Same-Origin Policy for your API. A malicious page can read the user’s private data.',
            },
            {
              id: 'b',
              text: 'CORS is a server-side firewall: without the header, the server never receives the cross-origin request.',
              correct: false,
              explanation:
                'CORS is enforced by the browser on reading responses. Simple requests (like a form POST) still reach the server and execute; only the reading is blocked. curl ignores CORS entirely.',
            },
            {
              id: 'c',
              text: 'The fix is an explicit allow-list of trusted origins, returning `Vary: Origin`, and never combining credentials with untrusted origins.',
              correct: true,
              explanation: 'Exact-match allow-lists, with Vary: Origin so caches do not serve one origin’s header to another.',
            },
            {
              id: 'd',
              text: 'A preflight OPTIONS request is sent for every cross-origin request, so CORS also prevents CSRF.',
              correct: false,
              explanation:
                'Preflights happen only for non-simple requests (custom headers, JSON content type, PUT/DELETE). Simple form POSTs go straight through, so CSRF needs its own defences.',
            },
          ],
          hints: ['Who enforces CORS: the browser or the server?', 'Which requests skip the preflight?'],
          answer: `**A and C are correct.**

**The Same-Origin Policy** stops a page on one origin from **reading** responses from another origin. **CORS is a controlled relaxation of it**: the server tells the browser which other origins may read its responses.

**Key facts:**
- **The browser enforces CORS, not the server.** Requests may still reach your server; CORS decides whether the calling JavaScript can read the response. Non-browser clients ignore it completely, so **CORS is not access control or authentication**.
- **Simple requests** (GET, HEAD, or POST with form-like content types and no custom headers) are sent directly. Others trigger a **preflight** \`OPTIONS\` request first, asking permission for the method and headers.
- \`Access-Control-Allow-Origin: *\` **cannot** be combined with credentials. Reflecting the request Origin works around that restriction, which is why it is dangerous with \`Allow-Credentials: true\`.

**Safe configuration:**
\`\`\`ts
const allowed = new Set(['https://app.example.com', 'https://admin.example.com'])
app.use(cors({
  origin: (origin, cb) => cb(null, !origin || allowed.has(origin)),
  credentials: true,
}))
\`\`\`
Use exact matches (not \`endsWith('example.com')\`, which also accepts \`evilexample.com\`), never allow the \`null\` origin with credentials, and set \`Vary: Origin\`.

**Common misunderstanding to correct in interviews:** a CORS error in the browser console is the browser protecting the *user*; "fixing" it with a wildcard on a credentialed API opens a real vulnerability.`,
          keyPoints: [
            'CORS relaxes the Same-Origin Policy for reading responses',
            'Enforced by browsers; not authentication or a firewall',
            'Simple requests skip preflight, so CORS does not stop CSRF',
            'Never reflect arbitrary origins with credentials; exact allow-lists and Vary: Origin',
          ],
          pitfalls: ['Suffix matching origins', 'Using a wildcard to make the console error go away'],
          followUps: ['Why does a request with Content-Type application/json trigger a preflight?'],
          references: [{ label: 'MDN: Cross-Origin Resource Sharing', url: 'https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS' }],
        },
      ],
    },
    {
      id: 'sec-auth',
      title: 'Authentication & identity',
      summary: 'Sessions vs JWT, OAuth2 and OIDC, password storage and brute-force protection.',
      questions: [
        {
          id: 'sec-sessions-vs-jwt',
          title: 'Sessions vs JWTs, refresh tokens and token storage',
          type: 'tradeoff',
          difficulty: 'core',
          priority: 'must',
          tags: ['authentication', 'jwt', 'sessions', 'refresh-tokens', 'cookies'],
          estMinutes: 8,
          roles: ['backend', 'full-stack'],
          prompt: `For a SPA plus API, **compare server-side sessions with JWT access tokens.** How do refresh tokens work, how do you log a user out everywhere, and **where should the browser store the token?**`,
          hints: [
            'Where does the state live, and how do you revoke it?',
            'A JWT is valid until it expires, whatever happens on the server.',
            'Compare localStorage and HttpOnly cookies against XSS and CSRF.',
          ],
          answer: `**Server-side sessions:** after login, the server stores session data (in Redis or the DB) and gives the browser a random **session id in an HttpOnly cookie**.
- ✅ Instant revocation (delete the session), small cookie, simple and mature.
- ❌ A lookup per request (cheap with Redis); needs a shared store with several instances.

**JWT (stateless access token):** a signed token containing claims (\`sub\`, \`exp\`, roles) that the API verifies without any lookup.
- ✅ No shared session store; works across services and domains; good for service-to-service and third-party APIs.
- ❌ **Cannot be revoked before it expires** without adding state back (a denylist or token version), claims go stale (a role change applies only at refresh), tokens are larger, and the security pitfalls are real (the \`alg: none\` attack, weak HS256 secrets, not validating \`aud\` and \`iss\`).

**Refresh tokens:** a short-lived access token (5–15 min) plus a long-lived refresh token.
- The refresh token is **stored server-side** (or as a hash) so it can be revoked, sent only to the refresh endpoint, and **rotated on every use**: if an old refresh token is reused, that indicates theft, so revoke the whole token family.
- "Log out everywhere" = revoke all refresh tokens for the user; access tokens die within minutes. For immediate effect, check a per-user \`tokenVersion\` in the access token against a cached value.

**Where to store tokens in the browser:**
- **localStorage or sessionStorage:** readable by any JavaScript, so a single XSS can **exfiltrate** the token and use it from anywhere. Not CSRF-prone.
- **HttpOnly, Secure, SameSite cookie:** JavaScript cannot read it (XSS can still act during the session but cannot steal the token). Needs CSRF protection (SameSite plus tokens or Origin checks).
- **In memory** plus a refresh cookie: the access token lives in a JS variable and is lost on reload, then refreshed via an HttpOnly cookie scoped to \`/auth/refresh\`.

**Recommendation for a first-party SPA and its own API:** **HttpOnly session cookies** (or the **BFF pattern**: the backend holds the OAuth tokens and the browser only gets a session cookie). Use JWTs where statelessness genuinely helps (between services, mobile clients, third-party APIs), with short expiry and strict validation.

**Also:** regenerate the session id on login (prevents session fixation), set idle and absolute timeouts, and bind sensitive actions to re-authentication.`,
          keyPoints: [
            'Sessions: server state, instant revocation, HttpOnly cookie',
            'JWT: stateless verification but hard revocation and stale claims',
            'Short access tokens plus rotating, server-tracked refresh tokens with reuse detection',
            'localStorage is exposed to XSS; HttpOnly cookies need CSRF protection',
            'For first-party SPAs, prefer cookie sessions or the BFF pattern',
          ],
          pitfalls: [
            'Calling JWTs "more secure" by default',
            'Long-lived JWTs with no revocation strategy',
            'Not validating alg, aud, iss and exp',
          ],
          followUps: ['How would auth work if the API is on a different domain from the SPA?', 'How do you store refresh tokens in a mobile app?'],
          references: [{ label: 'OWASP Session Management Cheat Sheet', url: 'https://cheatsheetseries.owasp.org/cheatsheets/Session_Management_Cheat_Sheet.html' }],
        },
        {
          id: 'sec-oauth-oidc',
          title: 'OAuth 2.0 and OpenID Connect basics',
          type: 'concept',
          difficulty: 'advanced',
          priority: 'should',
          tags: ['oauth2', 'oidc', 'pkce', 'sso', 'authorization-code'],
          estMinutes: 7,
          roles: ['backend', 'full-stack'],
          prompt: `You are adding **"Sign in with Google"** to a web app. **Explain the difference between OAuth 2.0 and OpenID Connect, and walk through the Authorization Code flow with PKCE.** Why is the implicit flow discouraged?`,
          hints: [
            'One is about delegated access to APIs, the other about who the user is.',
            'The browser receives a short-lived code, not the token. Who exchanges it, and what proves it is the same client?',
            'What does the state parameter protect against?',
          ],
          answer: `**OAuth 2.0** is an **authorisation** framework: it lets an app get an **access token** to call an API on the user's behalf ("let this app read my calendar"). It does not define who the user is.
**OpenID Connect (OIDC)** is an **authentication** layer on top of OAuth 2.0: it adds the **ID token** (a signed JWT with \`sub\`, \`email\`, \`iss\`, \`aud\`, \`exp\`, \`nonce\`), the \`openid\` scope, a userinfo endpoint and discovery. "Sign in with Google" is OIDC.

**Authorization Code flow with PKCE:**
1. The app generates a random **code_verifier** and its SHA-256 **code_challenge**, plus a random \`state\` (and \`nonce\`), stored in the user's session.
2. Redirect to the provider: \`/authorize?response_type=code&client_id=...&redirect_uri=...&scope=openid email profile&state=...&code_challenge=...&code_challenge_method=S256\`.
3. The user authenticates and consents at the provider.
4. The provider redirects back to the **exact registered redirect_uri** with \`?code=...&state=...\`.
5. The app checks \`state\` matches (prevents CSRF and login injection), then the **backend exchanges the code** at the token endpoint with the \`code_verifier\` (and the client secret for confidential clients).
6. It receives the ID token (and access and refresh tokens), **validates the ID token** (signature via the provider's JWKS, \`iss\`, \`aud\` = your client id, \`exp\`, \`nonce\`), finds or creates the local user by \`(issuer, sub)\`, and **creates its own session**.

**Why PKCE:** an intercepted authorisation code (malicious app on the same device, logs, referrer leaks) is useless without the verifier, which never left the client. It is now recommended for all clients, not only public ones.

**Why the implicit flow is discouraged:** it returned tokens directly in the URL fragment, exposing them to browser history, referrers and malicious scripts, with no way to bind the token to the client. OAuth 2.1 removes it in favour of code + PKCE.

**Practical points:**
- Key users by \`sub\` from a specific issuer, not by email (emails change and can be unverified); check \`email_verified\` before linking accounts.
- Request minimal scopes.
- Prefer the BFF pattern: tokens stay on the server, the browser gets an HttpOnly session cookie.
- Use a well-maintained library (openid-client, Auth.js, Passport strategies) rather than hand-rolling the flow.`,
          keyPoints: [
            'OAuth 2.0 = delegated authorisation (access tokens); OIDC = authentication (ID token)',
            'Authorization Code flow with the code exchanged server-side',
            'PKCE binds the code to the client; state prevents CSRF; nonce prevents replay',
            'Validate the ID token: signature, iss, aud, exp, nonce',
            'Implicit flow leaks tokens; OAuth 2.1 removes it',
          ],
          pitfalls: [
            'Using an OAuth access token as proof of identity',
            'Linking accounts by unverified email',
            'Loose redirect URI matching',
          ],
          followUps: ['How would you implement SSO for enterprise customers (SAML or OIDC)?'],
          references: [{ label: 'OAuth 2.0 (oauth.net)', url: 'https://oauth.net/2/' }, { label: 'OpenID Connect', url: 'https://openid.net/developers/how-connect-works/' }],
        },
        {
          id: 'sec-password-hashing',
          title: 'Storing passwords correctly',
          type: 'concept',
          difficulty: 'foundation',
          priority: 'must',
          tags: ['passwords', 'hashing', 'argon2', 'bcrypt', 'salt'],
          estMinutes: 4,
          roles: ['backend', 'full-stack'],
          prompt: `**How should passwords be stored?** Why not SHA-256, what does a salt do, and what else belongs in a modern password policy?`,
          hints: [
            'Fast hashes are a feature for files and a weakness for passwords.',
            'Two users with the same password should not have the same hash.',
            'Think about NIST guidance on complexity rules and breached passwords.',
          ],
          answer: `**Store passwords with a slow, salted, memory-hard password hashing function: argon2id (first choice), scrypt, or bcrypt.** Never store plaintext or reversible encryption, and never use plain fast hashes.

**Why not SHA-256 (even salted)?** It is designed to be **fast**: a GPU computes billions of SHA-256 hashes per second, so after a database leak, attackers can brute-force most human passwords quickly. Password hashes must be **deliberately slow and memory-hungry** to make every guess expensive.

**Salt:** a unique random value per password, stored next to the hash. It ensures identical passwords produce different hashes and defeats precomputed rainbow tables. It is not secret. Modern libraries generate and embed it automatically:
\`\`\`ts
import argon2 from 'argon2'
const hash = await argon2.hash(password, { type: argon2.argon2id }) // salt + params embedded
const ok = await argon2.verify(hash, attempt)                       // constant-time compare
\`\`\`
- **Work factor:** tune so hashing takes ~100–500 ms on your servers; store the parameters with the hash and **rehash on login** when you raise them.
- **Pepper (optional):** an additional secret kept outside the DB (in a secret manager), so a DB-only leak is not enough.
- bcrypt truncates input at 72 bytes, so be aware of very long passphrases.

**Modern policy (NIST SP 800-63B style):**
- Minimum length (8+, ideally 12+), allow long passphrases and all characters.
- **Check against breached-password lists** (for example the Have I Been Pwned k-anonymity API).
- No forced periodic rotation or arbitrary composition rules (they lead to predictable patterns); force a change only on evidence of compromise.
- Rate-limit login attempts, offer **MFA** (TOTP or WebAuthn passkeys).
- Reset flows: single-use, short-lived, random tokens stored hashed; the same response whether or not the email exists.

**Hashing on the server makes login CPU-heavy:** this is also why login endpoints need rate limits, so attackers cannot use them for denial of service.`,
          keyPoints: [
            'Use argon2id, scrypt or bcrypt: slow and memory-hard',
            'Fast hashes like SHA-256 are brute-forceable after a leak',
            'Unique per-password salt defeats rainbow tables; optional pepper',
            'Tune the work factor and rehash on login when upgrading',
            'Breached-password checks, MFA, no forced rotation; secure reset tokens',
          ],
          pitfalls: ['Encrypting passwords instead of hashing', 'Using one global salt', 'Comparing hashes with non-constant-time comparison'],
          followUps: ['How would you migrate a database of MD5 hashes to argon2 without forcing resets?'],
          references: [{ label: 'OWASP Password Storage Cheat Sheet', url: 'https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html' }],
        },
        {
          id: 'sec-brute-force',
          title: 'Protecting login against brute force and credential stuffing',
          type: 'concept',
          difficulty: 'core',
          priority: 'should',
          tags: ['rate-limiting', 'brute-force', 'credential-stuffing', 'mfa', 'enumeration'],
          estMinutes: 5,
          roles: ['backend', 'full-stack'],
          prompt: `Your login endpoint is being hit with **thousands of attempts per minute from many IPs**, using leaked email/password pairs from other sites. **How do you defend it without locking out real users?**`,
          hints: [
            'Rate-limit by more than one key.',
            'Account lockout can itself become a denial-of-service weapon.',
            'Can an attacker tell whether an email has an account from your responses?',
          ],
          answer: `**This is credential stuffing:** valid pairs leaked elsewhere, tried at scale from a botnet. Per-IP limits alone fail because each IP makes only a few attempts.

**Layered defences:**
1. **Rate limiting on several keys** (in Redis): per IP, **per account** (for example 5 failures per 15 minutes, then slow down), per IP range or ASN, and globally for the endpoint. Return 429 with \`Retry-After\`.
2. **Progressive friction instead of hard lockout:** exponential delays and a **CAPTCHA or proof-of-work** after a few failures. A hard lockout lets an attacker lock out any user (denial of service), so use temporary soft locks plus notification.
3. **MFA**, ideally **passkeys or WebAuthn**: a stolen password alone is no longer enough. Offer step-up authentication for risky logins.
4. **Breached-password detection** at sign-up and login: reject or force a reset for passwords known from breaches.
5. **Prevent user enumeration:** the same message ("Invalid email or password"), status and **similar timing** for unknown emails (hash a dummy password); the same for password reset ("If an account exists, we sent an email").
6. **Bot and anomaly detection:** new device or location alerts to the user, risk scoring (IP reputation, impossible travel), a WAF or edge bot management for large attacks.
7. **Monitoring:** alert on spikes in failed logins and on success-rate anomalies; keep audit logs.

**Do not forget the other auth endpoints:** password reset, MFA code verification (6 digits is only a million combinations without rate limits), sign-up and invite acceptance need limits too.

**Remember the CPU cost:** each attempt runs a slow password hash, so limits also protect the servers from overload.`,
          keyPoints: [
            'Credential stuffing defeats per-IP limits alone',
            'Rate limit per IP, per account, per network and globally',
            'Progressive delays and CAPTCHA instead of permanent lockout',
            'MFA or passkeys and breached-password checks',
            'Prevent user enumeration via identical responses and timing',
          ],
          pitfalls: ['Hard account lockout that attackers can trigger', 'Different error messages for unknown email vs wrong password'],
          followUps: ['How would you rate-limit MFA code verification?'],
          personalAngle:
            'Your scraping work gives you the attacker’s view of bot detection: mention what made automated traffic easy or hard to spot.',
          references: [{ label: 'OWASP Credential Stuffing Prevention Cheat Sheet', url: 'https://cheatsheetseries.owasp.org/cheatsheets/Credential_Stuffing_Prevention_Cheat_Sheet.html' }],
        },
      ],
    },
    {
      id: 'sec-api',
      title: 'API & server-side security',
      summary: 'Injection, broken access control, SSRF, secrets and the software supply chain.',
      questions: [
        {
          id: 'sec-injection',
          title: 'Debug: SQL and NoSQL injection',
          type: 'debugging',
          difficulty: 'core',
          priority: 'must',
          tags: ['sql-injection', 'nosql-injection', 'mongodb', 'postgresql', 'validation'],
          estMinutes: 7,
          roles: ['backend', 'full-stack'],
          prompt: `Both handlers below are exploitable. **Show an attack for each and fix them.**`,
          code: {
            language: 'typescript',
            source: `// 1) PostgreSQL search with sorting
app.get('/products', async (req, res) => {
  const { q, sort = 'name' } = req.query
  const rows = await db.query(
    \`SELECT id, name, price FROM products WHERE name ILIKE '%\${q}%' ORDER BY \${sort}\`,
  )
  res.json(rows)
})

// 2) MongoDB login
app.post('/login', async (req, res) => {
  const user = await users.findOne({ email: req.body.email, password: req.body.password })
  if (!user) return res.status(401).end()
  res.json(issueSession(user))
})`,
          },
          hints: [
            'What if q contains a single quote?',
            'Placeholders work for values. Do they work for column names in ORDER BY?',
            'With a JSON body, req.body.password does not have to be a string.',
          ],
          answer: `**1) SQL injection.** User input is concatenated into the SQL string.
- Attack via \`q\`: \`' UNION SELECT id, email, password_hash FROM users --\` dumps the users table. Time-based or error-based variants work even when output is hidden.
- \`sort\` is also injectable (\`sort=(SELECT CASE WHEN ... THEN name ELSE price END)\`) and **cannot be fixed with a placeholder**, because identifiers are not values.

**Fix:** parameterise values and **allow-list identifiers**:
\`\`\`ts
const SORTS = { name: 'name', price: 'price', newest: 'created_at DESC' } as const
app.get('/products', async (req, res) => {
  const q = typeof req.query.q === 'string' ? req.query.q : ''
  const sortKey = String(req.query.sort ?? 'name') as keyof typeof SORTS
  const order = SORTS[sortKey] ?? SORTS.name
  const rows = await db.query(
    \`SELECT id, name, price FROM products WHERE name ILIKE '%' || $1 || '%' ORDER BY \${order} LIMIT 50\`,
    [q],
  )
  res.json(rows.rows)
})
\`\`\`
The value is sent separately from the query text, so the database never parses it as SQL. ORMs and query builders (Prisma, Drizzle, Knex) parameterise by default, but **raw query escape hatches** (\`$queryRawUnsafe\`, \`knex.raw\` with interpolation) bring the bug back. Also escape \`%\` and \`_\` if users should not use wildcards, and connect with a **least-privilege DB user**.

**2) NoSQL (operator) injection.** The JSON body can contain objects: \`{"email": "admin@site.com", "password": {"$ne": null}}\` matches any password, so the attacker logs in as admin. \`{"$gt": ""}\` works the same way.

**Fix:**
- **Validate types and shape** with a schema (zod, class-validator) so \`email\` and \`password\` must be strings; or strip keys starting with \`$\` (express-mongo-sanitize, Mongoose \`sanitizeFilter\`).
- **And the real bug:** the code compares plaintext passwords in the query. Look up by email only, then verify a **hash** with argon2 or bcrypt:
\`\`\`ts
const { email, password } = LoginSchema.parse(req.body) // z.object({ email: z.string().email(), password: z.string() })
const user = await users.findOne({ email })
if (!user || !(await argon2.verify(user.passwordHash, password))) return res.status(401).end()
\`\`\`

**General rule:** never build queries (SQL, NoSQL, shell, LDAP, template) by concatenating input; validate input types at the boundary.`,
          keyPoints: [
            'String-concatenated SQL enables UNION, boolean and time-based injection',
            'Parameterised queries for values; allow-lists for identifiers like ORDER BY columns',
            'Raw-query escape hatches in ORMs reintroduce injection',
            'NoSQL operator injection via objects in JSON bodies; validate types with a schema',
            'Least-privilege DB users; hash passwords and verify outside the query',
          ],
          pitfalls: ['Trying to escape quotes manually', 'Assuming MongoDB is immune to injection'],
          followUps: ['How does a second-order SQL injection work?'],
          references: [{ label: 'OWASP SQL Injection Prevention Cheat Sheet', url: 'https://cheatsheetseries.owasp.org/cheatsheets/SQL_Injection_Prevention_Cheat_Sheet.html' }],
        },
        {
          id: 'sec-broken-access-control',
          title: 'Debug: an IDOR in a multi-tenant API',
          type: 'debugging',
          difficulty: 'foundation',
          priority: 'nice',
          tags: ['access-control', 'idor', 'multi-tenant', 'authorization'],
          estMinutes: 5,
          roles: ['backend', 'full-stack'],
          prompt: `Users are authenticated, and the frontend only shows a customer's own reports. **Why is this endpoint still vulnerable, and how do you fix it so the mistake cannot easily happen again?**`,
          code: {
            language: 'typescript',
            source: `router.get('/reports/:id', requireAuth, async (req, res) => {
  const report = await prisma.report.findUnique({ where: { id: req.params.id } })
  if (!report) return res.status(404).end()
  res.json(report)
})

router.patch('/reports/:id', requireAuth, async (req, res) => {
  const report = await prisma.report.update({ where: { id: req.params.id }, data: req.body })
  res.json(report)
})`,
          },
          hints: [
            'Authentication tells you who the user is. What checks what they may access?',
            'Change the id in the URL.',
            'Look at what data: req.body allows.',
          ],
          answer: `**The bug: authentication without authorisation (IDOR, insecure direct object reference).** Any logged-in user can request \`/reports/<any id>\` and read or modify another tenant's report. Hiding it in the UI does nothing; ids leak or can be guessed (and even UUIDs are not access control).

**Second bug: mass assignment.** \`data: req.body\` lets the caller set any column, for example \`tenantId\` (moving the report to another tenant) or \`ownerId\`.

**Fix: scope every query by the caller's tenant, and allow-list writable fields:**
\`\`\`ts
const UpdateReport = z.object({ title: z.string().max(200).optional(), notes: z.string().optional() })

router.get('/reports/:id', requireAuth, async (req, res) => {
  const report = await prisma.report.findFirst({
    where: { id: req.params.id, tenantId: req.user.tenantId },
  })
  if (!report) return res.status(404).end() // 404, not 403: do not reveal existence
  res.json(report)
})

router.patch('/reports/:id', requireAuth, requireRole('editor'), async (req, res) => {
  const data = UpdateReport.parse(req.body)
  const { count } = await prisma.report.updateMany({
    where: { id: req.params.id, tenantId: req.user.tenantId },
    data,
  })
  if (!count) return res.status(404).end()
  res.json({ ok: true })
})
\`\`\`

**Making it hard to get wrong:**
- A **repository or service layer** that always takes the tenant context, so raw unscoped queries are rare and easy to spot in review.
- **Postgres row-level security** (\`tenant_id = current_setting('app.tenant_id')\`) as a database-level backstop.
- Centralised policy checks (CASL, a \`can(user, action, resource)\` helper) instead of ad-hoc ifs.
- **Tests** that log in as tenant A and assert 404 on tenant B's resources for every endpoint.
- DTOs or schemas for both input (no mass assignment) and output (no leaking internal fields).`,
          keyPoints: [
            'Authentication is not authorisation; check ownership or tenant on every request',
            'Scope queries by tenant in the WHERE clause; return 404 for others',
            'Mass assignment: allow-list writable fields with a schema',
            'Defence in depth: tenant-aware data layer, row-level security, centralised policies',
            'Cross-tenant tests for every endpoint',
          ],
          pitfalls: ['Relying on unguessable ids', 'Checking ownership after fetching but forgetting it on update or delete'],
          followUps: ['How would you implement row-level security in Postgres with a connection pool?'],
          personalAngle:
            'On the multi-customer Efilli platform, explain how you made sure one customer could never see another customer’s data.',
          references: [{ label: 'OWASP Authorization Cheat Sheet', url: 'https://cheatsheetseries.owasp.org/cheatsheets/Authorization_Cheat_Sheet.html' }],
        },
        {
          id: 'sec-ssrf',
          title: 'SSRF in features that fetch URLs',
          type: 'concept',
          difficulty: 'advanced',
          priority: 'should',
          tags: ['ssrf', 'scraping', 'cloud-metadata', 'dns-rebinding', 'puppeteer'],
          estMinutes: 7,
          roles: ['backend', 'full-stack'],
          prompt: `Your product lets users submit a URL that the server fetches (a link preview, a webhook, or a headless browser scan). **What is SSRF, what can an attacker reach, and how do you defend against it properly?**`,
          hints: [
            'The request comes from inside your network, with your server’s privileges.',
            'Checking the hostname string is not enough: think redirects, DNS and IP encodings.',
            'A headless browser follows redirects, loads subresources and runs JavaScript.',
          ],
          answer: `**SSRF (server-side request forgery):** the attacker makes **your server** send requests to destinations they choose. The server sits inside your network, so it can reach things the attacker cannot:
- **Cloud metadata endpoints** (\`http://169.254.169.254/\`), which can expose temporary cloud credentials. This was the vector in several major breaches.
- **Internal services:** admin panels, Redis or Elasticsearch without authentication, Kubernetes APIs, \`localhost\` debug ports.
- Port scanning of the internal network, and reading local files via \`file://\` if the client supports it.

**Why naive checks fail:**
- Hostname blocklists are bypassed with alternative IP encodings (\`http://2130706433\`, \`http://0x7f.1\`, \`[::ffff:127.0.0.1]\`), DNS names that resolve to private IPs (\`localtest.me\`), or **DNS rebinding** (resolves to a public IP at validation time and a private IP at fetch time).
- **Redirects:** a public URL that 302-redirects to \`http://169.254.169.254\`.

**Defences (layered):**
1. **Allow-list** destinations where possible (known webhook domains, specific APIs).
2. Allow only \`http\` and \`https\` schemes and standard ports.
3. **Resolve DNS yourself, validate every resolved IP** against blocked ranges (loopback, RFC1918 private ranges, link-local 169.254.0.0/16, unique-local and IPv6 equivalents, 0.0.0.0), then **connect to that validated IP** (pin it) so a second resolution cannot change it.
4. **Re-validate on every redirect** (or disable redirects), with a small redirect limit.
5. Timeouts, response size limits and content-type checks.
6. **Network-level isolation (the strongest layer):** run fetchers in a separate network segment or container with egress rules that block internal ranges and metadata; enforce IMDSv2 (session tokens) on AWS; give fetcher workloads no cloud credentials at all.

**Headless browsers are a bigger surface:** Puppeteer or Playwright follow redirects, load subresources, run the page's JavaScript and can open \`file://\` URLs. Use request interception to block private destinations for **every** request, run the browser in a locked-down container with egress filtering, disable or sandbox downloads, and never run it with credentials or on a host that can reach internal services.

**Also consider:** blind SSRF (no response returned) is still exploitable for internal state changes; webhook features should sign their requests and have their own allow-lists.`,
          keyPoints: [
            'SSRF makes the server request attacker-chosen destinations from inside your network',
            'Targets: cloud metadata credentials, internal services, localhost ports',
            'Bypasses: IP encodings, DNS rebinding, redirects',
            'Resolve and validate IPs, pin the connection, re-validate redirects',
            'Network egress isolation is the strongest layer; headless browsers need interception and sandboxing',
          ],
          pitfalls: ['Only string-matching "localhost" and "127.0.0.1"', 'Validating the first URL but following redirects blindly'],
          followUps: ['How would you design the egress network for a fleet of scraper workers?'],
          personalAngle:
            'Your scrapers and the accessibility scanner fetched arbitrary URLs with Puppeteer: explain which of these protections you had, and what you would add.',
          references: [{ label: 'OWASP SSRF Prevention Cheat Sheet', url: 'https://cheatsheetseries.owasp.org/cheatsheets/Server_Side_Request_Forgery_Prevention_Cheat_Sheet.html' }],
        },
        {
          id: 'sec-secrets-supply-chain',
          title: 'Secrets management and supply-chain security',
          type: 'concept',
          difficulty: 'core',
          priority: 'should',
          tags: ['secrets', 'supply-chain', 'npm', 'dependencies', 'ci-cd', 'sbom'],
          estMinutes: 6,
          roles: ['backend', 'full-stack', 'general'],
          prompt: `A popular npm package you depend on transitively publishes a malicious version that **steals environment variables during \`postinstall\`**. **How do you reduce the risk of this kind of supply-chain attack, and how do you limit the damage if it happens?**`,
          hints: [
            'Think about what decides which version gets installed.',
            'What secrets are available in the environment where npm install runs?',
            'Prevention, detection and blast radius are separate concerns.',
          ],
          answer: `**Reduce the chance of installing something malicious:**
- **Lockfile committed and \`npm ci\` in CI**, so installs are reproducible and new versions arrive only through a reviewed PR (Renovate or Dependabot), not silently on the next build.
- Consider a **minimum release age** before adopting new versions (most malicious releases are detected within days), and review dependency changes in PRs.
- **Fewer dependencies:** remove unused packages; prefer well-maintained ones with many maintainers and provenance.
- **Disable install scripts** where possible (\`npm ci --ignore-scripts\`, or an allow-list of packages that may run scripts).
- Use a private registry proxy or scanning (Socket, Snyk, npm audit, GitHub Dependabot alerts) and check **npm provenance** (packages built from a known repository by a verified pipeline).
- Pin GitHub Actions to a version or **commit SHA**; third-party actions are dependencies too.

**Limit the blast radius (assume it will happen):**
- **CI installs should not have production secrets:** run install, build and test with no deploy credentials; the deploy job gets its credentials separately (OIDC short-lived tokens scoped to that job and environment).
- Least-privilege workflow tokens (\`permissions:\`), no secrets for fork PRs.
- **Secrets in a secret manager**, scoped per service and environment, rotated regularly; short-lived credentials instead of long-lived keys.
- Runtime containers with minimal permissions and egress restrictions (exfiltration needs network access).
- Developer machines: avoid long-lived cloud credentials in plain files.

**Detect and respond:**
- An **SBOM** (software bill of materials) or at least the lockfile tells you within minutes whether you were affected by an advisory.
- **Secret scanning** (GitHub push protection, gitleaks) for leaked credentials in code.
- A response plan: identify affected builds, **rotate every secret that was reachable**, rebuild from clean dependencies, review audit logs for misuse.

**Secrets basics recap:** never in git, images or frontend bundles; validated at boot; separate per environment; rotated; access is logged.`,
          keyPoints: [
            'Lockfile plus npm ci; updates only through reviewed PRs',
            'Fewer dependencies, ignore install scripts, provenance and scanning',
            'Pin CI actions; the install step should have no production secrets',
            'Short-lived scoped credentials (OIDC), secret manager, rotation',
            'SBOM and secret scanning; a rotation-first incident plan',
          ],
          pitfalls: ['Running npm install with deploy credentials in the environment', 'Assuming npm audit catches malicious (not just vulnerable) packages'],
          followUps: ['What is typosquatting and how would you guard against it?'],
          personalAngle:
            'As the author of REI-KIT on npm, you are also a publisher: mention how you protect your npm account (2FA, provenance, trusted publishing) and what consumers can verify.',
          references: [{ label: 'npm docs: generating provenance statements', url: 'https://docs.npmjs.com/generating-provenance-statements' }],
        },
      ],
    },
  ],
}

export default track
