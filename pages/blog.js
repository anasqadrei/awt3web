import { withRouter } from 'next/router'
import WithData from '../lib/withData'
import Layout from '../components/layout'
import Head from '../components/head'
import BlogpostsList from '../components/blogpostsList.comp'

const title = "المدونة"
const metaDescription = "مدونة موقع أوتاريكا للأغاني العربية"

export default withRouter(WithData((props) => (
  <Layout>
    <Head title={ title } description={ metaDescription } asPath={ decodeURIComponent(props.router.asPath) } />
    <h1 className="title">{ title }</h1>
    <p>blogposts List</p>
    <BlogpostsList/>
    <style jsx>{`
      .title, .description {
        text-align: center;
      }
    `}</style>
  </Layout>
)))
