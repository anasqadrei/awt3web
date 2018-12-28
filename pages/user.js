import Link from 'next/link'
import Layout from '../components/layout'
import Head from '../components/head'

export default (props) => (
  <Layout>
    <p>User Profile</p>
    <img src="https://via.placeholder.com/100?text=User+Img" alt=""/>
    User Name
    <p>email: asafdf@vkfj.com</p>
    <p>social media: facebook account</p>
    <p>Sex: male</p>
    <p>country: Kuwait</p>
    <p>last login: 12/4/2018</p>
    <p>joined: 1/2/2012</p>
    <p>premium: yes</p>
    <Link href="/playlists-list">
      <a>Library</a>
    </Link>
    <p>uploads snippet. wait for the designer to finish it</p>
    <Link as="/user/1/xxx/uploads" href={{ pathname: '/user-uploads', query: { id: 1, slug: 'xxx' } }}>
      <a>more uploads</a>
    </Link>
  </Layout>
)
