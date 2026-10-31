import mongoose from "mongoose"

const fightTileSchema = new mongoose.Schema(
    {
        id: {
            type: String,
            required: [true, 'Tile should have an id']
        },
        weight: {
            type: Number,
            default: 1,
            min: 0
        },
        blocked: {
            type: Boolean,
            default: false
        }
    },
    { _id: false }
)

export default fightTileSchema
