import Link from 'next/link'

export default (props) => (
  <section>
    <img src={ props.song.defaultImage ? props.song.defaultImage.url : `https://via.placeholder.com/30?text=no+photo?` }/>
    <Link href="/song/[id]/[slug]" as={ `/song/${ props.song.id }/${ props.song.slug }` }>
      <a>{ props.song.title }</a>
    </Link>
    -
    <Link href="/artist/[id]/[slug]" as={ `/artist/${ props.song.artist.id }/${ props.song.artist.slug }` }>
      <a>{ props.song.artist.name }</a>
    </Link>
    <img src="https://via.placeholder.com/30?text=duration"/> { props.song.duration }
    <img src="https://via.placeholder.com/30?text=plays"/> { props.song.plays }
  </section>
)
