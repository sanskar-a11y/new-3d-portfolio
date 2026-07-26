'use client'

import React from 'react'

interface Props {
  children: React.ReactNode
}

interface State {
  hasError: boolean
  error: string
}

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false, error: '' }
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error: error.message }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="fixed inset-0 bg-black text-white flex flex-col items-center justify-center p-8 font-mono">
          <h1 className="text-2xl font-bold mb-4 text-red-400">Runtime Error</h1>
          <p className="text-sm text-white/60 max-w-lg text-center">{this.state.error}</p>
          <button 
            onClick={() => { this.setState({ hasError: false, error: '' }); window.location.reload() }}
            className="mt-6 px-6 py-2 border border-white/30 hover:bg-white/10 transition-colors text-sm"
          >
            Reload
          </button>
        </div>
      )
    }

    return this.props.children
  }
}
