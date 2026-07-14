import mongoose, { mongo } from "mongoose";

const perkTypeSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            trim: true
        },
        color: {
            type: String,
            trim: true
        }
    },
    {
        toJSON: { virtuals: true },
        toObject: { virtuals: true }

    }
)

perkTypeSchema.virtual('id').get(function () {
    return this._id.toString()
})

export default perkTypeSchema