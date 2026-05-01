import Link from 'next/link'
import Badge from '@/components/ui/Badge'
import { Shield, BarChart3, Users, Eye, ArrowRight } from 'lucide-react'

export default function Home() {
  return (
    <main className="min-h-screen bg-kura-navy">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="container mx-auto px-4 py-16 sm:py-24">
          <div className="text-center">
            <div className="flex items-center justify-center mb-6">
              <Shield className="w-16 h-16 text-kura-accent" />
            </div>
            <h1 className="text-4xl sm:text-6xl font-bold text-kura-accent mb-4">
              KURA LIVE
            </h1>
            <p className="text-xl sm:text-2xl text-gray-300 mb-8 max-w-3xl mx-auto">
              Kenya Unified Results Architecture - Live Intelligence Platform
            </p>
            <p className="text-lg text-gray-400 mb-12 max-w-2xl mx-auto">
              Real-time election monitoring for Kenya&apos;s 2027 General Election.
              Track results from ~46,229 polling stations with AI-powered verification.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
              <Link 
                href="/login" 
                className="flex items-center px-8 py-4 bg-kura-accent hover:bg-kura-accent/80 text-white rounded-lg transition-colors font-medium text-lg"
              >
                <Shield className="w-5 h-5 mr-2" />
                Agent Portal
                <ArrowRight className="w-5 h-5 ml-2" />
              </Link>
              <Link 
                href="/results" 
                className="flex items-center px-8 py-4 bg-kura-surface hover:bg-kura-navy-mid text-white rounded-lg transition-colors font-medium text-lg border border-kura-border"
              >
                <Eye className="w-5 h-5 mr-2" />
                View Results
              </Link>
            </div>

            <Badge variant="info" className="text-lg px-6 py-2">
              Election Day: August 8, 2027
            </Badge>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-kura-surface">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white mb-4">Platform Features</h2>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
              Comprehensive election monitoring with real-time data capture and verification
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-kura-navy border border-kura-border rounded-lg p-6">
              <div className="flex items-center mb-4">
                <BarChart3 className="w-8 h-8 text-kura-accent mr-3" />
                <h3 className="text-xl font-semibold text-white">Live Stream Management</h3>
              </div>
              <p className="text-gray-300">
                Multi-platform streaming from TikTok, YouTube, and custom platforms with real-time monitoring and engagement tracking.
              </p>
            </div>

            <div className="bg-kura-navy border border-kura-border rounded-lg p-6">
              <div className="flex items-center mb-4">
                <Eye className="w-8 h-8 text-kura-accent mr-3" />
                <h3 className="text-xl font-semibold text-white">AI Transcription</h3>
              </div>
              <p className="text-gray-300">
                Automated speech-to-text transcription with vote extraction and real-time processing of result announcements.
              </p>
            </div>

            <div className="bg-kura-navy border border-kura-border rounded-lg p-6">
              <div className="flex items-center mb-4">
                <Shield className="w-8 h-8 text-kura-accent mr-3" />
                <h3 className="text-xl font-semibold text-white">Form 34A Scanning</h3>
              </div>
              <p className="text-gray-300">
                OCR-powered form scanning with automatic data extraction and verification against official IEBC portal data.
              </p>
            </div>

            <div className="bg-kura-navy border border-kura-border rounded-lg p-6">
              <div className="flex items-center mb-4">
                <Users className="w-8 h-8 text-kura-accent mr-3" />
                <h3 className="text-xl font-semibold text-white">Cross-Source Comparison</h3>
              </div>
              <p className="text-gray-300">
                Three-way verification between audio AI, Form 34A OCR, and IEBC portal data with automatic discrepancy detection.
              </p>
            </div>

            <div className="bg-kura-navy border border-kura-border rounded-lg p-6">
              <div className="flex items-center mb-4">
                <BarChart3 className="w-8 h-8 text-kura-accent mr-3" />
                <h3 className="text-xl font-semibold text-white">Real-time Alerts</h3>
              </div>
              <p className="text-gray-300">
                Instant discrepancy alerts with severity classification and escalation workflows for critical issues.
              </p>
            </div>

            <div className="bg-kura-navy border border-kura-border rounded-lg p-6">
              <div className="flex items-center mb-4">
                <Eye className="w-8 h-8 text-kura-accent mr-3" />
                <h3 className="text-xl font-semibold text-white">Public Dashboard</h3>
              </div>
              <p className="text-gray-300">
                Live results visualization with interactive Kenya map, station search, and real-time national tally updates.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white mb-4">National Coverage</h2>
            <p className="text-gray-400 text-lg">Monitoring every polling station across Kenya</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-4xl font-bold text-kura-accent mb-2">46,229</div>
              <div className="text-gray-400">Total Polling Stations</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-kura-green mb-2">47</div>
              <div className="text-gray-400">Counties</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-kura-amber mb-2">290</div>
              <div className="text-gray-400">Constituencies</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-kura-accent2 mb-2">1,450</div>
              <div className="text-gray-400">Wards</div>
            </div>
          </div>
        </div>
      </section>

      {/* Access Section */}
      <section className="py-16 bg-kura-surface">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white mb-4">Platform Access</h2>
            <p className="text-gray-400 text-lg">Choose your access level based on your role</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-kura-navy border border-kura-border rounded-lg p-6">
              <div className="flex items-center mb-4">
                <Users className="w-8 h-8 text-kura-green mr-3" />
                <h3 className="text-xl font-semibold text-white">Polling Agent</h3>
              </div>
              <p className="text-gray-300 mb-4">
                Field agents at polling stations with access to stream management, transcription, and result capture tools.
              </p>
              <Link 
                href="/login" 
                className="inline-flex items-center px-4 py-2 bg-kura-green hover:bg-kura-green/80 text-white rounded-lg transition-colors"
              >
                Agent Login
                <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
            </div>

            <div className="bg-kura-navy border border-kura-border rounded-lg p-6">
              <div className="flex items-center mb-4">
                <Shield className="w-8 h-8 text-kura-accent mr-3" />
                <h3 className="text-xl font-semibold text-white">Campaign Admin</h3>
              </div>
              <p className="text-gray-300 mb-4">
                Campaign oversight with analytics, agent management, and alert monitoring capabilities.
              </p>
              <Link 
                href="/login" 
                className="inline-flex items-center px-4 py-2 bg-kura-accent hover:bg-kura-accent/80 text-white rounded-lg transition-colors"
              >
                Admin Login
                <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
            </div>

            <div className="bg-kura-navy border border-kura-border rounded-lg p-6">
              <div className="flex items-center mb-4">
                <Eye className="w-8 h-8 text-kura-amber mr-3" />
                <h3 className="text-xl font-semibold text-white">Public Viewer</h3>
              </div>
              <p className="text-gray-300 mb-4">
                Open access to live results, interactive maps, and station-level result tracking.
              </p>
              <Link 
                href="/results" 
                className="inline-flex items-center px-4 py-2 bg-kura-amber hover:bg-kura-amber/80 text-white rounded-lg transition-colors"
              >
                View Results
                <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 border-t border-kura-border">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <div className="flex items-center justify-center mb-4">
              <Shield className="w-8 h-8 text-kura-accent mr-2" />
              <span className="text-xl font-bold text-kura-accent">KURA LIVE</span>
            </div>
            <p className="text-gray-400 mb-2">
              Kenya Unified Results Architecture - Live Intelligence Platform
            </p>
            <p className="text-gray-500 text-sm">
              Built for Kenya 2027 General Election • Kura Yako, Sauti Yako - Your Vote, Your Voice
            </p>
          </div>
        </div>
      </footer>
    </main>
  )
}
