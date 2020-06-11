import gql from 'graphql-tag'

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
        createdDate
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
