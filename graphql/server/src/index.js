require('dotenv').config()
const { ApolloServer, gql, UserInputError, AuthenticationError, ForbiddenError } = require('apollo-server')
const { v4: uuid } = require('uuid')
const jwt = require('jsonwebtoken')
const { connect } = require('./db')
const { Book, Author, User } = require('./models')
const { seed } = require('./seed')

const JWT_SECRET = 'NEED_HERE_A_SECRET_KEY'

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

    type User {
        username: String!
        favoriteGenre: String!
        id: ID!
    }
    
    type Token {
        value: String!
    }

    type Query {
        bookCount: Int!
        authorCount: Int!
        allBooks(author: String, genre: String): [Book!]!
        allAuthors: [Author!]!
        me: User
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

        createUser(
            username: String!
            favoriteGenre: String!
        ): User
        login(
            username: String!
            password: String!
        ): Token
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

        allAuthors: async () => Author.find({}).populate('bookCount'),

        me: async (root, args, context) => context.currentUser

    },

    Mutation: {

        addBook: async (root, args, context) => {
            if (!context.currentUser) {
                throw new ForbiddenError('You must be logged in')
            }

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

        editAuthor: async (root, args, context) => {
            if (!context.currentUser) {
                throw new ForbiddenError('You must be logged in')
            }

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
        },

        createUser: async (root, args, context) => {
            try {
                const user = new User({ username: args.username })
                return await user.save()
            } catch(error) {
                const inputError = new UserInputError(error.message, {
                    invalidArgs: args,
                })
                console.log(inputError)
                throw inputError
            }
        },

        login: async (root, args) => {
            const user = await User.findOne({ username: args.username })

            if ( !user || args.password !== 'secret' ) {
                throw new UserInputError("wrong credentials")
            }

            const userForToken = {
                username: user.username,
                id: user._id,
            }

            return { value: jwt.sign(userForToken, JWT_SECRET) }
        }
    }
}

const context = async ({ req }) => {
    const auth = req ? req.headers.authorization : null
    if (auth && auth.toLowerCase().startsWith('bearer ')) {
        const decodedToken = jwt.verify(auth.substring(7), JWT_SECRET)
        const currentUser = await User.findById(decodedToken.id)
        return { currentUser }
    }
}


connect().then(() => {
    seed()
})

const server = new ApolloServer({
    typeDefs,
    resolvers,
    context,
})

server.listen().then(({ url }) => {
    console.log(`Server ready at ${url}`)
})
