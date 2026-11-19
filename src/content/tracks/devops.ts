import type { Track } from '@/types/content'

const track: Track = {
  id: 'devops',
  code: 'P',
  title: 'DevOps, Cloud & Delivery',
  summary: 'Docker, CI/CD, Linux servers, deployment strategies and observability.',
  rationale:
    'You configured servers over SSH, containerised services with Docker and wrote YAML CI/CD pipelines for the Efilli platform, which is rare for a mid-level candidate and a strong differentiator for full-stack roles. This track turns that hands-on experience into precise explanations of why things work, plus the deployment and observability concepts interviewers use to probe depth.',
  icon: 'Container',
  phase: 3,
  modules: [
    {
      id: 'ops-containers',
      title: 'Containers & Docker',
      summary: 'What containers are, efficient images, and multi-service local setups.',
      questions: [
        {
          id: 'ops-containers-vs-vms',
          title: 'Containers vs virtual machines',
          type: 'concept',
          difficulty: 'foundation',
          priority: 'must',
          tags: ['docker', 'containers', 'virtual-machines', 'linux', 'namespaces', 'cgroups'],
          estMinutes: 4,
          roles: ['backend', 'full-stack', 'general'],
          prompt: `**What is a container, and how is it different from a virtual machine?** What actually isolates a container on Linux, and what are the security implications?`,
          hints: [
            'Which kernel does a container run on?',
            'Two Linux kernel features do most of the work: one limits what a process can see, the other what it can use.',
            'An image is not a container. Think layers and a writable layer on top.',
          ],
          answer: `**A container is an ordinary Linux process (or group of processes) isolated by kernel features, sharing the host's kernel. A VM runs a full guest OS with its own kernel on a hypervisor.**

| | Container | VM |
| --- | --- | --- |
| Kernel | Shared with the host | Its own guest kernel |
| Startup | Milliseconds to seconds | Tens of seconds to minutes |
| Size | MBs (app plus userland libraries) | GBs (a whole OS) |
| Density | Hundreds per host | Tens per host |
| Isolation | Process-level: weaker | Hardware-virtualised: stronger |

**What isolates a container:**
- **Namespaces** limit what the process **sees**: its own PID tree, network stack, mount table, hostname (UTS), IPC and users.
- **cgroups** limit what it can **use**: CPU, memory, I/O and process count. A memory limit breach gets the process OOM-killed.
- **Union or overlay filesystem:** an image is a stack of read-only layers, and the container adds a thin writable layer. Changes vanish when the container is removed unless they go to a **volume**.
- Plus capabilities dropping, seccomp and AppArmor or SELinux profiles.

**Image vs container:** the image is the immutable template (layers plus metadata); the container is a running instance of it, like a class and an object.

**Security implications:**
- Because the kernel is shared, a kernel exploit can escape the container. Do not treat containers as a hard security boundary for untrusted code; use VMs or sandboxed runtimes (gVisor, Firecracker) for that.
- Run as a **non-root user**, drop capabilities, avoid \`--privileged\`, and never mount the Docker socket into an app container (that equals root on the host).

**Why teams use containers:** the same artefact runs in dev, CI and production ("works on my machine" goes away), deploys are fast, and the environment is reproducible. Docker Desktop on macOS and Windows actually runs containers inside a small Linux VM.`,
          keyPoints: [
            'Containers share the host kernel; VMs run their own',
            'Namespaces isolate visibility; cgroups limit resources',
            'Images are read-only layers; containers add a writable layer, so use volumes for persistence',
            'Weaker isolation: run as non-root, drop capabilities, never mount the Docker socket',
          ],
          pitfalls: [
            'Calling containers "lightweight VMs" without explaining the shared kernel',
            'Storing important data in the container filesystem',
          ],
          followUps: ['What happens when a container exceeds its memory limit?', 'Why is PID 1 special inside a container?'],
          references: [{ label: 'Docker docs', url: 'https://docs.docker.com/' }],
        },
        {
          id: 'ops-dockerfile-multistage',
          title: 'Debug: a slow, bloated Node.js Dockerfile',
          type: 'debugging',
          difficulty: 'core',
          priority: 'must',
          tags: ['docker', 'dockerfile', 'multi-stage', 'layer-caching', 'security'],
          estMinutes: 10,
          roles: ['backend', 'full-stack'],
          prompt: `This image is **1.4 GB**, every code change **reinstalls all dependencies**, and the security team flagged it. **What is wrong, and how would you rewrite it?**`,
          code: {
            language: 'plaintext',
            source: `FROM node:22
WORKDIR /app
COPY . .
RUN npm install
RUN npm run build
ENV DATABASE_URL=postgres://admin:s3cret@db:5432/app
EXPOSE 3000
CMD npm start`,
          },
          hints: [
            'Docker caches layers in order. Which early instruction changes on every commit?',
            'Does the runtime image need the compiler, dev dependencies and source code?',
            'Look at the user, the secret, the base image and how the process receives signals.',
          ],
          answer: `**Problems:**
1. **Cache busting:** \`COPY . .\` comes before \`npm install\`, so any source change invalidates the install layer and all dependencies reinstall.
2. **Bloat:** the full \`node:22\` image (~1 GB, with a compiler toolchain), dev dependencies, source code, tests and possibly \`node_modules\` or \`.git\` copied from the host all ship to production.
3. **\`npm install\`** is not reproducible; use \`npm ci\` with the lockfile.
4. **Secret baked into the image:** the \`ENV\` with credentials is visible in \`docker history\` and to anyone who can pull the image.
5. **Runs as root.**
6. **Shell form \`CMD npm start\`:** the shell becomes PID 1 and does not forward SIGTERM, so graceful shutdown fails (the container is killed after the timeout). npm also adds a layer of process indirection.

**Rewrite, using a multi-stage build:**
\`\`\`dockerfile
# syntax=docker/dockerfile:1
FROM node:22-slim AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

FROM deps AS build
COPY . .
RUN npm run build && npm prune --omit=dev

FROM node:22-slim AS runtime
ENV NODE_ENV=production
WORKDIR /app
COPY --from=build --chown=node:node /app/node_modules ./node_modules
COPY --from=build --chown=node:node /app/dist ./dist
COPY --chown=node:node package.json ./
USER node
EXPOSE 3000
HEALTHCHECK CMD node -e "fetch('http://localhost:3000/health').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"
CMD ["node", "dist/main.js"]
\`\`\`
Plus a **\`.dockerignore\`**: \`node_modules\`, \`.git\`, \`.env*\`, \`dist\`, \`coverage\`.

**Why it is better:**
- Copying the manifests first means the dependency layer is reused until \`package-lock.json\` changes. Builds drop from minutes to seconds.
- The runtime stage contains only production \`node_modules\` and the compiled output, typically **150–250 MB** (smaller still with distroless or Alpine, after checking native module compatibility).
- **Secrets are injected at runtime** (environment variables from the orchestrator or a secret manager), and build-time secrets use \`RUN --mount=type=secret\`, never \`ENV\` or \`ARG\`.
- The exec-form \`CMD\` makes Node PID 1, so it receives SIGTERM: handle it to close the server and DB pool. Or use \`--init\` (tini) to reap zombies.
- A non-root user limits the damage of a compromise.
- Pin the base image (a specific version, or a digest) and scan it (Trivy, Docker Scout) in CI.`,
          keyPoints: [
            'Order layers from least to most frequently changing; copy manifests before source',
            'Multi-stage builds ship only runtime artefacts on a slim base image',
            'npm ci, .dockerignore, and pruned dev dependencies',
            'Never bake secrets into images; inject at runtime or use BuildKit secrets',
            'Non-root user, exec-form CMD for signal handling, HEALTHCHECK',
          ],
          pitfalls: [
            'Thinking that deleting a file in a later layer removes it from the image',
            'Passing secrets via ARG, which is also stored in the image history',
            'Using Alpine without checking native modules built against glibc',
          ],
          followUps: ['How do you get BuildKit cache to work in CI?', 'How would you handle SIGTERM in an Express or NestJS app?'],
          personalAngle:
            'Talk about the Dockerfiles you wrote for Efilli: build times, image size, and how environment config reached the containers on your servers.',
          references: [{ label: 'Docker docs: multi-stage builds', url: 'https://docs.docker.com/build/building/multi-stage/' }],
        },
        {
          id: 'ops-docker-compose',
          title: 'Docker Compose: networking, volumes and startup order',
          type: 'concept',
          difficulty: 'core',
          priority: 'should',
          tags: ['docker-compose', 'networking', 'volumes', 'healthcheck'],
          estMinutes: 5,
          roles: ['backend', 'full-stack'],
          prompt: `In a Compose setup with \`api\`, \`postgres\` and \`redis\`, the API sometimes crashes on startup with \`ECONNREFUSED\` to Postgres, and a teammate's connection string uses \`localhost:5432\`. **Explain Compose networking, volumes and startup order, and fix both problems.**`,
          hints: [
            'Inside a container, localhost means that container itself.',
            'depends_on waits for the container to start, not for the database to be ready.',
            'Where does Postgres data go when you run docker compose down?',
          ],
          answer: `**Networking:** Compose creates a default bridge network for the project, and **each service is reachable by its service name** through built-in DNS. Inside the \`api\` container, \`localhost\` is the API container itself, so the connection string must be \`postgres://user:pass@postgres:5432/app\`. Ports published with \`ports:\` (\`"5432:5432"\`) are only for reaching the service **from the host**; containers on the same network talk directly on the container port without publishing.

**Startup order:** \`depends_on\` alone only waits until the dependency container has **started**, not until Postgres accepts connections. Fix it with a health check and a condition:
\`\`\`yaml
services:
  api:
    build: .
    env_file: .env
    environment:
      DATABASE_URL: postgres://app:app@postgres:5432/app
      REDIS_URL: redis://redis:6379
    depends_on:
      postgres: { condition: service_healthy }
      redis: { condition: service_started }
    ports: ["3000:3000"]
  postgres:
    image: postgres:17
    environment: { POSTGRES_USER: app, POSTGRES_PASSWORD: app, POSTGRES_DB: app }
    volumes: [pgdata:/var/lib/postgresql/data]
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U app -d app"]
      interval: 5s
      retries: 10
  redis:
    image: redis:7
volumes:
  pgdata:
\`\`\`
**Also make the app resilient:** retry the DB connection with backoff on boot, because in production (Kubernetes, ECS) there is no \`depends_on\` and dependencies restart independently.

**Volumes:**
- **Named volumes** (\`pgdata\`) are managed by Docker and survive \`docker compose down\`; they are removed only with \`down -v\`.
- **Bind mounts** (\`./src:/app/src\`) map a host directory, which is ideal for hot reload in development; avoid them in production.
- Without a volume, the database data lives in the container's writable layer and is lost when the container is removed.

**Other useful bits:** \`profiles\` for optional services, an override file (\`compose.override.yaml\`) for dev-only settings, and \`restart: unless-stopped\` on simple single-host deployments.`,
          keyPoints: [
            'Services resolve each other by service name on the project network',
            'localhost inside a container refers to that container',
            'depends_on with condition service_healthy plus a healthcheck; app-level retries anyway',
            'Named volumes vs bind mounts; down -v deletes data',
          ],
          pitfalls: ['Publishing every port to the host unnecessarily', 'Relying on depends_on for readiness'],
          followUps: ['When is Compose enough for production, and when is it not?'],
          personalAngle:
            'Describe the Compose files behind your Efilli or Scrape & Compare stacks (API, Postgres, Redis, workers) and how you handled startup ordering for the scraper workers.',
          references: [{ label: 'Docker docs: Compose', url: 'https://docs.docker.com/compose/' }],
        },
      ],
    },
    {
      id: 'ops-cicd',
      title: 'CI/CD & deployments',
      summary: 'Pipeline design, GitHub Actions, deployment strategies and rollback.',
      questions: [
        {
          id: 'ops-cicd-pipeline-design',
          title: 'Designing a CI/CD pipeline',
          type: 'concept',
          difficulty: 'core',
          priority: 'must',
          tags: ['ci-cd', 'github-actions', 'pipelines', 'artifacts', 'environments'],
          estMinutes: 6,
          roles: ['backend', 'full-stack', 'general'],
          prompt: `**Describe the CI/CD pipeline you would set up for a Node.js API that deploys as a Docker image.** What runs on a pull request, what runs on merge to main, and how do you keep it fast and safe?`,
          hints: [
            'CI answers "is this change safe to merge?"; CD answers "how does it reach production?".',
            'Build once, then promote the same artefact through environments.',
            'Think about caching, parallel jobs, approvals and secrets.',
          ],
          answer: `**CI (on every pull request): fast feedback that the change is safe to merge.**
1. Checkout, set up Node with **dependency caching**, \`npm ci\`.
2. **Parallel jobs:** lint and format check, type-check, unit tests, and integration tests against service containers (Postgres, Redis).
3. Build the Docker image (with BuildKit layer cache) to prove it builds; optionally scan the dependencies and the image (\`npm audit\`, Trivy).
4. Required status checks plus code review before merge (branch protection).

**CD (on merge to main):**
1. **Build once**: build and push the image tagged with the **commit SHA** (immutable), not just \`latest\`.
2. Deploy that exact image to **staging**: run DB migrations (backward compatible), smoke tests or E2E.
3. **Promote the same image** to production, after a manual approval (GitHub environments with required reviewers) or automatically if checks pass.
4. Deploy with a **rolling, blue-green or canary** strategy; health checks gate the rollout; **automatic rollback** if health or error-rate checks fail.
5. Notify (Slack), tag the release, and record which SHA runs where.

**Keeping it fast:** caching (npm, Docker layers), parallel jobs, running only affected packages in a monorepo, failing fast on lint, and keeping E2E to critical paths.

**Keeping it safe:**
- Secrets in the CI secret store, scoped per environment; prefer **OIDC** short-lived cloud credentials over long-lived keys.
- Least-privilege \`permissions:\` for the workflow token; pin third-party actions to a version or SHA.
- PRs from forks do not get secrets.
- \`concurrency\` groups so two deploys to the same environment cannot overlap.
- Migrations are expand-then-contract, so the old and new code both work during the rollout.

**Key principle:** *the artefact that was tested is the artefact that is deployed*. Rebuilding per environment risks deploying something different from what passed.`,
          keyPoints: [
            'CI on PRs: lint, type-check, tests in parallel with caching',
            'Build once, tag by commit SHA, promote the same image across environments',
            'Staging, approvals, health-gated rollout and automatic rollback',
            'Secret scoping, OIDC, least-privilege tokens, pinned actions',
            'Concurrency control and backward-compatible migrations',
          ],
          pitfalls: [
            'Deploying the mutable latest tag, so you cannot tell what is running or roll back cleanly',
            'Rebuilding the image separately for each environment',
          ],
          followUps: ['How would you run DB migrations safely in this pipeline?', 'How do you deal with flaky tests blocking deploys?'],
          personalAngle:
            'Walk through the YAML pipelines you wrote at Efilli: the stages, how deploys reached your servers over SSH, and what you would improve now (immutable tags, approvals, automatic rollback).',
          references: [{ label: 'GitHub Actions documentation', url: 'https://docs.github.com/en/actions' }],
        },
        {
          id: 'ops-gha-debugging',
          title: 'Debug: a broken GitHub Actions workflow',
          type: 'debugging',
          difficulty: 'core',
          priority: 'must',
          tags: ['github-actions', 'yaml', 'ci-cd', 'secrets', 'caching'],
          estMinutes: 10,
          roles: ['backend', 'full-stack'],
          prompt: `This workflow should test every PR and deploy main. Instead: **tests fail with "connection refused" to Postgres, the deploy step runs on pull requests too, the deploy cannot read the SSH key, and \`npm ci\` takes 3 minutes every time.** Find the bugs.`,
          code: {
            language: 'yaml',
            source: `name: ci
on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:17
        env:
          POSTGRES_PASSWORD: test
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 22
      - run: npm ci
      - run: npm test
        env:
          DATABASE_URL: postgres://postgres:test@postgres:5432/postgres

  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: |
          echo "$SSH_KEY" > key && chmod 600 key
          ssh -i key deploy@app.example.com './deploy.sh'`,
          },
          hints: [
            'The job runs directly on the runner VM, not in a container. What hostname reaches the service?',
            'Nothing makes deploy wait for test or limits it to main.',
            'Secrets are not environment variables unless you map them.',
          ],
          answer: `**Bugs and fixes:**

1. **Wrong database host.** The steps run directly on the runner, not inside a container, so the service is reached through a **published port on \`localhost\`**. The hostname \`postgres\` only works when the job itself runs in a \`container:\`. Also, without a **health check** the tests can start before Postgres is ready.
2. **Deploy runs on every event, in parallel with tests.** There is no \`needs: test\` and no condition, so it deploys PR code (dangerous) even if tests fail.
3. **The secret is never exposed.** \`$SSH_KEY\` is empty: secrets must be mapped explicitly with \`env: SSH_KEY: \${{ secrets.SSH_KEY }}\`. Also, writing the key to the workspace and skipping host key verification are risky; use a known_hosts entry.
4. **No dependency cache.** \`setup-node\` supports \`cache: npm\`.
5. **Hygiene:** no least-privilege \`permissions\`, no \`concurrency\` for deploys, and running on both \`push\` and \`pull_request\` duplicates runs for branches with a PR.

**Fixed workflow:**
\`\`\`yaml
name: ci
on:
  pull_request:
  push:
    branches: [main]

permissions:
  contents: read

jobs:
  test:
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:17
        env:
          POSTGRES_PASSWORD: test
        ports: ["5432:5432"]
        options: >-
          --health-cmd "pg_isready -U postgres"
          --health-interval 5s --health-timeout 5s --health-retries 10
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: npm
      - run: npm ci
      - run: npm test
        env:
          DATABASE_URL: postgres://postgres:test@localhost:5432/postgres

  deploy:
    needs: test
    if: github.event_name == 'push' && github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    environment: production
    concurrency: production
    steps:
      - name: Deploy over SSH
        env:
          SSH_KEY: \${{ secrets.DEPLOY_SSH_KEY }}
          KNOWN_HOSTS: \${{ secrets.DEPLOY_KNOWN_HOSTS }}
        run: |
          install -m 700 -d ~/.ssh
          echo "$SSH_KEY" > ~/.ssh/id_ed25519 && chmod 600 ~/.ssh/id_ed25519
          echo "$KNOWN_HOSTS" > ~/.ssh/known_hosts
          ssh deploy@app.example.com './deploy.sh \${{ github.sha }}'
\`\`\`
**Further improvements:** deploy an image built and pushed in CI (tagged with the SHA) rather than building on the server; restrict the deploy user's SSH key to running only the deploy script (a forced command in \`authorized_keys\`); \`environment: production\` allows required reviewers and environment-scoped secrets.`,
          keyPoints: [
            'Service containers are reached via localhost and a mapped port when steps run on the runner',
            'Health checks so tests wait for the database',
            'needs plus if to gate deploys on tests and on main',
            'Secrets must be mapped explicitly into env',
            'cache: npm, least-privilege permissions, concurrency and environments',
          ],
          pitfalls: [
            'Disabling StrictHostKeyChecking instead of pinning known_hosts',
            'Echoing secrets in logs (GitHub masks exact matches, but not transformed values)',
          ],
          followUps: ['How would you replace the SSH key with OIDC-based cloud credentials?', 'How do you reuse this logic across repositories?'],
          personalAngle:
            'You deployed over SSH from YAML pipelines. Explain how you stored keys, how the server pulled or built the new version, and how you would harden it now.',
          references: [{ label: 'GitHub docs: service containers', url: 'https://docs.github.com/en/actions/use-cases-and-examples/using-containerized-services/about-service-containers' }],
        },
        {
          id: 'ops-deployment-strategies',
          title: 'Rolling, blue-green and canary deployments',
          type: 'tradeoff',
          difficulty: 'advanced',
          priority: 'must',
          tags: ['deployment', 'blue-green', 'canary', 'rolling', 'rollback', 'migrations', 'feature-flags'],
          estMinutes: 8,
          roles: ['backend', 'full-stack'],
          prompt: `**Compare rolling, blue-green and canary deployments.** How do you roll back with each, and how do database migrations fit in so that a rollback does not break?`,
          hints: [
            'During a rollout, old and new versions run at the same time.',
            'Rolling back code is easy; rolling back a dropped column is not.',
            'Deploying and releasing can be separate events.',
          ],
          answer: `**Rolling:** replace instances gradually (for example 25% at a time), gated by health checks.
- Pros: no extra capacity; the default in Kubernetes and ECS.
- Cons: old and new versions serve traffic simultaneously; rollback is another rolling deploy (minutes).

**Blue-green:** run the new version (green) next to the current one (blue), test green, then **switch traffic** at the LB or DNS.
- Pros: **instant rollback** (switch back), and full testing in a production-like environment before the switch.
- Cons: double capacity during the deploy; shared resources (the DB) are not duplicated, so the schema must work for both versions; in-flight sessions need draining.

**Canary:** send a small share of traffic (1% → 10% → 50% → 100%) to the new version, compare error rate, latency and business metrics against the baseline, and **promote or abort automatically**.
- Pros: the smallest blast radius; real-traffic validation.
- Cons: needs traffic-splitting infrastructure and good metrics; slower; low-traffic services may not produce a meaningful signal.

**Feature flags** separate **deploy** (code is on the servers) from **release** (users see it). Dark-launch, then enable per tenant or percentage, and the kill switch is faster than any rollback.

**Database migrations: expand and contract.** Because two versions overlap and a rollback must still work, every schema change must be **backward compatible with the previous version of the code**:
1. **Expand:** add the new column (nullable, or with a default), new table or new index (\`CREATE INDEX CONCURRENTLY\`). Deploy code that writes both and reads old (or new with a fallback).
2. **Migrate:** backfill in batches.
3. **Switch:** code reads the new structure.
4. **Contract:** remove the old column in a **later** release, once no running version uses it.

Renaming a column in one step breaks the old version during the rollout and makes rollback impossible.

**Rollback checklist:** immutable versioned artefacts (redeploy the previous SHA), migrations that never require a down-migration in an emergency, and automatic rollback on failed health checks or SLO breaches. Sometimes **roll forward** with a fix is safer, for example after data has been written in a new format.`,
          keyPoints: [
            'Rolling: gradual, no extra capacity, versions overlap',
            'Blue-green: instant switch and rollback, double capacity, shared DB',
            'Canary: small traffic share with metric-based automatic promotion or abort',
            'Feature flags separate deploy from release',
            'Expand-and-contract migrations keep both versions working',
          ],
          pitfalls: [
            'Destructive schema changes in the same release as the code that needs them',
            'Assuming blue-green also duplicates the database',
            'A canary without metrics to compare, which is just a slow rollout',
          ],
          followUps: ['How would you add a NOT NULL column to a 100M-row table safely?', 'When is rolling forward better than rolling back?'],
          references: [{ label: 'Martin Fowler: BlueGreenDeployment', url: 'https://martinfowler.com/bliki/BlueGreenDeployment.html' }],
        },
      ],
    },
    {
      id: 'ops-servers',
      title: 'Servers, config & networking',
      summary: 'Nginx as a reverse proxy, Linux troubleshooting over SSH, and configuration and secrets.',
      questions: [
        {
          id: 'ops-config-secrets',
          title: 'Environment configuration and secrets',
          type: 'tradeoff',
          difficulty: 'foundation',
          priority: 'must',
          tags: ['twelve-factor', 'environment-variables', 'secrets', 'configuration'],
          estMinutes: 5,
          roles: ['backend', 'full-stack', 'general'],
          prompt: `**How should an application get its configuration and secrets** in development, CI and production? Where do \`.env\` files fit, and what are the common ways secrets leak?`,
          hints: [
            'Config that varies per deploy should not live in the code.',
            'Environment variables are convenient but not perfect for secrets.',
            'Think about git history, images, logs and frontend bundles.',
          ],
          answer: `**Principle (twelve-factor):** keep config that varies between deploys **out of the code**, provide it through the **environment**, and **validate it at startup**.

**Per environment:**
- **Development:** a \`.env\` file (git-ignored) plus a committed \`.env.example\` listing every variable with dummy values.
- **CI:** the CI secret store (GitHub Actions secrets or environments), scoped per environment, with OIDC for cloud access instead of static keys.
- **Production:** a **secret manager** (AWS Secrets Manager or SSM, GCP Secret Manager, Vault, Doppler, or Kubernetes secrets with encryption at rest) injected as environment variables or mounted files at runtime. Non-secret config can live in deployment manifests.

**Validate at boot:** parse with a schema (zod, envalid, \`@nestjs/config\` with validation), fail fast with a clear message if something is missing, and export a typed config object rather than reading \`process.env\` everywhere.

**Common leaks:**
- Committed \`.env\` files. **Deleting the file later does not remove it from git history**: rotate the secret immediately. Add secret scanning (GitHub push protection, gitleaks).
- Secrets baked into Docker images through \`ENV\` or \`ARG\`, or copied \`.env\` files.
- **Frontend bundles:** anything with \`VITE_\`, \`NEXT_PUBLIC_\` or similar prefixes is public. Never put API secrets there; call your backend instead.
- Logs and error trackers printing the whole config, connection strings or request headers.
- Over-shared secrets: one key used by every service and developer, never rotated.

**Good practice:** least privilege (a separate DB user per service), **rotation** (ideally automatic, with short-lived credentials), audit logs of secret access, and different secrets per environment so a staging leak does not compromise production.

**Trade-off of environment variables:** simple and universal, but visible to the whole process and child processes and sometimes dumped in crash reports. Mounted files or fetching from a secret manager at runtime reduce that exposure.`,
          keyPoints: [
            'Config outside code, provided by the environment, validated at startup',
            '.env for local only, git-ignored, with a committed .env.example',
            'Secret managers and CI secret stores; OIDC instead of static keys',
            'Leak vectors: git history, images, frontend bundles, logs',
            'Rotation, least privilege and per-environment secrets',
          ],
          pitfalls: [
            'Thinking that removing a committed secret in a new commit fixes the leak',
            'Putting secret keys in public frontend environment variables',
          ],
          followUps: ['How would you rotate a database password with zero downtime?'],
          personalAngle:
            'Explain how you handled environment config and credentials on the Efilli servers, and what you would change: a secret manager, rotation, and validation at boot.',
          references: [{ label: 'The Twelve-Factor App: Config', url: 'https://12factor.net/config' }],
        },
        {
          id: 'ops-nginx-reverse-proxy',
          title: 'Nginx as a reverse proxy',
          type: 'concept',
          difficulty: 'core',
          priority: 'should',
          tags: ['nginx', 'reverse-proxy', 'tls', 'websockets', 'headers'],
          estMinutes: 6,
          roles: ['backend', 'full-stack'],
          prompt: `**Why put Nginx in front of a Node.js app, and what does a minimal production config look like?** After adding it, the app logs every client IP as \`127.0.0.1\` and WebSockets fail. Why?`,
          hints: [
            'Think about TLS, static files, buffering, compression and multiple upstreams.',
            'The app now sees the proxy as its client.',
            'WebSockets start as an HTTP request that asks to upgrade.',
          ],
          answer: `**A reverse proxy sits in front of your app servers and handles concerns the app should not:**
- **TLS termination** (certificates via Let's Encrypt or certbot) and the HTTP to HTTPS redirect.
- **Load balancing** across several Node processes or containers (\`upstream\` block).
- Serving **static files** and compression efficiently, plus caching headers.
- **Buffering** slow clients so Node workers are not tied up; request size limits and timeouts.
- Basic **rate limiting** (\`limit_req\`) and security headers.
- One public entry point routing paths or domains to different services.

**Minimal config:**
\`\`\`nginx
upstream api { server 127.0.0.1:3000; server 127.0.0.1:3001; keepalive 32; }

server {
  listen 443 ssl http2;
  server_name app.example.com;
  ssl_certificate     /etc/letsencrypt/live/app.example.com/fullchain.pem;
  ssl_certificate_key /etc/letsencrypt/live/app.example.com/privkey.pem;
  client_max_body_size 10m;

  location / {
    proxy_pass http://api;
    proxy_http_version 1.1;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
    # WebSockets
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection "upgrade";
    proxy_read_timeout 60s;
  }
}
server { listen 80; server_name app.example.com; return 301 https://$host$request_uri; }
\`\`\`

**The two symptoms:**
- **Client IP is 127.0.0.1:** the app sees the TCP connection from Nginx. Nginx must forward the original IP in \`X-Forwarded-For\` or \`X-Real-IP\`, and the app must **trust the proxy**: in Express, \`app.set('trust proxy', 1)\` (the number of hops), so \`req.ip\` and \`req.protocol\` are correct. Only trust these headers from your proxy, because clients can forge them, which matters for rate limiting and audit logs.
- **WebSockets fail:** the upgrade handshake needs HTTP/1.1 and the \`Upgrade\` and \`Connection\` headers to be passed through (they are hop-by-hop headers and are dropped by default). Long-lived connections also need a longer \`proxy_read_timeout\`, and with several upstreams you need sticky sessions or a pub/sub backplane.

**Operational tips:** \`nginx -t\` before \`systemctl reload nginx\` (reload is graceful); access and error logs in \`/var/log/nginx\`; a 502 means the upstream is down or refused the connection, and a 504 means it timed out.`,
          keyPoints: [
            'Reverse proxy duties: TLS, load balancing, static files, buffering, limits',
            'Forward X-Forwarded-For and Proto; configure trust proxy in the app',
            'WebSockets need HTTP/1.1 plus Upgrade and Connection headers and longer timeouts',
            'nginx -t then reload; 502 vs 504 meaning',
          ],
          pitfalls: ['Trusting X-Forwarded-For from any client', 'Forgetting the HTTP to HTTPS redirect or HSTS'],
          followUps: ['How would you do zero-downtime deploys with Nginx in front of two app instances?'],
          personalAngle:
            'If you put Nginx (or a similar proxy) in front of the Efilli services, explain your TLS setup and any problems you hit with headers, timeouts or body sizes.',
          references: [{ label: 'NGINX documentation', url: 'https://nginx.org/en/docs/' }],
        },
        {
          id: 'ops-linux-incident-ssh',
          title: 'Debug: a production server misbehaving over SSH',
          type: 'debugging',
          difficulty: 'core',
          priority: 'should',
          tags: ['linux', 'ssh', 'troubleshooting', 'disk', 'memory', 'systemd', 'logs'],
          estMinutes: 8,
          roles: ['backend', 'full-stack'],
          prompt: `Users report errors and slow responses. You SSH into the server and see the output below. **Walk through how you investigate and what you would fix, now and long term.**`,
          code: {
            language: 'bash',
            source: `$ df -h /
Filesystem      Size  Used Avail Use% Mounted on
/dev/vda1        50G   50G     0 100% /

$ docker logs api --tail 3
Error: ENOSPC: no space left on device, write
Error: ENOSPC: no space left on device, write
[ioredis] Unhandled error event: MISCONF Redis is configured to save RDB snapshots...

$ uptime
 10:42:01 up 87 days,  load average: 7.91, 7.40, 6.95   # 4 vCPU`,
          },
          hints: [
            'The disk is full. What usually fills a disk on a Docker host?',
            'Which commands find where the space went?',
            'Redis and the app both fail because they cannot write. What prevents this next time?',
          ],
          answer: `**Diagnosis: the root disk is 100% full.** The app cannot write files or logs (\`ENOSPC\`), and Redis refuses writes because its RDB snapshot failed (\`MISCONF\`). The high load is likely processes blocked on I/O and retries.

**Investigate (read-only first):**
\`\`\`bash
sudo du -xh --max-depth=1 / | sort -h | tail      # where is the space?
sudo du -sh /var/lib/docker/* /var/log/*          # usual suspects
docker system df                                   # images, containers, volumes, build cache
sudo find /var/lib/docker/containers -name '*-json.log' -size +500M -exec ls -lh {} \\;
sudo journalctl --disk-usage
sudo lsof +L1                                     # deleted files still held open
df -i /                                           # inode exhaustion looks the same
\`\`\`
Common culprits: **unbounded Docker JSON logs**, old images and build cache from many deploys, a runaway application log file, or core dumps. \`lsof +L1\` finds files that were deleted but are still held open, so their space is not freed until the process restarts.

**Fix now (carefully, in production):**
- Remove unused images and build cache: \`docker image prune -a\`, \`docker builder prune\` (avoid \`docker volume prune\` unless you are sure: volumes hold data).
- Truncate, rather than delete, a huge log held open by a process: \`truncate -s 0 <file>\`.
- \`journalctl --vacuum-size=500M\`.
- Then verify: Redis recovers (or \`CONFIG SET stop-writes-on-bgsave-error\` temporarily, only if you understand the durability trade-off), the app health check passes, and errors stop.

**Long-term fixes:**
- **Log rotation:** set Docker's \`log-opts\` (\`max-size: 10m\`, \`max-file: 3\`) in \`daemon.json\`, logrotate for app files, or ship logs to a central system instead of local disk.
- **Clean up in the deploy pipeline:** prune old images after a successful deploy.
- **Monitoring and alerts** on disk usage (warn at 80%, page at 90%), inodes, and Redis persistence errors.
- Separate data volumes from the root disk so logs cannot take down the database.
- Write a short **postmortem**: timeline, root cause, impact and actions.

**General triage order over SSH:** what changed (recent deploys) → \`df -h\` and \`df -i\` → \`free -m\` and \`dmesg\` for OOM kills → \`top\` or \`htop\` → \`systemctl status\` and \`journalctl -u <service>\` → \`ss -tlnp\` for listening ports → application logs.`,
          keyPoints: [
            'Read the symptoms: ENOSPC and Redis MISCONF point to a full disk',
            'Find the space: du, docker system df, Docker JSON logs, lsof +L1, inodes',
            'Safe cleanup: prune images and build cache, truncate open logs, careful with volumes',
            'Prevent: log rotation, cleanup in deploys, disk alerts, separate data volumes',
            'A systematic triage order and a postmortem',
          ],
          pitfalls: [
            'Deleting a log file a process still has open, which frees no space',
            'Running docker system prune --volumes on a server holding database volumes',
            'Fixing the symptom without adding monitoring',
          ],
          followUps: ['How would you find out what caused an OOM kill?', 'What would you put in a server runbook?'],
          personalAngle:
            'You administered Efilli servers over SSH: share a real incident (disk, memory, a crashed worker) and how you found the cause. Interviewers value a calm, methodical story.',
        },
      ],
    },
    {
      id: 'ops-observability',
      title: 'Observability & operations',
      summary: 'Logs, metrics and traces, health checks, and owning production.',
      questions: [
        {
          id: 'ops-logs-metrics-traces',
          title: 'Logs, metrics and traces',
          type: 'concept',
          difficulty: 'foundation',
          priority: 'should',
          tags: ['observability', 'logging', 'metrics', 'tracing', 'opentelemetry', 'slo'],
          estMinutes: 5,
          roles: ['backend', 'full-stack', 'general'],
          prompt: `**Explain the three pillars of observability: logs, metrics and traces.** What is each one good for, and what would you instrument first in a new Node.js API?`,
          hints: [
            'One tells you that something is wrong, one tells you where, one tells you why.',
            'Structured logs with a request id are worth more than many unstructured lines.',
            'Think about the RED or golden-signal metrics.',
          ],
          answer: `**Metrics** are numeric time series aggregated over time: request rate, error rate, latency percentiles, CPU, queue depth. They are cheap to store and query, ideal for **dashboards and alerts**: they tell you **that** something is wrong.

**Traces** follow **one request across services**: a tree of spans (API → DB query → Redis → external API), each with timing and attributes. They show **where** the time or the error is.

**Logs** are discrete events with context. They explain **why**: the error message, stack trace and input that caused it.

**What to instrument first in a Node.js API:**
1. **Structured JSON logs** (pino) with level, timestamp, \`requestId\` or \`traceId\`, route, user or tenant id, duration, and status. Never log secrets or personal data (use redaction).
2. **RED metrics per endpoint:** **R**ate, **E**rrors, **D**uration (p50, p95, p99 histograms), plus saturation: event loop lag, memory, DB pool usage, queue depth.
3. **Tracing with OpenTelemetry** auto-instrumentation for HTTP, Postgres and Redis, exporting to Jaeger, Tempo, Honeycomb or Datadog. Propagate trace context (\`traceparent\`) across services and into queued jobs.
4. **Error tracking** (Sentry) with release tags.

**Alerting:** alert on **symptoms users feel** (error rate, latency SLO burn rate), not on every CPU spike. Each alert should be actionable and link to a runbook. Define **SLOs** (for example 99.9% of requests succeed in under 300 ms over 30 days) and use the **error budget** to balance reliability against shipping speed.

**Correlation is the key idea:** the same trace id in logs, traces and error reports lets you jump from a latency spike on a dashboard to the slow traces, then to the logs of those exact requests.

**Cost and cardinality:** do not put user ids or full URLs into metric labels (cardinality explodes); sample traces; set log retention.`,
          keyPoints: [
            'Metrics for alerting and trends, traces for where, logs for why',
            'Structured logs with request or trace ids; redact sensitive data',
            'RED metrics plus saturation (event loop lag, pool usage, queue depth)',
            'OpenTelemetry tracing with context propagation',
            'Alert on user-facing symptoms and SLOs; watch label cardinality',
          ],
          pitfalls: ['Alerting on everything until alerts are ignored', 'Using high-cardinality labels such as user ids in metrics'],
          followUps: ['How would you trace a request through a BullMQ job?', 'What is an error budget and how would you use it?'],
          references: [{ label: 'OpenTelemetry documentation', url: 'https://opentelemetry.io/docs/' }],
        },
        {
          id: 'ops-health-checks',
          title: 'Liveness vs readiness health checks',
          type: 'multiple-choice',
          difficulty: 'core',
          priority: 'nice',
          tags: ['health-checks', 'kubernetes', 'liveness', 'readiness', 'graceful-shutdown'],
          estMinutes: 3,
          roles: ['backend'],
          prompt: `Your API's \`/health\` endpoint checks Postgres, Redis and a third-party API, and it is used as the **liveness** probe. During a short Redis outage, **all pods were restarted repeatedly**. Which change is correct?`,
          choices: [
            {
              id: 'a',
              text: 'Make liveness a cheap check that the process is responsive, and put dependency checks in the readiness probe so unready pods stop receiving traffic without being restarted.',
              correct: true,
              explanation:
                'Restarting does not fix a Redis outage. Liveness answers "is this process stuck?"; readiness answers "should I get traffic right now?".',
            },
            {
              id: 'b',
              text: 'Increase the liveness probe timeout to 60 seconds so slow dependencies are tolerated.',
              correct: false,
              explanation: 'It delays the restart storm but keeps the wrong semantics, and a truly hung process is detected much later.',
            },
            {
              id: 'c',
              text: 'Remove health checks entirely; the orchestrator can tell when the process crashes.',
              correct: false,
              explanation: 'A deadlocked or event-loop-blocked process does not crash. Without probes it keeps receiving traffic it cannot serve.',
            },
            {
              id: 'd',
              text: 'Add the third-party API check to liveness too, so problems are detected earlier.',
              correct: false,
              explanation: 'External dependencies in liveness make your pods restart because someone else is down: the cascading failure gets worse.',
            },
          ],
          hints: ['Would restarting the pod fix a Redis outage?'],
          answer: `**A is correct.**

- **Liveness:** "Is this process alive and not stuck?" If it fails, the orchestrator **restarts** the container. Keep it cheap and local: the HTTP server responds, the event loop is not blocked. **Never include shared dependencies**, or a dependency outage turns into a restart storm across every pod at once.
- **Readiness:** "Can this instance serve traffic right now?" If it fails, the instance is **removed from the load balancer** but not restarted. Check critical dependencies (DB connectivity), warm-up and draining here, ideally with cached results so health checks do not hammer the DB.
- **Startup probe:** gives slow-starting apps time before liveness kicks in.

**Graceful shutdown ties in:** on SIGTERM, fail readiness first, stop accepting new connections, finish in-flight requests, close DB and Redis pools, then exit before the termination grace period ends.

**Plain Docker or Compose:** \`HEALTHCHECK\` only marks the container unhealthy (Swarm or other tooling acts on it); load balancers such as Nginx or cloud LBs have their own health checks with the same readiness meaning.`,
          keyPoints: [
            'Liveness = restart if stuck; keep it local and cheap',
            'Readiness = remove from traffic; may check critical dependencies',
            'Dependencies in liveness cause restart storms',
            'Graceful shutdown: fail readiness, drain, close pools, exit',
          ],
          pitfalls: ['Using one /health endpoint for both probes'],
          followUps: ['How would you detect a blocked event loop in a liveness check?'],
          references: [{ label: 'Kubernetes: liveness, readiness and startup probes', url: 'https://kubernetes.io/docs/concepts/configuration/liveness-readiness-startup-probes/' }],
        },
        {
          id: 'ops-infra-deep-dive',
          title: 'Deep dive: the infrastructure you built',
          type: 'project-deep-dive',
          difficulty: 'advanced',
          priority: 'should',
          tags: ['infrastructure', 'docker', 'ci-cd', 'ownership', 'incidents'],
          estMinutes: 10,
          roles: ['backend', 'full-stack'],
          prompt: `"I see you set up the infrastructure for the accessibility platform. **Walk me through how code got from a developer's laptop to production, how you knew it was healthy, and what you would change today.**"`,
          hints: [
            'Draw the path: repo → CI → artefact → server → traffic.',
            'Have one concrete incident or rollback story ready.',
            'Be explicit about what you owned, what you inherited, and the scale.',
          ],
          answer: `**Structure (6–8 minutes, then let them dig in):**

1. **Context (30 s):** the product, team size, your role ("lead backend and infrastructure; one senior frontend developer"), and the real scale (customers, traffic, data volume). Never inflate numbers.
2. **The path to production, drawn as a pipeline:**
   - Git workflow (branches, PR review).
   - CI in YAML: install, lint, test, build the Docker image.
   - Deploy: how the new version reached the servers (SSH from CI, pulling an image or building on the server), how config and secrets were provided, and how migrations ran.
   - Runtime: containers (Compose?), reverse proxy and TLS, database, Redis, workers or schedulers.
3. **Health and operations:** what told you it was working (health checks, logs, uptime checks, error tracking, alerts), how you rolled back, backups and restore tests.
4. **One incident story (STAR-style):** symptom → how you investigated → root cause → fix → what you changed to prevent it. Ideally with a number (downtime minutes, time to detect).
5. **Trade-offs you made deliberately:** for example "single server with Docker Compose instead of Kubernetes, because we had two customers and one infrastructure engineer; this is what would make me move."
6. **What you would change now:** immutable image tags built in CI, a registry, automated rollback, a secret manager, infrastructure as code (Terraform), centralised logs and metrics, staging that mirrors production, documented runbooks.

**What the interviewer listens for:** genuine ownership, understanding of *why* each piece exists, awareness of risks (single points of failure, manual steps, secrets on disk) and a mature, honest view of what was good enough for that stage.

**Answer the follow-ups precisely:** "How did you handle zero-downtime deploys?" If you did not, say so and explain how you would. Honesty beats a vague claim.`,
          keyPoints: [
            'Clear context and honest scale',
            'End-to-end path: repo → CI → artefact → deploy → runtime',
            'How health was observed and how rollback worked',
            'A concrete incident with root cause and prevention',
            'Deliberate trade-offs and a credible improvement plan',
          ],
          pitfalls: [
            'Listing tools without explaining why they were chosen',
            'Overclaiming scale or ownership that a follow-up question will expose',
          ],
          followUps: ['What was the single biggest operational risk, and how did you mitigate it?', 'How did you back up the database, and did you ever test a restore?'],
          personalAngle:
            'Prepare this from your real Efilli work: Docker, YAML CI/CD, server configuration over SSH and the beta launch to the first paying customers. Write the pipeline down once so you can draw it from memory.',
        },
      ],
    },
  ],
}

export default track
