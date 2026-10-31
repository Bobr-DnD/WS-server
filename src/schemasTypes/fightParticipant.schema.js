import mongoose from "mongoose"
import fightPositionSchema from "./fightPosition.schema.js"
import fightPendingActionSchema from "./fightPendingAction.schema.js"

const fightParticipantSchema = new mongoose.Schema(
    {
        character: {
            type: mongoose.Schema.ObjectId,
            ref: 'Character',
            required: [true, 'Participant should reference a character']
        },
        position: {
            type: fightPositionSchema,
            default: () => ({})
        },
        actionPoints: {
            max: { type: Number, default: 0 },
            current: { type: Number, default: 0 }
        },
        activeLoadout: {
            type: mongoose.Schema.ObjectId,
            default: null
        },
        activeWeapon: {
            type: mongoose.Schema.ObjectId,
            ref: 'Entity',
            default: null
        },
        ready: {
            type: Boolean,
            default: false
        },
        pendingAction: {
            type: fightPendingActionSchema,
            default: null
        }
    },
    {
        toJSON: { virtuals: true },
        toObject: { virtuals: true }
    }
)

fightParticipantSchema.virtual('id').get(function () {
    return this._id.toString()
})

export default fightParticipantSchema
