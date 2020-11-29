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

// Map key-value to a native object
type GraphQLField<K extends string, V, E extends Record<string, any> = {}> =
  { [key in K]: ParseType<V, E> };

type GraphQLConsume<K extends string, V, Rest, E extends Record<string, any> = {}> =
  GraphQLField<K, V, E> & GraphQLContent<Rest, E>;

type GraphQLContent<T, E extends Record<string, any> = {}> =
  T extends `${infer K}:${infer V} ${infer Rest}`
    ? GraphQLConsume<K, V, Rest, E>
    :
  T extends `${infer K}:${infer V}`
    ? GraphQLField<K, V, E>
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
  // Remove newlines before colons
  T extends `${infer A}\n:${infer B}`
    ? GraphQLMinify<`${A}:${GraphQLMinify<B>}`>
    :
  // Remove newlines after colons
  T extends `${infer A}:\n${infer B}`
    ? GraphQLMinify<`${A}:${GraphQLMinify<B>}`>
    :
  // Remove newlines before left bracket
  T extends `${infer A}\n[${infer B}`
    ? GraphQLMinify<`${A}[${GraphQLMinify<B>}`>
    :
  // Remove newlines after left bracket
  T extends `${infer A}[\n${infer B}`
    ? GraphQLMinify<`${A}[${GraphQLMinify<B>}`>
    :
  // Remove spaces before left bracket
  T extends `${infer A} [${infer B}`
    ? GraphQLMinify<`${A}[${GraphQLMinify<B>}`>
    :
  // Remove newlines after left bracket
  T extends `${infer A}[ ${infer B}`
    ? GraphQLMinify<`${A}[${GraphQLMinify<B>}`>
    :
  // Remove newlines before right bracket
  T extends `${infer A}\n]${infer B}`
    ? GraphQLMinify<`${A}]${GraphQLMinify<B>}`>
    :
  // Remove newlines after right bracket
  T extends `${infer A}]\n${infer B}`
    ? GraphQLMinify<`${A}] ${GraphQLMinify<B>}`>
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

type Test = GraphQLMinify<`{
  id: ID!
  name: String!
  friends: [Character]
  appearsIn: [Episode]!
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