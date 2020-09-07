import Link from 'next/link'

export default (props) => (
  <section>
    <Link href="/artist/[id]/[slug]" as={ `/artist/${ props.artist.id }/${ props.artist.slug }` }>
      <a><img src={ props.artist.imageUrl ? props.artist.imageUrl : `https://via.placeholder.com/150?text=no+photo?` } alt={ props.artist.name }/></a>
    </Link>
    <div>
      <Link href="/artist/[id]/[slug]" as={ `/artist/${ props.artist.id }/${ props.artist.slug }` }>
        <a>{ props.artist.name }</a>
      </Link>
    </div>
    <div>
      { props.artist.songs && ` songs: ${ props.artist.songs }` }
      { props.artist.likes && ` | likes: ${ props.artist.likes }` }
    </div>
    <style jsx>{`
      .title, .description {
        text-align: center;
      }
    `}</style>
  </section>
)
