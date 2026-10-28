import mongoose from 'mongoose'
import Entity from '../schemas/entity.schema.js'
import Perk from '../schemas/perk.schema.js'

const DEFAULT_FORMATTER = (field) => `Оновлено поле "${field}"`

function formatScalar(label) {
    return (from, to) => `${label}: ${from ?? '—'} → ${to ?? '—'}`
}

function formatCountChange(label) {
    return (from, to) => {
        const fromCount = Array.isArray(from) ? from.length : 0
        const toCount = Array.isArray(to) ? to.length : 0
        if (fromCount === toCount) return `${label} оновлено`
        return `${label}: ${fromCount} → ${toCount}`
    }
}

function formatHealth(from, to) {
    const prevByName = new Map((from || []).map(h => [h.name, h]))
    const messages = []

    ;(to || []).forEach((h) => {
        const prev = prevByName.get(h.name)
        if (!prev) {
            messages.push(`Додано поле здоров'я "${h.name}" (${h.value}/${h.max})`)
            return
        }
        if (prev.value !== h.value) {
            messages.push(`"${h.name}": ${prev.value} → ${h.value}`)
        }
        prevByName.delete(h.name)
    })

    prevByName.forEach((h) => messages.push(`Видалено поле здоров'я "${h.name}"`))

    return messages.length ? messages.join(', ') : null
}

function refId(item) {
    // Raw (unpopulated) refs are bson ObjectId instances, which have their own
    // `.id` property holding the raw byte buffer - not a hex string - so that
    // case must be handled before falling back to plain-object `.id`/`._id`.
    if (item instanceof mongoose.Types.ObjectId) return item.toString()
    return String(item?.id ?? item?._id ?? item)
}

// `from` is the unpopulated character doc's raw ObjectId array (only ids),
// `to` is whatever the frontend sent - the full populated objects it already
// had in memory - so added items already carry a name; only removed ids need
// a lookup.
function formatRefCollection(label, Model) {
    return async (from, to) => {
        const fromIds = new Set((from || []).map(refId))
        const toList = to || []
        const toIds = new Set(toList.map(refId))

        const addedNames = toList
            .filter(item => !fromIds.has(refId(item)))
            .map(item => item?.name)
            .filter(Boolean)

        const removedIds = [...fromIds].filter(id => !toIds.has(id))
        const removedNames = removedIds.length
            ? (await Model.find({ _id: { $in: removedIds } }).select('name').lean()).map(doc => doc.name)
            : []

        const parts = []
        if (addedNames.length) parts.push(`Додано: ${addedNames.join(', ')}`)
        if (removedNames.length) parts.push(`Видалено: ${removedNames.join(', ')}`)

        return parts.length ? parts.join('; ') : `${label} оновлено`
    }
}

export const FIELD_LOG_FORMATTERS = {
    name: formatScalar("Ім'я"),
    level: formatScalar('Рівень'),
    experience: formatScalar('Досвід'),
    perkPoints: formatScalar('Очки навичок'),
    health: formatHealth,
    entities: formatRefCollection('Предмети', Entity),
    perks: formatRefCollection('Навички', Perk),
    customFields: formatCountChange('Додаткові поля'),
    currency: () => 'Оновлено валюту',
    loadouts: () => 'Оновлено профілі спорядження',
    playerNotes: () => 'Оновлено нотатки гравця',
    adminNotes: () => 'Оновлено нотатки адміна',
    image: () => 'Оновлено зображення',
}

export async function formatDiffMessage(diff) {
    if (!diff) return null

    const messages = await Promise.all(
        Object.entries(diff).map(async ([field, change]) => {
            const { from, to } = change || {}
            const formatter = FIELD_LOG_FORMATTERS[field]

            try {
                return formatter ? await formatter(from, to) : DEFAULT_FORMATTER(field)
            } catch {
                return DEFAULT_FORMATTER(field)
            }
        })
    )

    const filtered = messages.filter(Boolean)
    return filtered.length ? filtered.join('; ') : null
}
