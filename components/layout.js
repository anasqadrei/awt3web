import Nav from '../components/nav'
import Library from '../components/library'
import Search from '../components/search'
import Footnote from '../components/footnote'

const Layout = (props) => (
  <div dir="rtl">
    <Nav />
    <Library />
    <Search />
    {props.children}
    <Footnote />

    <style jsx global>{`
      div {
        text-align: right;
      }
    `}</style>
  </div>
)

export default Layout
