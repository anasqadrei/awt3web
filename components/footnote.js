import Head from './head'
import Link from 'next/link'

const Footnote = () => (
  <footer>
    <div>
      <Link href="/about">
        <a>About</a>
      </Link>
      <Link href="/blog">
        <a>Blog</a>
      </Link>
      <Link href="/terms">
        <a>Terms</a>
      </Link>
      <Link href="/privacy">
        <a>Privacy</a>
      </Link>
      <Link href="/cookies">
        <a>Cookies</a>
      </Link>
      <Link href="/copyright">
        <a>Copyright</a>
      </Link>
      <Link href="/contact">
        <a>Contact Us</a>
      </Link>
    </div>
    <div>
      Follow us on social media
      <Link href="/">
        <a>Facebook</a>
      </Link>
      <Link href="/">
        <a>Instagram</a>
      </Link>
      <Link href="/">
        <a>Twitter</a>
      </Link>
      <Link href="/">
        <a>Google+</a>
      </Link>
      <Link href="/">
        <a>YouTube</a>
      </Link>
    </div>
    <div>
      Download our apps
      <Link href="/">
        <a>App Store</a>
      </Link>
      <Link href="/">
        <a>Google Play</a>
      </Link>
    </div>
  </footer>
)

export default Footnote
