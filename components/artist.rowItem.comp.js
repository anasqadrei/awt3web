import Link from 'next/link'
import Image from 'next/image'
import { useMutation } from '@apollo/client'
import * as Sentry from '@sentry/nextjs'
import { ARTISTS_COLLECTION } from 'lib/constants'
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
    if (props.search && props.artist) {
      // execute mutation
      createClickedSearchResult({
        variables: {
          collection: ARTISTS_COLLECTION,
          id: props.artist.id,
        },
      })
    }
  }

  // display data
  return (
    <section>
      <Image src={ props.artist.imageUrl || `https://via.placeholder.com/30?text=no+photo?` } alt={ props.artist.name } width={ 30 } height={ 30 }/>
      <Link href={ `/artist/${ props.artist.id }/${ props.artist.slug }` }>
        <a onClick={ () => logClickedSearchResult() }>{ props.artist.name }</a>
      </Link>
      <img src="https://via.placeholder.com/30?text=plays"/> { props.artist.songPlays }
    </section>
  )
}

export default Comp