import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { useQuery } from '@apollo/client'
import * as Sentry from '@sentry/node'
import Modal from 'react-modal'
import { validateUrl } from 'lib/validateUrl'
import { queryAuthUser } from 'lib/localState'
import { GET_PLAYLIST_QUERY } from 'lib/graphql'
import { PLAYLISTS_COLLECTION, ROOT_APP_ELEMENT } from 'lib/constants'
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

const Comp = () => {
  const router = useRouter()

  // for accessibility
  Modal.setAppElement(ROOT_APP_ELEMENT)

  // get authenticated user
  const getAuthUser = queryAuthUser()

  // state variables
  const [updatePlaylistModalIsOpen, setUpdatePlaylistModalIsOpen] = useState(false)

  // set query variables
  const vars = {
    id: router.query.id
  }

  // excute query
  const { loading, error, data } = useQuery (
    GET_PLAYLIST_QUERY,
    {
      variables: vars,
    }
  )

  // initial loading
  if (loading) {
    return (
      <div>
        Loading... (design this)
      </div>
    )
  }

  // error handling
  if (error) {
    Sentry.captureException(error)
    return <ErrorMessage/>
  }

  // in case no data found
  if (!data?.getPlaylist) {
    return (
      <div>
        Playlist doesn't exist (design this)
      </div>
    )
  }

  // get data
  const { getPlaylist } = data

  // fix url in case it doesn't match the slug
  !(getPlaylist.private && getAuthUser?.id !== getPlaylist.user.id) && validateUrl(router, 'playlist', getPlaylist.id, getPlaylist.slug)

  // display data
  return (
    <section>
      {
        !(getPlaylist.private && getAuthUser?.id !== getPlaylist.user.id) ? (
          <div>
            <Head title={ getPlaylist.name }/>

            <div>
              <img src={ getPlaylist.imageUrl ? getPlaylist.imageUrl : `https://via.placeholder.com/100?text=no+photo` }/>
              <h1 className="title">{ getPlaylist.name }</h1>
              <LikePlaylist playlistId={ getPlaylist.id }/>
            </div>

            <div>
              <PlayPlaylist playlistId={ getPlaylist.id } shuffle={ false }/> | <PlayPlaylist playlistId={ getPlaylist.id } shuffle={ true }/> | 
              <div hidden={ getAuthUser?.id !== getPlaylist.user.id }>
                <button onClick={ () => { setUpdatePlaylistModalIsOpen(true) } }>Update Playlist</button> | 
              </div>
              <DeletePlaylist playlist={ getPlaylist }/>
            </div>

            <Modal isOpen={ updatePlaylistModalIsOpen } onRequestClose={ () => { setUpdatePlaylistModalIsOpen(false) } } style={ modalStyles } contentLabel="update playlist modal">
              <button onClick={ () => { setUpdatePlaylistModalIsOpen(false) } }>
                Close
              </button>
              <h2>Update Playlist</h2>
              <UpdatePlaylist playlist={ getPlaylist }/>
            </Modal>

            <SharePlaylist playlistId={ getPlaylist.id }/>

            <div>
              <img src="https://via.placeholder.com/728x90?text=728x90+Leaderboard+Ad+but+will+be+responsive"/>
            </div>

            <div>
              Data:
              { getPlaylist.desc && <div dangerouslySetInnerHTML={{ __html: getPlaylist.desc.replace(/#[^\s<]+/g,'') }}/> }
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

            { !getPlaylist.private && <CreateComment collection={ PLAYLISTS_COLLECTION } id={ getPlaylist.id }/> }
            <CommentsList collection={ PLAYLISTS_COLLECTION } id={ getPlaylist.id }/>
          </div>
        ) : (
          <div>
            هذي القائمة مغلقة
          </div>
        )
      }
    </section>
  )
}

export default Comp