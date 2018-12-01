import React from 'react'

class NoopWrapper extends React.PureComponent {
  render() {
    return this.props.children
  }
}

export default NoopWrapper
