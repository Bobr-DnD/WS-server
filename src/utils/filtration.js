export function sortByTwoFields(array, primaryField, secondaryField){
    array.sort((a, b) => {
        const keyA = `${a[primaryField]}-${a[secondaryField]}`
        const keyB = `${b[primaryField]}-${b[secondaryField]}`
        return keyA.localeCompare(keyB, 'uk')
    })

    return array
}

export function sortPerksByTwoFields(array, primaryField, secondaryField){
    array.sort((a, b) => {
        const keyA = `${a.type[primaryField]}-${a[secondaryField]}`
        const keyB = `${b.type[primaryField]}-${b[secondaryField]}`
        return keyA.localeCompare(keyB, 'uk')
    })

    return array
}

//TODO fix after api server fix id virtuals for objects
export function transformId(doc) {
    if (!doc) return doc
    const { _id, ...rest } = doc
    
    return { id: _id.toString(), ...rest }
}

export function transformArray(docs) {
    return docs.map(transformId)
}