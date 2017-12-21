import Head from './head'
import Link from 'next/link'

const links = [
  { href: '/playlists-list', label: 'قوائمي' },
  { href: '/playlist', label: 'recent' },
  { href: '/playlist', label: 'most played' },
  { href: '/multilist', label: 'downloaded/saved' },
  { href: '/multilist', label: 'liked' },
].map(link => {
  link.key = `nav-link-${link.href}-${link.label}`
  return link
})

const Library = () => (
  <nav>
    <ul>
      {links.map(
        ({ key, href, label }) => (
          <li key={key}>
            <Link href={href}>
              <a>{label}</a>
            </Link>
          </li>
        )
      )}
    </ul>

    <style jsx>{`
      :global(body) {
        margin: 0;
        font-family: -apple-system,BlinkMacSystemFont,Avenir Next,Avenir,Helvetica,sans-serif;
      }
      nav {
        text-align: center;
      }
      ul {
        display: flex;
        justify-content: space-between;
      }
      nav > ul {
        padding: 4px 16px;
      }
      li {
        display: flex;
        padding: 6px 8px;
      }
      a {
        color: #067df7;
        text-decoration: none;
        font-size: 13px;
      }
    `}</style>
  </nav>
)

export default Library
