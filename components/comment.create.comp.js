import { useMutation } from '@apollo/react-hooks'
import gql from 'graphql-tag'
import * as Sentry from '@sentry/node'
import { validateCommentsCollection, getCommentsCollectionQuery } from 'lib/commentsCollection'
import { SONGS_COLLECTION, ARTISTS_COLLECTION, PLAYLISTS_COLLECTION, BLOGPOSTS_COLLECTION } from 'lib/constants'
import { LIST_COMMENTS_QUERY, PAGE_SIZE } from 'components/comment.list.comp'
import ErrorMessage from 'components/errorMessage'

// TEMP: until we decide on the login mechanism
const loggedOnUser = {
  id: "1",
  username: "Admin",
}

const TEXTAREA_COMMENT = "comment"
const CREATE_COMMENT_MUTATION = gql`
  mutation createComment ($text: String!, $reference: CommentReferenceInput!, $userId: ID!) {
    createComment(text: $text, reference: $reference, userId: $userId) {
      id
    }
  }
`

export default function Comment(props) {
  // validate collection name
  if (!validateCommentsCollection(props.collection)) {
    return <ErrorMessage message='invalid collection name' />
  }

  // mutation
  const [createComment, { loading, error }] = useMutation(
    CREATE_COMMENT_MUTATION,
    {
      onError: (error) => {
        Sentry.captureException(error)
      },
    }
  )

  // handling submit event
  const handleSubmit = event => {
    // get data from form and set its behaviour
    event.preventDefault()
    const form = event.target
    const formData = new window.FormData(form)
    const text = formData.get(TEXTAREA_COMMENT)
    form.reset()

    // set query variables
    const createCommentQueryVariables = {
      text: text,
      reference: {
        collection: props.collection,
        id: props.id,
      },
      userId: loggedOnUser.id,
    }
    const listCommentsQueryVariables = {
      reference: {
        collection: props.collection,
        id: props.id,
      },
      page: 1,
      pageSize: PAGE_SIZE,
    }

    // execute createComment and refetch listComments from the start for the new comment to be shown
    // updating the list of comments in the cache is a hassle. paging becomes complicated.
    // just updating the number of comments in the cache
    createComment({
      variables: createCommentQueryVariables,
      update: (proxy) => {
        // read cache
        const query = getCommentsCollectionQuery(props.collection)
        const data = proxy.readQuery({
          query: query,
          variables: { id: props.id },
        })

        // update the number of comments in the cache
        let update = { ...data }
        switch (props.collection) {
          case SONGS_COLLECTION:
            update.getSong = {
              ...data.getSong,
              comments: data.getSong.comments + 1,
            }
            break
          case ARTISTS_COLLECTION:
            update.getArtist = {
              ...data.getArtist,
              comments: data.getArtist.comments + 1,
            }
            break
          case PLAYLISTS_COLLECTION:
            update.getPlaylist = {
              ...data.getPlaylist,
              comments: data.getPlaylist.comments + 1,
            }
            break
          case BLOGPOSTS_COLLECTION:
            update.getBlogpost = {
              ...data.getBlogpost,
              comments: data.getBlogpost.comments + 1,
            }
            break
        }
        proxy.writeQuery({
          query: query,
          variables: { id: props.id },
          data: update,
        })
      },
      refetchQueries: () => [{
        query: LIST_COMMENTS_QUERY,
        variables: listCommentsQueryVariables
      }],
      awaitRefetchQueries: true,
    })
  }

  // show comment form
  return (
    <form onSubmit={ handleSubmit }>
      <textarea name={ TEXTAREA_COMMENT } type="text" row="2" maxLength="200" placeholder="اكتب تعليقك هنا" required />
      <button type="submit" disabled={ loading }>أضف تعليقك</button>
      { error && (<ErrorMessage/>) }
      <style jsx>{`
        form {
          border-bottom: 1px solid #ececec;
        }
        input {
          display: block;
        }
      `}</style>
    </form>
  )
}
