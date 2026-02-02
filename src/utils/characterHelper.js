export function applyEffects(character) {
    character._characteristicsComputed = Object.fromEntries(
        Object.entries(character.characteristics).map(([key, value]) => {
            if (!Number.isNaN(Number(value))) {
                return [key, Number(value)]
            }
            return [key, value]
        })
    )

    character.effects.forEach(effect => {
        Object.entries(effect.effect).map(([key, value]) => {
            if(!Number.isNaN(Number(character._characteristicsComputed[key]))) character._characteristicsComputed[key] += value
        
        //TODO copy from API server
        })
    });
}