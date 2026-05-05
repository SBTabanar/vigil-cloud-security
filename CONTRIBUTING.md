# Contributing to Vigil

Thank you for your interest in Vigil! This document will help you get started with the codebase.

## Development Setup

### Option 1: Docker Compose (Recommended)

```bash
git clone https://github.com/SBTabanar/vigil-cloud-security.git
cd vigil-cloud-security
cp .env.example .env
# Optional: add your API keys to .env for full feature testing
docker-compose up --build -d
```

Visit http://localhost:5173

### Option 2: Local Python + Node

**Backend:**
```bash
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

**Frontend:**
```bash
cd frontend
npm install
npm run dev
```

## Project Conventions

### Python (Backend)
- **Framework:** FastAPI
- **Style:** PEP 8, type hints encouraged
- **Async:** Use `async def` for I/O bound operations (API calls, DB queries)
- **Database:** SQLAlchemy 2.0 syntax, use sessions via `Depends(get_db)`
- **Error handling:** Raise `HTTPException` with descriptive detail strings

### JavaScript (Frontend)
- **Framework:** React 18 with hooks
- **Styling:** Inline styles (no CSS-in-JS library, no Tailwind)
- **State:** React Context for auth, local state for UI
- **API calls:** Use `apiFetch` from `useAuth` hook (handles JWT + 401)

### Git Workflow
1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature-name`
3. Make atomic commits with clear messages
4. Open a Pull Request against `main`

## Commit Message Format

```
type(scope): short description

Longer explanation if needed.

Fixes #123
```

Types: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`

## Areas That Need Help

### High Priority
- [ ] **PostgreSQL migration** — Add Alembic migrations, update `docker-compose.yml`
- [ ] **Real CloudTrail integration** — Replace synthetic scan with actual AWS API calls using boto3
- [ ] **Test coverage** — Backend tests with pytest, frontend tests with Vitest

### Medium Priority
- [ ] **Additional compliance frameworks** — FedRAMP, MAS TRM, PDPA, DORA, APRA CPS 234
- [ ] **GCP scanner** — Equivalent CloudTrail/log analysis for Google Cloud
- [ ] **Dark mode** — CSS variable-based theme switching

### Low Priority / Good First Issues
- [ ] **Landing page copy** — Improve marketing copy, add screenshots
- [ ] **Error boundaries** — React error boundaries for graceful failure
- [ ] **Loading skeletons** — Replace "Loading..." text with skeleton screens
- [ ] **Form validation** — Better client-side validation on auth forms

## Code Review Process

1. All PRs need at least one review
2. CI must pass (when we add CI)
3. Maintain backward compatibility for API changes
4. Update this doc if you change setup steps

## Questions?

Open a [GitHub Discussion](https://github.com/SBTabanar/vigil-cloud-security/discussions) or ping us in an issue.
