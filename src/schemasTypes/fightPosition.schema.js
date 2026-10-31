import mongoose from "mongoose"

const fightPositionSchema = new mongoose.Schema(
    {
        tileId: {
            type: String,
            default: null
        }
    },
    { _id: false }
)

export default fightPositionSchema
