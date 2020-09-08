import Layout from 'components/layout'
import Head from 'components/head'
import BlogpostsList from 'components/blogpostsList.comp'

const META = {
  asPath: `/blog`,
  title: `المدونة`,
  description: `مدونة موقع أوتاريكا للأغاني العربية`,
}

export default () => (
  <Layout>
    <Head asPath={ META.asPath } title={ META.title } description={ META.description }/>
    <BlogpostsList/>
  </Layout>
)
