'use client';

import { Component } from 'react';
import { FiAlertCircle, FiRefreshCw } from 'react-icons/fi';

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    console.error('ErrorBoundary caught:', error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-[200px] flex items-center justify-center p-6">
          <div className="text-center">
            <FiAlertCircle className="w-12 h-12 text-red-400 mx-auto mb-3" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">Something went wrong</h3>
            <p className="text-gray-500 dark:text-gray-400 text-sm mb-4">
              {this.state.error?.message || 'An unexpected error occurred'}
            </p>
            <button
              onClick={() => this.setState({ hasError: false, error: null })}
              className="flex items-center gap-2 mx-auto px-4 py-2 bg-red-600 text-white rounded-lg text-sm hover:bg-red-700 transition-colors"
            >
              <FiRefreshCw className="w-4 h-4" /> Try Again
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
