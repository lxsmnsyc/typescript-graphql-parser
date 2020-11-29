// Base Scalar types
interface Scalar {
  String: string;
  Int: number;
  Float: number;
  Boolean: boolean;
  ID: any;
}

// Parses the scalar string into a primitive type
type ParseScalar<T, E extends Record<string, any> = {}> =
    T extends keyof Scalar
        ? Scalar[T]
        :
    T extends keyof E
        ? E[T]
        : never;

// Parses whether the type is an array or a scalar
type ParseArray<T, E extends Record<string, any> = {}> =
  T extends `[${infer U}]`
    ? ParseType<U, E>[]
    : ParseScalar<T, E>;

// Transforms the type if it is optional or not
type ParseType<T, E extends Record<string, any> = {}> =
  T extends `${infer U}!`
    ? ParseArray<U, E>
    : ParseArray<T, E> | null | undefined;


type GraphQLParams<T, E extends Record<string, any> = {}> =
  T extends `${string}:${infer V},${infer R}`
    ? [ParseType<V, E>, ...GraphQLParams<R, E>]
    :
  T extends `${string}:${infer V}`
    ? [ParseType<V, E>]
    : [];

// Map key-value to a native object
type GraphQLField<T, E extends Record<string, any> = {}> =
  T extends `${infer K}(${infer P}):${infer V}`
    ? { [key in K]: (...params: GraphQLParams<P, E>) => ParseType<V, E> }
    :
  T extends `${infer K}:${infer V}`
    ? { [key in K]: ParseType<V, E> }
    : {};

type GraphQLContent<T, E extends Record<string, any> = {}> =
    T extends `${infer Field} ${infer Rest}`
        ? GraphQLField<Field, E> & GraphQLContent<Rest, E>
        :
    T extends string
        ? GraphQLField<T, E>
        : {};

type GraphQLEnum<T> =
    T extends `${infer V} ${infer Rest}`
        ? V | GraphQLEnum<Rest>
        :
    T extends `${infer V} `
        ? V
        : T;

type GraphQLMinify<T> =
  // Remove spaces before colons
  T extends `${infer A} ,${infer B}`
    ? GraphQLMinify<`${A},${GraphQLMinify<B>}`>
    :
  // Remove spaces after colons
  T extends `${infer A}, ${infer B}`
    ? GraphQLMinify<`${A},${GraphQLMinify<B>}`>
    :
  // Remove spaces before colons
  T extends `${infer A} :${infer B}`
    ? GraphQLMinify<`${A}:${GraphQLMinify<B>}`>
    :
  // Remove spaces after colons
  T extends `${infer A}: ${infer B}`
    ? GraphQLMinify<`${A}:${GraphQLMinify<B>}`>
    :
  // Remove spaces before exclamation marks
  T extends `${infer A} !${infer B}`
    ? GraphQLMinify<`${A}!${GraphQLMinify<B>}`>
    :
  // Remove replace space after exclamation mark with semicolons
  T extends `${infer A}!  ${infer B}`
    ? GraphQLMinify<`${A}! ${GraphQLMinify<B>}`>
    :
  // Remove spaces before left bracket
  T extends `${infer A} [${infer B}`
    ? GraphQLMinify<`${A}[${GraphQLMinify<B>}`>
    :
  // Remove newlines after left bracket
  T extends `${infer A}[ ${infer B}`
    ? GraphQLMinify<`${A}[${GraphQLMinify<B>}`>
    :
  // Remove spaces before right bracket
  T extends `${infer A} ]${infer B}`
    ? GraphQLMinify<`${A}]${GraphQLMinify<B>}`>
    :
  // Remove newlines after right bracket
  T extends `${infer A}]  ${infer B}`
    ? GraphQLMinify<`${A}] ${GraphQLMinify<B>}`>
    :
  // Remove trailing newlines
  T extends `\n${infer A}`
    ? GraphQLMinify<A>
    : 
  T extends `${infer A}\n`
    ? GraphQLMinify<A>
    :
  // Remove trailing spaces
  T extends ` ${infer A}`
    ? GraphQLMinify<A>
    : 
  T extends `${infer A} `
    ? GraphQLMinify<A>
    :
  // Recursively remove spaces in between to make it single space
  T extends `${infer A}  ${infer B}`
    ? GraphQLMinify<`${A} ${GraphQLMinify<B>}`>
    :
  // Recursively remove newline in between to make it single space
  T extends `${infer A}\n${infer B}`
    ? GraphQLMinify<`${A} ${GraphQLMinify<B>}`>
    : T;

type GraphQL<T, E extends Record<string, any> = {}> = Readonly<
  T extends `{${infer Content}}`
    ? GraphQLContent<GraphQLMinify<Content>, E>
    :
  T extends `enum{${infer Content}}`
    ? GraphQLEnum<GraphQLMinify<Content>>
    : never
>;

type Test = GraphQL<`{
  numSides: Int!
  roll(numRolls: Int!): [Int]
  rollOnce: Int!
}`>;

type Episode = GraphQL<`enum{
  NEWHOPE
  EMPIRE
  JEDI
}`>;

type Character = GraphQL<`{
  id: ID!
  name: String!
  friends: [Character]
  appearsIn: [Episode]!
}`, {
  Character: Character,
  Episode: Episode,
}>;
