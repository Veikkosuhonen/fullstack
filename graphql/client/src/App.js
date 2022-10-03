import { useMutation, useQuery } from "@apollo/client";
import { useState } from "react";
import { Button, CircularProgress, Container, FormControl, InputLabel, MenuItem, Paper, Select, TextField, ToggleButton, ToggleButtonGroup, Typography } from "@mui/material"
import { Box } from "@mui/system";
import { ADD_BOOK, ALL_AUTHORS, AUTHOR_NAMES, FIND_BOOKS, SET_BORN } from "./queries";

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
          <Box display="flex" alignItems="center" key={author.id}>
            <Typography mr={2}>{author.name} born in {author.born}, {author.bookCount} books</Typography>
            <Button onClick={() => setAuthorName(author.name)}>
              Show books
            </Button>
          </Box>
        ))}
        <SetBorn />
      </Box>
    </Paper>
  );
}

const Books = ({ books, onClose }) => {
  return (
    <Paper variant="outlined">
      <Box padding={2}>
        <Typography variant="h2" mb={2}>Books</Typography>
        {books.map(book => (
          <Typography key={book.id}>
            {book.title} {book.author.name} {book.published}
          </Typography>
        ))}
        <Button onClick={onClose}>Close</Button>
      </Box>
    </Paper>
  )
}

const AllBooks = () => {
  const result = useQuery(FIND_BOOKS)
  console.log(result)

  if (result.loading) {
    return <CircularProgress />
  }
  return (
    <Paper variant="outlined">
      <Box padding={2}>
        <Typography variant="h2" mb={2}>Books</Typography>
        {result.data.allBooks.map(book => (
          <Typography key={book.id}>
            {book.title}, {book.author.name} {book.published}
          </Typography>
        ))}
        <AddBook />
      </Box>
    </Paper>
  )
}

const AddBook = () => {
  const [newBook, setNewBook] = useState({ title: "", author: "", published: 2000, genres: [] })
  const [genre, setGenre] = useState("")

  const [addBook] = useMutation(ADD_BOOK, {
    refetchQueries: [ { query: FIND_BOOKS }]
  })

  const onSubmit = (event) => {
    event.preventDefault()
    addBook({ variables: newBook })
    setNewBook({ title: "", author: "", published: 2000, genres: [] })
  }

  const onGenreAdd = () => {
    if (!genre) return
    setNewBook({ ...newBook, genres: newBook.genres.concat(genre)})
    setGenre("")
  }

  return (
    <form onSubmit={onSubmit}>
      <Typography variant="h3" mt={5}>Add book</Typography>
      <Box display="flex" flexDirection="column" rowGap={3} mt={2}>
        <TextField label="title" value={newBook.title} onChange={(event => setNewBook({ ...newBook, title: event.target.value }))} />
        <TextField label="author" autoComplete="off" value={newBook.author} onChange={(event => setNewBook({ ...newBook, author: event.target.value }))} />
        <TextField label="published" type="number" value={newBook.published} onChange={(event => setNewBook({ ...newBook, published: event.target.value }))} />
        <Box display="flex">
          <TextField label="genre" value={genre} onChange={event => setGenre(event.target.value)}/>
          <Button type="button" onClick={onGenreAdd}>Add</Button>
        </Box>
        {newBook.genres.map((genre, index) => <Typography key={index}>{genre}</Typography>)}
        <Button type="submit" variant="outlined">Add</Button>
      </Box>
    </form>
  )
}

const SetBorn = () => {
  const result = useQuery(AUTHOR_NAMES)
  const [author, setAuthor] = useState("")
  const [born, setBorn] = useState(2000)

  const [setBornYear] = useMutation(SET_BORN, {
    refetchQueries: [ {query: ALL_AUTHORS }]
  })

  if (result.loading) {
    return <CircularProgress />
  }

  const onSubmit = (event) => {
    event.preventDefault()
    setBornYear({ variables: { author, born: Number(born) }})
    setAuthor("")
    setBorn(2000)
  }

  return (
    <form onSubmit={onSubmit}>
      <Typography variant="h3" mt={5}>Set year of birth</Typography>
      <Box display="flex" flexDirection="column" rowGap={3} mt={2}>
        <FormControl fullWidth>
          <InputLabel id="demo-simple-select-label">Author</InputLabel>
          <Select
            value={author}
            label="Author"
            onChange={(event) => { setAuthor(event.target.value) }}
          >
            {result.data.allAuthors.map(author => 
              <MenuItem value={author.name}>{author.name}</MenuItem>
            )}
          </Select>
        </FormControl>
        <TextField label="born" type="number" value={born} onChange={event => setBorn(event.target.value)} />
        <Button type="submit" variant="outlined">Update</Button>
      </Box>
    </form>
  )
}

const Tabs = ({ value, onChange }) => (
  <Box display="flex">
    <ToggleButtonGroup value={value} exclusive onChange={onChange}>
      <ToggleButton value="authors">Authors</ToggleButton>
      <ToggleButton value="books">Books</ToggleButton>
    </ToggleButtonGroup>
  </Box>
)

const App = () => {
  const [tab, setTab] = useState("authors")
  return (
    <Container>
      <Typography variant="h1" mb={4}>GraphQL Books</Typography>
      <Tabs value={tab} onChange={(event, value) => setTab(value)}/>
      {tab === "authors" && <AllAuthors />}
      {tab === "books" && <AllBooks />}
    </Container>
  )
}

export default App;
