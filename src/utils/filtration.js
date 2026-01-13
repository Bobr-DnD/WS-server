export function sortByTwoFields(array, primaryField, secondaryField){
    array.sort((a, b) => {
        const keyA = `${a[primaryField]}-${a[secondaryField]}`
        const keyB = `${b[primaryField]}-${b[secondaryField]}`
        return keyA.localeCompare(keyB, 'uk')
    })

    return array
}