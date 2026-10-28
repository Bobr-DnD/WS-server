import { ValidationError } from './errors.js'

const PATH_PATTERN = /^\/([^/]+)$/

export function applyPatchOps(ops) {
    if (!Array.isArray(ops) || ops.length === 0) {
        throw new ValidationError('Patch must include at least one operation')
    }

    const result = {}

    for (const entry of ops) {
        const { op, path, value } = entry ?? {}

        if (op !== 'replace') {
            throw new ValidationError(`Unsupported patch operation: ${op}`)
        }

        const match = PATH_PATTERN.exec(path ?? '')
        if (!match) {
            throw new ValidationError(`Unsupported patch path: ${path}`)
        }

        result[match[1]] = value
    }

    return result
}
