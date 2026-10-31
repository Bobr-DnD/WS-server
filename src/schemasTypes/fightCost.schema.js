import mongoose from "mongoose"

// Shared by Fight.actionPoints ('fixed' | 'characterField') and
// Fight.attackCost ('fixed' | 'activeWeapon') - same shape, different
// meaning for `source` and `fieldName` depending on which one it's used for.
const fightCostSchema = new mongoose.Schema(
    {
        source: {
            type: String,
            default: 'fixed'
        },
        fixedAmount: {
            type: Number,
            default: 0
        },
        fieldName: {
            type: String,
            trim: true,
            default: null
        }
    },
    { _id: false }
)

export default fightCostSchema
