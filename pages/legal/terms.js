import Link from 'next/link'
import Layout from 'components/layout'
import Head from 'components/head'

const META = {
  asPath: `/terms`,
  title: `الشروط و الأحكام`,
  description: `Terms & Conditions`,
}

const Terms = () => (
  <Layout>
    <Head asPath={ META.asPath } title={ META.title } description={ META.description }/>
    terms page
    <p>
      Lorem ipsum dolor sit amet, consectetuer adipiscing
      elit. Aenean commodo ligula eget dolor. Aenean massa
      <strong>strong</strong>. Cum sociis natoque penatibus
      et magnis dis parturient montes, nascetur ridiculus
      mus. Donec quam felis, ultricies nec, pellentesque
      eu, pretium quis, sem. Nulla consequat massa quis
      enim. Donec pede justo, fringilla vel, aliquet nec,
      vulputate eget, arcu. In enim justo, rhoncus ut,
      imperdiet a, venenatis vitae, justo. Nullam dictum
      felis eu pede <Link href="#"><a className="external ext">link</a></Link>
      mollis pretium. Integer tincidunt. Cras dapibus.
      Vivamus elementum semper nisi. Aenean vulputate
      eleifend tellus. Aenean leo ligula, porttitor eu,
      consequat vitae, eleifend ac, enim. Aliquam lorem ante,
      dapibus in, viverra quis, feugiat a, tellus. Phasellus
      viverra nulla ut metus varius laoreet. Quisque rutrum.
      Aenean imperdiet. Etiam ultricies nisi vel augue.
      Curabitur ullamcorper ultricies nisi.
    </p>
    <p>
      Lorem ipsum dolor sit amet, consectetuer adipiscing
      elit. Aenean commodo ligula eget dolor. Aenean massa
      <strong>strong</strong>. Cum sociis natoque penatibus
      et magnis dis parturient montes, nascetur ridiculus
      mus. Donec quam felis, ultricies nec, pellentesque
      eu, pretium quis, sem. Nulla consequat massa quis
      enim. Donec pede justo, fringilla vel, aliquet nec,
      vulputate eget, arcu. In enim justo, rhoncus ut,
      imperdiet a, venenatis vitae, justo. Nullam dictum
      felis eu pede <Link href="#"><a className="external ext">link</a></Link>
      mollis pretium. Integer tincidunt. Cras dapibus.
      Vivamus elementum semper nisi. Aenean vulputate
      eleifend tellus. Aenean leo ligula, porttitor eu,
      consequat vitae, eleifend ac, enim. Aliquam lorem ante,
      dapibus in, viverra quis, feugiat a, tellus. Phasellus
      viverra nulla ut metus varius laoreet. Quisque rutrum.
      Aenean imperdiet. Etiam ultricies nisi vel augue.
      Curabitur ullamcorper ultricies nisi.
    </p>
  </Layout>
)

export default Terms
