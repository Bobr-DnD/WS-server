import Character from '../schemas/character.schema.js';
import { populateCharacter } from '../utils/entityPopulator.js';
import { sortByTwoFields, sortPerksByTwoFields } from '../utils/filtration.js';
import { applyEffects } from '../utils/characterHelper.js';
import { DatabaseError } from '../utils/errors.js';

export const getCharacterName = async (characterId) => {
    const characterName = await Character.findById(characterId).select('name');
    if (!characterName) {
        throw new DatabaseError('Character not found');
    }
    return characterName.name;
};

export const updateCharacter = async (characterData) => {
    const character = await populateCharacter(
        Character.findByIdAndUpdate(characterData.id, characterData, { new: true, runValidators: true })
    ).exec();

    if (!character) throw new DatabaseError('Character not found')

    sortFields(character)
    applyEffects(character)

    return character
}

export const getCharacter = async (characterId) => {
    const character = await populateCharacter(
        Character.findById(characterId)
    ).exec();

    if (!character) throw new DatabaseError('Character not found')

    sortFields(character)
    applyEffects(character)

    return character
}


function sortFields(character) {
    sortPerksByTwoFields(character.perks, 'name', 'name')
    sortByTwoFields(character.entities, 'type', 'name')
}