import Link from 'next/link'

export default function SongItem(props) {
  return (
    <section>
      <img src={ props.song.defaultImage ? props.song.defaultImage.url : `https://via.placeholder.com/30?text=no+photo?` }/>
      <Link as={ `/song/${ props.song.id }/${ props.song.slug }` } href={`/song?id=${ props.song.id }`}>
        <a>{ props.song.title }</a>
      </Link>
      -
      <Link as={ `/artist/${ props.song.artist.id }/${ props.song.artist.slug }` } href={`/artist?id=${ props.song.artist.id }`}>
        <a>{ props.song.artist.name }</a>
      </Link>
      <img src="https://via.placeholder.com/30?text=duration"/> { props.song.duration }
      <img src="https://via.placeholder.com/30?text=plays"/> { props.song.plays }
      <style jsx>{`
        .title, .description {
          text-align: center;
        }
      `}</style>
    </section>
  )
}
