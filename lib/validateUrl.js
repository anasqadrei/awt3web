export function validateUrl (router, path, id, slug) {
  // how a correct URL should look like
  const expectedRegExp = new RegExp(`^/${ path }/${ id }/${ slug }([?].*|[#].*|/)?$`)

  // if it is different than above then fix it
  if (!decodeURIComponent(router.asPath).match(expectedRegExp)) {
    // find optionals (query strings and fragments)
    const optionalsRegExp = new RegExp(/\?.*|#.*/)
    const optionals = optionalsRegExp.exec(decodeURIComponent(router.asPath))
    
    // URL changes
    const url = `/${ path }/${ id }/${ slug }${ optionals && optionals[0] ? optionals[0] : '' }`

    // change how the URL looks
    // replace will prevent adding a new URL entry into the history stack
    // shallow routing allows you to change the URL without running data fetching methods again
    router.replace(url, null, { shallow: true })
  }
}
