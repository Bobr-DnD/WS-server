const IGNORED_FIELDS = new Set(['_id', '__v', 'id'])

export function computeDiff(previous, patch) {
    if (!previous || !patch) return null

    const diff = {}

    Object.keys(patch).forEach((key) => {
        if (IGNORED_FIELDS.has(key)) return

        const before = previous[key]
        const after = patch[key]

        if (JSON.stringify(before) !== JSON.stringify(after)) {
            diff[key] = { from: before, to: after }
        }
    })

    return Object.keys(diff).length ? diff : null
}
