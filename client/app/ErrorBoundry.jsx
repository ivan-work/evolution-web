import React from 'react';

class ErrorBoundry extends React.PureComponent {
  state = {error: null};

  static getDerivedStateFromError(error) {
    return {error};
  }

  componentDidCatch() {
    // log error @TODO #ez
  }

  render() {
    const {error} = this.state;
    if (error) {
      if (error.message && error.stack) {
        return <div>
          Error: {String(error.message)}
          <br/>
          <pre>{String(error.stack)}</pre>
        </div>;
      }
      return <pre>Unknown error: {String(error)}</pre>;
    }
    return this.props.children;
  }
}

export default ErrorBoundry;