import mongoose from "mongoose";

const healthSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            trim: true
        },
        min: {
            type: Number,
            default: 0
        },
        max: {
            type: Number,
            default: 25
        },
        value: {
            type: Number,
            default: 25
        },
        colors: Array,
    },
    {
        toJSON: { virtuals: true },
        toObject: { virtuals: true }
    }
)

healthSchema.virtual('id').get(function () {
    return this._id.toString()
})

export default healthSchema