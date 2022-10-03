require('dotenv').config()
const { ApolloServer, gql, UserInputError } = require('apollo-server')
const { v4: uuid } = require('uuid')
const { connect } = require('./db')
const { Book, Author } = require('./models')
const { seed } = require('./seed')

const typeDefs = gql`
    type Book {
        title: String!
        published: Int!
        author: Author!
        genres: [String!]!
        id: ID!
    }

    type Author {
        name: String!
        id: ID!
        born: Int
        bookCount: Int!
    }

    type Query {
        bookCount: Int!,
        authorCount: Int!,
        allBooks(author: String, genre: String): [Book!]!
        allAuthors: [Author!]!
    }

    type Mutation {
        addBook(
            title: String!
            author: String!
            published: Int!
            genres: [String!]!
        ): Book

        editAuthor(
            name: String!,
            setBornTo: Int!
        ): Author
    }
`

const resolvers = {
    Query: {
        bookCount: async () => Book.count(),
        authorCount: async () => Author.count(),
        allBooks: async (root, { author, genre }) => {
            const books = await Book.find({}).populate({ path: 'author' })
            if (author) {
                return books.filter((book) => book.author.name.toLowerCase().includes(author.toLowerCase()))
            }
            return books
        },
        allAuthors: async () => Author.find({}).populate('bookCount')
    },
    Mutation: {
        addBook: async (root, args) => {
            const author = await Author.findOne({ name: args.author })
            if (!author) {
                const inputError = new UserInputError("Author not found", {
                    invalidArgs: args,
                })
                console.log(inputError)
                throw inputError
            }
            const newBook = new Book({ ...args, author })
            try {
                await newBook.save()
            } catch (error) {
                const inputError = new UserInputError(error.message, {
                    invalidArgs: args,
                })
                console.log(inputError)
                throw inputError
            }
            return newBook
        },

        editAuthor: async (root, args) => {
            try {
                const author = await Author.findOneAndUpdate({ name: args.name }, { $set: { born: args.setBornTo } }, { returnDocument: "after" })
                return author
            } catch (error) {
                const inputError = new UserInputError(error.message, {
                    invalidArgs: args,
                })
                console.log(inputError)
                throw inputError
            }
        }
    }
}

connect().then(() => {
    seed()
})

const server = new ApolloServer({
    typeDefs,
    resolvers,
})

server.listen().then(({ url }) => {
    console.log(`Server ready at ${url}`)
})
