import { gql, useQuery } from "@apollo/client";
import { useState } from "react";
import { Button, Container, Paper, Typography } from "@mui/material"
import { Box } from "@mui/system";

const ALL_AUTHORS = gql`
  query {
    allAuthors {
      name
      born
      id
      bookCount
    }
  }
`

const AllAuthors = () => {
  const result = useQuery(ALL_AUTHORS)
  const [authorName, setAuthorName] = useState(null)
  const booksResult = useQuery(FIND_BOOKS, {
    variables: { authorName },
    skip: !authorName
  })

  if (result.loading) {
    return <div>loading...</div>
  }

  if (authorName && booksResult.data) {
    return (
      <Books books={booksResult.data.allBooks} onClose={() => setAuthorName(null)}/>
    )
  }

  return (
    <Paper variant="outlined">
      <Box padding={2}>
        <Typography variant="h2" mb={2}>All authors</Typography>
        {result.data.allAuthors.map(author => (
          <Box display="flex" alignItems="center">
            <Typography mr={2}>{author.name} born in {author.born}, {author.bookCount} books</Typography>
            <Button onClick={() => setAuthorName(author.name)}>
              Show books
            </Button>
          </Box>
        ))}
      </Box>
    </Paper>
  );
}

const FIND_BOOKS = gql`
  query findBooks($authorName: String) {
    allBooks(author: $authorName) {
      title
      author
      published
      genres
    }
  }
`

const Books = ({ books, onClose }) => {
  return (
    <Paper variant="outlined">
      <Box padding={2}>
        <Typography variant="h2" mb={2}>Books</Typography>
        {books.map(book => (
          <Typography>
            {book.title} {book.published}
          </Typography>
        ))}
        <Button onClick={onClose}>Close</Button>
      </Box>
    </Paper>
  )
}

const App = () => {

  return (
    <Container>
      <Typography variant="h1" mb={4}>Books</Typography>
      <AllAuthors />
    </Container>
  )
}

export default App;
