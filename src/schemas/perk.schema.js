import mongoose from "mongoose"

const perkSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Perk should have a name'],
        trim: true
    },
    descriptions: {
        type: [String],
        required: [true, 'Perk should have a description'],
        trim: true
    },
    requirement: {
        type: Object,
        default: null
    },
    ranks: {
        type: Number,
        default: 0
    },
    type: {
        type: Object,
        name: String,
        color: String
    },
    notes: {
        type: String,
        default: null
    }
},
    {
        toJSON: { virtuals: true },
        toObject: { virtuals: true }
    })


export default mongoose.model('Perk', perkSchema)