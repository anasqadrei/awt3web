import Link from 'next/link'
import Layout from '../components/layout'
import Head from '../components/head'

const blogposts = []
for (let i = 0; i < 20; i++) {
  blogposts.push(
    <div key={i}>
      <Link as="/blog/1/slug" href={`/blogpost?id=1`}>
        <a>Blogpost {i}</a>
      </Link>
      <p>Date 23/4/2014, 5 comments</p>
    </div>
  )
}

export default (props) => (
  <Layout>
    <Head/>
    blog page
    <p>blogposts List</p>
    <div>
     {blogposts}
    </div>
  </Layout>
)
