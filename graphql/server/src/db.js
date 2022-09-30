const { default: mongoose } = require("mongoose")

const MONGODB_URI = `mongodb+srv://${process.env.MONGO_USERNAME}:${process.env.MONGO_PASSWORD}@${process.env.MONGO_CLUSTERNAME}.hrl4vln.mongodb.net/?retryWrites=true&w=majority`

const connect = async () => {
    console.log('connecting to', MONGODB_URI)
    try {
        await mongoose.connect(MONGODB_URI)
        console.log('connected to MongoDB')
    } catch (error) {
        console.log('error connection to MongoDB:', error.message)
        throw error
    }
}

module.exports = { connect }