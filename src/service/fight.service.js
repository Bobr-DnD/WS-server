import Fight from '../schemas/fight.schema.js'
import { getCharacter } from './character.service.js'
import { DatabaseError } from '../utils/errors.js'
import { getCenterTileId } from '../utils/tileGraph.js'
import { applyPatchOps } from '../utils/patchHelper.js'

export const getFight = async (fightId) => {
    const fight = await Fight.findById(fightId)
    if (!fight) throw new DatabaseError('Fight not found')
    return fight
}

export const getActiveFight = async (sessionId) => {
    return Fight.findOne({ session: sessionId, isActive: true })
}

function findParticipant(fight, characterId) {
    return fight.participants.find(p => p.character.toString() === characterId)
}

// Adds a participant entry the first time a character shows up in the
// currently active fight - position defaults to the overlay's center tile,
// same as a freshly-created enemy would if an admin hasn't moved it yet.
export const ensureParticipant = async (fightId, characterId) => {
    const fight = await getFight(fightId)

    if (findParticipant(fight, characterId)) return fight

    // Confirms the character actually exists before wiring it into the fight.
    await getCharacter(characterId)

    fight.participants.push({
        character: characterId,
        position: { tileId: getCenterTileId(fight.overlay) }
    })

    await fight.save()
    return fight
}

// Free-form repositioning, admin only - no AP, no path validation. The map
// is purely a shared board the admin arranges; players just see it update.
export const moveToken = async ({ fightId, targetType, targetId, tileId }) => {
    const fight = await getFight(fightId)

    if (targetType === 'enemy') {
        const enemy = fight.enemies.id(targetId)
        if (!enemy) throw new DatabaseError('Enemy not found')

        enemy.position.tileId = tileId
    } else {
        const participant = findParticipant(fight, targetId)
        if (!participant) throw new DatabaseError('Participant not found in this fight')

        participant.position.tileId = tileId
    }

    await fight.save()
    return fight
}

export const setActiveFight = async ({ sessionId, fightId }) => {
    await Fight.updateMany({ session: sessionId, _id: { $ne: fightId } }, { isActive: false })

    const fight = await Fight.findByIdAndUpdate(fightId, { isActive: true }, { new: true })
    if (!fight) throw new DatabaseError('Fight not found')

    return fight
}

export const deactivateFight = async (fightId) => {
    const fight = await Fight.findByIdAndUpdate(fightId, { isActive: false }, { new: true })
    if (!fight) throw new DatabaseError('Fight not found')

    return fight
}

export const adminUpdateFight = async (fightId, ops) => {
    const patch = applyPatchOps(ops)

    const fight = await Fight.findByIdAndUpdate(fightId, patch, { new: true, runValidators: true })
    if (!fight) throw new DatabaseError('Fight not found')

    return fight
}
