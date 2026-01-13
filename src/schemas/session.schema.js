import mongoose from "mongoose";

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
    //TODO probably move is not important field
    // move: {
    //     type: Number,
    //     default: 0
    // },
    customFields: {
        type: Object,
        default: {}
    },
    notes: {
        type: String,
        default: null
    },
    entityTypes: {
        type: [Object],
        default: [],
        id: String,
        icon: String,
        name: String
    },
    currencyTypes: {
        type: [Object],
        default: [],
        id: String,
        name: String,
        icon: String
    },
    characteristicsList: {
        type: [Object],
        default: [],
        id: String,
        name: String
    },
    questTypes: {
        type: [Object],
        default: [],
        id: String,
        name: String
    },
    perkTypes:{
        type: [Object],
        default: [],
        id: String,
        name: String,
        color: String
    },
    enemyTypes: {
        type: [Object],
        default: [],
        id: String,
        name: String,
        icon: String
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
    enemies: {
        type: [mongoose.Schema.ObjectId],
        ref: 'Enemy',
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
    quests: {
        type: [mongoose.Schema.ObjectId],
        ref: 'Quest',
        default: []
    }
}, {
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
})


export default mongoose.model('Session', sessionSchema)