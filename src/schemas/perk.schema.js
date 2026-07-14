import mongoose from "mongoose"
import perkTypeSchema from "../schemasTypes/perkType.schema.js"

const perkSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Perk should have a name'],
        trim: true
    },
    description:{
        type: String,
        required: [true, 'Perk should have a description'],
        trim: true
    },
    levels: {
        type: [],
        trim: true,
        default: []
    },
    type: {
        type: perkTypeSchema,
        required: [true, 'Perk should have a type']
    },
    requirement: {
        type: Object,
        default: null
    },
    ranks: {
        type: Number,
        default: 0
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