import type { Track } from '@/types/content'

const track: Track = {
  id: 'networking',
  code: 'L',
  title: 'Networking',
  summary: 'From DNS to TLS to HTTP/3: what happens on the wire and how to debug it.',
  rationale:
    '"What happens when you type a URL" is one of the most common interview questions, and backend roles follow up with TLS, load balancers and debugging tools. You have deployed servers, proxies and SSR integrations, so this track gives you the protocol vocabulary to explain what you already operate.',
  icon: 'Network',
  phase: 3,
  modules: [
    {
      id: 'net-foundations',
      title: 'Layers, DNS & transport',
      summary: 'The models, name resolution, TCP vs UDP.',
      questions: [
        {
          id: 'net-osi-tcpip',
          title: 'OSI vs TCP/IP models',
          type: 'multiple-choice',
          difficulty: 'foundation',
          priority: 'should',
          tags: ['osi', 'tcp-ip', 'layers'],
          estMinutes: 3,
          roles: ['general'],
          prompt: `Match technologies to layers. **Which statements are correct?** Select all that apply.`,
          choices: [
            { id: 'a', text: 'TCP and UDP are transport-layer (L4) protocols', correct: true, explanation: 'They provide process-to-process delivery via ports.' },
            { id: 'b', text: 'IP is a data-link (L2) protocol', correct: false, explanation: 'IP is the network layer (L3); Ethernet/Wi-Fi MAC are L2.' },
            { id: 'c', text: 'An L7 load balancer can route by URL path or header; an L4 one sees only IPs and ports', correct: true, explanation: 'L7 parses HTTP; L4 forwards TCP/UDP flows.' },
            { id: 'd', text: 'TLS fits neatly into exactly one OSI layer', correct: false, explanation: 'It sits between transport and application; often described as L6/"L4.5". The models are approximations.' },
          ],
          hints: ['Ports live at one layer, IP addresses at another.'],
          answer: `**a and c.**

The **OSI model** has 7 layers: Physical, Data link, Network, Transport, Session, Presentation, Application. The **TCP/IP model**, which is what the internet actually uses, collapses these into 4: **Link** (Ethernet, Wi-Fi, ARP), **Internet** (IP, ICMP), **Transport** (TCP, UDP, QUIC's UDP base) and **Application** (HTTP, DNS, TLS, SSH).

**Why it's useful in practice:**
- It gives shared vocabulary for **load balancers** (L4 vs L7), **firewalls** (L3/L4 rules vs a WAF at L7), and debugging ("is it DNS, TCP or HTTP?").
- **Encapsulation**: an HTTP request sits inside a TLS record, inside a TCP segment, inside an IP packet, inside an Ethernet frame. Each layer adds its own header.

The models are **teaching abstractions**. TLS, QUIC (transport functionality implemented in user space over UDP) and ARP don't map cleanly onto one layer, and good candidates say so instead of forcing it.`,
          keyPoints: [
            'TCP/IP 4 layers vs OSI 7',
            'L3 IP, L4 TCP/UDP ports, L7 HTTP',
            'L4 vs L7 load balancing',
            'Encapsulation',
            'Models are approximations',
          ],
          pitfalls: ['Reciting seven layers without being able to apply them'],
          references: [{ label: 'MDN: An overview of HTTP', url: 'https://developer.mozilla.org/en-US/docs/Web/HTTP/Overview' }],
        },
        {
          id: 'net-dns-resolution',
          title: 'How DNS resolution works',
          type: 'concept',
          difficulty: 'core',
          priority: 'must',
          tags: ['dns', 'ttl', 'resolver', 'records'],
          estMinutes: 6,
          roles: ['general'],
          prompt: `Walk me through resolving \`api.example.com\` from a fresh laptop. Which record types matter for a web deployment, and why did your DNS change "take hours to propagate"?`,
          hints: [
            'Stub resolver → recursive resolver → root → TLD → authoritative.',
            'Caches exist at every level and respect TTL.',
          ],
          answer: `**Resolution path:**
1. The app asks the OS **stub resolver**. It checks \`/etc/hosts\` and the OS cache, and the browser has its own cache.
2. The query goes to a **recursive resolver** (ISP, 1.1.1.1, 8.8.8.8, or a corporate one), usually over UDP port 53. It may use DNS-over-HTTPS or DNS-over-TLS.
3. On a cache miss the resolver walks the hierarchy **iteratively**:
   - **Root servers** answer with a referral to the \`.com\` **TLD** servers.
   - **TLD servers** answer with a referral to \`example.com\`'s **authoritative name servers** (their NS records).
   - The **authoritative server** returns the answer, for example \`A 203.0.113.10\`, with a **TTL**.
4. The resolver caches every answer by TTL and returns the result. The client connects.

**Record types:** \`A\`/\`AAAA\` (IPv4/IPv6), \`CNAME\` (alias to another name; not allowed at the zone apex, so providers offer ALIAS/ANAME flattening), \`NS\` (delegation), \`MX\` (mail), \`TXT\` (SPF, DKIM, domain verification), \`CAA\` (which CAs may issue certificates). Newer: \`HTTPS\`/\`SVCB\` records can advertise HTTP/3 support.

**"Propagation"** isn't a push. It's **cache expiry**. Resolvers and clients keep the old answer until its **TTL** runs out, and some ignore TTLs or cache negative answers (governed by the SOA's negative TTL). Changing NS records at the registrar takes even longer, because TLD delegations often have TTLs of 1–2 days.

**Migration practice:** lower the TTL (for example to 60 s) **a day before** the change, switch the record, verify with \`dig\`, then raise it again.

\`\`\`bash
dig +short api.example.com
dig +trace api.example.com        # walk root → TLD → authoritative yourself
dig @1.1.1.1 api.example.com A    # ask a specific resolver
\`\`\``,
          keyPoints: [
            'Stub → recursive → root → TLD → authoritative',
            'Caching at every level governed by TTL',
            'A/AAAA/CNAME/NS/MX/TXT/CAA; CNAME apex restriction',
            'Propagation = cache expiry; lower TTL before migrations',
            'dig +trace for debugging',
          ],
          pitfalls: ['Saying root servers know every domain\'s IP', 'Describing propagation as pushing updates'],
          followUps: ['How does DNS-based load balancing / GeoDNS work and what are its limits?'],
          personalAngle:
            'When you deployed the accessibility platform and pointed customer integrations at it, you dealt with DNS records and certificates. Describe how you would cut over with a lowered TTL.',
          references: [{ label: 'MDN: What is a domain name?', url: 'https://developer.mozilla.org/en-US/docs/Learn_web_development/Howto/Web_mechanics/What_is_a_domain_name' }],
        },
        {
          id: 'net-tcp-vs-udp',
          title: 'TCP handshake, flow control and congestion control vs UDP',
          type: 'tradeoff',
          difficulty: 'core',
          priority: 'must',
          tags: ['tcp', 'udp', 'handshake', 'congestion-control', 'flow-control'],
          estMinutes: 7,
          roles: ['general', 'backend'],
          prompt: `Explain the **TCP three-way handshake**, and the difference between **flow control** and **congestion control**. When would you choose **UDP** instead?`,
          hints: [
            'SYN, SYN-ACK, ACK: what is being synchronised?',
            'Flow control protects the receiver; congestion control protects the network.',
            'What do video calls and DNS care about more than reliability?',
          ],
          answer: `**TCP** gives a **reliable, ordered byte stream** on top of unreliable IP.

**Three-way handshake:**
1. Client → \`SYN\` with its initial sequence number (ISN).
2. Server → \`SYN-ACK\` with its own ISN, acknowledging the client's ISN + 1.
3. Client → \`ACK\`.

This synchronises sequence numbers in both directions (random ISNs make spoofing harder) and costs **one round trip** before data, plus more for TLS. Connections close with FIN/ACK exchanges. The side that closes first sits in \`TIME_WAIT\`, which matters on busy proxies.

**Reliability:** sequence numbers, ACKs, retransmission on timeout or duplicate ACKs, and checksums. **Head-of-line blocking**: one lost segment stalls everything behind it, because delivery is in order.

**Flow control** protects the **receiver**. The receiver advertises a **receive window** (rwnd), and the sender never has more unacknowledged bytes in flight than that.

**Congestion control** protects the **network**. The sender keeps a **congestion window** (cwnd): **slow start** (exponential growth), then **congestion avoidance** (additive increase), and it cuts back on loss (multiplicative decrease). Linux defaults to **CUBIC**; **BBR** models bandwidth and RTT instead of reacting to loss. Throughput is limited by min(rwnd, cwnd) / RTT. That's why **new connections are slow at first** and why connection reuse (keep-alive, HTTP/2) matters.

**UDP** is connectionless datagrams: no handshake, no ordering, no retransmission, just ports and a checksum. **Choose it when late data is useless or the application wants its own reliability:** DNS (one small request/response), real-time voice, video and games (drop a frame instead of stalling), metrics (StatsD), and **QUIC/HTTP/3**, which implements reliable streams, congestion control and TLS 1.3 in user space over UDP to avoid TCP head-of-line blocking and handshake latency.`,
          keyPoints: [
            'SYN/SYN-ACK/ACK synchronises sequence numbers; 1 RTT',
            'Reliability via seq/ack/retransmit; head-of-line blocking',
            'Flow control = receiver window; congestion control = cwnd, slow start, AIMD',
            'CUBIC/BBR; connection reuse matters',
            'UDP use cases incl. QUIC',
          ],
          pitfalls: ['Confusing flow and congestion control', 'Calling UDP "unreliable so never use it"'],
          followUps: ['What is TIME_WAIT and why can it exhaust ports on a proxy?'],
          references: [{ label: 'MDN: TCP glossary', url: 'https://developer.mozilla.org/en-US/docs/Glossary/TCP' }],
        },
        {
          id: 'net-ports-sockets',
          title: 'Ports, sockets and "address already in use"',
          type: 'concept',
          difficulty: 'foundation',
          priority: 'should',
          tags: ['ports', 'sockets', 'tcp', 'docker'],
          estMinutes: 4,
          roles: ['backend', 'full-stack'],
          prompt: `What is a **port**, and what uniquely identifies a TCP connection? Your Node app in Docker listens on port 3000 but \`curl localhost:3000\` from the host fails. Separately, restarting the app sometimes gives **EADDRINUSE**. Explain both.`,
          hints: [
            'A connection is identified by a 4-tuple (plus protocol).',
            'Inside a container, which interface is the app bound to, and is the port published?',
          ],
          answer: `A **port** is a 16-bit number that lets the transport layer deliver data to the right **process** on a host. Ports below 1024 are privileged on Linux: 22 SSH, 53 DNS, 80/443 HTTP(S), 5432 Postgres, 6379 Redis. Clients use random **ephemeral ports** (Linux defaults to 32768–60999). A **socket** is the OS endpoint (a file descriptor) a process uses to send and receive.

A TCP connection is uniquely identified by the **4-tuple** \`(src IP, src port, dst IP, dst port)\` plus the protocol. That's why one server port (443) can serve millions of clients. Each connection differs in client IP or port. A proxy that opens many outbound connections to **one** backend can run out of ephemeral ports, especially with many sockets in \`TIME_WAIT\`.

**Docker case:** two common causes.
1. The app **binds to \`127.0.0.1\`** inside the container. That's the container's own loopback, unreachable from outside. Bind to \`0.0.0.0\` (\`app.listen(3000, '0.0.0.0')\`; many frameworks default to localhost in development).
2. The port isn't **published**. \`EXPOSE\` is only documentation; you need \`-p 3000:3000\` (or \`ports:\` in Compose). Between Compose services, use the **service name** (\`http://api:3000\`), not \`localhost\`.

**EADDRINUSE:** another process (often the old instance that hasn't exited yet, or a zombie dev server) is still bound to the port. Find it with \`ss -tlnp | grep 3000\` or \`lsof -i :3000\`. Fix it with proper graceful shutdown, so the old process closes its listener on SIGTERM. Servers usually set \`SO_REUSEADDR\` so a listener can rebind while old connections sit in TIME_WAIT. Node does this by default.`,
          keyPoints: [
            'Port = process demultiplexing; well-known vs ephemeral',
            'Connection = 4-tuple; ephemeral port exhaustion',
            'Bind 0.0.0.0 in containers; EXPOSE vs -p publish',
            'Compose service DNS names instead of localhost',
            'EADDRINUSE diagnosis with ss/lsof',
          ],
          pitfalls: ['Thinking EXPOSE publishes the port', 'Using localhost to reach another container'],
          personalAngle:
            'Docker Compose networking with Redis, Postgres and API containers is part of your daily stack. A short story of a localhost-vs-service-name bug works well here.',
          references: [{ label: 'Docker docs: Port publishing', url: 'https://docs.docker.com/engine/network/port-publishing/' }],
        },
      ],
    },
    {
      id: 'net-web-protocols',
      title: 'TLS & HTTP versions',
      summary: 'Secure transport, HTTP/1.1 vs 2 vs 3, and the WebSocket upgrade.',
      questions: [
        {
          id: 'net-tls13-handshake',
          title: 'TLS 1.3 handshake and HTTPS',
          type: 'concept',
          difficulty: 'advanced',
          priority: 'must',
          tags: ['tls', 'https', 'certificates', 'handshake', 'security'],
          estMinutes: 7,
          roles: ['general', 'backend'],
          prompt: `What does **TLS** guarantee, and how does the **TLS 1.3 handshake** work? How does the browser know it's really talking to \`bank.example\`?`,
          hints: [
            'Three properties: confidentiality, integrity, authentication.',
            'Key exchange happens in the first flight in TLS 1.3.',
            'Certificate chain → trusted root; the hostname must match the SAN.',
          ],
          answer: `**TLS provides** **confidentiality** (encryption), **integrity** (tampering is detected through AEAD), and **server authentication** (certificates), plus optional client authentication (mTLS). HTTPS is HTTP inside TLS.

**TLS 1.3 handshake (1 RTT):**
1. **ClientHello**: supported cipher suites (AEAD, such as AES-GCM or ChaCha20-Poly1305), an **ephemeral key share** (ECDHE, for example X25519; increasingly a hybrid post-quantum share), **SNI** (the hostname) and **ALPN** (\`h2\`, \`http/1.1\`).
2. **ServerHello** with its own key share. Both sides now derive the same **session keys** using (EC)DHE. Everything after this point is **encrypted**, including the server's **Certificate**, **CertificateVerify** (a signature over the handshake, proving the server holds the certificate's private key) and **Finished**.
3. The client verifies everything, sends **Finished**, and application data flows.

Compared with TLS 1.2, it takes **one RTT instead of two**, removes legacy options (RSA key exchange, CBC, SHA-1), and makes **forward secrecy** mandatory: ephemeral keys mean a later leak of the server's private key can't decrypt recorded traffic. **0-RTT** resumption is available but **replayable**, so only use it for idempotent requests.

**Authenticating the server:**
- The certificate chain must lead to a **root CA in the trust store**, each signature must be valid, and the certificate must not be expired or revoked.
- The hostname must match the certificate's **SAN**.
- The CertificateVerify signature proves possession of the private key.
- Certificate Transparency logs make mis-issuance detectable.

**Operations:** automate certificates with ACME (Let's Encrypt), send the **full chain** (a missing intermediate breaks some clients), enable HSTS, and terminate TLS at the load balancer or reverse proxy. Re-encrypt to backends where the network isn't trusted.`,
          keyPoints: [
            'Confidentiality, integrity, authentication',
            '1-RTT handshake with ephemeral ECDHE key shares',
            'Certificate + CertificateVerify encrypted in 1.3',
            'Chain to trusted root, SAN hostname match',
            'Forward secrecy; 0-RTT replay risk',
          ],
          pitfalls: ['Saying the server\'s certificate public key encrypts the session data', 'Forgetting intermediate certificates'],
          followUps: ['What is mTLS and when would you use it between services?'],
          references: [{ label: 'MDN: Transport Layer Security', url: 'https://developer.mozilla.org/en-US/docs/Web/Security/Transport_Layer_Security' }],
        },
        {
          id: 'net-http-versions',
          title: 'HTTP/1.1 vs HTTP/2 vs HTTP/3',
          type: 'tradeoff',
          difficulty: 'core',
          priority: 'must',
          tags: ['http', 'http2', 'http3', 'quic', 'multiplexing'],
          estMinutes: 6,
          roles: ['general', 'frontend', 'backend'],
          prompt: `What problems does **HTTP/2** solve over HTTP/1.1, and what problem remains that **HTTP/3** solves? Does domain sharding or bundling still make sense?`,
          hints: [
            'HTTP/1.1: one outstanding request per connection.',
            'HTTP/2 multiplexes, but over one TCP connection.',
            'QUIC moves streams into the transport over UDP.',
          ],
          answer: `**HTTP/1.1** is text-based with **persistent connections** (keep-alive). Each connection handles **one request at a time** (pipelining was never usable in practice), so browsers open about 6 connections per origin, and a slow response blocks the ones queued behind it. Headers are repeated uncompressed on every request.

**HTTP/2** (usually over TLS with ALPN \`h2\`):
- A **binary framing** layer with **multiplexed streams** over **one TCP connection**. Many requests are in flight at once, which fixes application-level head-of-line blocking.
- **HPACK** header compression.
- Stream prioritisation (later simplified by RFC 9218 priority hints). Server push existed but is **deprecated and removed in browsers**; use \`103 Early Hints\` or preload instead.
- **The remaining problem:** **TCP head-of-line blocking**. One lost packet stalls *all* streams, because TCP delivers bytes in order. On lossy mobile networks, HTTP/2 can do worse than several HTTP/1.1 connections.

**HTTP/3** runs over **QUIC** (on UDP):
- Streams are **independent at the transport layer**: loss on one stream doesn't block the others.
- **TLS 1.3 is built in**: 1 RTT for a new connection, 0-RTT on resumption.
- **Connection migration** through connection IDs: switching from Wi-Fi to 4G keeps the connection.
- QPACK header compression. Discovered via \`Alt-Svc\` or DNS \`HTTPS\` records, with fallback to h2 when UDP is blocked.

**Old optimisations:** **domain sharding** works *against* HTTP/2 and HTTP/3 (more connections and handshakes, and it defeats multiplexing). Drop it. **Bundling** still helps somewhat (compression ratios, fewer requests to discover), but many small cacheable modules are no longer penalised much. Modern tools ship split chunks rather than one huge bundle.`,
          keyPoints: [
            'HTTP/1.1: one request per connection, ~6 connections, text headers',
            'HTTP/2: binary frames, multiplexing, HPACK, one TCP connection',
            'TCP head-of-line blocking remains',
            'HTTP/3/QUIC: independent streams, built-in TLS 1.3, connection migration',
            'Sharding is counterproductive now; push deprecated',
          ],
          pitfalls: ['Saying HTTP/2 eliminates all head-of-line blocking', 'Recommending server push'],
          followUps: ['Why might a corporate network break HTTP/3?'],
          personalAngle:
            'Your SEO and performance work on a high-traffic content site is a good example of where protocol upgrades and fewer origins improved real load times.',
          references: [{ label: 'MDN: Evolution of HTTP', url: 'https://developer.mozilla.org/en-US/docs/Web/HTTP/Basics_of_HTTP/Evolution_of_HTTP' }],
        },
        {
          id: 'net-websocket-upgrade',
          title: 'How the WebSocket upgrade works',
          type: 'concept',
          difficulty: 'core',
          priority: 'nice',
          tags: ['websockets', 'http-upgrade', 'proxy', 'nginx'],
          estMinutes: 4,
          roles: ['backend', 'full-stack'],
          prompt: `How does a **WebSocket connection get established** from an HTTP request? Your WebSocket works locally but **disconnects after 60 seconds** behind nginx in production. Why?`,
          hints: [
            'It starts as an HTTP/1.1 GET with special headers; the response is 101.',
            'Proxies must forward Upgrade/Connection and have idle timeouts.',
          ],
          answer: `A WebSocket starts as an **HTTP/1.1 GET** with:

\`\`\`plaintext
GET /ws HTTP/1.1
Host: app.example
Upgrade: websocket
Connection: Upgrade
Sec-WebSocket-Key: dGhlIHNhbXBsZSBub25jZQ==
Sec-WebSocket-Version: 13
Origin: https://app.example
\`\`\`

The server replies \`101 Switching Protocols\` with \`Sec-WebSocket-Accept\`, a hash of the key plus a fixed GUID, which proves the server understood the WebSocket protocol. After that, the **same TCP (and TLS) connection** carries WebSocket **frames** in both directions: text, binary, ping/pong, close. Client-to-server frames are masked. Over HTTP/2 there's an extended CONNECT mechanism (RFC 8441), but most deployments still use HTTP/1.1 upgrades.

**The 60-second disconnect behind nginx:**
1. \`Upgrade\` and \`Connection\` are **hop-by-hop headers**, and nginx doesn't forward them by default. Without them the upgrade fails outright. Since it connected, that part is configured.
2. **\`proxy_read_timeout\` defaults to 60 s**: if no data flows for 60 seconds, nginx closes the idle connection. Cloud load balancers have similar idle timeouts.

\`\`\`plaintext
location /ws {
  proxy_pass http://app:3000;
  proxy_http_version 1.1;
  proxy_set_header Upgrade $http_upgrade;
  proxy_set_header Connection "upgrade";
  proxy_read_timeout 3600s;
}
\`\`\`

Also send **application-level heartbeats** (ping/pong every 20–30 s), which keeps intermediaries from timing out and detects dead peers. The client should **reconnect with backoff**. **Validate \`Origin\`** on the server: browsers don't apply CORS to WebSockets, so cross-site WebSocket hijacking is possible with cookie auth.`,
          keyPoints: [
            'HTTP/1.1 GET with Upgrade/Connection → 101',
            'Sec-WebSocket-Key/Accept handshake',
            'Proxies must forward hop-by-hop upgrade headers',
            'Idle timeouts (nginx 60s) → heartbeats + timeout config',
            'Validate Origin (no CORS for WS)',
          ],
          pitfalls: ['Assuming CORS protects WebSocket endpoints'],
          references: [{ label: 'MDN: Writing WebSocket servers', url: 'https://developer.mozilla.org/en-US/docs/Web/API/WebSockets_API/Writing_WebSocket_servers' }],
        },
      ],
    },
    {
      id: 'net-infrastructure',
      title: 'Proxies, load balancers & CDNs',
      summary: 'The boxes between the client and your app, and how they shape latency.',
      questions: [
        {
          id: 'net-proxies-load-balancers',
          title: 'Forward vs reverse proxy; L4 vs L7 load balancing',
          type: 'tradeoff',
          difficulty: 'core',
          priority: 'should',
          tags: ['reverse-proxy', 'load-balancer', 'nginx', 'l4', 'l7'],
          estMinutes: 6,
          roles: ['backend', 'full-stack'],
          prompt: `What is the difference between a **forward proxy** and a **reverse proxy**? Compare **L4 and L7 load balancers**, and explain how your app gets the client's real IP behind them.`,
          hints: [
            'Whom does each proxy act on behalf of?',
            'Does the balancer read HTTP?',
            'X-Forwarded-For and trust boundaries.',
          ],
          answer: `**Forward proxy** acts for **clients**: corporate egress proxies, filtering, anonymity, caching. The server sees the proxy's IP. **Reverse proxy** acts for **servers**: clients think it *is* the site. Examples are nginx, Caddy, Traefik, Envoy, cloud load balancers and CDNs. It handles TLS termination, routing, compression, caching, rate limiting and hides the backends.

**L4 load balancer** works on **TCP/UDP flows** (IP + port). It's fast and protocol-agnostic, and it can pass TLS through untouched. But it can't route on paths or headers, and it balances **connections**, not requests. One long-lived HTTP/2 or WebSocket connection pins all its traffic to one backend.

**L7 load balancer** **parses HTTP**. It can route \`/api\` vs \`/static\`, route by host header (virtual hosts), do sticky sessions via cookies, retries, health checks per route, header rewrites, WAF rules, and balance **per request** across HTTP/2 streams. The cost is TLS termination (CPU and certificate management) and more latency per hop.

**Algorithms:** round robin, least connections (good for uneven request durations), weighted, and consistent hashing (cache affinity). Pair with **active health checks** and connection draining for deploys.

**Real client IP:** the backend sees the proxy's address. The proxy appends to \`X-Forwarded-For\` (or the standard \`Forwarded\` header). L4 balancers can use the **PROXY protocol**. The trap: XFF is **client-controllable**. Only trust entries added by **your own proxies** and read the right-most untrusted hop. In Express that's \`app.set('trust proxy', 1)\` (the number of hops), and in nginx \`set_real_ip_from\` plus \`real_ip_header\`. Rate limiting or audit logging on a spoofed XFF is a real vulnerability.`,
          keyPoints: [
            'Forward = client side, reverse = server side',
            'L4: connection-level, fast, no HTTP awareness',
            'L7: per-request routing, headers/paths, TLS termination',
            'Balancing algorithms + health checks + draining',
            'X-Forwarded-For trust configuration',
          ],
          pitfalls: ['Trusting the left-most X-Forwarded-For value', 'Expecting L4 to balance HTTP/2 requests evenly'],
          followUps: ['How do sticky sessions affect scaling and deploys?'],
          personalAngle:
            'You configured servers and deployed with Docker. Describe your reverse proxy setup (nginx or Caddy in front of containers, TLS termination) and how the app read client IPs.',
          references: [{ label: 'MDN: X-Forwarded-For', url: 'https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/X-Forwarded-For' }],
        },
        {
          id: 'net-what-happens-url',
          title: 'What happens when you type a URL and press Enter',
          type: 'system-design',
          difficulty: 'core',
          priority: 'must',
          tags: ['dns', 'tcp', 'tls', 'http', 'cdn', 'rendering', 'latency'],
          estMinutes: 12,
          roles: ['general', 'frontend', 'full-stack'],
          prompt: `You type \`https://shop.example/products\` and press Enter. **Explain everything that happens until the page is interactive.** Then point out where latency comes from and how a CDN helps.`,
          hints: [
            'Go layer by layer: URL parsing, caches, DNS, TCP, TLS, HTTP, server, rendering.',
            'Count the round trips before the first byte.',
            'A CDN shortens physical distance and terminates connections near the user.',
          ],
          answer: `**1. Browser:** parses the URL and checks **HSTS** (forces https). It may serve from the **HTTP cache** or a service worker. It checks for an existing connection to reuse.

**2. DNS:** browser cache → OS → recursive resolver → root/TLD/authoritative if not cached. Returns A/AAAA records, possibly CDN edge IPs chosen by GeoDNS or anycast. **0–1+ RTT.**

**3. Connection:** a TCP handshake (**1 RTT**) then a TLS 1.3 handshake (**1 RTT**), with ALPN choosing h2. Or **QUIC/HTTP/3**, which does both in **1 RTT** combined (0-RTT on resumption).

**4. HTTP request:** \`GET /products\` with cookies, \`Accept-Encoding\` and so on. It reaches a **CDN edge**, then perhaps a load balancer, a reverse proxy and the app server, which renders the page (database and cache queries) and returns HTML compressed with gzip or brotli.

**5. Rendering:** the browser parses HTML into the **DOM** as bytes stream in. The preload scanner fetches CSS, JS and fonts early. CSS → **CSSOM**. **Render-blocking** CSS and synchronous scripts delay the first paint. Then style → layout → paint → composite. That gives **FCP** and **LCP**.

**6. Interactivity:** JavaScript downloads, parses and executes. Frameworks **hydrate** server HTML and attach event handlers. Long tasks on the main thread hurt **INP**. More requests go to APIs and images.

**Latency sources:** the **speed of light** (Tokyo to us-east is about 150 ms RTT), handshake round trips, **TCP slow start** on new connections, server processing (TTFB), request waterfalls (HTML → CSS → font, or JS → API), large JS bundles, and main-thread work.

**How a CDN helps:** edges sit **close to users**, so handshakes complete in a few milliseconds. The edge keeps **warm, long-lived connections** to the origin (avoiding slow start). It caches static assets (\`Cache-Control: public, max-age=31536000, immutable\` for hashed files) and even HTML (\`s-maxage\`, \`stale-while-revalidate\`). It also absorbs traffic spikes and DDoS, and terminates TLS and HTTP/3 at the edge.`,
          keyPoints: [
            'HSTS, caches, DNS, TCP, TLS (or QUIC), HTTP, server, response',
            'Counts round trips; RTT dominated by distance',
            'Critical rendering path: DOM, CSSOM, render-blocking resources',
            'Hydration / JS execution → interactivity (INP)',
            'CDN: proximity, warm origin connections, caching, edge TLS',
          ],
          pitfalls: ['Skipping TLS or rendering entirely', 'Going extremely deep on one layer and never finishing'],
          followUps: ['How would you reduce TTFB for users in Japan on a US-hosted app?'],
          personalAngle:
            'You are in Tokyo. Use real RTTs to US and EU regions to explain why edge caching and region choice matter for Japanese users.',
          references: [{ label: 'MDN: How browsers work', url: 'https://developer.mozilla.org/en-US/docs/Web/Performance/Guides/How_browsers_work' }],
        },
        {
          id: 'net-troubleshooting-tools',
          title: 'Troubleshooting with dig, curl -v and traceroute',
          type: 'debugging',
          difficulty: 'advanced',
          priority: 'should',
          tags: ['troubleshooting', 'dig', 'curl', 'traceroute', 'tls'],
          estMinutes: 8,
          roles: ['backend', 'full-stack'],
          prompt: `Users report \`https://api.example.com\` is **"down"**, but your monitoring says the server is fine. Here is your first command's output. **What is the problem, and how do you narrow it down layer by layer?**`,
          code: {
            language: 'bash',
            source: `$ curl -v https://api.example.com/health
*   Trying 203.0.113.10:443...
* Connected to api.example.com (203.0.113.10) port 443
* ALPN: curl offers h2,http/1.1
* TLSv1.3 (OUT), TLS handshake, Client hello (1):
* TLSv1.3 (IN), TLS handshake, Server hello (2):
* TLSv1.3 (IN), TLS handshake, Certificate (11):
* SSL certificate problem: unable to get local issuer certificate
* Closing connection
curl: (60) SSL certificate problem: unable to get local issuer certificate`,
          },
          hints: [
            'DNS resolved and TCP connected. What failed?',
            'Browsers often have intermediates cached; curl and mobile apps do not.',
            'Check what chain the server actually sends.',
          ],
          answer: `**Reading the output:** DNS resolved (\`Trying 203.0.113.10\`), TCP connected on 443, and TLS 1.3 started. The failure is **certificate validation**: "unable to get local issuer certificate". The server is almost certainly **sending only the leaf certificate without the intermediate**. Desktop browsers often get away with it (they cache intermediates or fetch them via AIA), while \`curl\`, mobile apps, Node clients and webhooks fail. That's why monitoring from a browser says "fine".

**Confirm and fix:**

\`\`\`bash
openssl s_client -connect api.example.com:443 -servername api.example.com -showcerts </dev/null
# look at "Certificate chain": only depth 0 present → missing intermediate
\`\`\`

Configure the server to send the **full chain**: nginx \`ssl_certificate fullchain.pem\`, not \`cert.pem\`. With certbot that's \`fullchain.pem\`. Then reload and re-test.

**Layer-by-layer method for "it's down":**
1. **DNS:** \`dig +short api.example.com\`, \`dig @8.8.8.8 …\` and \`dig +trace\`. Wrong or stale IP? Different answers from different resolvers?
2. **Reachability/routing:** \`ping\` (ICMP may be blocked), and \`traceroute\` / \`mtr api.example.com\` to see where packets stop or latency jumps.
3. **TCP port:** \`nc -vz host 443\`. A timeout means a firewall or security group; "refused" means nothing is listening. On the server, \`ss -tlnp\`.
4. **TLS:** \`openssl s_client\` for the chain, expiry, SNI and hostname match.
5. **HTTP:** \`curl -v\` (status, headers, redirects), \`curl --resolve api.example.com:443:<ip>\` to hit a specific backend while bypassing DNS or the CDN, and \`curl -w '%{time_namelookup} %{time_connect} %{time_appconnect} %{time_starttransfer}\\n'\` for timing per phase.
6. **App:** logs, health of dependencies.

Always **reproduce from the user's vantage point** (their network, region or client type). "Works on my machine" is often a cache, resolver or client difference.`,
          keyPoints: [
            'Reads verbose output: DNS ok, TCP ok, TLS chain fails',
            'Missing intermediate; browsers mask it',
            'openssl s_client -showcerts; fullchain fix',
            'Layered method: dig → traceroute/mtr → nc → openssl → curl',
            'curl --resolve and -w timing',
          ],
          pitfalls: ['Using curl -k and calling it fixed', 'Concluding the server is fine because a browser works'],
          followUps: ['How would you monitor certificate expiry and chain validity?'],
          personalAngle:
            'Enterprise clients integrating with your platform often call it from server-side code, which fails on chain problems that browsers hide. If you debugged an integration issue like this, tell it.',
          references: [{ label: 'curl documentation', url: 'https://curl.se/docs/' }],
        },
      ],
    },
  ],
}

export default track
