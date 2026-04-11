import { Component, ReactNode } from 'react'
import { AlertCircle, RefreshCw } from 'lucide-react'

interface Props {
  children: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error('ErrorBoundary caught an error:', error, errorInfo)
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null })
    window.location.reload()
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-surface flex items-center justify-center p-4">
          <div className="bg-background rounded-lg p-6 max-w-md w-full shadow-medium border-2 border-danger text-center">
            <div className="flex justify-center mb-4">
              <AlertCircle size={64} className="text-danger" />
            </div>
            <h1 className="text-h2 font-bold mb-2">Oops! Something went wrong</h1>
            <p className="text-body text-text-secondary mb-6">
              Don't worry! Your data is safe. Let's try refreshing the app.
            </p>
            <button
              onClick={this.handleReset}
              className="w-full bg-accent text-white rounded-md py-3 px-6 font-bold text-body hover:bg-accent/90 transition-colors shadow-subtle focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 flex items-center justify-center gap-2"
            >
              <RefreshCw size={20} />
              Refresh App
            </button>
            {this.state.error && (
              <details className="mt-4 text-left">
                <summary className="text-caption text-text-secondary cursor-pointer hover:text-text-primary">
                  Technical details
                </summary>
                <pre className="mt-2 text-caption bg-surface p-3 rounded-md overflow-auto">
                  {this.state.error.toString()}
                </pre>
              </details>
            )}
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
