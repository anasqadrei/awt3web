import Link from 'next/link'
import Image from 'next/image'
import { useMutation } from '@apollo/client'
import * as Sentry from '@sentry/nextjs'
import { SONGS_COLLECTION } from 'lib/constants'
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
    if (props.search && props.song) {
      // execute mutation
      createClickedSearchResult({
        variables: {
          collection: SONGS_COLLECTION,
          id: props.song.id,
        },
      })
    }
  }

  // display data
  return (
    <section>
      <Image src={ props.song.defaultImage?.url || `https://via.placeholder.com/30?text=no+photo?` } width={ 30 } height={ 30 }/>
      <Link href={ `/song/${ props.song.id }/${ props.song.slug }` }>
        <a onClick={ () => logClickedSearchResult() }>{ props.song.title }</a>
      </Link>
      -
      <Link href={ `/artist/${ props.song.artist.id }/${ props.song.artist.slug }` }>
        <a>{ props.song.artist.name }</a>
      </Link>
      <img src="https://via.placeholder.com/30?text=duration"/> { props.song.duration }
      <img src="https://via.placeholder.com/30?text=plays"/> { props.song.plays }
    </section>
  )
}

export default Comp