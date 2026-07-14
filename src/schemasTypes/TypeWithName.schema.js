import mongoose from "mongoose";

const nameType = new mongoose.Schema(
    {
        name: {
            type: String,
            trim: true
        }
    },
    {
        toJSON: { virtuals: true },
        toObject: { virtuals: true }
    }
)

nameType.virtual('id').get(function () {
    return this._id.toString()
})

export default nameType