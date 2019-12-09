import Link from 'next/link'
import { useQuery } from '@apollo/react-hooks'
import { NetworkStatus } from 'apollo-client'
import gql from 'graphql-tag'
import Raven from 'raven-js'
import Head from './head'
import Comment from './comment.create.comp'
import CommentsList from './comment.list.comp'
import ErrorMessage from './errorMessage'

const BLOGPOSTS_COLLECTION = 'blogposts'
const GET_BLOGPOST_QUERY = gql`
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

const queryVariables = {}

export default function Blogpost(props) {
  // set query variables
  const queryVariables = {
    id: props.router.query.id
  }

  // excute query
  // setting notifyOnNetworkStatusChange to true will make the component rerender when
  // the "networkStatus" changes, so we are able to know if it is fetching
  // more data
  const { loading, error, data, networkStatus } = useQuery (
    GET_BLOGPOST_QUERY,
    {
      variables: queryVariables,
      notifyOnNetworkStatusChange: true,
    }
  )

  // error handling
  if (error) {
    Raven.captureException(error.message, { extra: error })
    return <ErrorMessage message='حدث خطأ ما. الرجاء إعادة المحاولة.' />
  }

  // initial loading
  if (loading) {
    return (<div>Loading... (design this)</div>)
  }

  // get data
  const { getBlogpost } = data

  // in case blogpost not found
  if (!getBlogpost) {
    return (<div>Blogpost doesn't exist (design this)</div>)
  }

  // fix url
  if (props.fixSlug) {
    const regExp = new RegExp (`^${ props.router.pathname }/${ props.router.query.id }/${ getBlogpost.slug }([?].*|[#].*|/)?$`)
    if (!decodeURIComponent(props.router.asPath).match(regExp)) {
      const href = `${ props.router.pathname }?id=${ props.router.query.id }&slug=${ getBlogpost.slug }`
      const as = `${ props.router.pathname }/${ props.router.query.id }/${ getBlogpost.slug }`
      props.router.replace(href, as)
    }
  }

  // display blogpost
  return (
    <section>
      <Head title={ getBlogpost.title } description={ getBlogpost.title } asPath={ decodeURIComponent(props.router.asPath) }/>
      <Link href="/"><a>الرئيسية</a></Link> / <Link href="/blog"><a>المدونة</a></Link> / { getBlogpost.title }
      <h1 className="title">{ getBlogpost.title }</h1>
      <p>
        written on { getBlogpost.createdDate }
      </p>
      <p>
        { getBlogpost.views } views
      </p>

      <div dangerouslySetInnerHTML={{ __html: getBlogpost.content }} />

      <div>
        <img src="https://via.placeholder.com/728x90?text=728x90+Leaderboard+Ad+but+will+be+responsive"/>
      </div>

      <Comment collection={ BLOGPOSTS_COLLECTION } id={ getBlogpost.id } />
      <CommentsList collection={ BLOGPOSTS_COLLECTION } id={ getBlogpost.id } total={ getBlogpost.comments }/>

      <style jsx>{`
        .title, .description {
          text-align: center;
        }
      `}</style>
    </section>
  )
}
