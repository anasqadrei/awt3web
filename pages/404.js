import Layout from 'components/layout'
import Head from 'components/head'

const META = {
  title: `Not Found`,
}

const Page = () => (
  <Layout>
    <Head title={ META.title }/>
    404 Page not found. you can customise
  </Layout>
)

export default Page