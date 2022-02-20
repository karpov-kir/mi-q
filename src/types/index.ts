// https://stackoverflow.com/questions/67538416/restrict-generic-type-t-to-specific-types
export type Exact<A, B> = A extends B ? (B extends A ? true : false) : false;
export type EnforceExact<Constraint, T> = Exact<Constraint, T> extends true ? T : never;
