import Link from 'next/link'

const SongItem = () => (
  <div>
    <img src="https://via.placeholder.com/30?text=song+image"/>
    <Link as="/song/1/slug" href={`/song?id=1`}>
      <a>song title</a>
    </Link>
    <Link as="/artist/1/slug" href={`/artist?id=1`}>
      <a>artist name</a>
    </Link>
    <img src="https://via.placeholder.com/30?text=duration"/> 3:25
    <img src="https://via.placeholder.com/30?text=playsCount"/> 2,323
  </div>
)

export default SongItem
