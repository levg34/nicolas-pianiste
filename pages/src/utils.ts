export const prepareForDisplay = (input: any[]): [any, any][] => {
    const output: [any, any][] = []
    for (let i = 0; i < input.length; i += 2) {
        const pair = [input[i], input[i + 1] || null]
        output.push(pair as [any, any])
    }
    return output
}
