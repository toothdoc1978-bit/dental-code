import { Component } from 'react'

// Chart state is written to localStorage on every change (useChartStore),
// so a render crash never loses data — a reload rehydrates the full chart.
export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  componentDidCatch(error, info) {
    console.error('Chart UI crashed:', error, info.componentStack)
  }

  render() {
    if (!this.state.hasError) return this.props.children
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6">
        <div className="max-w-md w-full bg-white border border-slate-200 rounded-lg shadow p-6 text-center">
          <h1 className="text-lg font-semibold text-slate-800">Something went wrong</h1>
          <p className="text-sm text-slate-600 mt-2">
            Your chart is safe — everything you entered is saved on this device.
            Reload the page to pick up right where you left off.
          </p>
          <button
            type="button"
            className="btn-primary mt-4"
            onClick={() => window.location.reload()}
          >
            Reload and recover chart
          </button>
        </div>
      </div>
    )
  }
}
