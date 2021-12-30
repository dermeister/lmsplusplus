export function combineClassNames(...classNames: (string | undefined)[]): string {
    return classNames.filter(c => c !== undefined).join(" ")
}

export function maybeValue<T>(value: T, condition: boolean): T | undefined {
    if (condition)
        return value
}
