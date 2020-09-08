import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import Error from 'next/error'
import Modal from 'react-modal'
import * as Sentry from '@sentry/node'
import { initializeApollo } from 'lib/apolloClient'
import { validateUrl } from 'lib/validateUrl'
import { GET_SONG_QUERY } from 'lib/graphql'
import { SONGS_COLLECTION, ROOT_APP_ELEMENT } from 'lib/constants'
import Layout from 'components/layout'
import Head from 'components/head'
import UpdateSong from 'components/song.update.comp'
import LikeSong from 'components/song.like.comp'
import PlaySong from 'components/song.play.comp'
import DownloadSong from 'components/song.download.comp'
import ShareSong from 'components/song.share.comp'
import DeleteSong from 'components/song.delete.comp'
import SendNoticeRegardingSong from 'components/song.sendNotice.comp'
import AddSongToCreatedPlaylist from 'components/playlist.addSong.create.comp'
import AddSongToListedPlaylist from 'components/playlist.addSong.list.comp'
import CreateSongImage from 'components/songImage.create.comp'
import LikeSongImage from 'components/songImage.like.comp'
import DeleteSongImage from 'components/songImage.delete.comp'
import CreateLyrics from 'components/lyrics.create.comp'
import UpdateLyrics from 'components/lyrics.update.comp'
import DeleteLyrics from 'components/lyrics.delete.comp'
import CreateComment from 'components/comment.create.comp'
import CommentsList from 'components/comment.list.comp'

// TODO: scrolling overflow?
// https://github.com/reactjs/react-modal/issues/283
const modalStyles = {
  content : {
    top                   : '50%',
    left                  : '50%',
    right                 : 'auto',
    bottom                : 'auto',
    marginRight           : '-50%',
    transform             : 'translate(-50%, -50%)'
  }
}

export async function getStaticProps(context) {
  try {
    // apollo client for the build time
    const client = await initializeApollo()
    // query
    const { data } = await client.query({
      query: GET_SONG_QUERY,
      variables: { id: context.params.id }
    })
    // return apollo cache and song
    return {
      props: {
        initialApolloState: client.cache.extract(),
        song: data.getSong,
      },
    }
  } catch (error) {
    Sentry.captureException(error)
    return { props: {} }
  }
}

export async function getStaticPaths() {
  // because we have so many paths, we'll return nothing and let it build at production time
  return {
    paths: [],
    fallback: true,
  }
}

