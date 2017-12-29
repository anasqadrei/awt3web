import Link from 'next/link'

const Search = (props) => (<div>
  <p>
    Search Box
    <Link href={`/search-results?q=Search-Term`}>
      <a>Search</a>
    </Link>
  </p>

  <style jsx="jsx">
    {
      `
        div {
          text-align: right;
        }
      `
    }
  </style>
</div>)

export default Search
