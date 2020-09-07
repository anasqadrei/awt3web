import Link from 'next/link'

export default (props) => (
  <section>
    <img src={ props.playlist.imageUrl ? props.playlist.imageUrl : `https://via.placeholder.com/30?text=no+photo?` }/>
    <Link href="/playlist/[id]/[slug]" as={ `/playlist/${ props.playlist.id }/${ props.playlist.slug }` }>
      <a>{ props.playlist.name }</a>
    </Link>
    <img src="https://via.placeholder.com/30?text=duration"/> { props.playlist.duration }
    <img src="https://via.placeholder.com/30?text=plays"/> { props.playlist.plays ? props.playlist.plays : 0 }
    <style jsx>{`
      .title, .description {
        text-align: center;
      }
    `}</style>
  </section>
)
