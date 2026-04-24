# Contributing to ChatOps-Commander

Thank you for your interest in contributing to ChatOps-Commander! This document provides guidelines and instructions for contributing.

## Code of Conduct

We are committed to providing a welcoming and inclusive environment. All contributors must follow our Code of Conduct:
- Be respectful and inclusive
- Welcome diverse perspectives
- Report unacceptable behavior to maintainers

## Getting Started

### Prerequisites

- Node.js >= 16.x
- npm or yarn
- Git
- Familiarity with TypeScript, React, and Node.js

### Setup

1. **Fork the repository**
   ```bash
   git clone https://github.com/YOUR_USERNAME/Chatops-commander.git
   cd Chatops-commander
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Create a feature branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

## Development Workflow

### Branch Naming Convention

Use clear, descriptive names:
- `feature/description` - New features
- `bugfix/description` - Bug fixes
- `docs/description` - Documentation updates
- `refactor/description` - Code refactoring
- `chore/description` - Maintenance tasks

### Commit Messages

Write clear, descriptive commit messages:

```
feat: Add user authentication system

- Implement JWT token generation
- Add login/logout endpoints
- Validate user credentials against database

Closes #123
```

**Format**: `type: description`

**Types**:
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation
- `style`: Code style (formatting, semicolons, etc.)
- `refactor`: Code refactoring
- `perf`: Performance improvements
- `test`: Test additions/modifications
- `chore`: Build, dependencies, tooling

### Code Style

- **Language**: TypeScript (strict mode)
- **Linting**: ESLint
- **Formatting**: Prettier
- **Line length**: 100 characters max

Run before committing:
```bash
npm run lint
npm run format
```

### Testing

All code changes must include tests:

```bash
npm run test
npm run test:coverage
```

- Aim for >80% code coverage
- Write unit tests for business logic
- Write integration tests for APIs
- Test edge cases and error scenarios

## Pull Request Process

### Before Submitting

1. **Update with main**
   ```bash
   git fetch origin
   git rebase origin/main
   ```

2. **Test your changes**
   ```bash
   npm run lint
   npm run format
   npm run test
   npm run build
   ```

3. **Create a descriptive PR title**
   - ✅ `feat: Add support for server groups`
   - ❌ `update` or `fix stuff`

### PR Description Template

```markdown
## Description
Brief description of changes

## Related Issues
Closes #123

## Changes
- Change 1
- Change 2
- Change 3

## Type of Change
- [ ] New feature
- [ ] Bug fix
- [ ] Breaking change
- [ ] Documentation update

## Testing
Describe how you tested:
- Manual testing steps
- Test coverage
- Edge cases covered

## Checklist
- [ ] Code follows style guidelines
- [ ] Tests added/updated
- [ ] Documentation updated
- [ ] No new warnings generated
- [ ] Tested in development environment
```

### Review Process

1. **Automated checks** must pass:
   - Linting
   - Tests
   - Build

2. **Code review**:
   - At least 1 approval required
   - CODEOWNERS must review relevant files
   - Address all review comments
   - Request re-review after changes

3. **Merge**:
   - Use "Squash and merge" for single commits
   - Use "Create a merge commit" for multiple logical commits
   - Delete branch after merge

## Protected Branches

### Main Branch Rules
- ✅ Requires pull request reviews (minimum 1)
- ✅ Requires status checks to pass (tests, linting, build)
- ✅ Requires branches to be up to date before merging
- ✅ No force pushes allowed
- ❌ No direct pushes allowed

### Improvement/Project-Enhancement Branch Rules
Same as main branch

**To push directly to these branches, you must:**
1. Be a repository maintainer
2. Follow the PR process anyway (best practice)

## Development Guidelines

### Frontend (React + TypeScript)

- Use functional components and hooks
- Use TypeScript for type safety
- Keep components small and reusable
- Use CSS modules or styled-components
- Test user interactions

Example:
```typescript
interface ButtonProps {
  label: string;
  onClick: () => void;
  disabled?: boolean;
}

const Button: React.FC<ButtonProps> = ({ label, onClick, disabled }) => (
  <button onClick={onClick} disabled={disabled}>
    {label}
  </button>
);
```

### Backend (Node.js + TypeScript)

- Use async/await patterns
- Validate all inputs
- Use consistent error handling
- Add proper logging
- Write API documentation

Example:
```typescript
async function getUser(id: string): Promise<User> {
  if (!id) throw new Error('ID is required');
  const user = await database.users.findById(id);
  if (!user) throw new NotFoundError('User not found');
  return user;
}
```

### Security Considerations

- ✅ Sanitize all user inputs
- ✅ Use environment variables for secrets
- ✅ Validate API requests
- ✅ Implement rate limiting
- ✅ Use HTTPS in production
- ❌ Never commit secrets or sensitive data
- ❌ Never disable security checks

## Reporting Issues

### Bug Reports

Include:
- Clear, descriptive title
- Steps to reproduce
- Expected behavior
- Actual behavior
- Environment (OS, Node version, etc.)
- Screenshots or logs (if applicable)

### Feature Requests

Include:
- Clear description of the feature
- Use cases and benefits
- Proposed implementation (optional)
- Related issues/discussions

## Documentation

All changes should include documentation:

- **Code comments** for complex logic
- **README updates** for new features
- **API documentation** for new endpoints
- **Setup guides** for new dependencies

## Questions?

- Check existing issues and PRs
- Read the README and documentation
- Ask in PR comments
- Contact maintainers

---

**Thank you for contributing to ChatOps-Commander!** 🎉
