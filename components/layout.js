import Nav from '../components/nav'
import Library from '../components/library'
import Footnote from '../components/footnote'
import Search from '../components/search'

const Layout = (props) => (
  <div dir="rtl">
    <Nav />
    <Library />
    <Footnote />
    <Search />
    {props.children}

    <style jsx>{`
      div {
        text-align: right;
      }
    `}</style>
  </div>


)

export default Layout
