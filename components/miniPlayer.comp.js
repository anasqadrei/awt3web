import Link from 'next/link'

const Comp = () => (
  <div>
    <Link href="/"><img src="https://via.placeholder.com/80?text=Song+Img" alt="Song Title - Artist Name"/></Link>
    <Link href="/"><a>Song Title</a></Link>
    <Link href="/"><a>Artist Name</a></Link>
    <Link href="/"><img src="https://via.placeholder.com/20" alt="Play"/></Link>
    00:02 Duration -4:31
    Volume
    **Audio Element**
    <Link href="/"><img src="https://via.placeholder.com/20" alt="Rewind"/></Link>
    <Link href="/"><img src="https://via.placeholder.com/20" alt="FF"/></Link>
    <Link href="/"><a>Like</a></Link>
    <Link href="/"><a>More</a></Link>
  </div>
)

export default Comp