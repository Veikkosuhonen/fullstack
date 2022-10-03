import { gql } from "@apollo/client"

export const ADD_BOOK = gql`
mutation addBook($title: String!, $author: String!, $published: Int!, $genres: [String!]!) {
  addBook(
    title: $title
    author: $author
    published: $published
    genres: $genres
  ) {
    title
    author
    published
    genres
    id
  }
}
`

export const FIND_BOOKS = gql`
query findBooks($authorName: String) {
  allBooks(author: $authorName) {
    title
    author {
      name
      born
    }
    published
    genres
    id
  }
}
`

export const ALL_AUTHORS = gql`
query {
  allAuthors {
    name
    born
    id
    bookCount
  }
}
`

export const AUTHOR_NAMES = gql`
query {
  allAuthors {
    name
    born
  }
}
`

export const SET_BORN = gql`
mutation setBornYear($author: String!, $born: Int!) {
  editAuthor(name: $author, setBornTo: $born) {
    id
  }
}
`