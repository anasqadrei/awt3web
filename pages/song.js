import Link from 'next/link'
import Layout from '../components/layout'
import Head from '../components/head'
import Comment from '../components/comment.comp'
import CommentsList from '../components/commentsList.comp'

const images = []
for (let i = 0; i < 3; i++) {
  images.push(
    <div key={i}>
      <img src="https://via.placeholder.com/80?text=Song+Img" alt=""/>
      Added by <Link href="/user/1/xxx"><a>username</a></Link> on 12/4/2017
      <Link href="/"><a>Delete*</a></Link>
      <Link href="/"><a>Like</a></Link> 33,334 likes
      <Link href="/"><a>Dislike</a></Link> 23,334 dislikes
      Report Image (reason 1, reason2, reasons3, signed by username)
    </div>
  )
}

export default (props) => (
  <Layout>
    {/* lift state up to make song title as the head title */}
    {/* <Head title={props.url.query.slug} /> */}
    <div>
      <Link href="/"><a>Flag</a></Link>
      <img src="https://via.placeholder.com/80"/>
      Song Title - <Link href="/"><a>Artist Name</a></Link>
    </div>
    <div>
      <Link href="/"><a>Play</a></Link> played 323,334 times
    </div>
    <div>
      <Link href="/"><a>Download</a></Link> Downloaded 23,334 times
    </div>
    <div>
      <Link href="/"><a>Like</a></Link> 33,334 likes
    </div>
    <div>
      <Link href="/"><a>Dislike</a></Link> 23,334 dislikes
      Report Song (reason 1, reason2, reasons3, signed by username)
    </div>
    <div>
      Share
      <Link href="/"><a>Facebook</a></Link>
      <Link href="/"><a>Twitter</a></Link>
      <Link href="/"><a>Google+</a></Link>
      <input value="https://www.awtarika.com/song/1/slug-here"/>
    </div>
    <div>
      description blah blah #one_two #three_four whatever
      <p>Length: 3:45</p>
      <p>file size: 5.3MB</p>
      <p>quality: 320kbps</p>
      Added by <Link href="/user/1/xxx"><a>username</a></Link> on 12/4/2017
      <Link href="/"><a>Update description*</a></Link>
      <Link href="/"><a>Delete*</a></Link>
    </div>
    <div>
    {images}
    <Link href=""><a>Add Image</a></Link>
    </div>
    <div>
      <Link href=""><a>Add Lyrics*</a></Link>
      <p>
        Lorem ipsum dolor sit amet, consectetuer adipiscing
        elit. Aenean commodo ligula eget dolor. Aenean massa.
        Cum sociis natoque penatibus
        et magnis dis parturient montes, nascetur ridiculus
        mus. Donec quam felis, ultricies nec, pellentesque
        eu, pretium quis, sem. Nulla consequat massa quis
        enim. Donec pede justo, fringilla vel, aliquet nec,
        vulputate eget, arcu.
      </p>
      First added on 1/4/2016 by <Link href="/user/1/xxx"><a>username 1</a></Link>
      last modified on 12/4/2017 by <Link href="/user/1/xxx"><a>username 2</a></Link>
      <Link href="/"><a>Update Lyrics</a></Link>
      <Link href="/"><a>Delete*</a></Link>
    </div>
    <Comment/>
    <CommentsList/>
  </Layout>
)
