import Raven from 'raven-js'

export default class Logger {
  constructor() {
    Raven.config(process.env.SENTRY_DSN).install()
  }

  logException(error) {
    Raven.captureException(error.message, {extra: error})
  }
}
