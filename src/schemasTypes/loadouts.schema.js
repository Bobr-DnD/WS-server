import mongoose from "mongoose"

const loadoutsSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            trim: true
        },
        itemsIds: {
            type: [mongoose.Schema.ObjectId],
            ref: 'Entity',
            default: null
        },
        perksIds: {
            type: [mongoose.Schema.ObjectId],
            ref: 'Perk',
            default: null
        },
    },
    {
        toJSON: { virtuals: true },
        toObject: { virtuals: true }
    }
)

loadoutsSchema.virtual('id').get(function () {
    return this._id.toString()
})

export default loadoutsSchema