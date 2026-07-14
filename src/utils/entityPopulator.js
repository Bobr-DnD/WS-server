import Perk from '../schemas/perk.schema.js';
import Effect from '../schemas/effect.schema.js'
import Entity from '../schemas/entity.schema.js'
import Character from '../schemas/character.schema.js'


export function populateCharacter(query) {
    return query.populate([
        'perks',
        'effects',
        'entities',
        { path: 'entities', populate: ['effects'] }
    ]);
}

export function populateSession(query) {
    return query.populate([
        'characters',
        'entities',
        'perks',
        'effects',
        'perks',
        { path: 'characters', populate: ['entities', 'perks', 'effects', { path: 'entities', populate: ['effects'] }] },
        { path: 'entities', populate: ['effects'] },
    ])
}