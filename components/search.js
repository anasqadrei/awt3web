import Link from 'next/link'

const Search = (props) => (
  <div>
    <p>
      Search Box
      <Link href={`/search-results?q=Search-Term`}>Search</Link>
    </p>

    <style jsx>{`
      div {
        text-align: right;
      }
    `}</style>
  </div>


)

export default Search
