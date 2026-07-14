import mongoose from "mongoose";

const customField = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, 'Field should have a name'],
            trim: true
        },
        description: {
            type: String,
            trim: true
        },
        value: {
            type: mongoose.Schema.Types.Mixed,
            validate: {
                validator: function (v) {
                    return ['string', 'number'].includes(typeof v);
                },
                message: 'Field must be string or number',

            },
            required: true
        }
    },
    {
        toJSON: { virtuals: true },
        toObject: { virtuals: true }
    }
)

customField.virtual('id').get(function () {
    return this._id.toString()
})

export default customField