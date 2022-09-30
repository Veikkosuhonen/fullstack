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
        allBooks: async (root, { author, genre }) => Book.find({}),
        allAuthors: async () => Author.find({})
    },
    Mutation: {
        addBook: async (root, args) => {
            const author = await Author.findOne({ name: args.author })
            if (!author) {
                throw new UserInputError("Author not found", {
                    invalidArgs: args,
                })
            }
            const newBook = new Book({ ...args, author })
            try {
                await newBook.save()
            } catch (error) {
                throw new UserInputError("Book could not be saved", {
                    invalidArgs: args,
                    error,
                })
            }
            return newBook
        },

        editAuthor: async (root, args) => {
            const author = await Author.find({ name: args.name })
            if (!author) {
                return null
            }
            author.born = args.setBornTo
            try {
                await author.save()
            } catch (error) {
                throw new UserInputError(error.message, {
                    invalidArgs: args,
                })
            }
            return author
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