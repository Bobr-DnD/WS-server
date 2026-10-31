import mongoose from "mongoose"

const fightPendingActionSchema = new mongoose.Schema(
    {
        targetEnemy: {
            type: mongoose.Schema.ObjectId,
            default: null
        },
        targetHealthId: {
            type: String,
            default: null
        },
        weapon: {
            type: mongoose.Schema.ObjectId,
            ref: 'Entity',
            default: null
        },
        rollMode: {
            type: String,
            enum: ['virtual', 'manual'],
            default: 'virtual'
        },
        dice: {
            type: [{ die: String, count: Number, _id: false }],
            default: []
        },
        modifier: {
            type: Number,
            default: 0
        },
        manualTotal: {
            type: Number,
            default: null
        },
        total: {
            type: Number,
            default: null
        },
        apSpent: {
            type: Number,
            default: 0
        },
        readiedAt: {
            type: Date,
            default: null
        }
    },
    { _id: false }
)

export default fightPendingActionSchema
