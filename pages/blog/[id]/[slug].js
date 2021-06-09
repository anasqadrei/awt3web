import { useEffect } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import Error from 'next/error'
import * as Sentry from '@sentry/nextjs'
import { initializeApollo } from 'lib/apolloClient'
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
    const client = await initializeApollo()

    // query
    const { data } = await client.query({
      query: GET_BLOGPOST_QUERY,
      variables: { id: context.params.id }
    })

    // if blogpost was not found
    if (!data?.getBlogpost) {
      return { notFound: true }
    }

    // return apollo cache and blogpost
    // incremental static regeneration every 100 minutes (6000 seconds)
    return {
      props: {
        initialApolloState: client.cache.extract(),
        blogpost: data.getBlogpost,
      },
      revalidate: 6000,
    }
  } catch (error) {
    Sentry.captureException(error)
    return { notFound: true }
  }
}

export async function getStaticPaths() {
  // because we have a very few paths, we'll return nothing and let it build at production time
  return {
    paths: [],
    fallback: true,
  }
}

const Page = ({ blogpost }) => {
  const router = useRouter()

  // fix url in case it doesn't match the slug
  useEffect(() => {
    // blogpost is null at build time (Static Generation)
    if (blogpost) {
      validateUrl(router, 'blog', blogpost.id, blogpost.slug)
    }
  })

  // If the page is not yet generated, this will be displayed initially until getStaticProps() finishes running
  if (router.isFallback) {
    return (
      <div>
        Loading... (design it please)
      </div>
    )
  }

  // TODO: doesn't work on dev. check on production
  const META = {
    asPath: `/blog/${ blogpost.id }/${ decodeURIComponent(blogpost.slug) }`,
    title: blogpost.title,
    description: blogpost.title,
  }

  return (
    <Layout>
      <Head asPath={ META.asPath } title={ META.title } description={ META.description }/>

      <Link href="/"><a>الرئيسية</a></Link> / <Link href="/blog"><a>المدونة</a></Link> / { blogpost.title }
      <h1 className="title">{ blogpost.title }</h1>
      <p>
        written on { blogpost.createdDate }
      </p>
      <p>
        { blogpost.views } views
      </p>
      <div dangerouslySetInnerHTML={{ __html: blogpost.content }}/>
      <div>
        <img src="https://via.placeholder.com/728x90?text=728x90+Leaderboard+Ad+but+will+be+responsive"/>
      </div>
      <CreateComment collection={ BLOGPOSTS_COLLECTION } id={ blogpost.id }/>
      <CommentsList collection={ BLOGPOSTS_COLLECTION } id={ blogpost.id }/>
    </Layout>
  )
}

export default Page