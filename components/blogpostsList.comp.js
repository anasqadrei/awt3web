import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { gql, useQuery, NetworkStatus } from '@apollo/client'
import * as Sentry from '@sentry/node'
// TODO: head here?
import Head from 'components/head'
import ErrorMessage from 'components/errorMessage'

const title = "المدونة"
const metaDescription = "مدونة موقع أوتاريكا للأغاني العربية"

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

export default () => {
  const router = useRouter()

  // paging
  const [nextPage, setNextPage] = useState(true)
  const [currentListLength, setCurrentListLength] = useState(0)

  // set query variables
  const queryVariables = {
    page: 1,
    pageSize: PAGE_SIZE,
    sort: SORT,
  }

  // excute query
  //
  // setting notifyOnNetworkStatusChange to true will make the component rerender when
  // the "networkStatus" changes, so we are able to know if it is fetching more data.
  //
  // onCompleted() decides paging. it compares currentListLength with the newListLength.
  // if they're equal, then it means no more items which is an indication to stop paging.
  const { loading, error, data, fetchMore, networkStatus } = useQuery (
    LIST_BLOGPOSTS_QUERY,
    {
      variables: queryVariables,
      notifyOnNetworkStatusChange: true,
      onCompleted: (data) => {
        // get new length of data (cached + newly fetched) with default = 0
        const newListLength = data?.listBlogposts?.length ?? 0;

        // if there are no new items in the list then stop paging.
        if (newListLength == currentListLength) {
          setNextPage(false)
        }

        // update currentListLength to be newListLength
        setCurrentListLength(newListLength)
      },
    }
  )

  // loading more network status. fetchMore: query is currently in flight
  const loadingMore = (networkStatus === NetworkStatus.fetchMore)

  // initial loading
  if (loading && !loadingMore) {
    return (
      <div>
        Loading... (design this)
      </div>
    )
  }

  // error handling
  if (error) {
    Sentry.captureException(error)
    return <ErrorMessage/>
  }

  // in case no data found
  if (!data?.listBlogposts?.length) {
    return (
      <div>
        no blogposts found (design this)
      </div>
    )
  }

  // get data
  const { listBlogposts } = data

  // function: get (and append at cache) new fetched data
  const loadMore = () => {
    fetchMore({
      variables: {
        page: Math.ceil(listBlogposts.length / queryVariables.pageSize) + 1
      },
    })
  }

  // display data
  return (
    <section>
      <Head title={ title } description={ metaDescription } asPath={ decodeURIComponent(router.asPath) } />

      <h1 className="title">{ title }</h1>
      <p>Blogposts List</p>

      { listBlogposts.map(blogpost => (
        <div key={ blogpost.id }>
          <Link href="/blog/[id]/[slug]" as={ `/blog/${ blogpost.id }/${ blogpost.slug }` }>
            <a>{ blogpost.title }</a>
          </Link>
          <p>Date { blogpost.createdDate }, { blogpost.comments || 0 } comments</p>
        </div>
      ))}

      { nextPage ?
        <button onClick={ () => loadMore() } disabled={ loadingMore }>
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
