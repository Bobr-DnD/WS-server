import mongoose from 'mongoose'

const wsLogSchema = new mongoose.Schema({
    event: {
        type: String,
        required: true
    },
    sessionId: {
        type: String,
        default: null
    },
    characterId: {
        type: String,
        default: null
    },
    role: {
        type: String,
        default: null
    },
    socketId: {
        type: String,
        default: null
    },
    payload: {
        type: String,
        default: null
    },
    message: {
        type: String,
        default: null
    },
    createdAt: {
        type: Date,
        default: Date.now,
        expires: '14d'
    }
}, {
    versionKey: false
})

wsLogSchema.index({ sessionId: 1, createdAt: -1 })

export default mongoose.model('WsLog', wsLogSchema, 'wslogs')
