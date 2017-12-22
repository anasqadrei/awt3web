import { graphql } from 'react-apollo'
import gql from 'graphql-tag'

const artistQuery = gql`
  query artist ($id: Int!){
    artist(id: $id) {
      id
      name
      defaultImage
      likersCount
      songsCount
      songsListenersCount
      songsPlaysCount
      songsLikedCount
      songsImagesCount
      commentsCount
      url
    }
  }
`

function ArtistData({ data: { artist } }) {
  if (artist) {
    return (
      <div>
        <div>
          <h1 className="title">{artist.name}</h1>
          <img src={artist.defaultImage} />
          <p className="description">عدد المعجبين: {artist.likersCount}</p>
          <p className="description">عدد الاغاني: {artist.songsCount}</p>
          <p className="description">عدد المستمعين: {artist.songsListenersCount}</p>
          <p className="description">عدد سماع الاغاني: {artist.songsPlaysCount}</p>
          <p className="description">عدد الاغاني المفضلة: {artist.songsLikedCount}</p>
          <p className="description">الصور: {artist.songsImagesCount}</p>
          <p className="description">عدد التعليقات: {artist.commentsCount}</p>
          <p className="description">الرابط: <span dir="ltr">{artist.url}</span></p>
        </div>

        <style jsx>{`
          .title, .description {
            text-align: center;
          }
        `}</style>
      </div>
    )
  } else {
    return (<div>Loading</div>)
  }
}

export default graphql(artistQuery, { options: ({ id }) => {
  return {
    variables: {
      id
    }
  }
}})(ArtistData)
