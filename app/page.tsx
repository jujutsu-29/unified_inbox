import { Navbar } from "@/components/Navbar"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { MessageCircle, Phone, AlertCircle, Users, Clock, CheckCircle } from "lucide-react"

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      {/* Header Navigation */}
      <Navbar/>

      {/* Hero Section */}
      <main className="flex-1">
        <div className="max-w-7xl mx-auto px-6 py-20">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left Column: Content */}
            <div className="space-y-8">
              <h1 className="text-5xl lg:text-6xl font-bold text-foreground text-pretty leading-tight">
                Your Unified Inbox for Customer Outreach
              </h1>

              <p className="text-lg text-muted-foreground leading-relaxed max-w-md">
                Bring all your SMS, WhatsApp, and Email conversations into one simple, powerful, and real-time inbox.
                Never miss a message again.
              </p>

              <div className="flex flex-col sm:flex-row gap-4">
                <Button size="lg" className="w-full sm:w-auto">
                  Get Started Now
                </Button>
                <Button size="lg" variant="outline" className="w-full sm:w-auto bg-transparent">
                  Learn More
                </Button>
              </div>
            </div>

            {/* Right Column: Chat UI Mock */}
            <div>
              <Card className="overflow-hidden shadow-xl">
                <div className="bg-card border-b p-4 flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-foreground text-sm">Sarah Johnson</p>
                    <p className="text-xs text-muted-foreground">Active now</p>
                  </div>
                  <div className="flex gap-2">
                    <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                      <Phone className="w-4 h-4 text-muted-foreground" />
                    </div>
                  </div>
                </div>

                <div className="bg-background p-6 space-y-4 h-80 overflow-y-auto flex flex-col justify-end">
                  <div className="flex gap-3">
                    <div className="w-8 h-8 rounded-full bg-secondary flex-shrink-0" />
                    <div className="bg-muted rounded-lg px-4 py-2 max-w-xs">
                      <p className="text-sm text-foreground">Hi! I'm interested in your pricing plans.</p>
                    </div>
                  </div>

                  <div className="flex justify-end gap-3">
                    <div className="bg-primary rounded-lg px-4 py-2 max-w-xs">
                      <p className="text-sm text-primary-foreground">
                        Great! I'll send you our pricing details right away.
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <div className="w-8 h-8 rounded-full bg-secondary flex-shrink-0" />
                    <div className="bg-muted rounded-lg px-4 py-2 max-w-xs">
                      <p className="text-sm text-foreground">Perfect! Thank you so much.</p>
                    </div>
                  </div>
                </div>

                <div className="bg-card border-t p-4">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Type a message..."
                      className="flex-1 bg-muted border-0 rounded-lg px-3 py-2 text-sm outline-none"
                      readOnly
                    />
                    <Button size="sm" className="px-3">
                      <span className="text-xs">Send</span>
                    </Button>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>

        <div className="bg-secondary/30 py-20">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-foreground mb-4 text-pretty">Problems We Solve</h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Managing customer communication across multiple channels has never been harder. Unified Inbox eliminates
                the chaos.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Problem 1 */}
              <Card className="p-6 flex flex-col gap-4">
                <div className="w-12 h-12 rounded-lg bg-destructive/10 flex items-center justify-center">
                  <AlertCircle className="w-6 h-6 text-destructive" />
                </div>
                <h3 className="text-lg font-semibold text-foreground">Fragmented Communication</h3>
                <p className="text-muted-foreground">
                  Messages scattered across SMS, WhatsApp, and Email apps. Miss important conversations and waste time
                  switching between platforms.
                </p>
              </Card>

              {/* Problem 2 */}
              <Card className="p-6 flex flex-col gap-4">
                <div className="w-12 h-12 rounded-lg bg-accent/10 flex items-center justify-center">
                  <Users className="w-6 h-6 text-accent" />
                </div>
                <h3 className="text-lg font-semibold text-foreground">Poor Team Collaboration</h3>
                <p className="text-muted-foreground">
                  No clear visibility into who's handling what conversation. Duplicate responses and confused customers
                  lead to poor service.
                </p>
              </Card>

              {/* Problem 3 */}
              <Card className="p-6 flex flex-col gap-4">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Clock className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-lg font-semibold text-foreground">Slow Response Times</h3>
                <p className="text-muted-foreground">
                  Customers wait longer for responses. No real-time notifications mean missed opportunities to engage
                  quickly.
                </p>
              </Card>
            </div>
          </div>
        </div>

        <div className="py-20">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-foreground mb-4 text-pretty">How Unified Inbox Solves It</h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                One powerful inbox that brings it all together, so your team can focus on what matters most: delighting
                customers.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Solution 1 */}
              <Card className="p-6 flex flex-col gap-4 border-accent/50">
                <div className="w-12 h-12 rounded-lg bg-accent/10 flex items-center justify-center">
                  <CheckCircle className="w-6 h-6 text-accent" />
                </div>
                <h3 className="text-lg font-semibold text-foreground">Centralized Hub</h3>
                <p className="text-muted-foreground">
                  All SMS, WhatsApp, and Email conversations in one place. Switch channels instantly without losing
                  context.
                </p>
              </Card>

              {/* Solution 2 */}
              <Card className="p-6 flex flex-col gap-4 border-accent/50">
                <div className="w-12 h-12 rounded-lg bg-accent/10 flex items-center justify-center">
                  <CheckCircle className="w-6 h-6 text-accent" />
                </div>
                <h3 className="text-lg font-semibold text-foreground">Team Visibility</h3>
                <p className="text-muted-foreground">
                  See who's handling each conversation, assign tickets, and collaborate seamlessly with your team in
                  real-time.
                </p>
              </Card>

              {/* Solution 3 */}
              <Card className="p-6 flex flex-col gap-4 border-accent/50">
                <div className="w-12 h-12 rounded-lg bg-accent/10 flex items-center justify-center">
                  <CheckCircle className="w-6 h-6 text-accent" />
                </div>
                <h3 className="text-lg font-semibold text-foreground">Instant Notifications</h3>
                <p className="text-muted-foreground">
                  Real-time alerts for new messages across all channels. Respond faster and never miss a customer again.
                </p>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
