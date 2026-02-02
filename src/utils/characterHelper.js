export function applyEffects(character) {
    character._characteristicsComputed = structuredClone(character.characteristics)
    character.effects.forEach(effect => {
        Object.entries(effect.effect).map(([key, value]) => character._characteristicsComputed[key] += value)
    });
}