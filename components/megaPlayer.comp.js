import Link from 'next/link'

export default () => (
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
    <Link href="/"><a>Up next</a></Link>
    <Link href="/"><a>Shuffle</a></Link>
    <Link href="/"><a>Repeat</a></Link>
    <Link href="/"><a>add to playlist</a></Link>
    <Link href="/"><a>Share</a></Link>
  </div>
)
