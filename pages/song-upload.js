import Link from 'next/link'
import Layout from '../components/layout'
import Head from '../components/head'

export default (props) => (
  <Layout>
    <Head/>
    upload page
    <div>
      <div>Drag File Here</div>
      <div>
        song title
        <input/>
      </div>
      <div>
        artist name
        <input/>
      </div>
      <div>
        description
        <textarea row="5"/>
      </div>
      <div>
        I have the rights
        <input type="checkbox"/>
      </div>
      <div>
        name or login button
      </div>
      <div>
        Confirmation
        <p>song title: blah blaj</p>
        <p>artist name: john doe</p>
        <p>description: text text tex #hashtag text text #hash_tag blah</p>
        <p>uploader: user name</p>
        <p>file: file name.mp3</p>
        <p>size: 4MB</p>
        <Link href="">
          <a>upload</a>
        </Link>
      </div>
    </div>
  </Layout>
)
