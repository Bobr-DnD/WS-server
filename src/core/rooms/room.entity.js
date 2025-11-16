class Room {
    constructor(id) {
        this.id = id;
        this.members = new Map();
    }

    addMember(socketId, role) {
        this.members.set(socketId, { role: role || 'user' });
        return this;
    }

    removeMember(socketId) {
        const deleted = this.members.delete(socketId);
        if (deleted) return this;

        return null;
    }

    hasMember(socketId) {
        return this.members.has(socketId);
    }

    connectCharacterToMember(socketId, userId) {
        const member = this.members.get(socketId);
        if (member) {
            member.userId = userId;
            return this;
        }

        return null;
    }

    disconnectCharacterFromMember(socketId) {
        const member = this.members.get(socketId);
        if (member) {
            member.userId = null;
            return this;
        }

        return null;
    }

    getCharacterBySocketId(socketId) {
        const member = this.members.get(socketId);
        if (member) {
            return member.userId;
        }

        return null;
    }

    get size() {
        return this.members.size;
    }

    toJSON() {
        return {
            id: this.id,
            members: Array.from(this.members)
        };
    }
}

export default Room;
