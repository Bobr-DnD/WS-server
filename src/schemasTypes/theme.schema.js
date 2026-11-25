import mongoose from "mongoose";

// Field names match the frontend's semantic Tailwind/CSS-var keys
// (tailwind.config.js `brand.*`, utils/themePresets.js in vueFtontEndService)
// instead of describing the raw hex look - so each is tied to a UI role
// (background, accent, text, ...) and can be re-themed independently.
// Defaults mirror the "Crimson Keep" preset, the frontend's default look.
const colorsSchema = new mongoose.Schema(
    {
        page: { type: String, trim: true, default: '#0D0D0D' },
        base: { type: String, trim: true, default: '#1A1A1A' },
        ink: { type: String, trim: true, default: '#1A1A1A' },
        surface: { type: String, trim: true, default: '#262220' },
        muted: { type: String, trim: true, default: '#8A8178' },
        subtle: { type: String, trim: true, default: '#C9C2B8' },
        faint: { type: String, trim: true, default: '#C9C2B8' },
        accent: { type: String, trim: true, default: '#A61C1C' },
        accentHover: { type: String, trim: true, default: '#E63946' },
        text: { type: String, trim: true, default: '#F2E9E4' },
        surfaceInverted: { type: String, trim: true, default: '#F2E9E4' },
        accentSecondary: { type: String, trim: true, default: '#40201A' }
    },
    { _id: false }
)

const themeSchema = new mongoose.Schema(
    {
        presetId: {
            type: String,
            trim: true,
            default: 'crimson-keep'
        },
        colors: {
            type: colorsSchema,
            default: () => ({})
        },
        faviconUrl: {
            type: String,
            trim: true,
            default: ''
        }
    },
    {
        toJSON: { virtuals: true },
        toObject: { virtuals: true }
    }
)

themeSchema.virtual('id').get(function () {
    return this._id.toString()
})

export default themeSchema
