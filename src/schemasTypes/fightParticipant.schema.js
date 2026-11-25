import mongoose from "mongoose"
import fightPositionSchema from "./fightPosition.schema.js"

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
