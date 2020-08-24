import Layout from 'components/layout'
import Head from 'components/head'
import ContactUs from 'components/contactUs.comp'

const META = {
  title: `اتصل بنا`,
  description: `لمراسلة الموقع`,
}

export default () => (
  <Layout>
    <Head title={ META.title } description={ META.description }/>
    contact us page
    <ContactUs/>
  </Layout>
)
