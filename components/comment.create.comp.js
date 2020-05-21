import { useMutation } from '@apollo/react-hooks'
import gql from 'graphql-tag'
import * as Sentry from '@sentry/node'
import { LIST_COMMENTS_QUERY, PAGE_SIZE } from 'components/comment.list.comp'
// import { GET_SONG_QUERY, SONGS_COLLECTION } from 'components/song.comp'
import { GET_ARTIST_QUERY, ARTISTS_COLLECTION } from 'components/artist.comp'
import { GET_BLOGPOST_QUERY, BLOGPOSTS_COLLECTION } from 'components/blogpost.comp'
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
        let query
        switch (props.collection) {
          // TODO: uncomment
          // case SONGS_COLLECTION:
          //   query = GET_SONG_QUERY
          //   break
          case ARTISTS_COLLECTION:
            query = GET_ARTIST_QUERY
            break
          case BLOGPOSTS_COLLECTION:
            query = GET_BLOGPOST_QUERY
            break
          default:
            return
        }
        const data = proxy.readQuery({
          query: query,
          variables: { id: props.id },
        })

        // update the number of comments in the cache
        let update = { ...data }
        switch (props.collection) {
          // TODO: uncomment
          // case SONGS_COLLECTION:
          //   update.getSong = {
          //     ...data.getSong,
          //     comments: data.getSong.comments + 1,
          //   }
          //   break
          case ARTISTS_COLLECTION:
            update.getArtist = {
              ...data.getArtist,
              comments: data.getArtist.comments + 1,
            }
            break
          case BLOGPOSTS_COLLECTION:
            update.getBlogpost = {
              ...data.getBlogpost,
              comments: data.getBlogpost.comments + 1,
            }
            break
          default:
            return
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
