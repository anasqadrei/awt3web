import { gql, useMutation } from '@apollo/client'
import * as Sentry from '@sentry/nextjs'
import { queryAuthUser } from 'lib/localState'
import { getCommentsCollectionQuery } from 'lib/commentsCollection'
import { SONGS_COLLECTION, ARTISTS_COLLECTION, PLAYLISTS_COLLECTION, BLOGPOSTS_COLLECTION } from 'lib/constants'
import AuthUser from 'components/user.auth.comp'
import CommentItem from 'components/comment.item.comp'
import ErrorMessage from 'components/errorMessage'

const TEXTAREA_REPLY = "reply"
const CREATE_REPLY_MUTATION = gql`
  mutation createComment ($text: String!, $reference: CommentReferenceInput!, $parentId: ID!, $userId: ID!) {
    createComment(text: $text, reference: $reference, parentId: $parentId, userId: $userId) {
      id
      reference {
        collection
        id
      }
      text
      createdDate
      likes
      user {
        id
        username
        slug
        imageUrl
      }
    }
  }
`
const COMMENT_CHILDREN_FRAGMENT = gql`fragment CommentChildren on Comment {
  children {
    id
    reference {
      collection
      id
    }
    text
    createdDate
    likes
    user {
      id
      username
      slug
      imageUrl
    }
  }
}`

const Comp = (props) => {
  // mutation tuple
  const [createComment, { loading, error }] = useMutation(
    CREATE_REPLY_MUTATION,
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
    const text = formData.get(TEXTAREA_REPLY)
    form.reset()

    // execute mutation and update the cache
    // add the newly created reply
    // update the number of comments
    createComment({
      variables: {
        text: text,
        reference: {
          collection: props.comment.reference.collection,
          id: props.comment.reference.id,
        },
        parentId: props.comment.id,
        userId: getAuthUser?.id,
      },
      update: (cache, { data: { createComment } }) => {
        // add the newly created reply
        {
          // read from cache
          const dataRead = cache.readFragment({
            id: cache.identify(props.comment),
            fragment: COMMENT_CHILDREN_FRAGMENT,
          })

          // deep clone since dataRead is read only
          let dataWrite = JSON.parse(JSON.stringify(dataRead))

          // add the newly created reply
          dataWrite.children = [...dataWrite.children || [], createComment]

          // write to cache
          cache.writeFragment({
            id: cache.identify(props.comment),
            fragment: COMMENT_CHILDREN_FRAGMENT,
            data: dataWrite,
          })
        }

        // update the number of comments
        {
          // read from cache
          const query = getCommentsCollectionQuery(props.comment.reference.collection)
          const dataRead = cache.readQuery({
            query: query,
            variables: { id: props.comment.reference.id },
          })

          // deep clone since dataRead is read only
          let dataWrite = JSON.parse(JSON.stringify(dataRead))

          // update the number of comments
          switch (props.comment.reference.collection) {
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
            variables: { id: props.comment.reference.id },
            data: dataWrite,
          })
        }
      },
    })
  }

  // display component
  return (
    <div>
      <CommentItem comment={ props.comment }/>
      { props.comment.children?.map( reply => (
        <CommentItem key={ reply.id } comment={ reply }/>
      ))}

      <form onSubmit={ handleSubmit }>
        <textarea name={ TEXTAREA_REPLY } type="text" row="2" maxLength="200" placeholder="اكتب رداً هنا" required/>
        {
          getAuthUser && (
            <button type="submit" disabled={ loading }>
              أضف رداً
            </button>
          )
        }

        { loading && <div>mutating (design this)</div> }
        { error && <ErrorMessage/> }
      </form>

      {
        !getAuthUser && (
          <div>
            سجل دخول لإضافة الرد!
            <AuthUser/>
          </div>
        )
      }
    </div>
  )
}

export default Comp