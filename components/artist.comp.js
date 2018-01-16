import { graphql } from 'react-apollo'
import gql from 'graphql-tag'
import { withRouter } from 'next/router'
import Logger from '../lib/logger'
import Head from './head'
import ErrorMessage from './errorMessage'

const logger = new Logger()

const artistQuery = gql`
  query artist ($id: Int!){
    artist(id: $id) {
      id
      name
      slug
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

function ArtistData({ data: { loading, error, artist }, ownProps, router }) {
  if (loading) {
    return (<div>Loading... (design this)</div>)
  } else if (error) {
    logger.logException(error)
    return <ErrorMessage message='حدث خطأ ما في عرض بيانات الفنان. الرجاء إعادة المحاولة.' />
  } else if (artist) {
    if (ownProps.fixSlug) {
      const re = new RegExp ('^' + ownProps.url.pathname + '/' + ownProps.url.query.id + '/' + artist.slug + '([?].*|[#].*|/)?$')
      if (!decodeURIComponent(ownProps.url.asPath).match(re)) {
        const href = ownProps.url.pathname + '?id=' + ownProps.url.query.id + '&slug=' + artist.slug
        const as = ownProps.url.pathname + '/' + ownProps.url.query.id + '/' + artist.slug
        router.replace(href, as)
      }
    }
    return (
      <div>
        <Head title={artist.name} description={artist.name} url={artist.url} ogImage={artist.defaultImage} />
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
    return (<div>Artist doesn't exist (design this)</div>)
  }
}

export default graphql(artistQuery, {
  options: ({url}) => {
    return {variables: {
        id: url.query.id
      }}
  },
  props: ({data, ownProps}) => ({data, ownProps})
})(withRouter(ArtistData))
