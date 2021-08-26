export function combineClassNames(...classNames: (string | undefined)[]): string {
  let result = ""
  for (const className of classNames)
    if (className)
      result += ` ${className}`
  return result
}

export function valueOrUndefined<T>(value: T, condition: boolean): T | undefined {
  if (condition)
    return value
}
