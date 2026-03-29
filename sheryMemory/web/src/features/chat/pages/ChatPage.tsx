import { useEffect, useRef, useState, useCallback } from 'react'
import { useChat } from '../hooks/useChat'
import { ChatSidebar } from '../components/ChatSidebar'
import { ChatHeader } from '../components/ChatHeader'
import { ChatEmptyState } from '../components/ChatEmptyState'
import { ChatMessage } from '../components/ChatMessage'
import { ChatInput } from '../components/ChatInput'
import { ChatLoadingDots } from '../components/ChatLoadingDots'
import { ChatLoading } from '../components/ChatLoading'

export function ChatPage() {
  const {
    sessions,
    activeSessionId,
    setActiveSessionId,
    messages,
    input,
    setInput,
    mode,
    setMode,
    isSending,
    isLoadingMessages,
    isInitializing,
    handleNewChat,
    handleDeleteSession,
    handleSend
  } = useChat()

  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const endOfMessagesRef = useRef<HTMLDivElement>(null)

  // Auto-scroll logic
  useEffect(() => {
    endOfMessagesRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isSending])

  const toggleSidebar = useCallback(() => {
    setIsSidebarOpen(prev => !prev)
  }, [])

  if (isInitializing) {
    return <ChatLoading />
  }

  return (
    <div className="relative flex h-[calc(100vh-8rem)] w-full overflow-hidden rounded-2xl border border-(--border-subtle) bg-(--bg-base) shadow-sm">
      <ChatSidebar
        sessions={sessions}
        activeSessionId={activeSessionId}
        setActiveSessionId={(sid) => setActiveSessionId(sid)}
        isSidebarOpen={isSidebarOpen}
        setIsSidebarOpen={setIsSidebarOpen}
        onNewChat={handleNewChat}
        onDeleteSession={handleDeleteSession}
      />

      <div className="flex flex-1 flex-col overflow-hidden bg-(--bg-base)">
        <ChatHeader onOpenSidebar={toggleSidebar} />

        <div className="flex-1 overflow-y-auto p-4 md:p-6 custom-scrollbar">
          {isLoadingMessages ? (
            <ChatLoading />
          ) : messages.length === 0 ? (
            <ChatEmptyState />
          ) : (
            <div className="flex flex-col gap-6 max-w-4xl mx-auto w-full">
              {messages.map((msg, index) => (
                <ChatMessage
                  key={msg.id}
                  message={msg}
                  isLast={index === messages.length - 1}
                  isSending={isSending}
                  onRegenerate={(content) => handleSend(content, true)}
                />
              ))}

              {isSending && <ChatLoadingDots />}
              <div ref={endOfMessagesRef} className="h-2" />
            </div>
          )}
        </div>

        <ChatInput
          input={input}
          setInput={setInput}
          onSend={() => handleSend()}
          mode={mode}
          setMode={setMode}
          disabled={isInitializing || isSending}
        />
      </div>
    </div>
  )
}

