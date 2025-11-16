class Room {
    constructor(id) {
        this.id = id;
        this.members = new Map();
    }

    addMember(socketId) {
        this.members.set(socketId, {});
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

    connectMemberToUser(socketId, userId) {
        this.members.get(socketId).userId = userId;
        return this;
    }

    disconnectMemberFromUser(socketId) {
        this.members.get(socketId).userId = null;
        return this;
    }

    getUserBySocketId(socketId) {
        return this.members.get(socketId).userId;
    }

    getSocketByUserId(userId) {
        for (const [socketId, member] of this.members) {
            if (member.userId === userId) {
                return socketId;
            }
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
