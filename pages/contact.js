import { withApollo } from 'lib/withApollo'
import Layout from 'components/layout'
import Head from 'components/head'
import ContactUs from 'components/contactUs.comp'

export default withApollo()(() => (
  <Layout>
    <Head/>
    contact us page
    <ContactUs/>
  </Layout>
))
