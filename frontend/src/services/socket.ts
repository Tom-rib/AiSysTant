import { io, Socket } from 'socket.io-client'

const WS_URL = import.meta.env.VITE_WS_URL || 'ws://localhost:3001'

class SocketService {
  private socket: Socket | null = null

  connect(token: string) {
    if (this.socket?.connected) {
      return this.socket
    }

    this.socket = io(WS_URL, {
      auth: {
        token,
      },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 5,
    })

    this.socket.on('connect', () => {
      console.log('✅ Socket connecté:', this.socket?.id)
    })

    this.socket.on('disconnect', (reason) => {
      console.log('❌ Socket déconnecté:', reason)
    })

    this.socket.on('connect_error', (error) => {
      console.error('❌ Erreur de connexion socket:', error)
    })

    return this.socket
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect()
      this.socket = null
    }
  }

  // Chat events
  onNewMessage(callback: (message: any) => void) {
    this.socket?.on('message', callback)
  }

  onTyping(callback: (data: { userId: string; isTyping: boolean }) => void) {
    this.socket?.on('typing', callback)
  }

  sendMessage(conversationId: string, content: string) {
    this.socket?.emit('send_message', { conversationId, content })
  }

  setTyping(conversationId: string, isTyping: boolean) {
    this.socket?.emit('typing', { conversationId, isTyping })
  }

  // SSH events
  onSSHOutput(callback: (data: { serverId: string; output: string }) => void) {
    this.socket?.on('ssh_output', callback)
  }

  onSSHError(callback: (data: { serverId: string; error: string }) => void) {
    this.socket?.on('ssh_error', callback)
  }

  onSSHConnected(callback: (data: { serverId: string }) => void) {
    this.socket?.on('ssh_connected', callback)
  }

  onSSHDisconnected(callback: (data: { serverId: string }) => void) {
    this.socket?.on('ssh_disconnected', callback)
  }

  executeSSHCommand(serverId: string, command: string) {
    this.socket?.emit('ssh_command', { serverId, command })
  }

  // Notifications
  onNotification(callback: (notification: any) => void) {
    this.socket?.on('notification', callback)
  }

  // Activity updates
  onActivityUpdate(callback: (activity: any) => void) {
    this.socket?.on('activity_update', callback)
  }

  // Generic event listener
  on(event: string, callback: (...args: any[]) => void) {
    this.socket?.on(event, callback)
  }

  off(event: string, callback?: (...args: any[]) => void) {
    this.socket?.off(event, callback)
  }

  offAll(event: string) {
    this.socket?.removeAllListeners(event)
  }

  emit(event: string, ...args: any[]) {
    this.socket?.emit(event, ...args)
  }

  // Get socket instance
  getSocket() {
    return this.socket
  }

  // Check connection status
  isConnected() {
    return this.socket?.connected || false
  }
}

export const socketService = new SocketService()
export default socketService
