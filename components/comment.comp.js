import Link from 'next/link'

const Comment = () => (
  <div>
    <textarea row="5"/>
    <Link href="#">
      <a>Post Comment Here</a>
    </Link>
  </div>
)

export default Comment
