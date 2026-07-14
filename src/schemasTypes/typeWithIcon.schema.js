import mongoose from "mongoose";

const iconType = new mongoose.Schema(
    {
        name: {
            type: String,
            trim: true
        },
        icon: {
            type: String,
            trim: true
        }
    },
    {
        toJSON: { virtuals: true },
        toObject: { virtuals: true }
    }
)

iconType.virtual('id').get(function () {
    return this._id.toString()
})

export default iconType