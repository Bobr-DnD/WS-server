import Perk from '../schemas/perk.schema.js';
import Effect from '../schemas/effect.schema.js'
import Entity from '../schemas/entity.schema.js'
import Quest from '../schemas/quest.schema.js'
import Character from '../schemas/character.schema.js'


export function populateCharacter(query) {
    return query.populate([
        'perks',
        'effects',
        'entities',
        'quests',
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
        'quests',
        { path: 'characters', populate: ['entities', 'perks', 'quests', 'effects', { path: 'entities', populate: ['effects'] }] },
        { path: 'entities', populate: ['effects'] },
    ])
}