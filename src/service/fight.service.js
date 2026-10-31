import Fight from '../schemas/fight.schema.js'
import Entity from '../schemas/entity.schema.js'
import { getCharacter } from './character.service.js'
import { DatabaseError, ValidationError, AuthError } from '../utils/errors.js'
import { getCenterTileId, findPathCost } from '../utils/tileGraph.js'
import { applyPatchOps } from '../utils/patchHelper.js'

const DIE_SIDES = { d4: 4, d6: 6, d8: 8, d10: 10, d12: 12, d20: 20, d100: 100 }

export const getFight = async (fightId) => {
    const fight = await Fight.findById(fightId)
    if (!fight) throw new DatabaseError('Fight not found')
    return fight
}

export const getActiveFight = async (sessionId) => {
    return Fight.findOne({ session: sessionId, isActive: true })
}

function findParticipant(fight, characterId) {
    const participant = fight.participants.find(p => p.character.toString() === characterId)
    if (!participant) throw new DatabaseError('Participant not found in this fight')
    return participant
}

function resolveActionPoints(costConfig, character) {
    if (costConfig?.source === 'characterField' && costConfig.fieldName) {
        const field = (character.characteristics || []).find(c => c.name === costConfig.fieldName)
        const parsed = field ? Number(field.value) : NaN
        if (!Number.isNaN(parsed)) return parsed
    }
    return costConfig?.fixedAmount ?? 0
}

function resolveAttackCost(costConfig, weaponEntity) {
    if (costConfig?.source === 'activeWeapon' && costConfig.fieldName && weaponEntity?.characteristics) {
        const parsed = Number(weaponEntity.characteristics[costConfig.fieldName])
        if (!Number.isNaN(parsed)) return parsed
    }
    return costConfig?.fixedAmount ?? 0
}

// Adds a participant entry the first time a character shows up in the
// currently active fight - position defaults to the overlay's center tile,
// AP comes from the fight's actionPoints config (fixed, or read off a named
// character characteristic).
export const ensureParticipant = async (fightId, characterId) => {
    const fight = await getFight(fightId)

    if (fight.participants.some(p => p.character.toString() === characterId)) return fight

    const character = await getCharacter(characterId)
    const max = resolveActionPoints(fight.actionPoints, character)

    fight.participants.push({
        character: characterId,
        position: { tileId: getCenterTileId(fight.overlay) },
        actionPoints: { max, current: max },
        activeLoadout: character.loadouts?.[0]?.id ?? null,
        activeWeapon: null,
        ready: false,
        pendingAction: null
    })

    await fight.save()
    return fight
}

export const moveToken = async ({ fightId, targetType, targetId, tileId, isAdmin }) => {
    const fight = await getFight(fightId)

    const tile = fight.tiles.find(t => t.id === tileId)
    if (!tile || tile.blocked) throw new ValidationError('Target tile is not available')

    if (targetType === 'enemy') {
        if (!isAdmin) throw new AuthError('Only the admin can move enemies')

        const enemy = fight.enemies.id(targetId)
        if (!enemy) throw new DatabaseError('Enemy not found')

        enemy.position.tileId = tileId
        await fight.save()
        return fight
    }

    const participant = findParticipant(fight, targetId)

    if (!isAdmin) {
        const cost = findPathCost(participant.position.tileId, tileId, fight.overlay, fight.tiles)
        if (cost === null) throw new ValidationError('No path to that tile')
        if (cost > participant.actionPoints.current) throw new ValidationError('Not enough action points')

        participant.actionPoints.current -= cost
    }

    participant.position.tileId = tileId
    await fight.save()
    return fight
}

export const setActiveLoadout = async ({ fightId, characterId, loadoutId }) => {
    const fight = await getFight(fightId)
    const participant = findParticipant(fight, characterId)

    if (loadoutId !== null) {
        const character = await getCharacter(characterId)
        const exists = character.loadouts?.some(l => l.id === loadoutId)
        if (!exists) throw new ValidationError('Loadout does not belong to this character')
    }

    participant.activeLoadout = loadoutId
    participant.activeWeapon = null
    await fight.save()
    return fight
}

export const setActiveWeapon = async ({ fightId, characterId, entityId }) => {
    const fight = await getFight(fightId)
    const participant = findParticipant(fight, characterId)

    if (entityId !== null) {
        const character = await getCharacter(characterId)
        const loadout = character.loadouts?.find(l => l.id === participant.activeLoadout?.toString())
        const belongsToLoadout = loadout?.itemsIds?.some(id => id.toString() === entityId)
        if (!belongsToLoadout) throw new ValidationError('Weapon must be part of the active loadout')
    }

    participant.activeWeapon = entityId
    await fight.save()
    return fight
}

