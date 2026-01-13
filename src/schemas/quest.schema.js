import mongoose from "mongoose"

const questSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Quest should have a name'],
        trim: true
    },
    description:{
        type: String,
        required: [true, 'Quest should have a descritpion'],
        trim: true
    },
    status: {
        type: String,
        required: [true, 'Quest should have a descritpion'],
        trim: true
    },
    reward: {
        type: String,
        trim: true
    },
    steps: {
        type: [Object],
        id:{
            type: String
        },
        name: {
            type: String,
            trim: true,
            default: null
        },
        status: {
            type: String,
            trim: true,
            default: null
        }
    },
    notes:{
        type: String,
        default: ''
    }
}, {
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
})


export default mongoose.model('Quest', questSchema)