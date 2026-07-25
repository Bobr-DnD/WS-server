import mongoose from 'mongoose'
import loadoutsSchema from '../schemasTypes/loadouts.schema.js';
import healthSchema from '../schemasTypes/health.schema.js';
import currencySchema from '../schemasTypes/currency.schema.js';
import customField from '../schemasTypes/customField.schema.js'
import characteristics from '../schemasTypes/characteristics.schema.js';

const characterSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Character should have a name'],
        trim: true
    },
    session: {
        type: mongoose.Schema.ObjectId,
        ref: 'Session',
        require: [true, 'Character should have a session']
    },
    image: {
        type: String,
        trim: true,
        default: null
    },
    gender: {
        type: String,
        trim: true,
        default: null
    },
    class: {
        type: String,
        trim: true,
        default: null
    },
    race: {
        type: String,
        trim: true,
        default: null
    },
    level: {
        type: Number,
        default: 0
    },
    experience: {
        type: Number,
        default: 0
    },
    experienceToLevelUp: {
        type: Number,
        default: 10
    },
    perkPoints: {
        type: Number,
        default: 0
    },
    adminNotes: {
        type: String,
        default: null
    },
    playerNotes: {
        type: String,
        default: null
    },
    characteristics: {
        type: [characteristics],
        default: null
    },
    currency: {
        type: [currencySchema],
        default: null
    },
    customFields: {
        type: [customField],
        default: null
    },
    health: {
        type: [healthSchema],
        default: [],
    },
    effects: {
        type: [mongoose.Schema.ObjectId],
        ref: 'Effect',
        default: []
    },
    perks: {
        type: [mongoose.Schema.ObjectId],
        ref: 'Perk',
        default: []
    },
    entities: {
        type: [mongoose.Schema.ObjectId],
        ref: 'Entity',
        default: []
    },
    loadouts: {
        type: [loadoutsSchema],
        default: []
    }
},
    {
        toJSON: { virtuals: true },
        toObject: { virtuals: true }
    });

characterSchema.virtual('characteristicsComputed').get(function () {
    return this._characteristicsComputed
})

characterSchema.virtual('id').get(function () {
    return this._id.toString()
})

export default mongoose.model('Character', characterSchema)