export default ({ song }) => {
  const router = useRouter()

  // fix url in case it doesn't match the slug
  useEffect(() => {
    // song is null at build time (Static Generation)
    if (song) {
      validateUrl(router, 'song', song.id, song.slug)
    }
  })

  // state variables
  const [reportSongModalIsOpen, setReportSongModalIsOpen] = useState(false)
  const [addSongToPlaylistModalIsOpen, setAddSongToPlaylistModalIsOpen] = useState(false)
  const [showCreatePlaylist, setShowCreatePlaylist] = useState(false)
  const [updateSongModalIsOpen, setUpdateSongModalIsOpen] = useState(false)
  const [createSongImageModalIsOpen, setCreateSongImageModalIsOpen] = useState(false)
  const [createLyricsModalIsOpen, setCreateLyricsModalIsOpen] = useState(false)
  const [updateLyricsModalIsOpen, setUpdateLyricsModalIsOpen] = useState(false)

  // if song was not found or error (after running getStaticProps())
  if (!router.isFallback && !song) {
    // TODO: custom 404 instead of this. to have the proper design
    return <Error statusCode={ 404 } title="Song Not Found"/>
  }

  // If the page is not yet generated, this will be displayed initially until getStaticProps() finishes running
  if (router.isFallback) {
    return (
      <div>
        Loading... (design it please)
      </div>
    )
  }

  // TODO: doesn't work on dev. check on production
  const META = {
    asPath: `/song/${ song.id }/${ decodeURIComponent(song.slug) }`,
    title: `${ song.title } - ${ song.artist.name }`,
    description: `${ song.title } - ${ song.artist.name }`,
    image: song.defaultImage?.url,
  }

  // for accessibility
  Modal.setAppElement(ROOT_APP_ELEMENT)

  // open and close modals
  function openAddSongToPlaylistModal() {
    setAddSongToPlaylistModalIsOpen(true)
    setShowCreatePlaylist(false)
  }
  function closeAddSongToPlaylistModal() {
    setAddSongToPlaylistModalIsOpen(false)
    setShowCreatePlaylist(false)
  }

  return (
    <Layout>
      <Head asPath={ META.asPath } title={ META.title } description={ META.description } image={ META.image }/>

      <div>
        <div>
          <button onClick={ () => { setReportSongModalIsOpen(true) } }>
            Report Song
          </button>
          <Modal isOpen={ reportSongModalIsOpen } onRequestClose={ () => { setReportSongModalIsOpen(false) } } style={ modalStyles } contentLabel="report song modal">
            <button onClick={ () => { setReportSongModalIsOpen(false) } }>
              Close
            </button>
            <h2>Report { song.title }</h2>
            <SendNoticeRegardingSong song={ song }/>
          </Modal>
        </div>

        <img src={ song.defaultImage ? song.defaultImage.url : `https://via.placeholder.com/100?text=no+photo?` }/>
        <h1 className="title">
          { song.title } -
          <Link href="/artist/[id]/[slug]" as={ `/artist/${ song.artist.id }/${ song.artist.slug }` }>
            <a>{ song.artist.name }</a>
          </Link>
        </h1>
      </div>

      <div>
        <PlaySong songId={ song.id }/>
      </div>
      <div>
        <Link href="#"><a><img src="https://via.placeholder.com/60?text=Queue" alt="Queue"/>Play Next/Add to Queue</a></Link>
      </div>
      <div>
        <DownloadSong songId={ song.id }/>
      </div>
      <div>
        <LikeSong songId={ song.id }/>
      </div>

      <div>
        <button onClick={ openAddSongToPlaylistModal }>
          Add to a playlist
        </button>
        <Modal isOpen={ addSongToPlaylistModalIsOpen } onRequestClose={ closeAddSongToPlaylistModal } style={ modalStyles } contentLabel="Add song to playlist modal">
          <button onClick={ closeAddSongToPlaylistModal }>
            Close
          </button>
          <h2>Add { song.title } to a playlist</h2>
          <button onClick={ () => setShowCreatePlaylist(!showCreatePlaylist) }>
            + new playlist
          </button>
          { showCreatePlaylist && (
            <div>
              <AddSongToCreatedPlaylist song={ song }/>
            </div>
          )}
          <AddSongToListedPlaylist private={ true } song={ song }/>
          <AddSongToListedPlaylist private={ false } song={ song }/>
        </Modal>
      </div>

      <div>
        <ShareSong songId={ song.id }/>
      </div>

      <div>
        <img src="https://via.placeholder.com/728x90?text=728x90+Leaderboard+Ad+but+will+be+responsive"/>
      </div>

      <div>
        { song.desc && (
          <div dangerouslySetInnerHTML={{ __html: song.desc.replace(/#[^\s<]+/g,'') }}/>
        )}
        {
          song.hashtags && song.hashtags.map(hashtag => (
            <div key={ hashtag }>
              <Link href="/hashtag/[hashtag]" as={ `/hashtag/${ hashtag }` }><a>#{ hashtag }</a></Link>
            </div>
          ))
        }
        <p>المدة: { song.duration }</p>
        <p>حجم الملف: { song.fileSize }MB</p>
        <p>الجودة: { song.bitRate }kbps</p>
        أضافها <Link href="/user/[id]/[slug]" as={ `/user/${ song.user.id }/${ song.user.slug }` }><a>{ song.user.username }</a></Link> on { song.createdDate }
        <div>
          <div>
            <button onClick={ () => { setUpdateSongModalIsOpen(true) } }>
              Update Song
            </button>
            <Modal isOpen={ updateSongModalIsOpen } onRequestClose={ () => { setUpdateSongModalIsOpen(false) } } style={ modalStyles } contentLabel="update song modal">
              <button onClick={ () => { setUpdateSongModalIsOpen(false) } }>
                Close
              </button>
              <h2>Update Song</h2>
              <UpdateSong song={ song }/>
            </Modal>
          </div>
          <DeleteSong song={ song }/>
        </div>
      </div>

      <div>
        { song.imagesList?.map(image => (
          <div key={ image.id }>
            <img src={ image.url } alt={ song.title }/>
            أضافها <Link href="/user/[id]/[slug]" as={ `/user/${ image.user.id }/${ image.user.slug }` }><a>{ image.user.username }</a></Link> on { image.createdDate }
            <DeleteSongImage songId={ song.id } image={ image }/>
            <LikeSongImage songId={ song.id } imageId={ image.id }/>
          </div>
        ))}
        <div>
          <button onClick={ () => { setCreateSongImageModalIsOpen(true) } }>
            Add Song Image
          </button>
          <Modal isOpen={ createSongImageModalIsOpen } onRequestClose={ () => { setCreateSongImageModalIsOpen(false) } } style={ modalStyles } contentLabel="add song image modal">
            <button onClick={ () => { setCreateSongImageModalIsOpen(false) } }>
              Close
            </button>
            <h2>Add Song Image</h2>
            <CreateSongImage songId={ song.id }/>
          </Modal>
        </div>
      </div>

      <div>
        <div>
          <button onClick={ () => { setCreateLyricsModalIsOpen(true) } }>
            Add Lyrics
          </button>
          <Modal isOpen={ createLyricsModalIsOpen } onRequestClose={ () => { setCreateLyricsModalIsOpen(false) } } style={ modalStyles } contentLabel="add lyrics modal">
            <button onClick={ () => { setCreateLyricsModalIsOpen(false) } }>
              Close
            </button>
            <h2>Add lyrics</h2>
            <CreateLyrics songId={ song.id }/>
          </Modal>
        </div>
        { song.lyrics && (
          <div>
            <div dangerouslySetInnerHTML={{ __html: song.lyrics.content }}/>
            { song.lyrics.createdDate && `created on ${ song.lyrics.createdDate }` } { song.lyrics.lastUpdatedDate && `last modified on ${ song.lyrics.lastUpdatedDate }` } by <Link href="/user/[id]/[slug]" as={ `/user/${ song.lyrics.user.id }/${ song.lyrics.user.slug }` }><a>{ song.lyrics.user.username }</a></Link>
            <div>
              <button onClick={ () => { setUpdateLyricsModalIsOpen(true) } }>
                Update Lyrics
              </button>
              <Modal isOpen={ updateLyricsModalIsOpen } onRequestClose={ () => { setUpdateLyricsModalIsOpen(false) } } style={ modalStyles } contentLabel="update lyrics modal">
                <button onClick={ () => { setUpdateLyricsModalIsOpen(false) } }>
                  Close
                </button>
                <h2>update lyrics</h2>
                <UpdateLyrics songId={ song.id } lyrics={ song.lyrics }/>
              </Modal>
            </div>
            <DeleteLyrics songId={ song.id } lyrics={ song.lyrics }/>
          </div>
        )}
      </div>

      <div>
        todo: Related Songs
        {/* // TODO: relatedSongs */}
      </div>

      <CreateComment collection={ SONGS_COLLECTION } id={ song.id }/>
      <CommentsList collection={ SONGS_COLLECTION } id={ song.id }/>

      <style jsx>{`
        .title, .description {
          text-align: center;
        }
      `}</style>
    </Layout>
  )
}
