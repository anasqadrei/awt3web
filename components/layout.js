import Nav from 'components/nav'
import Footnote from 'components/footnote'
import MiniPlayer from 'components/miniPlayer.comp'
import MegaPlayer from 'components/megaPlayer.comp'

const Comp = (props) => (
  <div dir="rtl">
    <Nav/>
    {props.children}
    <Footnote/>
    <MiniPlayer/>
    <MegaPlayer/>
  </div>
)

export default Comp