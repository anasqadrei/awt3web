import Layout from 'components/layout'
import Head from 'components/head'
import BlogpostsList from 'components/blogpostsList.comp'

const META = {
  asPath: `/blog`,
  title: `المدونة`,
  description: `مدونة موقع أوتاريكا للأغاني العربية`,
}

const Index = () => (
  <Layout>
    <Head asPath={ META.asPath } title={ META.title } description={ META.description }/>
    <BlogpostsList/>
  </Layout>
)

export default Index
