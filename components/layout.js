import withSentry from '../lib/withSentry'
import Nav from '../components/nav'
import Footnote from '../components/footnote'

export default withSentry((props) => (
  <div dir="rtl">
    <Nav/>
    {props.children}
    <Footnote/>

    <style jsx global>{`
      div {
        text-align: right;
      }
    `}</style>
  </div>
))
