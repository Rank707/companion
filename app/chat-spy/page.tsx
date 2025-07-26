"use client"

import { useState, useEffect, useRef } from "react"
import { useSearchParams } from "next/navigation"
import { io, type Socket } from "socket.io-client"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { Eye, Send, Zap } from "lucide-react"

interface Message {
  id: string
  type: "user" | "ai"
  content: string
  timestamp: string
}

export default function ChatSpyPage() {
  const searchParams = useSearchParams()
  const code = searchParams.get("code")
  const [socket, setSocket] = useState<Socket | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [companionDraft, setCompanionDraft] = useState("")
  const [isCompanionTyping, setIsCompanionTyping] = useState(false)
  const [prankThoughts, setPrankThoughts] = useState("")
  const [isConnected, setIsConnected] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const { toast } = useToast()

  useEffect(() =>
  {
    if (!code) return

    // Replace with your backend Socket.IO URL
    const newSocket = io("https://mindmate-y168.onrender.com/")
    setSocket(newSocket)

    newSocket.on("connect", () =>
    {
      setIsConnected(true)
      newSocket.emit("join-room", { code: code, userType: "spy" })
    })

    newSocket.on("disconnect", () =>
    {
      setIsConnected(false)
    })

    newSocket.on("friend-typing", (data) =>
    {
      setCompanionDraft(data.currentDraft)
      setIsCompanionTyping(data.isTyping)
    })

    newSocket.on("ai-response", (data) =>
    {
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + "-user",
          type: "user",
          content: data.userMessage || "",
          timestamp: new Date().toISOString(),
        },
        {
          id: Date.now() + "-ai",
          type: "ai",
          content: data.text || "No response from AI 😶", // <- 🔥 FIXED!
          timestamp: new Date().toISOString(),
        },
      ])
    })

    newSocket.on("prank-injected", (data) =>
    {
      toast({
        title: "Prank Sent! 😈",
        description: `Injected: "${data.prankThoughts}"`,
      })
      setPrankThoughts("")
    })

    newSocket.on("user-joined", (data) =>
    {
      toast({
        title: "User Connected",
        description: `${data.userType} joined the room`,
      })
    })

    newSocket.on("user-left", (data) =>
    {
      toast({
        title: "User Disconnected",
        description: `${data.userType} left the room`,
        variant: "destructive",
      })
    })
    console.log(prankThoughts);

    return () =>
    {
      newSocket.close()
    }
  }, [code, toast]);
  
  useEffect(() => {
  if (!socket || !code) return;

  console.log("💬 Emitting prank prompt:", prankThoughts); // ✅ Add this log

  socket.emit("update-spy-prompt", {
    code,
    spyPrompt: prankThoughts,
  });
}, [prankThoughts, socket, code]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const handleSendPrank = () => {
    if (!socket || !prankThoughts.trim()) return

    // Send prank message with injected thoughts
    socket.emit("send-message", {
      userSays: companionDraft || "",
      userThinks: prankThoughts.trim(),
      code,
    })



    socket.emit("inject-prank", {
      code,
      prankThoughts: prankThoughts.trim(),
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
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-100 p-4">
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-4 h-[90vh]">
        {/* Chat Monitor */}
        <div className="lg:col-span-2">
          <Card className="h-full flex flex-col">
            <CardHeader className="border-b">
              <CardTitle className="flex items-center gap-2">
                <Eye className="h-5 w-5" />
                Chat Monitor
                <Badge variant={isConnected ? "default" : "destructive"}>
                  {isConnected ? "Connected" : "Disconnected"}
                </Badge>
              </CardTitle>
            </CardHeader>

            <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.length === 0 && (
                <div className="text-center text-gray-500 mt-8">
                  <p>Waiting for conversation to start...</p>
                  <p className="text-sm mt-2">{"You'll see all messages here 👀"}</p>
                </div>
              )}

              {messages.map((message) => (
                <div key={message.id} className={`flex ${message.type === "user" ? "justify-end" : "justify-start"}`}>
                  <div
                    className={`max-w-[70%] p-3 rounded-lg ${
                      message.type === "user" ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-900"
                    }`}
                  >
                    <p>{message.content}</p>
                    {/* <p className={`text-xs mt-1 ${message.type === "user" ? "text-blue-200" : "text-gray-500"}`}>
                      {new Date(message.timestamp).toLocaleTimeString()}
                    </p> */}
                  </div>
                </div>
              ))}

              <div ref={messagesEndRef} />
            </CardContent>
          </Card>
        </div>

        {/* Spy Controls */}
        <div className="space-y-4">
          {/* Live Typing Monitor */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Live Typing</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="min-h-[100px] p-3 bg-gray-50 rounded border">
                {isCompanionTyping ? (
                  <div>
                    <Badge className="mb-2">Friend is typing...</Badge>
                    <p className="text-sm font-mono bg-white p-2 rounded">{companionDraft || "..."}</p>
                  </div>
                ) : (
                  <p className="text-gray-500 text-sm">No typing activity</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Prank Control */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Zap className="h-5 w-5" />
                Prank Control
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium">Inject Secret Thoughts:</label>
                <Textarea
                  value={prankThoughts}
                  onChange={(e) => setPrankThoughts(e.target.value)}
                  placeholder="Add what they're 'secretly' thinking..."
                  className="mt-1"
                  rows={3}
                  
                />
              </div>

              <Button
                onClick={handleSendPrank}
                disabled={!prankThoughts.trim() || !isConnected}
                className="w-full bg-red-600 hover:bg-red-700"
              >
                <Send className="h-4 w-4 mr-2" />
                Send Prank Message
              </Button>

              <div className="text-xs text-gray-500">
                <p>💡 This will send the current draft with your added thoughts</p>
              </div>
            </CardContent>
          </Card>

          {/* Room Info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Room Info</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <p>
                  <strong>Code:</strong> {code}
                </p>
                <p>
                  <strong>Role:</strong> Spy Master 😈
                </p>
                <p>
                  <strong>Status:</strong>
                  <Badge variant={isConnected ? "default" : "destructive"} className="ml-2">
                    {isConnected ? "Active" : "Disconnected"}
                  </Badge>
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
