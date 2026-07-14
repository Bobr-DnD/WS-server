import mongoose from "mongoose";

const currencySchema = new mongoose.Schema(
    {
        name: {
            type: String,
            timr: true
        },
        value: {
            type: Number,
            default: 0
        },
        icon: {
            type: String,
            default: 'currencyDollar'
        }
    },
    {
        toJSON: { virtuals: true },
        toObject: { virtuals: true }
    }
)

currencySchema.virtual('id').get(function () {
    return this._id.toString()
})

export default currencySchema