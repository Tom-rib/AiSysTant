# Contribution Guidelines for AiSystant

## Getting Started

1. Fork the repository
2. Clone your fork: `git clone https://github.com/YOUR_USERNAME/chatops-commander.git`
3. Create a feature branch: `git checkout -b feature/your-feature-name`
4. Run setup: `bash setup.sh`

## Development Workflow

### Before Starting
- Read the [Architecture](ARCHITECTURE.md) document
- Understand the [API Specification](API.md)
- Review existing code style

### Branch Naming
- `feature/` - New features
- `fix/` - Bug fixes
- `docs/` - Documentation updates
- `refactor/` - Code refactoring
- `perf/` - Performance improvements
- `security/` - Security fixes

### Commit Messages
```
type(scope): description

[optional body]

[optional footer]
```

Examples:
```
feat(chat): add message editing capability
fix(ssh): resolve terminal disconnect issue
docs(api): update authentication section
refactor(backend): simplify AI prompt logic
```

### Code Style

#### TypeScript
- Use strict mode: `"strict": true` in tsconfig.json
- Prefer interfaces over types for object shapes
- Use enums for constants
- Always add type annotations for function parameters

```typescript
// Good
interface ChatMessage {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: Date;
}

async function processMessage(msg: ChatMessage): Promise<void> {
  // Implementation
}

// Avoid
function processMessage(msg) {
  // No types
}
```

#### React Components
- Use functional components with hooks
- Props as interfaces
- Descriptive component names
- Extract complex logic to custom hooks

```typescript
interface ChatBoxProps {
  onSend: (message: string) => void;
  disabled?: boolean;
}

export const ChatBox: React.FC<ChatBoxProps> = ({ onSend, disabled }) => {
  // Component code
};
```

#### File Organization
```
frontend/src/
├── components/
│   ├── Chat/
│   │   ├── ChatBox.tsx
│   │   ├── ChatBox.test.tsx
│   │   └── ChatBox.css
│   └── Terminal/
│       ├── Terminal.tsx
│       └── Terminal.css
├── pages/
├── services/
├── context/
└── types/
```

## Testing

### Writing Tests
- Use Jest + React Testing Library
- Aim for 80%+ code coverage
- Test behavior, not implementation

```typescript
// Good test
test('sends message when send button clicked', async () => {
  const onSend = jest.fn();
  render(<ChatBox onSend={onSend} />);
  
  const input = screen.getByRole('textbox');
  await userEvent.type(input, 'Hello');
  await userEvent.click(screen.getByRole('button', { name: /send/i }));
  
  expect(onSend).toHaveBeenCalledWith('Hello');
});
```

### Running Tests
```bash
# Backend
cd backend && npm test

# Frontend
cd frontend && npm test

# With coverage
npm test -- --coverage
```

## Documentation

### Adding New Features
1. Update [ARCHITECTURE.md](ARCHITECTURE.md) if modifying system design
2. Update [API.md](API.md) for new endpoints
3. Add comments for complex logic
4. Update README.md if it affects setup/usage

### Documentation Format
- Use Markdown (.md)
- Include code examples
- Add diagrams where helpful
- Keep language clear and concise

## Before Submitting a Pull Request

- [ ] Code follows project style guide
- [ ] All tests pass: `npm test`
- [ ] No TypeScript errors: `tsc --noEmit`
- [ ] Commits are descriptive
- [ ] Documentation is updated
- [ ] No console errors or warnings
- [ ] Related issues are linked

## Code Review Process

1. At least one approval required
2. All CI checks must pass
3. No merge conflicts
4. Maintainers may request changes

## Performance Guidelines

- Memoize expensive components: `React.memo()`, `useMemo()`
- Lazy load routes: `React.lazy()`
- Optimize database queries
- Profile before optimizing

## Security Guidelines

- Never commit secrets or API keys
- Validate all user inputs
- Use parameterized queries
- Sanitize HTML/user content
- Keep dependencies updated

## Reporting Issues

### Bug Report Template
```markdown
**Description**: Clear description of the issue

**Steps to Reproduce**:
1. Step 1
2. Step 2

**Expected Behavior**: What should happen

**Actual Behavior**: What actually happens

**Environment**:
- OS: 
- Node version:
- Browser (if frontend):
```

### Feature Request Template
```markdown
**Description**: Clear description of the feature

**Use Case**: Why is this needed?

**Proposed Solution**: How it should work

**Alternatives Considered**: Other approaches
```

## Community

- Be respectful and inclusive
- Help others when you can
- Ask questions if unclear
- Share knowledge and experience

## Questions?

- Check existing [issues](https://github.com/issues)
- Read the [documentation](docs/)
- Open a discussion

Thank you for contributing! 🚀
