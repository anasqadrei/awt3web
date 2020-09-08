import Head from 'next/head'

const ROOT_WEBSITE_URL = 'https://www.awtarika.com'
const WEBSITE_TITLE = 'أوتاريكا'
const DEFAULT_DESCRIPTION = 'موقع أوتاريكا للأغاني العربية'
const DEFAULT_IMAGE = ''

export default (props) => {
  const url = props.asPath ? `${ ROOT_WEBSITE_URL }${ props.asPath }` : `${ ROOT_WEBSITE_URL }/`
  const title = props.title ? `${ props.title } - ${ WEBSITE_TITLE }` : WEBSITE_TITLE
  const description = props.description || DEFAULT_DESCRIPTION
  const image = props.image || DEFAULT_IMAGE

  return (
    <Head>
      <meta charSet="UTF-8"/>
      <title>{ title }</title>
      <meta name="application-name" content="أوتاريكا"/>
      <meta name="title" content={ title }/>
      <meta name="description" content={ description }/>
      <meta name="viewport" content="width=device-width, initial-scale=1"/>

      <meta property="og:url" content={ url }/>
      <meta property="og:title" content={ title }/>
      <meta property="og:description" content={ description }/>
      <meta property="og:type" content="music.song"/>
      <meta property="og:site_name" content={ WEBSITE_TITLE }/>
      <meta property="og:image" content={ image }/>
      <meta property="og:image:width" content="1200"/>
      <meta property="og:image:height" content="630"/>
      <meta property="og:image:type" content="image/jpeg"/>

      <meta name="twitter:site" content={ url }/>
      <meta name="twitter:card" content="summary_large_image"/>
      <meta name="twitter:image" content={ image }/>

      <link rel="icon" href="/favicon.ico"/>

      {
        // TODO: many other tags (google, facebook, twitter, microsoft, apple, android). do later
        // check https://github.com/garmeeh/next-seo
        // also change type (music.song) based on artist or song
      }

    </Head>
  )
}
