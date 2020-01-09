import NextHead from 'next/head'
import { string } from 'prop-types'

const ROOT_WEBSITE_URL = 'https://www.awtarika.com'
const WEBSITE_TITLE = 'أوتاريكا'
const defaultDescription = ''
const defaultOGImage = ''

const Head = (props) => (
  <NextHead>
    <meta charSet="UTF-8" />
    <meta name="application-name" content="أوتاريكا" />
    <title>{ props.title ? `${ props.title } - ${ WEBSITE_TITLE }` : WEBSITE_TITLE }</title>
    <meta name="title" content={ props.title ? `${ props.title } - ${ WEBSITE_TITLE }` : WEBSITE_TITLE } />
    <meta name="description" content={props.description || defaultDescription} />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <link rel="icon" sizes="192x192" href="/static/touch-icon.png" />
    <link rel="apple-touch-icon" href="/static/touch-icon.png" />
    <link rel="mask-icon" href="/static/favicon-mask.svg" color="#49B882" />
    <link rel="icon" href="/favicon.ico" />
    <meta property="og:url" content={ props.asPath ? `${ ROOT_WEBSITE_URL }${ props.asPath }` : `${ ROOT_WEBSITE_URL }/` } />
    <meta property="og:title" content={ props.title ? `${ props.title } - ${ WEBSITE_TITLE }` : WEBSITE_TITLE } />
    <meta property="og:description" content={props.description || defaultDescription} />
    <meta property="og:type" content="music.song"/>
    <meta property="og:site_name" content={ WEBSITE_TITLE } />
    <meta name="twitter:site" content={ props.asPath ? `${ ROOT_WEBSITE_URL }${ props.asPath }` : `${ ROOT_WEBSITE_URL }/` } />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:image" content={props.ogImage || defaultOGImage} />
    <meta property="og:image" content={props.ogImage || defaultOGImage} />
    <meta property="og:image:width" content="1200" />
    <meta property="og:image:height" content="630" />
    <meta property="og:image:type" content="image/jpeg"/>

    {/* Many other tags (google, facebook, twitter, microsoft, apple, android). do later */}

  </NextHead>
)

Head.propTypes = {
  title: string,
  description: string,
  asPath: string,
  ogImage: string
}

export default Head
