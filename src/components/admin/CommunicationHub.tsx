'use client'

import { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { Send, MessageSquare, Users, Bell, Search, Filter, Phone, Mail, AlertCircle, CheckCircle, Clock } from 'lucide-react'
import Badge from '@/components/ui/Badge'

interface Message {
  id: string
  senderId: string
  senderName: string
  receiverId: string
  receiverName: string
  content: string
  timestamp: string
  type: 'broadcast' | 'direct' | 'alert' | 'system'
  status: 'sent' | 'delivered' | 'read'
  priority: 'low' | 'medium' | 'high' | 'urgent'
}

interface Agent {
  id: string
  name: string
  agentId: string
  stationCode: string
  status: 'online' | 'offline' | 'busy'
  lastSeen: string
}

export default function CommunicationHub() {
  const [messages, setMessages] = useState<Message[]>([])
  const [agents, setAgents] = useState<Agent[]>([])
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null)
  const [messageContent, setMessageContent] = useState('')
  const [messageType, setMessageType] = useState<'direct' | 'broadcast' | 'alert'>('direct')
  const [priority, setPriority] = useState<'low' | 'medium' | 'high' | 'urgent'>('medium')
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState<'all' | 'unread' | 'sent' | 'received'>('all')
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Mock data
    const mockMessages: Message[] = [
      {
        id: '1',
        senderId: 'admin',
        senderName: 'Admin',
        receiverId: 'agent-001',
        receiverName: 'James Mwangi',
        content: 'Please verify your stream quality and ensure audio is clear for vote transcription.',
        timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
        type: 'direct',
        status: 'read',
        priority: 'medium'
      },
      {
        id: '2',
        senderId: 'agent-001',
        senderName: 'James Mwangi',
        receiverId: 'admin',
        receiverName: 'Admin',
        content: 'Stream quality confirmed. Audio is clear and ready for counting.',
        timestamp: new Date(Date.now() - 25 * 60 * 1000).toISOString(),
        type: 'direct',
        status: 'read',
        priority: 'low'
      },
      {
        id: '3',
        senderId: 'admin',
        senderName: 'Admin',
        receiverId: 'all',
        receiverName: 'All Agents',
        content: 'IMPORTANT: New voting procedure updates. Please review the updated Form 34A guidelines.',
        timestamp: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
        type: 'broadcast',
        status: 'delivered',
        priority: 'high'
      },
      {
        id: '4',
        senderId: 'system',
        senderName: 'System',
        receiverId: 'admin',
        receiverName: 'Admin',
        content: 'Critical alert: 5 agents have not submitted tallies for their stations.',
        timestamp: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
        type: 'alert',
        status: 'delivered',
        priority: 'urgent'
      }
    ]

    const mockAgents: Agent[] = [
      {
        id: 'agent-001',
        name: 'James Mwangi',
        agentId: 'AG-0001',
        stationCode: 'KE-047-290-0001',
        status: 'online',
        lastSeen: new Date().toISOString()
      },
      {
        id: 'agent-002',
        name: 'Sarah Njoroge',
        agentId: 'AG-0002',
        stationCode: 'KE-047-290-0002',
        status: 'offline',
        lastSeen: new Date(Date.now() - 30 * 60 * 1000).toISOString()
      },
      {
        id: 'agent-003',
        name: 'David Ochieng',
        agentId: 'AG-0003',
        stationCode: 'KE-047-290-0003',
        status: 'busy',
        lastSeen: new Date(Date.now() - 5 * 60 * 1000).toISOString()
      }
    ]

    setMessages(mockMessages)
    setAgents(mockAgents)
    setLoading(false)
  }, [])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const handleSendMessage = async () => {
    if (!messageContent.trim() || sending) return

    setSending(true)

    try {
      // Simulate sending message
      await new Promise(resolve => setTimeout(resolve, 1000))

      const newMessage: Message = {
        id: Date.now().toString(),
        senderId: 'admin',
        senderName: 'Admin',
        receiverId: messageType === 'broadcast' ? 'all' : selectedAgent?.id || '',
        receiverName: messageType === 'broadcast' ? 'All Agents' : selectedAgent?.name || '',
        content: messageContent,
        timestamp: new Date().toISOString(),
        type: messageType,
        status: 'sent',
        priority
      }

      setMessages(prev => [...prev, newMessage])
      setMessageContent('')
    } catch (error) {
      console.error('Failed to send message:', error)
    } finally {
      setSending(false)
    }
  }

  const getFilteredMessages = () => {
    let filtered = [...messages]

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(msg =>
        msg.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
        msg.senderName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        msg.receiverName.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Apply type filter
    if (filterType === 'unread') {
      filtered = filtered.filter(msg => msg.status !== 'read')
    } else if (filterType === 'sent') {
      filtered = filtered.filter(msg => msg.senderId === 'admin')
    } else if (filterType === 'received') {
      filtered = filtered.filter(msg => msg.senderId !== 'admin')
    }

    return filtered.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
  }

  const getStatusColor = (status: Message['status']) => {
    switch (status) {
      case 'sent': return 'text-blue-400'
      case 'delivered': return 'text-green-400'
      case 'read': return 'text-gray-400'
      default: return 'text-gray-400'
    }
  }

  const getPriorityColor = (priority: Message['priority']) => {
    switch (priority) {
      case 'urgent': return 'bg-red-500/10 text-red-400 border-red-500/30'
      case 'high': return 'bg-orange-500/10 text-orange-400 border-orange-500/30'
      case 'medium': return 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30'
      case 'low': return 'bg-gray-500/10 text-gray-400 border-gray-500/30'
      default: return 'bg-gray-500/10 text-gray-400 border-gray-500/30'
    }
  }

  const getAgentStatusColor = (status: Agent['status']) => {
    switch (status) {
      case 'online': return 'bg-green-500'
      case 'offline': return 'bg-gray-500'
      case 'busy': return 'bg-yellow-500'
      default: return 'bg-gray-500'
    }
  }

  const filteredMessages = getFilteredMessages()
  const onlineAgents = agents.filter(agent => agent.status === 'online').length
  const unreadCount = messages.filter(msg => msg.status !== 'read' && msg.receiverId === 'admin').length

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-kura-accent border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  return (
    <div className="h-full flex">
      {/* Agents Sidebar */}
      <div className="w-80 bg-kura-surface border-r border-kura-border flex flex-col">
        <div className="p-4 border-b border-kura-border">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-white">Agents</h2>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-400 rounded-full" />
              <span className="text-sm text-gray-400">{onlineAgents} online</span>
            </div>
          </div>
          
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search agents..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 bg-kura-navy border border-kura-border rounded-lg text-white placeholder-gray-500 text-sm focus:outline-none focus:border-kura-accent"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {agents.map((agent) => (
            <motion.div
              key={agent.id}
              whileHover={{ scale: 1.02 }}
              onClick={() => setSelectedAgent(agent)}
              className={`p-3 rounded-lg cursor-pointer transition-colors ${
                selectedAgent?.id === agent.id 
                  ? 'bg-kura-accent/20 border border-kura-accent' 
                  : 'bg-kura-navy border border-kura-border hover:bg-kura-navy/80'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <div className={`w-2 h-2 rounded-full ${getAgentStatusColor(agent.status)}`} />
                  <span className="text-white font-medium">{agent.name}</span>
                </div>
                <Badge variant="default" size="sm" className="bg-blue-500/10 text-blue-400 border-blue-500/30">
                  {agent.agentId}
                </Badge>
              </div>
              
              <div className="text-sm text-gray-400">{agent.stationCode}</div>
              <div className="text-xs text-gray-500 mt-1">
                {agent.status === 'online' ? 'Active now' : `Last seen ${new Date(agent.lastSeen).toLocaleTimeString()}`}
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Chat Header */}
        <div className="bg-kura-surface border-b border-kura-border p-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-semibold text-white">Communication Hub</h1>
              <div className="flex items-center space-x-4 mt-1">
                <span className="text-sm text-gray-400">
                  {selectedAgent ? `Chat with ${selectedAgent.name}` : 'Select an agent to start chatting'}
                </span>
                {unreadCount > 0 && (
                  <Badge variant="default" className="bg-red-500/10 text-red-400 border-red-500/30">
                    {unreadCount} unread
                  </Badge>
                )}
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <button className="p-2 bg-kura-navy border border-kura-border rounded-lg hover:bg-kura-navy/80">
                <Phone className="w-4 h-4 text-gray-400" />
              </button>
              <button className="p-2 bg-kura-navy border border-kura-border rounded-lg hover:bg-kura-navy/80">
                <Mail className="w-4 h-4 text-gray-400" />
              </button>
            </div>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {filteredMessages.map((message) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex ${message.senderId === 'admin' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`max-w-lg ${message.senderId === 'admin' ? 'order-2' : 'order-1'}`}>
                <div className={`p-3 rounded-lg ${
                  message.senderId === 'admin' 
                    ? 'bg-kura-accent text-white' 
                    : 'bg-kura-navy text-white'
                }`}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">{message.senderName}</span>
                    <div className="flex items-center space-x-2">
                      {message.type !== 'direct' && (
                        <Badge variant="default" size="sm" className="bg-white/20 text-white border-white/30">
                          {message.type}
                        </Badge>
                      )}
                      <Badge variant="default" size="sm" className={getPriorityColor(message.priority)}>
                        {message.priority}
                      </Badge>
                    </div>
                  </div>
                  
                  <p className="text-sm mb-2">{message.content}</p>
                  
                  <div className="flex items-center justify-between text-xs opacity-70">
                    <span>{new Date(message.timestamp).toLocaleTimeString()}</span>
                    <div className="flex items-center space-x-1">
                      {message.senderId === 'admin' && (
                        <>
                          <CheckCircle className={`w-3 h-3 ${getStatusColor(message.status)}`} />
                          <span>{message.status}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
                
                {message.receiverName !== 'Admin' && (
                  <div className="text-xs text-gray-400 mt-1">
                    To: {message.receiverName}
                  </div>
                )}
              </div>
            </motion.div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Message Input */}
        <div className="bg-kura-surface border-t border-kura-border p-4">
          <div className="space-y-3">
            {/* Message Type and Priority */}
            <div className="flex items-center space-x-3">
              <select
                value={messageType}
                onChange={(e) => setMessageType(e.target.value as 'direct' | 'broadcast' | 'alert')}
                className="bg-kura-navy border border-kura-border rounded px-3 py-1 text-white text-sm"
              >
                <option value="direct">Direct Message</option>
                <option value="broadcast">Broadcast</option>
                <option value="alert">Alert</option>
              </select>
              
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as 'low' | 'medium' | 'high' | 'urgent')}
                className="bg-kura-navy border border-kura-border rounded px-3 py-1 text-white text-sm"
              >
                <option value="low">Low Priority</option>
                <option value="medium">Medium Priority</option>
                <option value="high">High Priority</option>
                <option value="urgent">Urgent</option>
              </select>
              
              {messageType === 'broadcast' && (
                <Badge variant="default" className="bg-blue-500/10 text-blue-400 border-blue-500/30">
                  Sending to all agents
                </Badge>
              )}
            </div>

            {/* Message Input */}
            <div className="flex space-x-2">
              <input
                type="text"
                value={messageContent}
                onChange={(e) => setMessageContent(e.target.value)}
                placeholder={
                  messageType === 'broadcast' 
                    ? 'Type broadcast message...' 
                    : selectedAgent 
                    ? `Type message to ${selectedAgent.name}...`
                    : 'Select an agent to message...'
                }
                disabled={!selectedAgent && messageType === 'direct'}
                className="flex-1 bg-kura-navy border border-kura-border rounded-lg px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-kura-accent"
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              />
              
              <button
                onClick={handleSendMessage}
                disabled={sending || (!selectedAgent && messageType === 'direct') || !messageContent.trim()}
                className="px-4 py-2 bg-kura-accent hover:bg-kura-accent/80 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {sending ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
