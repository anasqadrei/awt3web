import Head from 'components/head'
import Link from 'next/link'

const Footnote = () => (
  <footer>
    <div>
      <Link href="/about">
        <a>About</a>
      </Link>
      <Link href="/blog">
        <a>Blog | المدونة</a>
      </Link>
      <Link href="/legal/terms">
        <a>Terms</a>
      </Link>
      <Link href="/legal/privacy">
        <a>Privacy</a>
      </Link>
      <Link href="/legal/cookies">
        <a>Cookies</a>
      </Link>
      <Link href="/legal/copyright">
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
