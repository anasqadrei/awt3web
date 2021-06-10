import Link from 'next/link'
import Image from 'next/image'
import { useMutation } from '@apollo/client'
import * as Sentry from '@sentry/nextjs'
import { PLAYLISTS_COLLECTION } from 'lib/constants'
import { CREATE_CLICKED_SEARCH_RESULT_MUTATION } from 'lib/graphql'

const Comp = (props) => {
  // mutation tuple
  const [createClickedSearchResult] = useMutation(
    CREATE_CLICKED_SEARCH_RESULT_MUTATION,
    {
      onError: (error) => {
        Sentry.captureException(error)
      },
    }
  )

  // function: log clicked search result to find popular ones
  const logClickedSearchResult = () => {
    if (props.search && props.playlist) {
      // execute mutation
      createClickedSearchResult({
        variables: {
          collection: PLAYLISTS_COLLECTION,
          id: props.playlist.id,
        },
      })
    }
  }

  // display data
  return (
    <section>
      <Image src={ props.playlist.imageUrl || `https://via.placeholder.com/30?text=no+photo?` } width={ 30 } height={ 30 }/>
      <Link href={ `/playlist/${ props.playlist.id }/${ props.playlist.slug }` }>
        <a onClick={ () => logClickedSearchResult() }>{ props.playlist.name }</a>
      </Link>
      <img src="https://via.placeholder.com/30?text=duration"/> { props.playlist.duration }
      <img src="https://via.placeholder.com/30?text=plays"/> { props.playlist.plays ? props.playlist.plays : 0 }
    </section>
  )
}

export default Comp