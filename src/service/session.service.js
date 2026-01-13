import Session from '../schemas/session.schema.js';
import { populateSession } from '../utils/entityPopulator.js';
import { transformArray } from '../utils/IdConverter.js';
import { sortByTwoFields } from '../utils/filtration.js';
import { DatabaseError } from '../utils/errors.js';

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
    return session
}

export const updateSession = async (sessionData) => {
    const session = await populateSession(
        Session.findByIdAndUpdate(sessionData.id, sessionData, { new: true, runValidators: true })
    ).exec();

    if (!session) throw new DatabaseError('Session not found')

    SortAndTransform(session)
    return session
}

function SortAndTransform(session){
    transformArray(session.characters)

    sortByTwoFields(session.entities, 'type', 'name')
    sortByTwoFields(session.perks, 'type', 'name')

    session.characters.map(ch => {
        sortByTwoFields(ch.perks, 'type', 'name')
        sortByTwoFields(ch.entities, 'type', 'name')
    })
}
