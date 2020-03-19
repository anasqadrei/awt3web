import Link from 'next/link'
import { useRouter } from 'next/router'
import { useQuery } from '@apollo/react-hooks'
import gql from 'graphql-tag'
import * as Sentry from '@sentry/node'
import Head from './head'
import LikeSong from './song.like.comp'
import PlaySong from './song.play.comp'
import DownloadSong from './song.download.comp'
import ShareSong from './song.share.comp'
import SendNoticeRegardingSong from './song.sendNotice.comp'
import CreateSongImage from './songImage.create.comp'
import LikeSongImage from './songImage.like.comp'
import DeleteSongImage from './songImage.delete.comp'
import CreateLyrics from './lyrics.create.comp'
import DeleteLyrics from './lyrics.delete.comp'
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
      hashtags
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
        likers {
          id
        }
        dislikers {
          id
        }
      }
      lyrics {
        id
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

export default function Song() {
  const router = useRouter()

  // set query variables
  const queryVariables = {
    id: router.query.id
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
    Sentry.captureException(error)
    return <ErrorMessage message='حدث خطأ ما في عرض بيانات الأغنية. الرجاء إعادة المحاولة.' />
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

  // fix url in case it doesn't match the slug
  const regExp = new RegExp (`^/song/${ router.query.id }/${ getSong.slug }([?].*|[#].*|/)?$`)
  if (!decodeURIComponent(router.asPath).match(regExp)) {
    const href = `/song/[id]/[slug]`
    const as = `/song/${ router.query.id }/${ getSong.slug }`
    router.replace(href, as)
  }

  // display song
  return (
    <section>
      <Head title={ `${ getSong.title } - ${ getSong.artist.name }` } description={ getSong.title } asPath={ decodeURIComponent(router.asPath) } ogImage={ getSong.defaultImage && getSong.defaultImage.url } />

      <div>
        <SendNoticeRegardingSong song={ getSong }/>
        <img src={ getSong.defaultImage ? getSong.defaultImage.url : `https://via.placeholder.com/100?text=no+photo?` }/>
        <h1 className="title">
          { getSong.title } -
          <Link href="/artist/[id]/[slug]" as={ `/artist/${ getSong.artist.id }/${ getSong.artist.slug }` }>
            <a>{ getSong.artist.name }</a>
          </Link>
        </h1>
      </div>

      <div>
        <PlaySong/>{ getSong.plays ? `played ${ getSong.plays } times` : `be the first to play` }
      </div>
      <div>
        <Link href="#"><a><img src="https://via.placeholder.com/60?text=Queue" alt="Queue"/>Play Next/Add to Queue</a></Link>
      </div>
      <div>
        <DownloadSong/>{ getSong.downloads && `Downloaded ${ getSong.downloads } times` }
      </div>
      <div>
        <LikeSong/>
        <p>
          { getSong.likes ? `${ getSong.likes } likes` : `be the first to like` }
        </p>
        <p>
          { getSong.dislikes && `${ getSong.dislikes } dislikes` }
        </p>
      </div>

      <div>
        Share
        { getSong.shares ? `${ getSong.shares } shared this` : `be the first to share` }
        <ShareSong/>
        <span dir="ltr"><input value={ getSong.url } readOnly/></span>
      </div>

      <div>
        <img src="https://via.placeholder.com/728x90?text=728x90+Leaderboard+Ad+but+will+be+responsive"/>
      </div>

      <div>
        <p>{ getSong.desc.replace(/#(\S+)/g,'') }</p>
        {
          getSong.hashtags && getSong.hashtags.map(hashtag => (
            <div key={ hashtag }>
              <Link href="/hashtag/[hashtag]" as={ `/hashtag/${ hashtag }` }><a>#{ hashtag }</a></Link>
            </div>
          ))
        }
        <p>المدة: { getSong.duration }</p>
        <p>حجم الملف: { getSong.fileSize }MB</p>
        <p>الجودة: { getSong.bitRate }kbps</p>
        أضافها <Link href="/user/[id]/[slug]" as={ `/user/${ getSong.user.id }/${ getSong.user.slug }` }><a>{ getSong.user.username }</a></Link> on { getSong.createdDate }
        <div>
          <Link href="#"><a>Update description*</a></Link>
          <Link href="#"><a>Delete*</a></Link>
        </div>
      </div>

      <div>
        { getSong.imagesList && getSong.imagesList.map(image => (
          <div key={ image.id }>
            <img src={ image.url } alt={ getSong.title }/>
            أضافها <Link href="/user/[id]/[slug]" as={ `/user/${ image.user.id }/${ image.user.slug }` }><a>{ image.user.username }</a></Link> on { image.createdDate }
            <DeleteSongImage image={ image }/>
            <LikeSongImage image={ image }/>
          </div>
        ))}
        <CreateSongImage/>
      </div>

      <div>
        <CreateLyrics/>
        { getSong.lyrics && (
          <div>
            <div dangerouslySetInnerHTML={{ __html: getSong.lyrics.content }} />
            last modified on { getSong.lyrics.lastUpdatedDate } by <Link href="/user/[id]/[slug]" as={ `/user/${ getSong.lyrics.user.id }/${ getSong.lyrics.user.slug }` }><a>{ getSong.lyrics.user.username }</a></Link>
            <Link href="#"><a>Update Lyrics</a></Link>
            <DeleteLyrics lyrics={ getSong.lyrics }/>
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
