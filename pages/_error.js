import React from 'react'

export default class Error extends React.Component {
  static getInitialProps({ res, err }) {
    const statusCode = res ? res.statusCode : err ? err.statusCode : null;
    return { statusCode }
  }

  render() {
    return (
      <p>
        Design this page -
        {this.props.statusCode
          ? `XXX1 An error ${this.props.statusCode} occurred on server`
          : 'XXX2 An error occurred on client'
        }
        <style jsx>{`
          p {
            text-align: center;
          }
        `}</style>
      </p>
    )
  }
}
