import React from 'react'
import App from 'next/app'
import * as Sentry from '@sentry/node'

Sentry.init({
  dsn: process.env.SENTRY_DSN,
})

class AwtarikaApp extends App {
  render() {
    const { Component, pageProps } = this.props

    // TODO: It's a workaround. Check when this closes: https://github.com/zeit/next.js/issues/8592
    const { err } = this.props
    const modifiedPageProps = { ...pageProps, err }

    return <Component {...modifiedPageProps} />
  }
}

export default AwtarikaApp
