import { SONGS_COLLECTION, ARTISTS_COLLECTION, PLAYLISTS_COLLECTION, BLOGPOSTS_COLLECTION } from 'lib/constants'
import { GET_SONG_QUERY, GET_ARTIST_QUERY, GET_PLAYLIST_QUERY, GET_BLOGPOST_QUERY } from 'lib/graphql'

export function validateCommentsCollection (collection) {
  switch (collection) {
    case SONGS_COLLECTION:
    case ARTISTS_COLLECTION:
    case PLAYLISTS_COLLECTION:
    case BLOGPOSTS_COLLECTION:
      return true
      break
    default:
      return false
  }
}

export function getCommentsCollectionQuery (collection) {
  let query
  switch (collection) {
    case SONGS_COLLECTION:
      query = GET_SONG_QUERY
      break
    case ARTISTS_COLLECTION:
      query = GET_ARTIST_QUERY
      break
    case PLAYLISTS_COLLECTION:
      query = GET_PLAYLIST_QUERY
      break
    case BLOGPOSTS_COLLECTION:
      query = GET_BLOGPOST_QUERY
      break
  }
  return query
}
