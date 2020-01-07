import Link from 'next/link'
import { useQuery } from '@apollo/react-hooks'
import gql from 'graphql-tag'
import Raven from 'raven-js'
import Head from './head'
import CreateComment from './comment.create.comp'
import CommentsList from './comment.list.comp'
import ErrorMessage from './errorMessage'

export const SONGS_COLLECTION = 'songs'
export const GET_SONG_QUERY = gql`
  query getSong ($id: ID!) {
    getSong(id: $id) {
      id
      title
      slug
      url
      createdDate
      artist {
        id
        name
        slug
      }
      desc
      plays
      downloads
      likes
      dislikes
      shares
      comments
      duration
      fileSize
      bitRate
      defaultImage {
        url
      }
      imagesList {
        id
        url
        createdDate
        user {
          id
          username
          slug
        }
      }
      lyrics {
        content
        lastUpdatedDate
        user {
          id
          username
          slug
        }
      }
      user {
        id
        username
        slug
      }
    }
  }
`

const relatedSongs = []
for (let i = 0; i < 10; i++) {
  relatedSongs.push(
    <div key={i}>
      <img src="https://via.placeholder.com/30?text=song+image"/>
      <Link as="/song/1/slug" href={`/song?id=1`}>
        <a>song title</a>
      </Link>
      <Link as="/artist/1/slug" href={`/artist?id=1`}>
        <a>artist name</a>
      </Link>
      <img src="https://via.placeholder.com/30?text=duration"/> 3:25
      <img src="https://via.placeholder.com/30?text=playsCount"/> 2,323
      <img src="https://via.placeholder.com/30?text=More+Actions"/>
    </div>
  )
}

export default function Song(props) {
  // set query variables
  const queryVariables = {
    id: props.router.query.id
  }

  // excute query
  const { loading, error, data } = useQuery (
    GET_SONG_QUERY,
    {
      variables: queryVariables,
    }
  )

  // error handling
  if (error) {
    Raven.captureException(error.message, { extra: error })
    return <ErrorMessage message='Error' />
  }

  // initial loading
  if (loading) {
    return (<div>Loading... (design this)</div>)
  }

  // get data
  const { getSong } = data

  // in case song not found
  if (!getSong) {
    return (<div>Song doesn't exist (design this)</div>)
  }

  // fix url
  if (props.fixSlug) {
    const regExp = new RegExp (`^${ props.router.pathname }/${ props.router.query.id }/${ getSong.slug }([?].*|[#].*|/)?$`)
    if (!decodeURIComponent(props.router.asPath).match(regExp)) {
      const href = `${ props.router.pathname }?id=${ props.router.query.id }&slug=${ getSong.slug }`
      const as = `${ props.router.pathname }/${ props.router.query.id }/${ getSong.slug }`
      props.router.replace(href, as)
    }
  }

  // display song
  return (
    <section>
      <Head title={ getSong.title } description={ getSong.title } asPath={ decodeURIComponent(props.router.asPath) } ogImage={ getSong.defaultImage && getSong.defaultImage.url } />

      <div>
        <Link href="#"><a>Flag</a></Link>
        <img src={ getSong.defaultImage ? getSong.defaultImage.url : `https://via.placeholder.com/100?text=no+photo?` }/>
        <h1 className="title">
          { getSong.title } -
          <Link as={ `/artist/${ getSong.artist.id }/${ getSong.artist.slug }` } href={`/artist?id=${ getSong.artist.id }`}>
            <a>{ getSong.artist.name }</a>
          </Link>
        </h1>
      </div>

      <div>
        <Link href="#"><a><img src="https://via.placeholder.com/60?text=Play" alt="Play"/></a></Link> played { getSong.plays } times
      </div>
      <div>
        <Link href="#"><a><img src="https://via.placeholder.com/60?text=Queue" alt="Queue"/>Play Next/Add to Queue</a></Link>
      </div>
      <div>
        <Link href="#"><a><img src="https://via.placeholder.com/60?text=Download" alt="Download"/></a></Link> Downloaded { getSong.downloads } times
      </div>
      <div>
        <Link href="#"><a><img src="https://via.placeholder.com/60?text=Like" alt="Like"/></a></Link>{ getSong.likes } likes
      </div>
      <div>
        <Link href="#"><a><img src="https://via.placeholder.com/60?text=Dislike" alt="Dislike"/></a></Link>{ getSong.dislikes } dislikes
        Report Song (reason 1, reason2, reasons3, signed by username)
      </div>

      <div>
        Share
        { getSong.shares ? `${ getSong.shares } shared this` : `be the first to share` }
        <Link href="#"><a>Facebook</a></Link>
        <Link href="#"><a>Twitter</a></Link>
        <Link href="#"><a>Google+</a></Link>
        <span dir="ltr"><input value={ getSong.url } readOnly/></span>
      </div>

      <div>
        <img src="https://via.placeholder.com/728x90?text=728x90+Leaderboard+Ad+but+will+be+responsive"/>
      </div>

      <div>
        { getSong.desc }
        <p>المدة: { getSong.duration }</p>
        <p>حجم الملف: { getSong.fileSize }MB</p>
        <p>الجودة: { getSong.bitRate }kbps</p>
        أضافها <Link as={ `/user/${ getSong.user.id }/${ getSong.user.slug }` } href={`/user?id=${ getSong.user.id }`}><a>{ getSong.user.username }</a></Link> on { getSong.createdDate }
        <div>
          <Link href="#"><a>Update description*</a></Link>
          <Link href="#"><a>Delete*</a></Link>
        </div>
      </div>

      <div>
        { getSong.imagesList && getSong.imagesList.map(image => (
          <div key={ image.id }>
            <img src={ image.url } alt={ getSong.title }/>
            أضافها <Link as={ `/user/${ image.user.id }/${ image.user.slug }` } href={`/user?id=${ image.user.id }`}><a>{ image.user.username }</a></Link> on { image.createdDate }
            <Link href="#"><a>Delete*</a></Link>
            <Link href="#"><a>Like</a></Link> 33,334 likes
            <Link href="#"><a>Dislike</a></Link> 23,334 dislikes
            Report Image (reason 1, reason2, reasons3, signed by username)
          </div>
        ))}
        <Link href="#"><a>Add Image</a></Link>
      </div>

      <div>
        <Link href="#"><a>Add Lyrics*</a></Link>
        { getSong.lyrics && (
          <div>
            <div dangerouslySetInnerHTML={{ __html: getSong.lyrics.content }} />
            last modified on { getSong.lyrics.lastUpdatedDate } by <Link as={ `/user/${ getSong.lyrics.user.id }/${ getSong.lyrics.user.slug }` } href={`/user?id=${ getSong.lyrics.user.id }`}><a>{ getSong.lyrics.user.username }</a></Link>
            <Link href="#"><a>Update Lyrics</a></Link>
            <Link href="#"><a>Delete*</a></Link>
            First added on 1/4/2016 by <Link href="/user/1/xxx"><a>username 1</a></Link>
          </div>
        )}
      </div>

      <div>
        Related Songs
        {relatedSongs}
      </div>

      <CreateComment collection={ SONGS_COLLECTION } id={ getSong.id } />
      <CommentsList collection={ SONGS_COLLECTION } id={ getSong.id } total={ getSong.comments }/>

      <style jsx>{`
        .title, .description {
          text-align: center;
        }
      `}</style>
    </section>
  )
}