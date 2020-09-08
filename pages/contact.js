import Layout from 'components/layout'
import Head from 'components/head'
import ContactUs from 'components/contactUs.comp'

const META = {
  asPath: `/contact`,
  title: `اتصل بنا`,
  description: `لمراسلة الموقع`,
}

export default () => (
  <Layout>
    <Head asPath={ META.asPath } title={ META.title } description={ META.description }/>
    contact us page
    <ContactUs/>
  </Layout>
)
