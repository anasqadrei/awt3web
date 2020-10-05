import Router from 'next/router'
import { gql, useMutation } from '@apollo/client'
import * as Sentry from '@sentry/node'
import { queryAuthUser } from 'lib/localState'
import AuthUser from 'components/user.auth.comp'
import { LIST_USER_PLAYLISTS_QUERY, DEFAULT_SORT, PAGE_SIZE } from 'components/playlist.user.comp'
import ErrorMessage from 'components/errorMessage'

const FORM_NAME = "name"
const FORM_DESC = "desc"
const FORM_PRIVACY = "privacy"
const CREATE_PLAYLIST_MUTATION = gql`
  mutation createPlaylist ($name: String!, $desc: String, $privacy: Boolean!, $userId: ID!) {
    createPlaylist(name: $name, desc: $desc, private: $privacy, userId: $userId) {
      id
      slug
    }
  }
`

export default () => {
  // mutation tuple
  const [createPlaylist, { loading, error, data }] = useMutation(
    CREATE_PLAYLIST_MUTATION,
    {
      onCompleted: (data) => {
        Router.push(`/playlist/[id]/[slug]`, `/playlist/${ data.createPlaylist.id }/${ data.createPlaylist.slug }`)
      },
      onError: (error) => {
        Sentry.captureException(error)
      },
    }
  )

  // get authenticated user
  const getAuthUser = queryAuthUser()

  // function: handle onSubmit event. get data from form and execute mutation
  const handleSubmit = (event) => {
    // get data from form and set its behaviour
    event.preventDefault()
    const form = event.target
    const formData = new window.FormData(form)
    const name = formData.get(FORM_NAME)
    const desc = formData.get(FORM_DESC).replace(/\n/g, '<br/>')
    const privacy = formData.get(FORM_PRIVACY) ? true : false

    // execute mutation
    // refetch all user's playlists because updating cache is a hassle
    createPlaylist({
      variables: {
        name: name,
        desc: desc,
        privacy: privacy,
        userId: getAuthUser?.id,
      },
      refetchQueries: () => [{
        query: LIST_USER_PLAYLISTS_QUERY,
        variables: {
          userId: getAuthUser?.id,
          private: privacy,
          page: 1,
          pageSize: PAGE_SIZE,
          sort: DEFAULT_SORT,
        }
      }],
      awaitRefetchQueries: false,
    })
  }

  // display component
  return (
    <div>
      <form onSubmit={ handleSubmit }>
        playlist name: <input name={ FORM_NAME } type="text" disabled={ loading } maxLength="50" placeholder="playlist name here" required/>
        description: <textarea name={ FORM_DESC } type="text" disabled={ loading } row="7" maxLength="500" placeholder="desc here"/>
        <input name={ FORM_PRIVACY } type="checkbox" disabled={ loading }/> private playlist
        {
          getAuthUser && (
            <button type="submit" disabled={ loading || data?.createPlaylist }>
              Add Playlist
            </button>
          )
        }

        { loading && <div>mutating (design this)</div> }
        { error && <ErrorMessage/> }
        { data?.createPlaylist && <div>playlist created. redirect shortly</div> }
      </form>

      {
        !getAuthUser && (
          <div>
            سجل دخول لإضافة قائمة!
            <AuthUser/>
          </div>
        )
      }
    </div>
  )
}
