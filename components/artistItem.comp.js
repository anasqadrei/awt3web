import Link from 'next/link'

const ArtistItem = () => (
  <div>
    <img src="https://via.placeholder.com/30?text=artist+image"/>
    <Link as="/artist/1/slug" href={`/artist?id=1`}>
      <a>artist name</a>
    </Link>
  </div>
)

export default ArtistItem
