import mongoose from "mongoose";

const colorType = new mongoose.Schema(
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

colorType.virtual('id').get(function () {
    return this._id.toString()
})

export default colorType