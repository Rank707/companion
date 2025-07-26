import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { MessageCircle, Shield, Zap } from "lucide-react"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-16">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            Welcome to <span className="text-indigo-600">MindMate AI</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Your trusted AI companion for meaningful conversations. Share your thoughts, get insights, and find support
            whenever you need it.
          </p>
          <Link href="/enter-code">
            <Button size="lg" className="text-lg px-8 py-4">
              Access Companion
            </Button>
          </Link>
        </div>

        {/* Features */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          <Card>
            <CardHeader>
              <MessageCircle className="h-12 w-12 text-indigo-600 mb-4" />
              <CardTitle>Meaningful Conversations</CardTitle>
              <CardDescription>Engage in deep, thoughtful discussions with our AI companion</CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <Shield className="h-12 w-12 text-indigo-600 mb-4" />
              <CardTitle>Safe & Private</CardTitle>
              <CardDescription>Your conversations are secure and confidential</CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <Zap className="h-12 w-12 text-indigo-600 mb-4" />
              <CardTitle>Instant Support</CardTitle>
              <CardDescription>Get immediate responses and emotional support 24/7</CardDescription>
            </CardHeader>
          </Card>
        </div>

        {/* CTA Section */}
        <Card className="max-w-2xl mx-auto text-center">
          <CardHeader>
            <CardTitle className="text-2xl">Ready to Start?</CardTitle>
            <CardDescription>Enter your access code to begin your conversation with MindMate AI</CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/enter-code">
              <Button size="lg" className="w-full">
                Get Started Now
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
