import mongoose, { mongo } from 'mongoose';

const sessionSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Session should have a name'],
        trim: true
    },
    image:{
        type: String,
        trim: true
    },
    currency: {
        type: Object,
        default: null
    },
    move: {
        type: Number,
        default: 0
    },
    customFields: {
        type: Object,
        default: null
    },
    adminNotes:{
        type: Array,
        default: null
    },
    characters: {
        type: [mongoose.Schema.ObjectId],
        ref: 'Character',
        default: []
    },
    armors:{
        type: [mongoose.Schema.ObjectId],
        ref: 'Armor',
        default: []
    },
    enemies:{
        type: [mongoose.Schema.ObjectId],
        ref: 'Enemy',
        default: []
    },
    inventories:{
        type: [mongoose.Schema.ObjectId],
        ref: 'Inventory',
        default: []
    },
    medicines:{
        type: [mongoose.Schema.ObjectId],
        ref: 'Medicine',
        default: []
    },
    perks:{
        type: [mongoose.Schema.ObjectId],
        ref: 'Perk',
        default: []
    },
    weapons:{
        type: [mongoose.Schema.ObjectId],
        ref: 'Weapon',
        default: []
    },
    effects:{
        type: [mongoose.Schema.ObjectId],
        ref: 'Effect',
        default: []
    },
    fractions: {
        type: [mongoose.Schema.ObjectId],
        ref: 'Fraction',
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
});

export default mongoose.model('Session', sessionSchema);
