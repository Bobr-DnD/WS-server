import Session from '../schemas/session.schema.js';
import { populateSession } from '../utils/entityPopulator.js';
import { transformArray } from '../utils/IDConverter.js';
import { sortByTwoFields, sortPerksByTwoFields } from '../utils/filtration.js';
import { DatabaseError } from '../utils/errors.js';
import { applyEffects } from '../utils/characterHelper.js';

export const getSessionMove = async (sessionId) => {
    const session = await Session.findById(sessionId);
    if (!session) {
        throw new DatabaseError('Session not found');
    }
    return session.move;
};

export const updateSessionMove = async (sessionId, moveValue) => {
    const session = await Session.findById(sessionId);
    if (!session) {
        throw new DatabaseError('Session not found');
    }
    session.move = session.move + Number(moveValue);

    await session.save();
    return session.move;
};

export const getSessionCharactersIds = async (sessionId) => {
    const session = await Session.findById(sessionId);
    if (!session) {
        throw new DatabaseError('Session not found');
    }
    return session.characters;
};

export const getSessionName = async (sessionId) => {    
    const sessionName = await Session.findById(sessionId).select('name');
    if (!sessionName) {
        throw new DatabaseError('Session not found');
    }
    return sessionName.name;
};

export const getSession = async (sessionId) => {
    const session = await populateSession(
        Session.findById(sessionId)
    ).exec();

    if (!session) throw new DatabaseError('Session not found')

    SortAndTransform(session)
    session.characters.forEach(character => {
        applyEffects(character)
    })

    return session
}

export const updateSession = async (sessionData) => {
    const session = await populateSession(
        Session.findByIdAndUpdate(sessionData.id, sessionData, { new: true, runValidators: true })
    ).exec();

    if (!session) throw new DatabaseError('Session not found')

    SortAndTransform(session)
    session.characters.forEach(character => {
        applyEffects(character)
    })

    return session
}

function SortAndTransform(session) {
    transformArray(session.characters)

    sortByTwoFields(session.entities, 'type', 'name')
    sortPerksByTwoFields(session.perks, 'name', 'name')

    session.characters.map(ch => {
        sortPerksByTwoFields(ch.perks, 'name', 'name')
        sortByTwoFields(ch.entities, 'type', 'name')
    })
}
