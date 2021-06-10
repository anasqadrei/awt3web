import Link from 'next/link'
import Image from 'next/image'

const Comp = (props) => (
  <section>
    <Link href={ `/artist/${ props.artist.id }/${ props.artist.slug }` }>
      <a><Image src={ props.artist.imageUrl || `https://via.placeholder.com/150?text=no+photo?` } alt={ props.artist.name } width={ 150 } height={ 150 }/></a>
    </Link>
    <div>
      <Link href={ `/artist/${ props.artist.id }/${ props.artist.slug }` }>
        <a>{ props.artist.name }</a>
      </Link>
    </div>
    <div>
      { props.artist.songs && ` songs: ${ props.artist.songs }` }
      { props.artist.likes && ` | likes: ${ props.artist.likes }` }
    </div>
  </section>
)

export default Comp