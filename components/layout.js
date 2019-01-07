import withSentry from '../lib/withSentry'
import Nav from '../components/nav'
import Footnote from '../components/footnote'
import MiniPlayer from '../components/miniPlayer.comp'
import MegaPlayer from '../components/megaPlayer.comp'

export default withSentry((props) => (
  <div dir="rtl">
    <Nav/>
    {props.children}
    <Footnote/>
    <MiniPlayer/>
    <MegaPlayer/>

    <style jsx global>{`
      div {
        text-align: right;
      }
    `}</style>
  </div>
))
