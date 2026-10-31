// Tile ids encode their own coordinates so the server never needs a separate
// coordinate lookup table: grid tiles are "r{row}c{col}", radial tiles are
// "ring{n}-sector{s}" (or just "ring0" for the single center tile - ring 0
// isn't divided into sectors).
const GRID_ID = /^r(\d+)c(\d+)$/
const RADIAL_SECTOR_ID = /^ring(\d+)-sector(\d+)$/

export function parseTileId(tileId) {
    if (typeof tileId !== 'string') return null

    const gridMatch = GRID_ID.exec(tileId)
    if (gridMatch) return { kind: 'grid', row: Number(gridMatch[1]), col: Number(gridMatch[2]) }

    if (tileId === 'ring0') return { kind: 'radial', ring: 0, sector: null }

    const radialMatch = RADIAL_SECTOR_ID.exec(tileId)
    if (radialMatch) return { kind: 'radial', ring: Number(radialMatch[1]), sector: Number(radialMatch[2]) }

    return null
}

export function gridTileId(row, col) {
    return `r${row}c${col}`
}

export function radialTileId(ring, sector) {
    return ring === 0 ? 'ring0' : `ring${ring}-sector${sector}`
}

export function getCenterTileId(overlay) {
    if (overlay?.type === 'radial') return 'ring0'

    const cols = overlay?.grid?.cols ?? 10
    const rows = overlay?.grid?.rows ?? 10
    return gridTileId(Math.floor(rows / 2), Math.floor(cols / 2))
}

function gridNeighbors(parsed, overlay) {
    const cols = overlay?.grid?.cols ?? 10
    const rows = overlay?.grid?.rows ?? 10
    const neighbors = []

    for (let dRow = -1; dRow <= 1; dRow++) {
        for (let dCol = -1; dCol <= 1; dCol++) {
            if (dRow === 0 && dCol === 0) continue
            const row = parsed.row + dRow
            const col = parsed.col + dCol
            if (row < 0 || row >= rows || col < 0 || col >= cols) continue
            neighbors.push(gridTileId(row, col))
        }
    }

    return neighbors
}

function radialNeighbors(parsed, overlay) {
    const rings = overlay?.radial?.rings ?? 5
    const sectorsPerRing = overlay?.radial?.sectorsPerRing ?? 8
    const neighbors = []

    if (parsed.ring === 0) {
        for (let s = 0; s < sectorsPerRing; s++) neighbors.push(radialTileId(1, s))
        return neighbors
    }

    const prevSector = (parsed.sector - 1 + sectorsPerRing) % sectorsPerRing
    const nextSector = (parsed.sector + 1) % sectorsPerRing
    neighbors.push(radialTileId(parsed.ring, prevSector))
    neighbors.push(radialTileId(parsed.ring, nextSector))

    neighbors.push(parsed.ring === 1 ? 'ring0' : radialTileId(parsed.ring - 1, parsed.sector))
    if (parsed.ring < rings) neighbors.push(radialTileId(parsed.ring + 1, parsed.sector))

    return neighbors
}

export function getNeighborTileIds(tileId, overlay) {
    const parsed = parseTileId(tileId)
    if (!parsed) return []

    return parsed.kind === 'grid' ? gridNeighbors(parsed, overlay) : radialNeighbors(parsed, overlay)
}

// Dijkstra shortest-cost path between two tiles. Edge cost = weight of the
// tile being ENTERED (the tile you start on never counts - you're already
// standing there). Blocked tiles are simply never reachable as a destination
// and are skipped as stepping stones, so a path can never cross one.
// Not heap-based - fine for the tile counts a hand-authored battle map has.
export function findPathCost(fromTileId, toTileId, overlay, tiles) {
    if (fromTileId === toTileId) return 0

    const tileById = new Map((tiles || []).map(t => [t.id, t]))
    const targetTile = tileById.get(toTileId)
    if (!targetTile || targetTile.blocked) return null

    const distances = new Map([[fromTileId, 0]])
    const visited = new Set()
    const queue = [[fromTileId, 0]]

    while (queue.length) {
        queue.sort((a, b) => a[1] - b[1])
        const [current, currentDist] = queue.shift()

        if (visited.has(current)) continue
        visited.add(current)

        if (current === toTileId) return currentDist

        for (const neighborId of getNeighborTileIds(current, overlay)) {
            const neighborTile = tileById.get(neighborId)
            if (!neighborTile || neighborTile.blocked) continue

            const cost = currentDist + (neighborTile.weight ?? 1)
            if (cost < (distances.get(neighborId) ?? Infinity)) {
                distances.set(neighborId, cost)
                queue.push([neighborId, cost])
            }
        }
    }

    return null
}
