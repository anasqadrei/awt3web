import Router from 'next/router'
import { setNextPage as setArtistNextPage } from '../components/artist.search.comp'
import { setNextPage as setSongNextPage } from '../components/song.search.comp'
import { setNextPage as setPlaylistNextPage } from '../components/playlist.search.comp'

const FORM_QUERY = "query"

export default function Search() {

  // handling submit event
  const handleSubmit = event => {
    event.preventDefault()
    const form = event.target
    const formData = new window.FormData(form)
    const query = formData.get(FORM_QUERY)

    setArtistNextPage(true)
    setSongNextPage(true)
    setPlaylistNextPage(true)
    Router.push(`/search-results?q=${ query }`)
  }

  return (
    <form onSubmit={ handleSubmit }>
      <input name={ FORM_QUERY } type="text" maxLength="50" placeholder="search here" required/>
      <button type="submit">بحث</button>
    </form>
  )
}
