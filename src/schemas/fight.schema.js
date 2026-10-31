import mongoose from 'mongoose'
import fightOverlaySchema from '../schemasTypes/fightOverlay.schema.js'
import fightTileSchema from '../schemasTypes/fightTile.schema.js'
import fightCostSchema from '../schemasTypes/fightCost.schema.js'
import fightEnemySchema from '../schemasTypes/fightEnemy.schema.js'
import fightParticipantSchema from '../schemasTypes/fightParticipant.schema.js'

const fightSchema = new mongoose.Schema({
    session: {
        type: mongoose.Schema.ObjectId,
        ref: 'Session',
        required: [true, 'Fight should have a session']
    },
    name: {
        type: String,
        required: [true, 'Fight should have a name'],
        trim: true
    },
    isActive: {
        type: Boolean,
        default: false
    },
    background: {
        image: { type: String, default: null },
        width: { type: Number, default: null },
        height: { type: Number, default: null }
    },
    overlay: {
        type: fightOverlaySchema,
        default: () => ({})
    },
    tiles: {
        type: [fightTileSchema],
        default: []
    },
    actionPoints: {
        type: fightCostSchema,
        default: () => ({ source: 'fixed', fixedAmount: 3 })
    },
    attackCost: {
        type: fightCostSchema,
        default: () => ({ source: 'fixed', fixedAmount: 1 })
    },
    weaponDamageFieldName: {
        type: String,
        trim: true,
        default: 'damageDice'
    },
    enemies: {
        type: [fightEnemySchema],
        default: []
    },
    participants: {
        type: [fightParticipantSchema],
        default: []
    }
},
    {
        toJSON: { virtuals: true },
        toObject: { virtuals: true }
    });

fightSchema.virtual('id').get(function () {
    return this._id.toString()
})

export default mongoose.model('Fight', fightSchema)
