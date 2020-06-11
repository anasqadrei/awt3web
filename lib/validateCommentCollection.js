import { SONGS_COLLECTION, ARTISTS_COLLECTION, BLOGPOSTS_COLLECTION } from 'lib/constants'

export function validateCommentCollection (collection) {
  switch (collection) {
    case SONGS_COLLECTION:
    case ARTISTS_COLLECTION:
    case BLOGPOSTS_COLLECTION:
      return true
      break
    default:
      return false
  }
}
