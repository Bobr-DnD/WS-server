import mongoose from "mongoose";

const entitySchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Entity should have a name'],
        trim: true
    },
    type: {
        type: String,
        required: [true, 'Entity should have a type'],
        trim: true
    },
    description: {
        type: String,
        required: [true, 'Entity should have a description'],
        trim: true
    },
    image: {
        type: String,
        default: null
    },
    notes: {
        type: String,
        default: null
    },
    characteristics: {
        type: Object,
        default: null,
    },
    requirement: {
        type: Object,
        default: null
    },
    effects: {
        type: [mongoose.Schema.ObjectId],
        ref: "Effect",
        default: []
    },
    price: {
        type: Number,
        default: null
    },
    rarity: {
        type: String,
        default: null
    }

},
    {
        toJSON: { virtuals: true },
        toObject: { virtuals: true }
    })

export default mongoose.model('Entity', entitySchema);