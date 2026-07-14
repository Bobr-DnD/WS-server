import mongoose from "mongoose"

const loadoutsLimitSchema = new mongoose.Schema(
    {
        loadouts: {
            type: Number,
            default: null,
            min: 1
        },
        items: {
            type: Number,
            default: null,
            min: 1
        },
        perks: {
            type: Number,
            default: null,
            min: 1
        }
    },
    {
        toJSON: { virtuals: true },
        toObject: { virtuals: true }
    }
)

loadoutsLimitSchema.virtual('id').get(function () {
    return this._id.toString()
})

export default loadoutsLimitSchema