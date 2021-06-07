import { gql, useMutation } from '@apollo/client'
import * as Sentry from '@sentry/nextjs'
import { queryAuthUser } from 'lib/localState'
import { validateCommentsCollection, getCommentsCollectionQuery } from 'lib/commentsCollection'
import { SONGS_COLLECTION, ARTISTS_COLLECTION, PLAYLISTS_COLLECTION, BLOGPOSTS_COLLECTION } from 'lib/constants'
import AuthUser from 'components/user.auth.comp'
import { LIST_COMMENTS_QUERY, PAGE_SIZE } from 'components/comment.list.comp'
import ErrorMessage from 'components/errorMessage'

const TEXTAREA_COMMENT = "comment"
const CREATE_COMMENT_MUTATION = gql`
  mutation createComment ($text: String!, $reference: CommentReferenceInput!, $userId: ID!) {
    createComment(text: $text, reference: $reference, userId: $userId) {
      id
    }
  }
`

const Comp = (props) => {
  // validate collection name
  if (!validateCommentsCollection(props.collection)) {
    return <ErrorMessage message='invalid collection name'/>
  }

  // mutation tuple
  const [createComment, { loading, error }] = useMutation(
    CREATE_COMMENT_MUTATION,
    {
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
    const text = formData.get(TEXTAREA_COMMENT)
    form.reset()

    // set query variables
    const varsCreateComment = {
      text: text,
      reference: {
        collection: props.collection,
        id: props.id,
      },
      userId: getAuthUser?.id,
    }
    const varsListComments = {
      reference: {
        collection: props.collection,
        id: props.id,
      },
      page: 1,
      pageSize: PAGE_SIZE,
    }

    // execute mutation and update the cache
    // only update the number of comments in the cache
    // refetch listComments because updating them in cache is a hassle. paging becomes complicated.
    createComment({
      variables: varsCreateComment,
      update: (cache) => {
        // read from cache
        const query = getCommentsCollectionQuery(props.collection)
        const dataRead = cache.readQuery({
          query: query,
          variables: { id: props.id },
        })

        // deep clone since dataRead is read only
        let dataWrite = JSON.parse(JSON.stringify(dataRead))

        // update the number of comments
        switch (props.collection) {
          case SONGS_COLLECTION:
            dataWrite.getSong.comments = dataWrite.getSong?.comments + 1 || 1
            break
          case ARTISTS_COLLECTION:
            dataWrite.getArtist.comments = dataWrite.getArtist?.comments + 1 || 1
            break
          case PLAYLISTS_COLLECTION:
            dataWrite.getPlaylist.comments = dataWrite.getPlaylist?.comments + 1 || 1
            break
          case BLOGPOSTS_COLLECTION:
            dataWrite.getBlogpost.comments = dataWrite.getBlogpost?.comments + 1 || 1
            break
        }

        // write to cache
        cache.writeQuery({
          query: query,
          variables: { id: props.id },
          data: dataWrite,
        })
      },
      refetchQueries: () => [{
        query: LIST_COMMENTS_QUERY,
        variables: varsListComments
      }],
      awaitRefetchQueries: true,
    })
  }

  // display component
  return (
    <div>
      <form onSubmit={ handleSubmit }>
        <textarea name={ TEXTAREA_COMMENT } type="text" row="2" maxLength="200" placeholder="اكتب تعليقك هنا" required/>
        {
          getAuthUser && (
            <button type="submit" disabled={ loading }>
              أضف تعليقك
            </button>
          ) 
        }

        { loading && <div>mutating (design this)</div> }
        { error && <ErrorMessage/> }
      </form>

      {
        !getAuthUser && (
          <div>
            سجل دخول لإضافة التعليق!
            <AuthUser/>
          </div>
        )
      }
    </div>
  )
}

export default Comp