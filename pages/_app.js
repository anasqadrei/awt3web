import * as Sentry from '@sentry/node'
import { ApolloProvider } from '@apollo/client'
import { useApollo } from 'lib/apolloClient'

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
})

// TODO: err is a workaround. Check when this closes: https://github.com/zeit/next.js/issues/8592

const App = ({ Component, pageProps, err }) => (
  <ApolloProvider client={ useApollo(pageProps.initialApolloState) }>
    <Component { ...pageProps } err={ err }/>
  </ApolloProvider>
)

export default App
