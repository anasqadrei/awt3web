import { useEffect } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import Error from 'next/error'
import * as Sentry from '@sentry/node'
import { withApollo, createApolloClient } from 'lib/withApollo'
import { validateUrl } from 'lib/validateUrl'
import { GET_BLOGPOST_QUERY } from 'lib/graphql'
import { BLOGPOSTS_COLLECTION } from 'lib/constants'
import Layout from 'components/layout'
import Head from 'components/head'
import CreateComment from 'components/comment.create.comp'
import CommentsList from 'components/comment.list.comp'

export async function getStaticProps(context) {
  try {
    // apollo client for the build time
    const client = await createApolloClient()
    // query
    const { data } = await client.query({
      query: GET_BLOGPOST_QUERY,
      variables: { id: context.params.id }
    })
    // return apollo cache and blogpost
    return {
      props: {
        apolloState: client.cache.extract(),
        blogpost: data.getBlogpost,
      },
    }
  } catch (error) {
    Sentry.captureException(error)
    return { props: {} }
  }
}

export async function getStaticPaths() {
  // because we have a very few paths, we'll return nothing and let it build at production time
  return {
    paths: [],
    fallback: true,
  }
}

export default withApollo()(({ blogpost }) => {
  const router = useRouter()

  // fix url in case it doesn't match the slug
  useEffect(() => {
    // blogpost is null at build time (Static Generation)
    if (blogpost) {
      validateUrl(router, 'blog', blogpost.id, blogpost.slug)
    }
  })

  // if blogpost was not found or error (after running getStaticProps())
  if (!router.isFallback && !blogpost) {
    return <Error statusCode={ 404 } title="Blogpost Not Found" />;
  }

  // If the page is not yet generated, this will be displayed initially until getStaticProps() finishes running
  if (router.isFallback) {
    return (<div>Loading Blogpost... (design it please)</div>)
  }

  return (
    <Layout>
      <Head title={ blogpost.title } description={ blogpost.title } asPath={ `/blog/${ blogpost.id }/${ decodeURIComponent(blogpost.slug) }` } />
      <Link href="/"><a>الرئيسية</a></Link> / <Link href="/blog"><a>المدونة</a></Link> / { blogpost.title }
      <h1 className="title">{ blogpost.title }</h1>
      <p>
        written on { blogpost.createdDate }
      </p>
      <p>
        { blogpost.views } views
      </p>
      <div dangerouslySetInnerHTML={{ __html: blogpost.content }} />
      <div>
        <img src="https://via.placeholder.com/728x90?text=728x90+Leaderboard+Ad+but+will+be+responsive"/>
      </div>
      <CreateComment collection={ BLOGPOSTS_COLLECTION } id={ blogpost.id } />
      <CommentsList collection={ BLOGPOSTS_COLLECTION } id={ blogpost.id } />
      <style jsx>{`
        .title, .description {
          text-align: center;
        }
      `}</style>
    </Layout>
  )
})
