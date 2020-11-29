// Base Scalar types
interface Scalar {
  String: string;
  Int: number;
  Float: number;
  Boolean: boolean;
  ID: any;
  [key: string]: any;
}

// Parses the scalar string into a primitive type
type ParseScalar<T> = T extends keyof Scalar ? Scalar[T] : never;

// Parses whether the type is an array or a scalar
type ParseType<T> =
  T extends `[${infer U}]`
    ? GraphQLRequired<U>[]
    : ParseScalar<T>;

// Transforms the type if it is optional or not
type GraphQLRequired<T> =
  T extends `${infer U}!`
    ? ParseType<U>
    : 
  T extends `${infer U}`
    ? ParseType<U> | null | undefined
    : T;

// Map key-value to a native object
type GraphQLField<K extends string, V> =
  { [key in K]: GraphQLRequired<V> };

type GraphQLConsume<K extends string, V, Rest> =
  GraphQLField<K, V> & GraphQLContent<Rest>;

type GraphQLContent<T> =
  T extends `${infer K}:${infer V};${infer Rest}`
    ? GraphQLConsume<K, V, Rest>
    :
  T extends `${infer K}:${infer V}`
    ? GraphQLField<K, V>
    : {};

type GraphQLMinify<T> =
  // Remove spaces before colons
  T extends `${infer A} :${infer B}`
    ? GraphQLMinify<`${A}:${GraphQLMinify<B>}`>
    :
  // Remove spaces after colons
  T extends `${infer A}: ${infer B}`
    ? GraphQLMinify<`${A}:${GraphQLMinify<B>}`>
    :
  // Remove spaces before semicolons
  T extends `${infer A} ;${infer B}`
    ? GraphQLMinify<`${A};${GraphQLMinify<B>}`>
    :
  // Remove spaces after semicolons
  T extends `${infer A}; ${infer B}`
    ? GraphQLMinify<`${A};${GraphQLMinify<B>}`>
    :
  // Remove spaces before exclamation marks
  T extends `${infer A} !${infer B}`
    ? GraphQLMinify<`${A}!${GraphQLMinify<B>}`>
    :
  // Remove replace space after exclamation mark with semicolons
  T extends `${infer A}! ${infer B}`
    ? GraphQLMinify<`${A}!;${GraphQLMinify<B>}`>
    :
  // Remove newlines before colons
  T extends `${infer A}\n:${infer B}`
    ? GraphQLMinify<`${A}:${GraphQLMinify<B>}`>
    :
  // Remove newlines after colons
  T extends `${infer A}:\n${infer B}`
    ? GraphQLMinify<`${A}:${GraphQLMinify<B>}`>
    :
  // Remove newlines before semicolons
  T extends `${infer A}\n;${infer B}`
    ? GraphQLMinify<`${A};${GraphQLMinify<B>}`>
    :
  // Remove newlines after semicolons
  T extends `${infer A};\n${infer B}`
    ? GraphQLMinify<`${A};${GraphQLMinify<B>}`>
    :
  // Remove newlines before left bracket
  T extends `${infer A}\n[${infer B}`
    ? GraphQLMinify<`${A};${GraphQLMinify<B>}`>
    :
  // Remove newlines after left bracket
  T extends `${infer A}[\n${infer B}`
    ? GraphQLMinify<`${A};${GraphQLMinify<B>}`>
    :
  // Remove spaces before left bracket
  T extends `${infer A} [${infer B}`
    ? GraphQLMinify<`${A};${GraphQLMinify<B>}`>
    :
  // Remove newlines after left bracket
  T extends `${infer A}[ ${infer B}`
    ? GraphQLMinify<`${A};${GraphQLMinify<B>}`>
    :
  // Remove newlines before right bracket
  T extends `${infer A}\n]${infer B}`
    ? GraphQLMinify<`${A};${GraphQLMinify<B>}`>
    :
  // Remove newlines after right bracket
  T extends `${infer A}]\n${infer B}`
    ? GraphQLMinify<`${A};${GraphQLMinify<B>}`>
    :
  // Remove spaces before right bracket
  T extends `${infer A} ]${infer B}`
    ? GraphQLMinify<`${A};${GraphQLMinify<B>}`>
    :
  // Remove newlines after right bracket
  T extends `${infer A}] ${infer B}`
    ? GraphQLMinify<`${A};${GraphQLMinify<B>}`>
    :
  // Remove trailing newlines
  T extends `\n${infer A}`
    ? GraphQLMinify<A>
    : 
  T extends `\n${infer A} `
    ? GraphQLMinify<A>
    :
  // Remove trailing spaces
  T extends ` ${infer A}`
    ? GraphQLMinify<A>
    : 
  T extends `${infer A} `
    ? GraphQLMinify<A>
    :
  // Remove trailing semicolons
  T extends `;${infer A}`
    ? GraphQLMinify<A>
    : 
  T extends `${infer A};`
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

export type GraphQL<T> = Readonly<
  T extends `{${infer Content}}`
    ? GraphQLContent<GraphQLMinify<Content>>
    : never
>;

