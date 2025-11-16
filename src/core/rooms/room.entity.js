class Room {
    constructor(id) {
        this.id = id;
        this.members = new Set();
    }

    addMember(socketId) {
        this.members.add(socketId);
    }

    removeMember(socketId) {
        const deleted = this.members.delete(socketId);
        if (deleted) return this;

        return null;
    }

    hasMember(socketId) {
        return this.members.has(socketId);
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
