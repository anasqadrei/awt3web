import { useMutation } from '@apollo/react-hooks'
import gql from 'graphql-tag'
import * as Sentry from '@sentry/node'
import { getCommentsCollectionQuery } from 'lib/commentsCollection'
import { SONGS_COLLECTION, ARTISTS_COLLECTION, PLAYLISTS_COLLECTION, BLOGPOSTS_COLLECTION } from 'lib/constants'
import { LIST_COMMENTS_QUERY, PAGE_SIZE } from 'components/comment.list.comp'
import CommentItem from 'components/comment.item.comp'
import ErrorMessage from 'components/errorMessage'

// TEMP: until we decide on the login mechanism
const loggedOnUser = {
  id: "1",
  username: "Admin",
}

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

export default function ParentComment(props) {
  // mutation
  const [createComment, { loading: loadingCreate, error: errorCreate }] = useMutation(
    CREATE_REPLY_MUTATION,
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
    const text = formData.get(TEXTAREA_REPLY)
    form.reset()

    // set query variables
    const createReplyQueryVariables = {
      text: text,
      reference: {
        collection: props.comment.reference.collection,
        id: props.comment.reference.id,
      },
      parentId: props.comment.id,
      userId: loggedOnUser.id,
    }
    const listCommentsQueryVariables = {
      reference: {
        collection: props.comment.reference.collection,
        id: props.comment.reference.id,
      },
      page: 1,
      pageSize: PAGE_SIZE,
    }

    // execute createComment and update the replies(children) cache
    createComment({
      variables: createReplyQueryVariables,
      update: (proxy, { data: { createComment } }) => {
        // add the newly created reply to the cache
        {
          const data = proxy.readQuery({
            query: LIST_COMMENTS_QUERY,
            variables: listCommentsQueryVariables,
          })

          // find the comment that the reply belongs to and add it
          const parentIndex = data.listComments.findIndex(elem => elem.id === props.comment.id)
          data.listComments[parentIndex].children = [...data.listComments[parentIndex].children || [], createComment]

          // update cache
          proxy.writeQuery({
            query: LIST_COMMENTS_QUERY,
            variables: listCommentsQueryVariables,
            data: data,
          })
        }
        // update the number of comments in the cache
        {
          // read cache
          const query = getCommentsCollectionQuery(props.comment.reference.collection)
          const data = proxy.readQuery({
            query: query,
            variables: { id: props.comment.reference.id },
          })

          // update the number of comments in the cache
          let update = { ...data }
          switch (props.comment.reference.collection) {
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
            variables: { id: props.comment.reference.id },
            data: update,
          })
        }
      },
    })
  }

  return (
    <form onSubmit={ handleSubmit }>
      <CommentItem comment={ props.comment } />
      { props.comment.children && props.comment.children.map( reply => (
        <div key={ reply.id }>
          <CommentItem comment={ reply } />
        </div>
      ))}

      <textarea name={ TEXTAREA_REPLY } type="text" row="2" maxLength="200" placeholder="اكتب رداً هنا" required />
      <button type="submit" disabled={ loadingCreate }>أضف رداً</button>
      { errorCreate && (<ErrorMessage/>) }

      <style jsx>{`
        .title, .description {
          text-align: center;
        }
      `}</style>
    </form>
  )
}