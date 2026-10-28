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

export const FIELD_LOG_FORMATTERS = {
    name: formatScalar("Ім'я"),
    level: formatScalar('Рівень'),
    experience: formatScalar('Досвід'),
    perkPoints: formatScalar('Очки навичок'),
    health: formatHealth,
    entities: formatCountChange('Предмети'),
    perks: formatCountChange('Навички'),
    customFields: formatCountChange('Додаткові поля'),
    currency: () => 'Оновлено валюту',
    loadouts: () => 'Оновлено профілі спорядження',
    playerNotes: () => 'Оновлено нотатки гравця',
    adminNotes: () => 'Оновлено нотатки адміна',
    image: () => 'Оновлено зображення',
}

export function formatDiffMessage(diff) {
    if (!diff) return null

    const messages = Object.entries(diff)
        .map(([field, change]) => {
            const { from, to } = change || {}
            const formatter = FIELD_LOG_FORMATTERS[field]

            try {
                return formatter ? formatter(from, to) : DEFAULT_FORMATTER(field)
            } catch {
                return DEFAULT_FORMATTER(field)
            }
        })
        .filter(Boolean)

    return messages.length ? messages.join('; ') : null
}
