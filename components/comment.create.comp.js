import { useMutation } from '@apollo/react-hooks'
import gql from 'graphql-tag'
import Raven from 'raven-js'
import { LIST_COMMENTS_QUERY, PAGE_SIZE, setNextPage } from './comment.list.comp'
import ErrorMessage from './errorMessage'

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
        Raven.captureException(error.message, { extra: error })
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
    // updating the cache is a hassle. paging becomes complicated.
    setNextPage(true)
    createComment({
      variables: createCommentQueryVariables,
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
      { error && (<ErrorMessage message='حدث خطأ ما. الرجاء إعادة المحاولة.' />) }
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
