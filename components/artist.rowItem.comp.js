import Link from 'next/link'

export default (props) => (
  <section>
    <img src={ props.artist.imageUrl ? props.artist.imageUrl : `https://via.placeholder.com/30?text=no+photo?` } alt={ props.artist.name }/>
    <Link href="/artist/[id]/[slug]" as={ `/artist/${ props.artist.id }/${ props.artist.slug }` }>
      <a>{ props.artist.name }</a>
    </Link>
    <img src="https://via.placeholder.com/30?text=plays"/> { props.artist.songPlays }
  </section>
)
