# 🧪 Terminal SSH Testing Guide

## Prerequisites
- Backend running: `npm run dev` in `/backend`
- Frontend running: `npm run dev` in `/frontend`
- At least one SSH server configured

## Test Steps

### 1. Connection Diagnostic
Open browser console (F12) and check:
```
[MultiTerminal] useEffect: Initialisation Socket.io
[MultiTerminal] Socket URL: http://localhost:3001
[Socket] ✅ CONNECT: xxx
```

**IF YOU SEE "Socket CONNECT ERROR":**
- Check backend server URL (should be port 3001)
- Check CORS settings in backend
- Check firewall/ports

### 2. Terminal Creation
1. Click "Nouveau" > select a server
2. Check console for:
```
[TerminalEmulator] useEffect 1: INIT TERMINAL - session-xxx
[TerminalEmulator] Terminal créé: session-xxx
[TerminalEmulator] useEffect 2: CREATE SESSION - session-xxx
[Socket] 📡 terminal-create: session-xxx
[Socket] 🔌 Création session SSH: session-xxx
```

**IF CREATION FAILS:**
- Check SSH server credentials
- Check server is accessible from backend
- Check port 22 is open

### 3. Terminal Input
1. Type in the terminal
2. Check console for:
```
[TerminalEmulator] Input utilisateur: session-xxx - "ls"
[TerminalEmulator] 📤 EMIT terminal-input: session-xxx
[Socket] ⌨️ terminal-input reçu: session-xxx
[Socket] ✅ Input envoyé: session-xxx
[Socket] 📤 Envoi output: session-xxx - xxx bytes
```

**IF INPUT DOESN'T WORK:**
- Check socket is connected
- Check terminal-input event is being received
- Check SSH stream is open

### 4. Tab Persistence
1. Open Terminal 1 (server A)
2. Type "pwd" → should show output
3. Switch to another tab or create Terminal 2 (server B)
4. Switch back to Terminal 1
5. Type "ls" → should work

**IF TAB DISAPPEARS:**
- Check that component is hidden not unmounted
- Check terminal.dispose() is not called on switch

### 5. Command History
1. In Terminal 1: `cd /tmp`
2. In Terminal 1: `ls` → should list files in /tmp (not /home)
3. Create a file: `touch test.txt`
4. List again: `ls | grep test` → should show test.txt

**IF COMMANDS DON'T PERSIST:**
- Check TerminalSessionManager keeps session alive
- Check currentDir is updated after cd
- Check stream doesn't close between commands

## Common Issues & Fixes

### Socket never connects
```
[MultiTerminal] ❌ Socket CONNECT ERROR: ...
```
**Fix:** Check backend is running and accessible
```bash
curl http://localhost:3001/
```

### Terminal creates but no input
```
[TerminalEmulator] Input utilisateur: ... but no [Socket] 📤
```
**Fix:** Socket not connected when input happens
- Make sure socket.connected == true before emitting
- Check socket.emit() doesn't fail silently

### FitAddon crashes
```
Cannot read properties of undefined (reading 'dimensions')
```
**Fix:** Already fixed in this version
- Check terminal div has height > 0 before fit()
- Use setTimeout to defer fit() call

### Memory leaks
- Tabs don't close properly
- Sessions pile up

**Fix:** Check cleanup functions are called

## Debug Mode

To enable verbose logging:
1. Open browser DevTools (F12)
2. Check "Console" tab
3. Look for `[Socket]`, `[TerminalEmulator]`, `[MultiTerminal]` prefixes
4. Match request/response pairs

Example trace:
```
[MultiTerminal] Socket URL: http://localhost:3001
→ [Socket] ✅ CONNECT: xyz123
→ [TerminalEmulator] Émission: terminal-create
→ [Socket] 📡 terminal-create: session-xxx
→ [Socket] 🔌 Création session SSH: session-xxx
→ [TerminalEmulator] Callback terminal-create: {success: true}
→ User types "ls"
→ [TerminalEmulator] 📤 EMIT terminal-input: ls
→ [Socket] ⌨️ terminal-input reçu: session-xxx - "ls"
→ [Socket] 📤 Envoi output: session-xxx - 250 bytes
→ [TerminalEmulator] Reçu output: session-xxx
```

## Backend Logs

Check backend server output for:
```
[Socket] ✅ CONNECT: xxx
[Socket] 📡 terminal-create: session-xxx
[Socket] 👂 Écoute stream: session-xxx
[Socket] ⌨️ terminal-input reçu: session-xxx
[Socket] 📤 Envoi output: session-xxx
```

If you see errors:
```
[Socket] ❌ Erreur ...
```

That means something failed - check the full error message.

## Testing Checklist

- [ ] Socket connects
- [ ] Terminal creates
- [ ] Can type and see output
- [ ] Tab switching works
- [ ] Commands persist (cd /tmp then pwd)
- [ ] File operations work (touch, ls)
- [ ] Multiple terminals simultaneously
- [ ] No crashes when switching tabs
- [ ] No memory leaks (check dev tools)

## Next Steps if Issues Persist

1. Check browser console (F12) for errors
2. Check backend logs for errors
3. Check network tab (F12) for failed requests
4. Post error messages with full context

Format:
```
Frontend console shows: [TerminalEmulator] ...
Backend logs show: [Socket] ...
Expected: ...
Actual: ...
```
