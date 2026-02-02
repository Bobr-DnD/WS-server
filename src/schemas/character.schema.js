import mongoose from 'mongoose'

const characterSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Character should have a name'],
        unique: false,
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
        type: Object,
        default: null
    },
    currency: {
        type: [Object],
        default: null
    },
    customFields: {
        type: Object,
        default: null
    },
    health: {
        type: [Object],
        default: [],
    },
    effects: {
        type: [mongoose.Schema.ObjectId],
        ref: 'Effect',
        default: [],
        effect: Object,
        timeLeft: Number
    },
    quests: {
        type: [mongoose.Schema.ObjectId],
        ref: 'Quest',
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
},
    {
        toJSON: { virtuals: true },
        toObject: { virtuals: true }
    });

characterSchema.virtual('characteristicsComputed').get(function () {
    return this._characteristicsComputed
})

export default mongoose.model('Character', characterSchema)
