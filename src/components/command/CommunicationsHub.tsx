'use client'

import { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { 
  MessageSquare, 
  Send, 
  Radio, 
  Bell, 
  Users, 
  Clock, 
  Check,
  AlertTriangle,
  Shield
} from 'lucide-react'

interface Message {
  id: string
  type: 'secure' | 'alert' | 'broadcast' | 'radio'
  sender: string
  content: string
  timestamp: Date
  priority: 'low' | 'medium' | 'high' | 'critical'
  read: boolean
}

interface RadioLog {
  id: string
  channel: string
  agent: string
  message: string
  timestamp: Date
  signal_strength: number
}

export default function CommunicationsHub() {
  const [activeTab, setActiveTab] = useState<'messages' | 'alerts' | 'broadcast' | 'radio'>('messages')
  const [newMessage, setNewMessage] = useState('')
  const [selectedChannel, setSelectedChannel] = useState('command')
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Mock data
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'secure',
      sender: 'Command Center',
      content: 'All agents report to your stations immediately',
      timestamp: new Date(Date.now() - 300000),
      priority: 'high',
      read: false
    },
    {
      id: '2',
      type: 'alert',
      sender: 'Security Team',
      content: 'Security breach detected at Nairobi Station 5',
      timestamp: new Date(Date.now() - 600000),
      priority: 'critical',
      read: false
    },
    {
      id: '3',
      type: 'broadcast',
      sender: 'Operations',
      content: 'Voting extended by 2 hours in affected areas',
      timestamp: new Date(Date.now() - 900000),
      priority: 'medium',
      read: true
    }
  ])

  const [radioLogs] = useState<RadioLog[]>([
    {
      id: '1',
      channel: 'Channel 1',
      agent: 'Agent Johnson',
      message: 'Station secure, proceeding with vote count',
      timestamp: new Date(Date.now() - 120000),
      signal_strength: 5
    },
    {
      id: '2',
      channel: 'Channel 2',
      agent: 'Agent Kamau',
      message: 'Requesting backup at Mombasa Station 3',
      timestamp: new Date(Date.now() - 180000),
      signal_strength: 3
    },
    {
      id: '3',
      channel: 'Channel 1',
      agent: 'Agent Wanjiru',
      message: 'All systems operational, voter turnout high',
      timestamp: new Date(Date.now() - 240000),
      signal_strength: 4
    }
  ])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'secure': return <Shield className="w-4 h-4 text-kura-green" />
      case 'alert': return <AlertTriangle className="w-4 h-4 text-kura-red" />
      case 'broadcast': return <Bell className="w-4 h-4 text-kura-amber" />
      case 'radio': return <Radio className="w-4 h-4 text-kura-blue" />
      default: return <MessageSquare className="w-4 h-4 text-kura-muted" />
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'border-l-4 border-kura-red'
      case 'high': return 'border-l-4 border-kura-amber'
      case 'medium': return 'border-l-4 border-kura-blue'
      default: return 'border-l-4 border-kura-muted'
    }
  }

  const getSignalColor = (strength: number) => {
    if (strength >= 4) return 'text-kura-green'
    if (strength >= 2) return 'text-kura-amber'
    return 'text-kura-red'
  }

  const handleSendMessage = () => {
    if (newMessage.trim()) {
      const message: Message = {
        id: Date.now().toString(),
        type: 'secure',
        sender: 'Command Center',
        content: newMessage,
        timestamp: new Date(),
        priority: 'medium',
        read: false
      }
      setMessages(prev => [message, ...prev])
      setNewMessage('')
    }
  }

  const MessagesTab = () => (
    <div className="flex flex-col h-full">
      {/* Message List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.map((message) => (
          <motion.div
            key={message.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`bg-kura-panel2 rounded-lg p-3 ${getPriorityColor(message.priority)} ${
              !message.read ? 'bg-opacity-80' : ''
            }`}
          >
            <div className="flex items-start space-x-3">
              {getTypeIcon(message.type)}
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium text-kura-text">{message.sender}</span>
                  <span className="text-xs text-kura-muted">
                    {message.timestamp.toLocaleTimeString('en-KE', { hour12: false })}
                  </span>
                </div>
                <p className="text-xs text-kura-text">{message.content}</p>
              </div>
              {!message.read && (
                <div className="w-2 h-2 bg-kura-blue rounded-full"></div>
              )}
            </div>
          </motion.div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <div className="p-4 border-t border-kura-border">
        <div className="flex items-center space-x-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
            placeholder="Type secure message..."
            className="flex-1 bg-kura-panel2 border border-kura-border text-kura-text text-sm px-3 py-2 rounded-lg focus:outline-none focus:border-kura-blue"
          />
          <button
            onClick={handleSendMessage}
            className="ops-button-primary p-2"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  )

  const AlertsTab = () => (
    <div className="p-4 space-y-3">
      {messages
        .filter(m => m.type === 'alert')
        .map((alert) => (
          <motion.div
            key={alert.id}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className={`command-panel ${getPriorityColor(alert.priority)}`}
          >
            <div className="p-3">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <AlertTriangle className="w-4 h-4 text-kura-red" />
                  <span className="text-sm font-medium text-kura-text">{alert.sender}</span>
                </div>
                <span className="text-xs text-kura-muted">
                  {alert.timestamp.toLocaleTimeString('en-KE', { hour12: false })}
                </span>
              </div>
              <p className="text-xs text-kura-text">{alert.content}</p>
            </div>
          </motion.div>
        ))}
    </div>
  )

  const BroadcastTab = () => (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b border-kura-border">
        <h3 className="text-sm font-semibold text-kura-text mb-2">Broadcast Message</h3>
        <textarea
          placeholder="Compose broadcast message to all agents..."
          className="w-full bg-kura-panel2 border border-kura-border text-kura-text text-sm px-3 py-2 rounded-lg h-24 resize-none focus:outline-none focus:border-kura-blue"
        />
        <button className="ops-button-primary mt-2">
          Send Broadcast
        </button>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages
          .filter(m => m.type === 'broadcast')
          .map((broadcast) => (
            <motion.div
              key={broadcast.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="command-panel"
            >
              <div className="p-3">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <Bell className="w-4 h-4 text-kura-amber" />
                    <span className="text-sm font-medium text-kura-text">{broadcast.sender}</span>
                  </div>
                  <span className="text-xs text-kura-muted">
                    {broadcast.timestamp.toLocaleTimeString('en-KE', { hour12: false })}
                  </span>
                </div>
                <p className="text-xs text-kura-text">{broadcast.content}</p>
              </div>
            </motion.div>
          ))}
      </div>
    </div>
  )

  const RadioTab = () => (
    <div className="flex flex-col h-full">
      {/* Channel Selector */}
      <div className="p-4 border-b border-kura-border">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-kura-text">Radio Channels</h3>
          <Radio className="w-4 h-4 text-kura-blue" />
        </div>
        <div className="flex space-x-2">
          {['Channel 1', 'Channel 2', 'Command'].map((channel) => (
            <button
              key={channel}
              onClick={() => setSelectedChannel(channel)}
              className={`ops-button text-xs ${
                selectedChannel === channel ? 'ops-button-primary' : 'ops-button-secondary'
              }`}
            >
              {channel}
            </button>
          ))}
        </div>
      </div>

      {/* Radio Logs */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {radioLogs
          .filter(log => selectedChannel === 'Command' || log.channel === selectedChannel)
          .map((log) => (
            <motion.div
              key={log.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="command-panel"
            >
              <div className="p-3">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <Radio className="w-4 h-4 text-kura-blue" />
                    <span className="text-sm font-medium text-kura-text">{log.agent}</span>
                    <span className="text-xs text-kura-muted">{log.channel}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className={`flex items-center space-x-1 ${getSignalColor(log.signal_strength)}`}>
                      <div className="w-2 h-2 bg-current rounded-full"></div>
                      <span className="text-xs">{log.signal_strength}/5</span>
                    </div>
                    <span className="text-xs text-kura-muted">
                      {log.timestamp.toLocaleTimeString('en-KE', { hour12: false })}
                    </span>
                  </div>
                </div>
                <p className="text-xs text-kura-text">{log.message}</p>
              </div>
            </motion.div>
          ))}
      </div>
    </div>
  )

  return (
    <div className="command-panel h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-kura-border">
        <div>
          <h2 className="text-lg font-semibold text-kura-text flex items-center space-x-2">
            <MessageSquare className="w-5 h-5 text-kura-cyan" />
            <span>Communications Hub</span>
          </h2>
          <p className="text-xs text-kura-muted">Command dispatch console</p>
        </div>
        
        {/* Unread Count */}
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 bg-kura-blue rounded-full animate-pulse"></div>
          <span className="text-xs text-kura-blue">
            {messages.filter(m => !m.read).length} unread
          </span>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex space-x-1 p-4 border-b border-kura-border">
        {[
          { id: 'messages', label: 'Messages', icon: MessageSquare },
          { id: 'alerts', label: 'Alerts', icon: AlertTriangle },
          { id: 'broadcast', label: 'Broadcast', icon: Bell },
          { id: 'radio', label: 'Radio', icon: Radio }
        ].map((tab) => {
          const Icon = tab.icon
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center space-x-2 px-3 py-2 text-xs rounded-lg transition-colors ${
                activeTab === tab.id
                  ? 'bg-kura-cyan/20 text-kura-cyan border border-kura-cyan/30'
                  : 'text-kura-muted hover:text-kura-text hover:bg-kura-panel2'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          )
        })}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden">
        {activeTab === 'messages' && <MessagesTab />}
        {activeTab === 'alerts' && <AlertsTab />}
        {activeTab === 'broadcast' && <BroadcastTab />}
        {activeTab === 'radio' && <RadioTab />}
      </div>
    </div>
  )
}
