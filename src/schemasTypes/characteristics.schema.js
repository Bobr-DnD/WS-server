import mongoose from "mongoose";

const characteristics = new mongoose.Schema(
    {
        name: String,
        value: String,
    },
    {
        toJSON: { virtuals: true },
        toObject: { virtuals: true }
    }
)

characteristics.virtual('id').get(function () {
    return this._id.toString()
})

export default characteristics