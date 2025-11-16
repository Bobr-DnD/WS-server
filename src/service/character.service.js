import Character from '../schemas/character.session.js';
import { DatabaseError } from '../utils/errors.js';

export const getCharacterName = async (characterId) => {
    const characterName = await Character.findById(characterId).select('name');
    if (!characterName) {
        throw new DatabaseError('Character not found');
    }
    return characterName.name;
};
