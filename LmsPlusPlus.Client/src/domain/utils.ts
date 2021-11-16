export type Fields<T> = Partial<{ [k in keyof T]: T[k] }>
