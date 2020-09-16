import { gql } from '@apollo/client'

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

export const GET_PLAYLIST_QUERY = gql`
  query getPlaylist ($id: ID!) {
    getPlaylist(id: $id) {
      id
      name
      slug
      url
      imageUrl
      desc
      hashtags
      private
      duration
      createdDate
      lastUpdatedDate
      user {
        id
        username
        slug
      }
      songs {
        id
        title
        slug
        artist {
          id
          name
          slug
        }
        duration
        defaultImage {
          url
        }
      }
      comments
      plays
      usersPlayed
      likes
      shares
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

export const AUTH_USER_FRAGMENT = gql`
  fragment AuthUser on User {
    id
    username
    slug
    imageUrl
    emails
    profiles {
      provider
      providerId
    }
    birthDate
    sex
    country {
      id
      nameAR
    }
    createdDate
    lastSeenDate
    premium
  } 
`