function rollVirtualDice(dice) {
    let total = 0
    const rolled = []

    for (const entry of dice || []) {
        const sides = DIE_SIDES[entry?.die]
        if (!sides) continue

        const count = Math.max(0, Math.min(20, Number(entry.count) || 0))
        const rolls = Array.from({ length: count }, () => Math.floor(Math.random() * sides) + 1)

        rolled.push({ die: entry.die, count, rolls })
        total += rolls.reduce((sum, r) => sum + r, 0)
    }

    return { rolled, total }
}

export const readyAttack = async ({ fightId, characterId, targetEnemy, targetHealthId, rollMode, dice, modifier, manualTotal }) => {
    const fight = await getFight(fightId)
    const participant = findParticipant(fight, characterId)

    if (participant.ready) throw new ValidationError('Already readying an action')

    const enemy = fight.enemies.id(targetEnemy)
    if (!enemy) throw new DatabaseError('Target enemy not found')
    if (!enemy.health.id(targetHealthId)) throw new ValidationError('Target health bar not found on this enemy')

    const weaponEntity = participant.activeWeapon
        ? await Entity.findById(participant.activeWeapon).lean()
        : null

    const cost = resolveAttackCost(fight.attackCost, weaponEntity)
    if (cost > participant.actionPoints.current) throw new ValidationError('Not enough action points')

    const mod = Number(modifier) || 0
    let total
    let rolled = []

    if (rollMode === 'manual') {
        total = Number(manualTotal)
        if (!Number.isFinite(total)) throw new ValidationError('Manual roll result must be a number')
    } else {
        const result = rollVirtualDice(dice)
        rolled = result.rolled
        total = result.total + mod
    }

    participant.actionPoints.current -= cost
    participant.ready = true
    participant.pendingAction = {
        targetEnemy,
        targetHealthId,
        weapon: participant.activeWeapon,
        rollMode: rollMode === 'manual' ? 'manual' : 'virtual',
        dice: rollMode === 'manual' ? [] : (dice || []),
        modifier: mod,
        manualTotal: rollMode === 'manual' ? total : null,
        total,
        apSpent: cost,
        readiedAt: new Date()
    }

    await fight.save()
    return { fight, rolled, total, cost }
}

export const cancelReady = async ({ fightId, characterId }) => {
    const fight = await getFight(fightId)
    const participant = findParticipant(fight, characterId)

    if (!participant.ready || !participant.pendingAction) return fight

    participant.actionPoints.current = Math.min(
        participant.actionPoints.max,
        participant.actionPoints.current + (participant.pendingAction.apSpent || 0)
    )
    participant.ready = false
    participant.pendingAction = null

    await fight.save()
    return fight
}

// approve: auto-deducts the readied roll total from the targeted enemy's
// health bar. reject: refunds the AP that was spent readying the attack -
// nothing was applied yet, so there's nothing on the enemy side to undo.
export const resolveAttack = async ({ fightId, characterId, approve }) => {
    const fight = await getFight(fightId)
    const participant = findParticipant(fight, characterId)

    if (!participant.ready || !participant.pendingAction) throw new ValidationError('No pending action to resolve')

    const pending = participant.pendingAction

    if (approve) {
        const enemy = fight.enemies.id(pending.targetEnemy)
        const healthBar = enemy?.health.id(pending.targetHealthId)
        if (healthBar) {
            const min = healthBar.min ?? 0
            const max = healthBar.max ?? healthBar.value
            healthBar.value = Math.max(min, Math.min(max, healthBar.value - pending.total))
        }
    } else {
        participant.actionPoints.current = Math.min(
            participant.actionPoints.max,
            participant.actionPoints.current + (pending.apSpent || 0)
        )
    }

    participant.ready = false
    participant.pendingAction = null

    await fight.save()
    return fight
}

export const adminSetAP = async ({ fightId, characterId, current, max }) => {
    const fight = await getFight(fightId)
    const participant = findParticipant(fight, characterId)

    if (typeof max === 'number') participant.actionPoints.max = max
    if (typeof current === 'number') participant.actionPoints.current = current

    await fight.save()
    return fight
}

// Admin-triggered round reset - refills every participant's AP and clears
// any action they were mid-readying (there is no fixed turn order, so "new
// round" is the only reset point for free-form AP-gated play).
export const newRound = async (fightId) => {
    const fight = await getFight(fightId)

    fight.participants.forEach(p => {
        p.actionPoints.current = p.actionPoints.max
        p.ready = false
        p.pendingAction = null
    })

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
