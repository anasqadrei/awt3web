import { graphql } from 'react-apollo'
import gql from 'graphql-tag'
import Raven from 'raven-js'
import Head from './head'
import ErrorMessage from './errorMessage'

const artistQuery = gql`
  query getArtist ($id: ID!) {
    getArtist(id: $id) {
      id
      name
      slug
      imageUrl
      likes
      songs
      songUsersPlayed
      songPlays
      songLikes
      songImages
      url
    }
  }
`

function ArtistData({ data: { loading, error, getArtist }, ownProps }) {
  if (loading) {
    return (<div>Loading... (design this)</div>)
  } else if (error) {
    Raven.captureException(error.message, {extra: error})
    return <ErrorMessage message='حدث خطأ ما في عرض بيانات الفنان. الرجاء إعادة المحاولة.' />
  } else if (!getArtist) {
    return (<div>Artist doesn't exist (design this)</div>)
  } else if (getArtist) {
    if (ownProps.fixSlug) {
      const re = new RegExp ('^' + ownProps.router.pathname + '/' + ownProps.router.query.id + '/' + getArtist.slug + '([?].*|[#].*|/)?$')
      if (!decodeURIComponent(ownProps.router.asPath).match(re)) {
        const href = ownProps.router.pathname + '?id=' + ownProps.router.query.id + '&slug=' + getArtist.slug
        const as = ownProps.router.pathname + '/' + ownProps.router.query.id + '/' + getArtist.slug
        ownProps.router.replace(href, as)
      }
    }
    return (
      <div>
        <Head title={ getArtist.name } description={ getArtist.name } url={ getArtist.url } ogImage={ getArtist.imageUrl } />
        <div>
          <h1 className="title">{ getArtist.name }</h1>
          <img src={ getArtist.imageUrl } />
          <p className="description">عدد المعجبين: { getArtist.likes }</p>
          <p className="description">عدد الاغاني: { getArtist.songs }</p>
          <p className="description">عدد المستمعين: { getArtist.songUsersPlayed }</p>
          <p className="description">عدد سماع الاغاني: { getArtist.songPlays }</p>
          <p className="description">عدد الاغاني المفضلة: { getArtist.songLikes }</p>
          <p className="description">الصور: { getArtist.songImages }</p>
          <p className="description">الرابط: <span dir="ltr">{ getArtist.url }</span></p>
        </div>

        <style jsx>{`
          .title, .description {
            text-align: center;
          }
        `}</style>
      </div>
    )
  }
}

export default graphql(artistQuery, {
  options: ({ router }) => {
    return { variables: {
        id: router.query.id
      }
    }
  },
  props: ({ data, ownProps }) => ({ data, ownProps })
})(ArtistData)
