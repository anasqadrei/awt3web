import { useState } from 'react'
import Modal from 'react-modal'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { useQuery } from '@apollo/react-hooks'
import gql from 'graphql-tag'
import * as Sentry from '@sentry/node'
import { GET_PLAYLIST_QUERY } from 'lib/graphql'
import { PLAYLISTS_COLLECTION } from 'lib/constants'
import Head from 'components/head'
import UpdatePlaylist from 'components/playlist.update.comp'
import LikePlaylist from 'components/playlist.like.comp'
import PlayPlaylist from 'components/playlist.play.comp'
import SharePlaylist from 'components/playlist.share.comp'
import DeletePlaylist from 'components/playlist.delete.comp'
import SongItem from 'components/song.item.comp'
import RemoveSongFromPlaylist from 'components/playlist.removeSong.comp'
import CreateComment from 'components/comment.create.comp'
import CommentsList from 'components/comment.list.comp'
import ErrorMessage from 'components/errorMessage'
import { ROOT_APP_ELEMENT } from 'lib/constants'

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

export default function playlist() {
  const router = useRouter()

  // for accessibility
  Modal.setAppElement(ROOT_APP_ELEMENT)

  // state variables
  const [updatePlaylistModalIsOpen, setUpdatePlaylistModalIsOpen] = useState(false)

  // set query variables
  const queryVariables = {
    id: router.query.id
  }

  // excute query
  const { loading, error, data } = useQuery (
    GET_PLAYLIST_QUERY,
    {
      variables: queryVariables,
    }
  )

  // error handling
  if (error) {
    Sentry.captureException(error)
    return <ErrorMessage />
  }

  // initial loading
  if (loading) {
    return (<div>Loading... (design this)</div>)
  }

  // get data
  const { getPlaylist } = data

  // in case playlist not found
  if (!getPlaylist) {
    return (<div>Playlist doesn't exist (design this)</div>)
  }

  // fix url in case it doesn't match the slug
  const regExp = new RegExp (`^/playlist/${ router.query.id }/${ getPlaylist.slug }([?].*|[#].*|/)?$`)
  if (!decodeURIComponent(router.asPath).match(regExp)) {
    const href = `/playlist/[id]/[slug]`
    const as = `/playlist/${ router.query.id }/${ getPlaylist.slug }`
    router.replace(href, as)
  }

  // display playlist
  return (
    <section>
      <Head title={ getPlaylist.name } description={ getPlaylist.name } asPath={ decodeURIComponent(router.asPath) } ogImage={ getPlaylist.imageUrl } />
      <div>
        <img src={ getPlaylist.imageUrl ? getPlaylist.imageUrl : `https://via.placeholder.com/100?text=no+photo` }/>
        <h1 className="title">{ getPlaylist.name }</h1>
        <LikePlaylist/>
        { getPlaylist.likes ? `${ getPlaylist.likes } liked them` : `be the first to like? or empty?` }
      </div>

      <div>
        <PlayPlaylist shuffle={ false }/> | <PlayPlaylist shuffle={ true }/> | <button onClick={ () => { setUpdatePlaylistModalIsOpen(true) } }>Update Playlist</button> | <DeletePlaylist playlist={ getPlaylist }/>
      </div>

      <Modal isOpen={ updatePlaylistModalIsOpen } onRequestClose={ () => { setUpdatePlaylistModalIsOpen(false) } } style={ modalStyles } contentLabel="update playlist modal">
        <button onClick={ () => { setUpdatePlaylistModalIsOpen(false) } }>close</button>
        <h2>Update Playlist</h2>
        <UpdatePlaylist playlist={ getPlaylist }/>
      </Modal>

      { getPlaylist.private ? (
          <div>
            { getPlaylist.shares && `${ getPlaylist.shares } shared this` }
          </div>
        )
        :
        (
          <div>
            Share
            { getPlaylist.shares ? `${ getPlaylist.shares } shared this` : `be the first to share` }
            <SharePlaylist/>
            <span dir="ltr"><input value={ getPlaylist.url } readOnly/></span>
          </div>
        )
      }

      <div>
        <img src="https://via.placeholder.com/728x90?text=728x90+Leaderboard+Ad+but+will+be+responsive"/>
      </div>

      <div>
        Data:
        { getPlaylist.desc && (
          <div dangerouslySetInnerHTML={{ __html: getPlaylist.desc.replace(/#[^\s<]+/g,'') }} />
        )}
        {
          getPlaylist.hashtags && getPlaylist.hashtags.map(hashtag => (
            <div key={ hashtag }>
              <Link href="/hashtag/[hashtag]" as={ `/hashtag/${ hashtag }` }><a>#{ hashtag }</a></Link>
            </div>
          ))
        }
        { getPlaylist.usersPlayed ? `${ getPlaylist.usersPlayed } listeners` : null }
        Played: { getPlaylist.plays ? getPlaylist.plays : 0 }
        <br/>
        private: { getPlaylist.private.toString() }
        <br/>
        Added by: <Link href="/user/[id]/[slug]" as={ `/user/${ getPlaylist.user.id }/${ getPlaylist.user.slug }` }><a>{ getPlaylist.user.username }</a></Link> on { getPlaylist.createdDate }
      </div>

      <div>
        { getPlaylist.songs && getPlaylist.songs.map((song, index) => (
          <div key={ `${ index }-${ song.id }` }>
            <SongItem song={ song }/>
            <RemoveSongFromPlaylist playlist={ getPlaylist } song={ song } index={ index }/>
          </div>
        )) }
      </div>

      { !getPlaylist.private && (
        <CreateComment collection={ PLAYLISTS_COLLECTION } id={ getPlaylist.id } />
      )}
      <CommentsList collection={ PLAYLISTS_COLLECTION } id={ getPlaylist.id } />

      <style jsx>{`
        .title, .description {
          text-align: center;
        }
      `}</style>
    </section>
  )
}
