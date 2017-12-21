import Link from 'next/link'
import Layout from '../components/layout'
import Head from '../components/head'

export default () => (
  <Layout>
    <Head title="أوتاريكا" />

    <div className="hero">
      <h1 className="title">أوتاريكا</h1>
      <p className="description">اهلا بكم في موقع اوتاريكا للاغاني حيث نتمنى ان تسعدوا بقضاء افضل الاوقات بسماع كل ما يحلوا لكم من اغاني و موسيقى.</p>
      <div className="row">
        <p>New Songs</p>
        <p>Trending</p>
        <p>My Recently Played</p>
        <Link as="/song/1/الليل-يا-ليلى" href={`/song?id=1`}>
        <a className="card">
          <h3>الليل-يا-ليلى</h3>
          <p>وديع الصافي</p>
        </a>
        </Link>
      </div>
    </div>

    <style jsx>{`
      .hero {
        width: 100%;
        color: #333;
      }
      .title {
        margin: 0;
        width: 100%;
        padding-top: 80px;
        line-height: 1.15;
        font-size: 48px;
      }
      .title, .description {
        text-align: center;
      }
      .row {
        max-width: 880px;
        margin: 80px auto 40px;
        display: flex;
        flex-direction: row;
        justify-content: space-around;
      }
      .card {
        padding: 18px 18px 24px;
        width: 220px;
        text-align: left;
        text-decoration: none;
        color: #434343;
        border: 1px solid #9B9B9B;
      }
      .card:hover {
        border-color: #067df7;
      }
      .card h3 {
        margin: 0;
        color: #067df7;
        font-size: 18px;
      }
      .card p {
        margin: 0;
        padding: 12px 0 0;
        font-size: 13px;
        color: #333;
      }
    `}</style>
  </Layout>
)
