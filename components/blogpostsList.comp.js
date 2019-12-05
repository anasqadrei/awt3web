import Link from 'next/link'
import { useQuery } from '@apollo/react-hooks'
import { NetworkStatus } from 'apollo-client'
import gql from 'graphql-tag'
import Raven from 'raven-js'
import ErrorMessage from './errorMessage'

const SORT = '-createdDate'
const PAGE_SIZE = 25
const LIST_BLOGPOSTS_QUERY = gql`
  query listBlogposts ($sort: String!, $page: Int!, $pageSize: Int!) {
    listBlogposts(sort: $sort, page: $page, pageSize: $pageSize) {
      id
      title
      slug
      createdDate
      comments
    }
  }
`

// a paging flag
let nextPage = true

export default function BlogpostsList() {
  // set query variables
  const queryVariables = {
    page: 1,
    pageSize: PAGE_SIZE,
    sort: SORT,
  }

  // excute query
  // setting notifyOnNetworkStatusChange to true will make the component rerender when
  // the "networkStatus" changes, so we are able to know if it is fetching more data
  const { loading, error, data, fetchMore, networkStatus } = useQuery (
    LIST_BLOGPOSTS_QUERY,
    {
      variables: queryVariables,
      notifyOnNetworkStatusChange: true,
    }
  )

  // loading more network status. fetchMore: query is currently in flight
  const loadingMore = (networkStatus === NetworkStatus.fetchMore)

  // get and append new fetched blogposts. also decide on paging
  const loadMoreBlogposts = () => {
    fetchMore({
      variables: {
        page: Math.ceil(listBlogposts.length/queryVariables.pageSize)+1
      },
      updateQuery: (previousResult, { fetchMoreResult }) => {
        if (!fetchMoreResult || (fetchMoreResult.listBlogposts && fetchMoreResult.listBlogposts.length === 0)) {
          nextPage = false
          return previousResult
        }
        return Object.assign({}, previousResult, {
          listBlogposts: [...previousResult.listBlogposts, ...fetchMoreResult.listBlogposts],
        })
      },
    })
  }

  // error handling
  if (error) {
    Raven.captureException(error.message, { extra: error })
    return <ErrorMessage message='حدث خطأ ما. الرجاء إعادة المحاولة.' />
  }

  // initial loading
  if (loading && !loadingMore) {
    return (<div>Loading... (design this)</div>)
  }

  // get data
  const { listBlogposts } = data

  // in case no blogposts found
  if (!listBlogposts.length) {
    return (<div>no blogposts found (design this)</div>)
  }

  // display blogposts otherwise
  return (
    <section>
      { listBlogposts.map(blogpost => (
        <div key={ blogpost.id }>
          <Link as={ `/blogpost/${ blogpost.id }/${ blogpost.slug }` } href={`/blogpost?id=${ blogpost.id }`}>
            <a>{ blogpost.title }</a>
          </Link>
          <p>Date { blogpost.createdDate }, { blogpost.comments || 0 } comments</p>
        </div>
      ))}

      { (loadingMore || nextPage)?
        <button onClick={ () => loadMoreBlogposts() } disabled={ loadingMore }>
          { loadingMore ? 'Loading...' : 'Show More Blogposts' }
        </button>
        :
        <p>all blogposts has been shown</p>
      }
      <style jsx>{`
        .title, .description {
          text-align: center;
        }
      `}</style>
    </section>
  )
}
