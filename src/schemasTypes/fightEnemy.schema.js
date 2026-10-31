import mongoose from "mongoose"
import healthSchema from "./health.schema.js"
import fightPositionSchema from "./fightPosition.schema.js"

const fightEnemySchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, 'Enemy should have a name'],
            trim: true
        },
        image: {
            type: String,
            default: null
        },
        notes: {
            type: String,
            default: null
        },
        stats: {
            type: Object,
            default: null
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
        health: {
            type: [healthSchema],
            default: []
        },
        position: {
            type: fightPositionSchema,
            default: () => ({})
        },
        visibleToPlayers: {
            type: Boolean,
            default: true
        }
    },
    {
        toJSON: { virtuals: true },
        toObject: { virtuals: true }
    }
)

fightEnemySchema.virtual('id').get(function () {
    return this._id.toString()
})

export default fightEnemySchema
