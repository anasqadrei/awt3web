import gql from 'graphql-tag'

export const GET_ARTIST_QUERY = gql`
  query getArtist ($id: ID!) {
    getArtist(id: $id) {
      id
      name
      slug
      imageUrl
      likes
      shares
      comments
      songs
      songUsersPlayed
      songPlays
      songLikes
      songImages
      url
    }
  }
`

export const GET_BLOGPOST_QUERY = gql`
  query getBlogpost ($id: ID!) {
    getBlogpost(id: $id) {
      id
      title
      slug
      content
      metaTags
      createdDate
      comments
      views
    }
  }
`
