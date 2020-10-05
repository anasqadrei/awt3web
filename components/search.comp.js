import Router from 'next/router'

const FORM_QUERY = "query"

const Comp = () => {
  // handling submit event
  const handleSubmit = event => {
    event.preventDefault()
    const form = event.target
    const formData = new window.FormData(form)
    const query = formData.get(FORM_QUERY)

    Router.push(`/search-results?q=${ query }`)
  }

  return (
    <form onSubmit={ handleSubmit }>
      <input name={ FORM_QUERY } type="text" maxLength="50" placeholder="search here" required/>
      <button type="submit">
        بحث
      </button>
    </form>
  )
}

export default Comp