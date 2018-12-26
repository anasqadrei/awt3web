import Link from 'next/link'

const comments = []
for (let i = 0; i < 20; i++) {
  comments.push(
    <div key={i}>
      <Link as="/user/1/slug" href={`/user?id=1`}>
        <img src="https://via.placeholder.com/80?text=User+Img" alt=""/>
      </Link>
      <Link as="/user/1/slug" href={`/user?id=1`}>
        <a>User {i}</a>
      </Link>
      <Link href="#">
        <a>Like</a>
      </Link>
      5
      <p>Date 23/4/2014</p>
      <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Blandit massa enim nec dui. Ante metus dictum at tempor commodo ullamcorper a lacus.</p>
    </div>
  )
}

const CommentsList = () => (
  <div>
    {comments}
  </div>
)

export default CommentsList
