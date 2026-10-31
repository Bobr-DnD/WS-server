import mongoose from "mongoose"

const fightOverlaySchema = new mongoose.Schema(
    {
        type: {
            type: String,
            enum: ['grid', 'radial'],
            default: 'grid'
        },
        grid: {
            cols: { type: Number, default: 10 },
            rows: { type: Number, default: 10 },
            x: { type: Number, default: 0 },
            y: { type: Number, default: 0 },
            w: { type: Number, default: 100 },
            h: { type: Number, default: 100 }
        },
        radial: {
            cx: { type: Number, default: 50 },
            cy: { type: Number, default: 50 },
            rings: { type: Number, default: 5 },
            sectorsPerRing: { type: Number, default: 8 },
            maxRadius: { type: Number, default: 50 }
        }
    },
    { _id: false }
)

export default fightOverlaySchema
