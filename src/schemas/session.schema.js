import mongoose from "mongoose";
import loadoutLimitsSchema from '../schemasTypes/loadoutLimits.schema.js';
import iconType from "../schemasTypes/typeWithIcon.schema.js";
import colorType from "../schemasTypes/typeWithColor.schema.js"
import nameType from "../schemasTypes/TypeWithName.schema.js"
import customField from "../schemasTypes/customField.schema.js";

const sessionSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Session should have a name'],
        trim: true
    },
    image: {
        type: String,
        trim: true,
        default: null
    },
    password: {
        type: String,
        minLength: 8,
        select: false,
        required: [true, 'Session should have a password']
    },
    customFields: {
        type: [customField],
        default: []
    },
    notes: {
        type: String,
        default: null
    },
    entityTypes: {
        type: [iconType],
        default: [],
    },
    currencyTypes: {
        type: [iconType],
        default: []
    },
    characteristicsList: {
        type: [nameType],
        default: []
    },
    perkTypes: {
        type: [colorType],
        default: [],
    },
    characters: {
        type: [mongoose.Schema.ObjectId],
        ref: 'Character',
        default: []
    },
    entities: {
        type: [mongoose.Schema.ObjectId],
        ref: 'Entity',
        default: []
    },
    perks: {
        type: [mongoose.Schema.ObjectId],
        ref: 'Perk',
        default: []
    },
    effects: {
        type: [mongoose.Schema.ObjectId],
        ref: 'Effect',
        default: []
    },
    loadoutsLimit: {
        type: loadoutLimitsSchema,
        default: () => ({})
    }
}, {
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
})

export default mongoose.model('Session', sessionSchema)