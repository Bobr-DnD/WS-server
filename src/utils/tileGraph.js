// Tile ids encode their own coordinates so the server never needs a separate
// coordinate lookup table: grid tiles are "r{row}c{col}", radial tiles are
// "ring{n}-sector{s}" (or just "ring0" for the single center tile - ring 0
// isn't divided into sectors). With movement no longer AP/path-gated, this
// file only needs to hand out a sensible default spawn point - the actual
// grid geometry is purely a client-side rendering concern now.

export function gridTileId(row, col) {
    return `r${row}c${col}`
}

export function getCenterTileId(overlay) {
    if (overlay?.type === 'radial') return 'ring0'

    const cols = overlay?.grid?.cols ?? 10
    const rows = overlay?.grid?.rows ?? 10
    return gridTileId(Math.floor(rows / 2), Math.floor(cols / 2))
}
