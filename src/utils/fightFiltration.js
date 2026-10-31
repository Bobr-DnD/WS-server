// Players share one live battle map, so participants/positions/AP stay fully
// visible to everyone - only two things are admin-only: an enemy's private
// notes, and enemies the admin hasn't revealed yet.
export function toPlayerFight(fight) {
    if (!fight) return fight

    const plain = typeof fight.toObject === 'function' ? fight.toObject({ virtuals: true }) : fight

    return {
        ...plain,
        enemies: (plain.enemies || [])
            .filter(enemy => enemy.visibleToPlayers !== false)
            .map(({ notes, ...rest }) => rest)
    }
}
