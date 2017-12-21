import Head from './head'
import Link from 'next/link'

const links = [
  { href: '/about', label: 'About' },
  { href: '/blog', label: 'blog' },
  { href: '/terms', label: 'terms' },
  { href: '/privacy', label: 'privacy' },
  { href: '/copyright', label: 'copyright' },
  { href: '/contact', label: 'contact us' },
].map(link => {
  link.key = `nav-link-${link.href}-${link.label}`
  return link
})

const Footnote = () => (
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

export default Footnote
