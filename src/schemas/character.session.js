import mongoose from 'mongoose';

const characterSchema = new mongoose.Schema({
        name: {
            type: String,
            required: [true, 'Character should have a name'],
            unique: false,
            trim: true
        },
        image: {
            type: String,
            trim: true,
            default: ''
        },
        gender: {
            type: String,
            default: null
        },
        class: {
            type: String,
            default: null
        },
        race: {
            type: String,
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
        health: {
            type: [Object],
            default: []
        },
        characteristics: {
            type: Object,
            default: null
        },
        customFields: {
            type: Object,
            default: null
        },
        effects: {
            type: [Object],
            default: null
        },
        adminNotes: {
            type: String,
            default: null
        },
        playerNotes: {
            type: String,
            default: null
        },
        session: {
            type: mongoose.Schema.ObjectId,
            ref: 'Session',
            require: [true, 'Character should have a session']
        },
        quests: {
            type: [mongoose.Schema.ObjectId],
            ref: 'Quest',
            default: []
        },
        weapons: {
            type: [mongoose.Schema.ObjectId],
            ref: 'Weapon',
            default: []
        },
        armor: {
            type: [mongoose.Schema.ObjectId],
            ref: 'Armor',
            default: []
        },
        perks: {
            type: [mongoose.Schema.ObjectId],
            ref: 'Perk',
            default: []
        },
        medicines: {
            type: [mongoose.Schema.ObjectId],
            ref: 'Medicine',
            default: []
        },
        inventory: {
            type: [mongoose.Schema.ObjectId],
            ref: 'Inventory',
            default: []
        }
    },
    {
        toJSON: { virtuals: true },
        toObject: { virtuals: true }
    });

export default mongoose.model('Character', characterSchema);
