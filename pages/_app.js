import { ApolloProvider } from '@apollo/client'
import { useApollo } from 'lib/apolloClient'

// BUG: err is a workaround. Check when this closes: https://github.com/zeit/next.js/issues/8592

const App = ({ Component, pageProps, err }) => (
  <ApolloProvider client={ useApollo(pageProps.initialApolloState) }>
    <Component { ...pageProps } err={ err }/>
  </ApolloProvider>
)

export default App
