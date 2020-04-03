import WithData from '../lib/withData'
import Layout from '../components/layout'
import Head from '../components/head'
import ContactUs from '../components/contactUs.comp'

export default WithData(() => (
  <Layout>
    <Head/>
    contact us page
    <ContactUs/>
  </Layout>
))
