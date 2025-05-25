
/**
 * Client
**/

import * as runtime from './runtime/library.js';
import $Types = runtime.Types // general types
import $Public = runtime.Types.Public
import $Utils = runtime.Types.Utils
import $Extensions = runtime.Types.Extensions
import $Result = runtime.Types.Result

export type PrismaPromise<T> = $Public.PrismaPromise<T>


/**
 * Model Invoice
 * 
 */
export type Invoice = $Result.DefaultSelection<Prisma.$InvoicePayload>
/**
 * Model Customer
 * 
 */
export type Customer = $Result.DefaultSelection<Prisma.$CustomerPayload>
/**
 * Model Supplier
 * 
 */
export type Supplier = $Result.DefaultSelection<Prisma.$SupplierPayload>
/**
 * Model Bank
 * 
 */
export type Bank = $Result.DefaultSelection<Prisma.$BankPayload>
/**
 * Model BankStatement
 * 
 */
export type BankStatement = $Result.DefaultSelection<Prisma.$BankStatementPayload>
/**
 * Model Transaction
 * 
 */
export type Transaction = $Result.DefaultSelection<Prisma.$TransactionPayload>

/**
 * ##  Prisma Client ʲˢ
 *
 * Type-safe database client for TypeScript & Node.js
 * @example
 * ```
 * const prisma = new PrismaClient()
 * // Fetch zero or more Invoices
 * const invoices = await prisma.invoice.findMany()
 * ```
 *
 *
 * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client).
 */
export class PrismaClient<
  ClientOptions extends Prisma.PrismaClientOptions = Prisma.PrismaClientOptions,
  U = 'log' extends keyof ClientOptions ? ClientOptions['log'] extends Array<Prisma.LogLevel | Prisma.LogDefinition> ? Prisma.GetEvents<ClientOptions['log']> : never : never,
  ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs
> {
  [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['other'] }

    /**
   * ##  Prisma Client ʲˢ
   *
   * Type-safe database client for TypeScript & Node.js
   * @example
   * ```
   * const prisma = new PrismaClient()
   * // Fetch zero or more Invoices
   * const invoices = await prisma.invoice.findMany()
   * ```
   *
   *
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client).
   */

  constructor(optionsArg ?: Prisma.Subset<ClientOptions, Prisma.PrismaClientOptions>);
  $on<V extends U>(eventType: V, callback: (event: V extends 'query' ? Prisma.QueryEvent : Prisma.LogEvent) => void): PrismaClient;

  /**
   * Connect with the database
   */
  $connect(): $Utils.JsPromise<void>;

  /**
   * Disconnect from the database
   */
  $disconnect(): $Utils.JsPromise<void>;

  /**
   * Add a middleware
   * @deprecated since 4.16.0. For new code, prefer client extensions instead.
   * @see https://pris.ly/d/extensions
   */
  $use(cb: Prisma.Middleware): void

/**
   * Executes a prepared raw query and returns the number of affected rows.
   * @example
   * ```
   * const result = await prisma.$executeRaw`UPDATE User SET cool = ${true} WHERE email = ${'user@email.com'};`
   * ```
   *
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
   */
  $executeRaw<T = unknown>(query: TemplateStringsArray | Prisma.Sql, ...values: any[]): Prisma.PrismaPromise<number>;

  /**
   * Executes a raw query and returns the number of affected rows.
   * Susceptible to SQL injections, see documentation.
   * @example
   * ```
   * const result = await prisma.$executeRawUnsafe('UPDATE User SET cool = $1 WHERE email = $2 ;', true, 'user@email.com')
   * ```
   *
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
   */
  $executeRawUnsafe<T = unknown>(query: string, ...values: any[]): Prisma.PrismaPromise<number>;

  /**
   * Performs a prepared raw query and returns the `SELECT` data.
   * @example
   * ```
   * const result = await prisma.$queryRaw`SELECT * FROM User WHERE id = ${1} OR email = ${'user@email.com'};`
   * ```
   *
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
   */
  $queryRaw<T = unknown>(query: TemplateStringsArray | Prisma.Sql, ...values: any[]): Prisma.PrismaPromise<T>;

  /**
   * Performs a raw query and returns the `SELECT` data.
   * Susceptible to SQL injections, see documentation.
   * @example
   * ```
   * const result = await prisma.$queryRawUnsafe('SELECT * FROM User WHERE id = $1 OR email = $2;', 1, 'user@email.com')
   * ```
   *
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
   */
  $queryRawUnsafe<T = unknown>(query: string, ...values: any[]): Prisma.PrismaPromise<T>;


  /**
   * Allows the running of a sequence of read/write operations that are guaranteed to either succeed or fail as a whole.
   * @example
   * ```
   * const [george, bob, alice] = await prisma.$transaction([
   *   prisma.user.create({ data: { name: 'George' } }),
   *   prisma.user.create({ data: { name: 'Bob' } }),
   *   prisma.user.create({ data: { name: 'Alice' } }),
   * ])
   * ```
   * 
   * Read more in our [docs](https://www.prisma.io/docs/concepts/components/prisma-client/transactions).
   */
  $transaction<P extends Prisma.PrismaPromise<any>[]>(arg: [...P], options?: { isolationLevel?: Prisma.TransactionIsolationLevel }): $Utils.JsPromise<runtime.Types.Utils.UnwrapTuple<P>>

  $transaction<R>(fn: (prisma: Omit<PrismaClient, runtime.ITXClientDenyList>) => $Utils.JsPromise<R>, options?: { maxWait?: number, timeout?: number, isolationLevel?: Prisma.TransactionIsolationLevel }): $Utils.JsPromise<R>


  $extends: $Extensions.ExtendsHook<"extends", Prisma.TypeMapCb<ClientOptions>, ExtArgs, $Utils.Call<Prisma.TypeMapCb<ClientOptions>, {
    extArgs: ExtArgs
  }>>

      /**
   * `prisma.invoice`: Exposes CRUD operations for the **Invoice** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Invoices
    * const invoices = await prisma.invoice.findMany()
    * ```
    */
  get invoice(): Prisma.InvoiceDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.customer`: Exposes CRUD operations for the **Customer** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Customers
    * const customers = await prisma.customer.findMany()
    * ```
    */
  get customer(): Prisma.CustomerDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.supplier`: Exposes CRUD operations for the **Supplier** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Suppliers
    * const suppliers = await prisma.supplier.findMany()
    * ```
    */
  get supplier(): Prisma.SupplierDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.bank`: Exposes CRUD operations for the **Bank** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Banks
    * const banks = await prisma.bank.findMany()
    * ```
    */
  get bank(): Prisma.BankDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.bankStatement`: Exposes CRUD operations for the **BankStatement** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more BankStatements
    * const bankStatements = await prisma.bankStatement.findMany()
    * ```
    */
  get bankStatement(): Prisma.BankStatementDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.transaction`: Exposes CRUD operations for the **Transaction** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Transactions
    * const transactions = await prisma.transaction.findMany()
    * ```
    */
  get transaction(): Prisma.TransactionDelegate<ExtArgs, ClientOptions>;
}

export namespace Prisma {
  export import DMMF = runtime.DMMF

  export type PrismaPromise<T> = $Public.PrismaPromise<T>

  /**
   * Validator
   */
  export import validator = runtime.Public.validator

  /**
   * Prisma Errors
   */
  export import PrismaClientKnownRequestError = runtime.PrismaClientKnownRequestError
  export import PrismaClientUnknownRequestError = runtime.PrismaClientUnknownRequestError
  export import PrismaClientRustPanicError = runtime.PrismaClientRustPanicError
  export import PrismaClientInitializationError = runtime.PrismaClientInitializationError
  export import PrismaClientValidationError = runtime.PrismaClientValidationError

  /**
   * Re-export of sql-template-tag
   */
  export import sql = runtime.sqltag
  export import empty = runtime.empty
  export import join = runtime.join
  export import raw = runtime.raw
  export import Sql = runtime.Sql



  /**
   * Decimal.js
   */
  export import Decimal = runtime.Decimal

  export type DecimalJsLike = runtime.DecimalJsLike

  /**
   * Metrics
   */
  export type Metrics = runtime.Metrics
  export type Metric<T> = runtime.Metric<T>
  export type MetricHistogram = runtime.MetricHistogram
  export type MetricHistogramBucket = runtime.MetricHistogramBucket

  /**
  * Extensions
  */
  export import Extension = $Extensions.UserArgs
  export import getExtensionContext = runtime.Extensions.getExtensionContext
  export import Args = $Public.Args
  export import Payload = $Public.Payload
  export import Result = $Public.Result
  export import Exact = $Public.Exact

  /**
   * Prisma Client JS version: 6.8.2
   * Query Engine version: 2060c79ba17c6bb9f5823312b6f6b7f4a845738e
   */
  export type PrismaVersion = {
    client: string
  }

  export const prismaVersion: PrismaVersion

  /**
   * Utility Types
   */


  export import JsonObject = runtime.JsonObject
  export import JsonArray = runtime.JsonArray
  export import JsonValue = runtime.JsonValue
  export import InputJsonObject = runtime.InputJsonObject
  export import InputJsonArray = runtime.InputJsonArray
  export import InputJsonValue = runtime.InputJsonValue

  /**
   * Types of the values used to represent different kinds of `null` values when working with JSON fields.
   *
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  namespace NullTypes {
    /**
    * Type of `Prisma.DbNull`.
    *
    * You cannot use other instances of this class. Please use the `Prisma.DbNull` value.
    *
    * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
    */
    class DbNull {
      private DbNull: never
      private constructor()
    }

    /**
    * Type of `Prisma.JsonNull`.
    *
    * You cannot use other instances of this class. Please use the `Prisma.JsonNull` value.
    *
    * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
    */
    class JsonNull {
      private JsonNull: never
      private constructor()
    }

    /**
    * Type of `Prisma.AnyNull`.
    *
    * You cannot use other instances of this class. Please use the `Prisma.AnyNull` value.
    *
    * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
    */
    class AnyNull {
      private AnyNull: never
      private constructor()
    }
  }

  /**
   * Helper for filtering JSON entries that have `null` on the database (empty on the db)
   *
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  export const DbNull: NullTypes.DbNull

  /**
   * Helper for filtering JSON entries that have JSON `null` values (not empty on the db)
   *
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  export const JsonNull: NullTypes.JsonNull

  /**
   * Helper for filtering JSON entries that are `Prisma.DbNull` or `Prisma.JsonNull`
   *
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  export const AnyNull: NullTypes.AnyNull

  type SelectAndInclude = {
    select: any
    include: any
  }

  type SelectAndOmit = {
    select: any
    omit: any
  }

  /**
   * Get the type of the value, that the Promise holds.
   */
  export type PromiseType<T extends PromiseLike<any>> = T extends PromiseLike<infer U> ? U : T;

  /**
   * Get the return type of a function which returns a Promise.
   */
  export type PromiseReturnType<T extends (...args: any) => $Utils.JsPromise<any>> = PromiseType<ReturnType<T>>

  /**
   * From T, pick a set of properties whose keys are in the union K
   */
  type Prisma__Pick<T, K extends keyof T> = {
      [P in K]: T[P];
  };


  export type Enumerable<T> = T | Array<T>;

  export type RequiredKeys<T> = {
    [K in keyof T]-?: {} extends Prisma__Pick<T, K> ? never : K
  }[keyof T]

  export type TruthyKeys<T> = keyof {
    [K in keyof T as T[K] extends false | undefined | null ? never : K]: K
  }

  export type TrueKeys<T> = TruthyKeys<Prisma__Pick<T, RequiredKeys<T>>>

  /**
   * Subset
   * @desc From `T` pick properties that exist in `U`. Simple version of Intersection
   */
  export type Subset<T, U> = {
    [key in keyof T]: key extends keyof U ? T[key] : never;
  };

  /**
   * SelectSubset
   * @desc From `T` pick properties that exist in `U`. Simple version of Intersection.
   * Additionally, it validates, if both select and include are present. If the case, it errors.
   */
  export type SelectSubset<T, U> = {
    [key in keyof T]: key extends keyof U ? T[key] : never
  } &
    (T extends SelectAndInclude
      ? 'Please either choose `select` or `include`.'
      : T extends SelectAndOmit
        ? 'Please either choose `select` or `omit`.'
        : {})

  /**
   * Subset + Intersection
   * @desc From `T` pick properties that exist in `U` and intersect `K`
   */
  export type SubsetIntersection<T, U, K> = {
    [key in keyof T]: key extends keyof U ? T[key] : never
  } &
    K

  type Without<T, U> = { [P in Exclude<keyof T, keyof U>]?: never };

  /**
   * XOR is needed to have a real mutually exclusive union type
   * https://stackoverflow.com/questions/42123407/does-typescript-support-mutually-exclusive-types
   */
  type XOR<T, U> =
    T extends object ?
    U extends object ?
      (Without<T, U> & U) | (Without<U, T> & T)
    : U : T


  /**
   * Is T a Record?
   */
  type IsObject<T extends any> = T extends Array<any>
  ? False
  : T extends Date
  ? False
  : T extends Uint8Array
  ? False
  : T extends BigInt
  ? False
  : T extends object
  ? True
  : False


  /**
   * If it's T[], return T
   */
  export type UnEnumerate<T extends unknown> = T extends Array<infer U> ? U : T

  /**
   * From ts-toolbelt
   */

  type __Either<O extends object, K extends Key> = Omit<O, K> &
    {
      // Merge all but K
      [P in K]: Prisma__Pick<O, P & keyof O> // With K possibilities
    }[K]

  type EitherStrict<O extends object, K extends Key> = Strict<__Either<O, K>>

  type EitherLoose<O extends object, K extends Key> = ComputeRaw<__Either<O, K>>

  type _Either<
    O extends object,
    K extends Key,
    strict extends Boolean
  > = {
    1: EitherStrict<O, K>
    0: EitherLoose<O, K>
  }[strict]

  type Either<
    O extends object,
    K extends Key,
    strict extends Boolean = 1
  > = O extends unknown ? _Either<O, K, strict> : never

  export type Union = any

  type PatchUndefined<O extends object, O1 extends object> = {
    [K in keyof O]: O[K] extends undefined ? At<O1, K> : O[K]
  } & {}

  /** Helper Types for "Merge" **/
  export type IntersectOf<U extends Union> = (
    U extends unknown ? (k: U) => void : never
  ) extends (k: infer I) => void
    ? I
    : never

  export type Overwrite<O extends object, O1 extends object> = {
      [K in keyof O]: K extends keyof O1 ? O1[K] : O[K];
  } & {};

  type _Merge<U extends object> = IntersectOf<Overwrite<U, {
      [K in keyof U]-?: At<U, K>;
  }>>;

  type Key = string | number | symbol;
  type AtBasic<O extends object, K extends Key> = K extends keyof O ? O[K] : never;
  type AtStrict<O extends object, K extends Key> = O[K & keyof O];
  type AtLoose<O extends object, K extends Key> = O extends unknown ? AtStrict<O, K> : never;
  export type At<O extends object, K extends Key, strict extends Boolean = 1> = {
      1: AtStrict<O, K>;
      0: AtLoose<O, K>;
  }[strict];

  export type ComputeRaw<A extends any> = A extends Function ? A : {
    [K in keyof A]: A[K];
  } & {};

  export type OptionalFlat<O> = {
    [K in keyof O]?: O[K];
  } & {};

  type _Record<K extends keyof any, T> = {
    [P in K]: T;
  };

  // cause typescript not to expand types and preserve names
  type NoExpand<T> = T extends unknown ? T : never;

  // this type assumes the passed object is entirely optional
  type AtLeast<O extends object, K extends string> = NoExpand<
    O extends unknown
    ? | (K extends keyof O ? { [P in K]: O[P] } & O : O)
      | {[P in keyof O as P extends K ? P : never]-?: O[P]} & O
    : never>;

  type _Strict<U, _U = U> = U extends unknown ? U & OptionalFlat<_Record<Exclude<Keys<_U>, keyof U>, never>> : never;

  export type Strict<U extends object> = ComputeRaw<_Strict<U>>;
  /** End Helper Types for "Merge" **/

  export type Merge<U extends object> = ComputeRaw<_Merge<Strict<U>>>;

  /**
  A [[Boolean]]
  */
  export type Boolean = True | False

  // /**
  // 1
  // */
  export type True = 1

  /**
  0
  */
  export type False = 0

  export type Not<B extends Boolean> = {
    0: 1
    1: 0
  }[B]

  export type Extends<A1 extends any, A2 extends any> = [A1] extends [never]
    ? 0 // anything `never` is false
    : A1 extends A2
    ? 1
    : 0

  export type Has<U extends Union, U1 extends Union> = Not<
    Extends<Exclude<U1, U>, U1>
  >

  export type Or<B1 extends Boolean, B2 extends Boolean> = {
    0: {
      0: 0
      1: 1
    }
    1: {
      0: 1
      1: 1
    }
  }[B1][B2]

  export type Keys<U extends Union> = U extends unknown ? keyof U : never

  type Cast<A, B> = A extends B ? A : B;

  export const type: unique symbol;



  /**
   * Used by group by
   */

  export type GetScalarType<T, O> = O extends object ? {
    [P in keyof T]: P extends keyof O
      ? O[P]
      : never
  } : never

  type FieldPaths<
    T,
    U = Omit<T, '_avg' | '_sum' | '_count' | '_min' | '_max'>
  > = IsObject<T> extends True ? U : T

  type GetHavingFields<T> = {
    [K in keyof T]: Or<
      Or<Extends<'OR', K>, Extends<'AND', K>>,
      Extends<'NOT', K>
    > extends True
      ? // infer is only needed to not hit TS limit
        // based on the brilliant idea of Pierre-Antoine Mills
        // https://github.com/microsoft/TypeScript/issues/30188#issuecomment-478938437
        T[K] extends infer TK
        ? GetHavingFields<UnEnumerate<TK> extends object ? Merge<UnEnumerate<TK>> : never>
        : never
      : {} extends FieldPaths<T[K]>
      ? never
      : K
  }[keyof T]

  /**
   * Convert tuple to union
   */
  type _TupleToUnion<T> = T extends (infer E)[] ? E : never
  type TupleToUnion<K extends readonly any[]> = _TupleToUnion<K>
  type MaybeTupleToUnion<T> = T extends any[] ? TupleToUnion<T> : T

  /**
   * Like `Pick`, but additionally can also accept an array of keys
   */
  type PickEnumerable<T, K extends Enumerable<keyof T> | keyof T> = Prisma__Pick<T, MaybeTupleToUnion<K>>

  /**
   * Exclude all keys with underscores
   */
  type ExcludeUnderscoreKeys<T extends string> = T extends `_${string}` ? never : T


  export type FieldRef<Model, FieldType> = runtime.FieldRef<Model, FieldType>

  type FieldRefInputType<Model, FieldType> = Model extends never ? never : FieldRef<Model, FieldType>


  export const ModelName: {
    Invoice: 'Invoice',
    Customer: 'Customer',
    Supplier: 'Supplier',
    Bank: 'Bank',
    BankStatement: 'BankStatement',
    Transaction: 'Transaction'
  };

  export type ModelName = (typeof ModelName)[keyof typeof ModelName]


  export type Datasources = {
    db?: Datasource
  }

  interface TypeMapCb<ClientOptions = {}> extends $Utils.Fn<{extArgs: $Extensions.InternalArgs }, $Utils.Record<string, any>> {
    returns: Prisma.TypeMap<this['params']['extArgs'], ClientOptions extends { omit: infer OmitOptions } ? OmitOptions : {}>
  }

  export type TypeMap<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> = {
    globalOmitOptions: {
      omit: GlobalOmitOptions
    }
    meta: {
      modelProps: "invoice" | "customer" | "supplier" | "bank" | "bankStatement" | "transaction"
      txIsolationLevel: Prisma.TransactionIsolationLevel
    }
    model: {
      Invoice: {
        payload: Prisma.$InvoicePayload<ExtArgs>
        fields: Prisma.InvoiceFieldRefs
        operations: {
          findUnique: {
            args: Prisma.InvoiceFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$InvoicePayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.InvoiceFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$InvoicePayload>
          }
          findFirst: {
            args: Prisma.InvoiceFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$InvoicePayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.InvoiceFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$InvoicePayload>
          }
          findMany: {
            args: Prisma.InvoiceFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$InvoicePayload>[]
          }
          create: {
            args: Prisma.InvoiceCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$InvoicePayload>
          }
          createMany: {
            args: Prisma.InvoiceCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.InvoiceCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$InvoicePayload>[]
          }
          delete: {
            args: Prisma.InvoiceDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$InvoicePayload>
          }
          update: {
            args: Prisma.InvoiceUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$InvoicePayload>
          }
          deleteMany: {
            args: Prisma.InvoiceDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.InvoiceUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.InvoiceUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$InvoicePayload>[]
          }
          upsert: {
            args: Prisma.InvoiceUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$InvoicePayload>
          }
          aggregate: {
            args: Prisma.InvoiceAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateInvoice>
          }
          groupBy: {
            args: Prisma.InvoiceGroupByArgs<ExtArgs>
            result: $Utils.Optional<InvoiceGroupByOutputType>[]
          }
          count: {
            args: Prisma.InvoiceCountArgs<ExtArgs>
            result: $Utils.Optional<InvoiceCountAggregateOutputType> | number
          }
        }
      }
      Customer: {
        payload: Prisma.$CustomerPayload<ExtArgs>
        fields: Prisma.CustomerFieldRefs
        operations: {
          findUnique: {
            args: Prisma.CustomerFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CustomerPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.CustomerFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CustomerPayload>
          }
          findFirst: {
            args: Prisma.CustomerFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CustomerPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.CustomerFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CustomerPayload>
          }
          findMany: {
            args: Prisma.CustomerFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CustomerPayload>[]
          }
          create: {
            args: Prisma.CustomerCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CustomerPayload>
          }
          createMany: {
            args: Prisma.CustomerCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.CustomerCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CustomerPayload>[]
          }
          delete: {
            args: Prisma.CustomerDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CustomerPayload>
          }
          update: {
            args: Prisma.CustomerUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CustomerPayload>
          }
          deleteMany: {
            args: Prisma.CustomerDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.CustomerUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.CustomerUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CustomerPayload>[]
          }
          upsert: {
            args: Prisma.CustomerUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CustomerPayload>
          }
          aggregate: {
            args: Prisma.CustomerAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateCustomer>
          }
          groupBy: {
            args: Prisma.CustomerGroupByArgs<ExtArgs>
            result: $Utils.Optional<CustomerGroupByOutputType>[]
          }
          count: {
            args: Prisma.CustomerCountArgs<ExtArgs>
            result: $Utils.Optional<CustomerCountAggregateOutputType> | number
          }
        }
      }
      Supplier: {
        payload: Prisma.$SupplierPayload<ExtArgs>
        fields: Prisma.SupplierFieldRefs
        operations: {
          findUnique: {
            args: Prisma.SupplierFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SupplierPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.SupplierFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SupplierPayload>
          }
          findFirst: {
            args: Prisma.SupplierFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SupplierPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.SupplierFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SupplierPayload>
          }
          findMany: {
            args: Prisma.SupplierFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SupplierPayload>[]
          }
          create: {
            args: Prisma.SupplierCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SupplierPayload>
          }
          createMany: {
            args: Prisma.SupplierCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.SupplierCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SupplierPayload>[]
          }
          delete: {
            args: Prisma.SupplierDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SupplierPayload>
          }
          update: {
            args: Prisma.SupplierUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SupplierPayload>
          }
          deleteMany: {
            args: Prisma.SupplierDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.SupplierUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.SupplierUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SupplierPayload>[]
          }
          upsert: {
            args: Prisma.SupplierUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SupplierPayload>
          }
          aggregate: {
            args: Prisma.SupplierAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateSupplier>
          }
          groupBy: {
            args: Prisma.SupplierGroupByArgs<ExtArgs>
            result: $Utils.Optional<SupplierGroupByOutputType>[]
          }
          count: {
            args: Prisma.SupplierCountArgs<ExtArgs>
            result: $Utils.Optional<SupplierCountAggregateOutputType> | number
          }
        }
      }
      Bank: {
        payload: Prisma.$BankPayload<ExtArgs>
        fields: Prisma.BankFieldRefs
        operations: {
          findUnique: {
            args: Prisma.BankFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$BankPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.BankFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$BankPayload>
          }
          findFirst: {
            args: Prisma.BankFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$BankPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.BankFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$BankPayload>
          }
          findMany: {
            args: Prisma.BankFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$BankPayload>[]
          }
          create: {
            args: Prisma.BankCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$BankPayload>
          }
          createMany: {
            args: Prisma.BankCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.BankCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$BankPayload>[]
          }
          delete: {
            args: Prisma.BankDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$BankPayload>
          }
          update: {
            args: Prisma.BankUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$BankPayload>
          }
          deleteMany: {
            args: Prisma.BankDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.BankUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.BankUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$BankPayload>[]
          }
          upsert: {
            args: Prisma.BankUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$BankPayload>
          }
          aggregate: {
            args: Prisma.BankAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateBank>
          }
          groupBy: {
            args: Prisma.BankGroupByArgs<ExtArgs>
            result: $Utils.Optional<BankGroupByOutputType>[]
          }
          count: {
            args: Prisma.BankCountArgs<ExtArgs>
            result: $Utils.Optional<BankCountAggregateOutputType> | number
          }
        }
      }
      BankStatement: {
        payload: Prisma.$BankStatementPayload<ExtArgs>
        fields: Prisma.BankStatementFieldRefs
        operations: {
          findUnique: {
            args: Prisma.BankStatementFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$BankStatementPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.BankStatementFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$BankStatementPayload>
          }
          findFirst: {
            args: Prisma.BankStatementFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$BankStatementPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.BankStatementFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$BankStatementPayload>
          }
          findMany: {
            args: Prisma.BankStatementFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$BankStatementPayload>[]
          }
          create: {
            args: Prisma.BankStatementCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$BankStatementPayload>
          }
          createMany: {
            args: Prisma.BankStatementCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.BankStatementCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$BankStatementPayload>[]
          }
          delete: {
            args: Prisma.BankStatementDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$BankStatementPayload>
          }
          update: {
            args: Prisma.BankStatementUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$BankStatementPayload>
          }
          deleteMany: {
            args: Prisma.BankStatementDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.BankStatementUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.BankStatementUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$BankStatementPayload>[]
          }
          upsert: {
            args: Prisma.BankStatementUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$BankStatementPayload>
          }
          aggregate: {
            args: Prisma.BankStatementAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateBankStatement>
          }
          groupBy: {
            args: Prisma.BankStatementGroupByArgs<ExtArgs>
            result: $Utils.Optional<BankStatementGroupByOutputType>[]
          }
          count: {
            args: Prisma.BankStatementCountArgs<ExtArgs>
            result: $Utils.Optional<BankStatementCountAggregateOutputType> | number
          }
        }
      }
      Transaction: {
        payload: Prisma.$TransactionPayload<ExtArgs>
        fields: Prisma.TransactionFieldRefs
        operations: {
          findUnique: {
            args: Prisma.TransactionFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TransactionPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.TransactionFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TransactionPayload>
          }
          findFirst: {
            args: Prisma.TransactionFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TransactionPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.TransactionFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TransactionPayload>
          }
          findMany: {
            args: Prisma.TransactionFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TransactionPayload>[]
          }
          create: {
            args: Prisma.TransactionCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TransactionPayload>
          }
          createMany: {
            args: Prisma.TransactionCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.TransactionCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TransactionPayload>[]
          }
          delete: {
            args: Prisma.TransactionDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TransactionPayload>
          }
          update: {
            args: Prisma.TransactionUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TransactionPayload>
          }
          deleteMany: {
            args: Prisma.TransactionDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.TransactionUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.TransactionUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TransactionPayload>[]
          }
          upsert: {
            args: Prisma.TransactionUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TransactionPayload>
          }
          aggregate: {
            args: Prisma.TransactionAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateTransaction>
          }
          groupBy: {
            args: Prisma.TransactionGroupByArgs<ExtArgs>
            result: $Utils.Optional<TransactionGroupByOutputType>[]
          }
          count: {
            args: Prisma.TransactionCountArgs<ExtArgs>
            result: $Utils.Optional<TransactionCountAggregateOutputType> | number
          }
        }
      }
    }
  } & {
    other: {
      payload: any
      operations: {
        $executeRaw: {
          args: [query: TemplateStringsArray | Prisma.Sql, ...values: any[]],
          result: any
        }
        $executeRawUnsafe: {
          args: [query: string, ...values: any[]],
          result: any
        }
        $queryRaw: {
          args: [query: TemplateStringsArray | Prisma.Sql, ...values: any[]],
          result: any
        }
        $queryRawUnsafe: {
          args: [query: string, ...values: any[]],
          result: any
        }
      }
    }
  }
  export const defineExtension: $Extensions.ExtendsHook<"define", Prisma.TypeMapCb, $Extensions.DefaultArgs>
  export type DefaultPrismaClient = PrismaClient
  export type ErrorFormat = 'pretty' | 'colorless' | 'minimal'
  export interface PrismaClientOptions {
    /**
     * Overwrites the datasource url from your schema.prisma file
     */
    datasources?: Datasources
    /**
     * Overwrites the datasource url from your schema.prisma file
     */
    datasourceUrl?: string
    /**
     * @default "colorless"
     */
    errorFormat?: ErrorFormat
    /**
     * @example
     * ```
     * // Defaults to stdout
     * log: ['query', 'info', 'warn', 'error']
     * 
     * // Emit as events
     * log: [
     *   { emit: 'stdout', level: 'query' },
     *   { emit: 'stdout', level: 'info' },
     *   { emit: 'stdout', level: 'warn' }
     *   { emit: 'stdout', level: 'error' }
     * ]
     * ```
     * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/logging#the-log-option).
     */
    log?: (LogLevel | LogDefinition)[]
    /**
     * The default values for transactionOptions
     * maxWait ?= 2000
     * timeout ?= 5000
     */
    transactionOptions?: {
      maxWait?: number
      timeout?: number
      isolationLevel?: Prisma.TransactionIsolationLevel
    }
    /**
     * Global configuration for omitting model fields by default.
     * 
     * @example
     * ```
     * const prisma = new PrismaClient({
     *   omit: {
     *     user: {
     *       password: true
     *     }
     *   }
     * })
     * ```
     */
    omit?: Prisma.GlobalOmitConfig
  }
  export type GlobalOmitConfig = {
    invoice?: InvoiceOmit
    customer?: CustomerOmit
    supplier?: SupplierOmit
    bank?: BankOmit
    bankStatement?: BankStatementOmit
    transaction?: TransactionOmit
  }

  /* Types for Logging */
  export type LogLevel = 'info' | 'query' | 'warn' | 'error'
  export type LogDefinition = {
    level: LogLevel
    emit: 'stdout' | 'event'
  }

  export type GetLogType<T extends LogLevel | LogDefinition> = T extends LogDefinition ? T['emit'] extends 'event' ? T['level'] : never : never
  export type GetEvents<T extends any> = T extends Array<LogLevel | LogDefinition> ?
    GetLogType<T[0]> | GetLogType<T[1]> | GetLogType<T[2]> | GetLogType<T[3]>
    : never

  export type QueryEvent = {
    timestamp: Date
    query: string
    params: string
    duration: number
    target: string
  }

  export type LogEvent = {
    timestamp: Date
    message: string
    target: string
  }
  /* End Types for Logging */


  export type PrismaAction =
    | 'findUnique'
    | 'findUniqueOrThrow'
    | 'findMany'
    | 'findFirst'
    | 'findFirstOrThrow'
    | 'create'
    | 'createMany'
    | 'createManyAndReturn'
    | 'update'
    | 'updateMany'
    | 'updateManyAndReturn'
    | 'upsert'
    | 'delete'
    | 'deleteMany'
    | 'executeRaw'
    | 'queryRaw'
    | 'aggregate'
    | 'count'
    | 'runCommandRaw'
    | 'findRaw'
    | 'groupBy'

  /**
   * These options are being passed into the middleware as "params"
   */
  export type MiddlewareParams = {
    model?: ModelName
    action: PrismaAction
    args: any
    dataPath: string[]
    runInTransaction: boolean
  }

  /**
   * The `T` type makes sure, that the `return proceed` is not forgotten in the middleware implementation
   */
  export type Middleware<T = any> = (
    params: MiddlewareParams,
    next: (params: MiddlewareParams) => $Utils.JsPromise<T>,
  ) => $Utils.JsPromise<T>

  // tested in getLogLevel.test.ts
  export function getLogLevel(log: Array<LogLevel | LogDefinition>): LogLevel | undefined;

  /**
   * `PrismaClient` proxy available in interactive transactions.
   */
  export type TransactionClient = Omit<Prisma.DefaultPrismaClient, runtime.ITXClientDenyList>

  export type Datasource = {
    url?: string
  }

  /**
   * Count Types
   */


  /**
   * Count Type CustomerCountOutputType
   */

  export type CustomerCountOutputType = {
    Invoice: number
    BankStatement: number
  }

  export type CustomerCountOutputTypeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    Invoice?: boolean | CustomerCountOutputTypeCountInvoiceArgs
    BankStatement?: boolean | CustomerCountOutputTypeCountBankStatementArgs
  }

  // Custom InputTypes
  /**
   * CustomerCountOutputType without action
   */
  export type CustomerCountOutputTypeDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CustomerCountOutputType
     */
    select?: CustomerCountOutputTypeSelect<ExtArgs> | null
  }

  /**
   * CustomerCountOutputType without action
   */
  export type CustomerCountOutputTypeCountInvoiceArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: InvoiceWhereInput
  }

  /**
   * CustomerCountOutputType without action
   */
  export type CustomerCountOutputTypeCountBankStatementArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: BankStatementWhereInput
  }


  /**
   * Count Type SupplierCountOutputType
   */

  export type SupplierCountOutputType = {
    Invoice: number
    BankStatement: number
  }

  export type SupplierCountOutputTypeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    Invoice?: boolean | SupplierCountOutputTypeCountInvoiceArgs
    BankStatement?: boolean | SupplierCountOutputTypeCountBankStatementArgs
  }

  // Custom InputTypes
  /**
   * SupplierCountOutputType without action
   */
  export type SupplierCountOutputTypeDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SupplierCountOutputType
     */
    select?: SupplierCountOutputTypeSelect<ExtArgs> | null
  }

  /**
   * SupplierCountOutputType without action
   */
  export type SupplierCountOutputTypeCountInvoiceArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: InvoiceWhereInput
  }

  /**
   * SupplierCountOutputType without action
   */
  export type SupplierCountOutputTypeCountBankStatementArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: BankStatementWhereInput
  }


  /**
   * Count Type BankCountOutputType
   */

  export type BankCountOutputType = {
    bankStatements: number
  }

  export type BankCountOutputTypeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    bankStatements?: boolean | BankCountOutputTypeCountBankStatementsArgs
  }

  // Custom InputTypes
  /**
   * BankCountOutputType without action
   */
  export type BankCountOutputTypeDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the BankCountOutputType
     */
    select?: BankCountOutputTypeSelect<ExtArgs> | null
  }

  /**
   * BankCountOutputType without action
   */
  export type BankCountOutputTypeCountBankStatementsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: BankStatementWhereInput
  }


  /**
   * Count Type BankStatementCountOutputType
   */

  export type BankStatementCountOutputType = {
    transactions: number
  }

  export type BankStatementCountOutputTypeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    transactions?: boolean | BankStatementCountOutputTypeCountTransactionsArgs
  }

  // Custom InputTypes
  /**
   * BankStatementCountOutputType without action
   */
  export type BankStatementCountOutputTypeDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the BankStatementCountOutputType
     */
    select?: BankStatementCountOutputTypeSelect<ExtArgs> | null
  }

  /**
   * BankStatementCountOutputType without action
   */
  export type BankStatementCountOutputTypeCountTransactionsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: TransactionWhereInput
  }


  /**
   * Models
   */

  /**
   * Model Invoice
   */

  export type AggregateInvoice = {
    _count: InvoiceCountAggregateOutputType | null
    _avg: InvoiceAvgAggregateOutputType | null
    _sum: InvoiceSumAggregateOutputType | null
    _min: InvoiceMinAggregateOutputType | null
    _max: InvoiceMaxAggregateOutputType | null
  }

  export type InvoiceAvgAggregateOutputType = {
    id: number | null
    totalSales: Decimal | null
    totalDiscount: Decimal | null
    netAmount: Decimal | null
    total: Decimal | null
    exchangeRate: Decimal | null
    taxAmount: Decimal | null
    customerId: number | null
    supplierId: number | null
  }

  export type InvoiceSumAggregateOutputType = {
    id: number | null
    totalSales: Decimal | null
    totalDiscount: Decimal | null
    netAmount: Decimal | null
    total: Decimal | null
    exchangeRate: Decimal | null
    taxAmount: Decimal | null
    customerId: number | null
    supplierId: number | null
  }

  export type InvoiceMinAggregateOutputType = {
    id: number | null
    createdAt: Date | null
    updatedAt: Date | null
    invoiceDate: Date | null
    invoiceNumber: string | null
    issuerName: string | null
    receiverName: string | null
    totalSales: Decimal | null
    totalDiscount: Decimal | null
    netAmount: Decimal | null
    total: Decimal | null
    invoiceStatus: string | null
    currency: string | null
    exchangeRate: Decimal | null
    taxAmount: Decimal | null
    issuerCountry: string | null
    receiverCountry: string | null
    issuerEtaId: string | null
    receiverEtaId: string | null
    customerId: number | null
    supplierId: number | null
  }

  export type InvoiceMaxAggregateOutputType = {
    id: number | null
    createdAt: Date | null
    updatedAt: Date | null
    invoiceDate: Date | null
    invoiceNumber: string | null
    issuerName: string | null
    receiverName: string | null
    totalSales: Decimal | null
    totalDiscount: Decimal | null
    netAmount: Decimal | null
    total: Decimal | null
    invoiceStatus: string | null
    currency: string | null
    exchangeRate: Decimal | null
    taxAmount: Decimal | null
    issuerCountry: string | null
    receiverCountry: string | null
    issuerEtaId: string | null
    receiverEtaId: string | null
    customerId: number | null
    supplierId: number | null
  }

  export type InvoiceCountAggregateOutputType = {
    id: number
    createdAt: number
    updatedAt: number
    invoiceDate: number
    invoiceNumber: number
    issuerName: number
    receiverName: number
    totalSales: number
    totalDiscount: number
    netAmount: number
    total: number
    invoiceStatus: number
    currency: number
    exchangeRate: number
    taxAmount: number
    issuerCountry: number
    receiverCountry: number
    issuerEtaId: number
    receiverEtaId: number
    customerId: number
    supplierId: number
    _all: number
  }


  export type InvoiceAvgAggregateInputType = {
    id?: true
    totalSales?: true
    totalDiscount?: true
    netAmount?: true
    total?: true
    exchangeRate?: true
    taxAmount?: true
    customerId?: true
    supplierId?: true
  }

  export type InvoiceSumAggregateInputType = {
    id?: true
    totalSales?: true
    totalDiscount?: true
    netAmount?: true
    total?: true
    exchangeRate?: true
    taxAmount?: true
    customerId?: true
    supplierId?: true
  }

  export type InvoiceMinAggregateInputType = {
    id?: true
    createdAt?: true
    updatedAt?: true
    invoiceDate?: true
    invoiceNumber?: true
    issuerName?: true
    receiverName?: true
    totalSales?: true
    totalDiscount?: true
    netAmount?: true
    total?: true
    invoiceStatus?: true
    currency?: true
    exchangeRate?: true
    taxAmount?: true
    issuerCountry?: true
    receiverCountry?: true
    issuerEtaId?: true
    receiverEtaId?: true
    customerId?: true
    supplierId?: true
  }

  export type InvoiceMaxAggregateInputType = {
    id?: true
    createdAt?: true
    updatedAt?: true
    invoiceDate?: true
    invoiceNumber?: true
    issuerName?: true
    receiverName?: true
    totalSales?: true
    totalDiscount?: true
    netAmount?: true
    total?: true
    invoiceStatus?: true
    currency?: true
    exchangeRate?: true
    taxAmount?: true
    issuerCountry?: true
    receiverCountry?: true
    issuerEtaId?: true
    receiverEtaId?: true
    customerId?: true
    supplierId?: true
  }

  export type InvoiceCountAggregateInputType = {
    id?: true
    createdAt?: true
    updatedAt?: true
    invoiceDate?: true
    invoiceNumber?: true
    issuerName?: true
    receiverName?: true
    totalSales?: true
    totalDiscount?: true
    netAmount?: true
    total?: true
    invoiceStatus?: true
    currency?: true
    exchangeRate?: true
    taxAmount?: true
    issuerCountry?: true
    receiverCountry?: true
    issuerEtaId?: true
    receiverEtaId?: true
    customerId?: true
    supplierId?: true
    _all?: true
  }

  export type InvoiceAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Invoice to aggregate.
     */
    where?: InvoiceWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Invoices to fetch.
     */
    orderBy?: InvoiceOrderByWithRelationInput | InvoiceOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: InvoiceWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Invoices from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Invoices.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned Invoices
    **/
    _count?: true | InvoiceCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: InvoiceAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: InvoiceSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: InvoiceMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: InvoiceMaxAggregateInputType
  }

  export type GetInvoiceAggregateType<T extends InvoiceAggregateArgs> = {
        [P in keyof T & keyof AggregateInvoice]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateInvoice[P]>
      : GetScalarType<T[P], AggregateInvoice[P]>
  }




  export type InvoiceGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: InvoiceWhereInput
    orderBy?: InvoiceOrderByWithAggregationInput | InvoiceOrderByWithAggregationInput[]
    by: InvoiceScalarFieldEnum[] | InvoiceScalarFieldEnum
    having?: InvoiceScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: InvoiceCountAggregateInputType | true
    _avg?: InvoiceAvgAggregateInputType
    _sum?: InvoiceSumAggregateInputType
    _min?: InvoiceMinAggregateInputType
    _max?: InvoiceMaxAggregateInputType
  }

  export type InvoiceGroupByOutputType = {
    id: number
    createdAt: Date
    updatedAt: Date
    invoiceDate: Date
    invoiceNumber: string
    issuerName: string
    receiverName: string
    totalSales: Decimal
    totalDiscount: Decimal
    netAmount: Decimal
    total: Decimal
    invoiceStatus: string
    currency: string
    exchangeRate: Decimal
    taxAmount: Decimal
    issuerCountry: string
    receiverCountry: string
    issuerEtaId: string
    receiverEtaId: string
    customerId: number | null
    supplierId: number | null
    _count: InvoiceCountAggregateOutputType | null
    _avg: InvoiceAvgAggregateOutputType | null
    _sum: InvoiceSumAggregateOutputType | null
    _min: InvoiceMinAggregateOutputType | null
    _max: InvoiceMaxAggregateOutputType | null
  }

  type GetInvoiceGroupByPayload<T extends InvoiceGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<InvoiceGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof InvoiceGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], InvoiceGroupByOutputType[P]>
            : GetScalarType<T[P], InvoiceGroupByOutputType[P]>
        }
      >
    >


  export type InvoiceSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    invoiceDate?: boolean
    invoiceNumber?: boolean
    issuerName?: boolean
    receiverName?: boolean
    totalSales?: boolean
    totalDiscount?: boolean
    netAmount?: boolean
    total?: boolean
    invoiceStatus?: boolean
    currency?: boolean
    exchangeRate?: boolean
    taxAmount?: boolean
    issuerCountry?: boolean
    receiverCountry?: boolean
    issuerEtaId?: boolean
    receiverEtaId?: boolean
    customerId?: boolean
    supplierId?: boolean
    Customer?: boolean | Invoice$CustomerArgs<ExtArgs>
    Supplier?: boolean | Invoice$SupplierArgs<ExtArgs>
  }, ExtArgs["result"]["invoice"]>

  export type InvoiceSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    invoiceDate?: boolean
    invoiceNumber?: boolean
    issuerName?: boolean
    receiverName?: boolean
    totalSales?: boolean
    totalDiscount?: boolean
    netAmount?: boolean
    total?: boolean
    invoiceStatus?: boolean
    currency?: boolean
    exchangeRate?: boolean
    taxAmount?: boolean
    issuerCountry?: boolean
    receiverCountry?: boolean
    issuerEtaId?: boolean
    receiverEtaId?: boolean
    customerId?: boolean
    supplierId?: boolean
    Customer?: boolean | Invoice$CustomerArgs<ExtArgs>
    Supplier?: boolean | Invoice$SupplierArgs<ExtArgs>
  }, ExtArgs["result"]["invoice"]>

  export type InvoiceSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    invoiceDate?: boolean
    invoiceNumber?: boolean
    issuerName?: boolean
    receiverName?: boolean
    totalSales?: boolean
    totalDiscount?: boolean
    netAmount?: boolean
    total?: boolean
    invoiceStatus?: boolean
    currency?: boolean
    exchangeRate?: boolean
    taxAmount?: boolean
    issuerCountry?: boolean
    receiverCountry?: boolean
    issuerEtaId?: boolean
    receiverEtaId?: boolean
    customerId?: boolean
    supplierId?: boolean
    Customer?: boolean | Invoice$CustomerArgs<ExtArgs>
    Supplier?: boolean | Invoice$SupplierArgs<ExtArgs>
  }, ExtArgs["result"]["invoice"]>

  export type InvoiceSelectScalar = {
    id?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    invoiceDate?: boolean
    invoiceNumber?: boolean
    issuerName?: boolean
    receiverName?: boolean
    totalSales?: boolean
    totalDiscount?: boolean
    netAmount?: boolean
    total?: boolean
    invoiceStatus?: boolean
    currency?: boolean
    exchangeRate?: boolean
    taxAmount?: boolean
    issuerCountry?: boolean
    receiverCountry?: boolean
    issuerEtaId?: boolean
    receiverEtaId?: boolean
    customerId?: boolean
    supplierId?: boolean
  }

  export type InvoiceOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "createdAt" | "updatedAt" | "invoiceDate" | "invoiceNumber" | "issuerName" | "receiverName" | "totalSales" | "totalDiscount" | "netAmount" | "total" | "invoiceStatus" | "currency" | "exchangeRate" | "taxAmount" | "issuerCountry" | "receiverCountry" | "issuerEtaId" | "receiverEtaId" | "customerId" | "supplierId", ExtArgs["result"]["invoice"]>
  export type InvoiceInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    Customer?: boolean | Invoice$CustomerArgs<ExtArgs>
    Supplier?: boolean | Invoice$SupplierArgs<ExtArgs>
  }
  export type InvoiceIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    Customer?: boolean | Invoice$CustomerArgs<ExtArgs>
    Supplier?: boolean | Invoice$SupplierArgs<ExtArgs>
  }
  export type InvoiceIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    Customer?: boolean | Invoice$CustomerArgs<ExtArgs>
    Supplier?: boolean | Invoice$SupplierArgs<ExtArgs>
  }

  export type $InvoicePayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "Invoice"
    objects: {
      Customer: Prisma.$CustomerPayload<ExtArgs> | null
      Supplier: Prisma.$SupplierPayload<ExtArgs> | null
    }
    scalars: $Extensions.GetPayloadResult<{
      id: number
      createdAt: Date
      updatedAt: Date
      invoiceDate: Date
      invoiceNumber: string
      issuerName: string
      receiverName: string
      totalSales: Prisma.Decimal
      totalDiscount: Prisma.Decimal
      netAmount: Prisma.Decimal
      total: Prisma.Decimal
      invoiceStatus: string
      currency: string
      exchangeRate: Prisma.Decimal
      taxAmount: Prisma.Decimal
      issuerCountry: string
      receiverCountry: string
      issuerEtaId: string
      receiverEtaId: string
      customerId: number | null
      supplierId: number | null
    }, ExtArgs["result"]["invoice"]>
    composites: {}
  }

  type InvoiceGetPayload<S extends boolean | null | undefined | InvoiceDefaultArgs> = $Result.GetResult<Prisma.$InvoicePayload, S>

  type InvoiceCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<InvoiceFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: InvoiceCountAggregateInputType | true
    }

  export interface InvoiceDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['Invoice'], meta: { name: 'Invoice' } }
    /**
     * Find zero or one Invoice that matches the filter.
     * @param {InvoiceFindUniqueArgs} args - Arguments to find a Invoice
     * @example
     * // Get one Invoice
     * const invoice = await prisma.invoice.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends InvoiceFindUniqueArgs>(args: SelectSubset<T, InvoiceFindUniqueArgs<ExtArgs>>): Prisma__InvoiceClient<$Result.GetResult<Prisma.$InvoicePayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one Invoice that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {InvoiceFindUniqueOrThrowArgs} args - Arguments to find a Invoice
     * @example
     * // Get one Invoice
     * const invoice = await prisma.invoice.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends InvoiceFindUniqueOrThrowArgs>(args: SelectSubset<T, InvoiceFindUniqueOrThrowArgs<ExtArgs>>): Prisma__InvoiceClient<$Result.GetResult<Prisma.$InvoicePayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Invoice that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {InvoiceFindFirstArgs} args - Arguments to find a Invoice
     * @example
     * // Get one Invoice
     * const invoice = await prisma.invoice.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends InvoiceFindFirstArgs>(args?: SelectSubset<T, InvoiceFindFirstArgs<ExtArgs>>): Prisma__InvoiceClient<$Result.GetResult<Prisma.$InvoicePayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Invoice that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {InvoiceFindFirstOrThrowArgs} args - Arguments to find a Invoice
     * @example
     * // Get one Invoice
     * const invoice = await prisma.invoice.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends InvoiceFindFirstOrThrowArgs>(args?: SelectSubset<T, InvoiceFindFirstOrThrowArgs<ExtArgs>>): Prisma__InvoiceClient<$Result.GetResult<Prisma.$InvoicePayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more Invoices that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {InvoiceFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Invoices
     * const invoices = await prisma.invoice.findMany()
     * 
     * // Get first 10 Invoices
     * const invoices = await prisma.invoice.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const invoiceWithIdOnly = await prisma.invoice.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends InvoiceFindManyArgs>(args?: SelectSubset<T, InvoiceFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$InvoicePayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a Invoice.
     * @param {InvoiceCreateArgs} args - Arguments to create a Invoice.
     * @example
     * // Create one Invoice
     * const Invoice = await prisma.invoice.create({
     *   data: {
     *     // ... data to create a Invoice
     *   }
     * })
     * 
     */
    create<T extends InvoiceCreateArgs>(args: SelectSubset<T, InvoiceCreateArgs<ExtArgs>>): Prisma__InvoiceClient<$Result.GetResult<Prisma.$InvoicePayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many Invoices.
     * @param {InvoiceCreateManyArgs} args - Arguments to create many Invoices.
     * @example
     * // Create many Invoices
     * const invoice = await prisma.invoice.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends InvoiceCreateManyArgs>(args?: SelectSubset<T, InvoiceCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Invoices and returns the data saved in the database.
     * @param {InvoiceCreateManyAndReturnArgs} args - Arguments to create many Invoices.
     * @example
     * // Create many Invoices
     * const invoice = await prisma.invoice.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Invoices and only return the `id`
     * const invoiceWithIdOnly = await prisma.invoice.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends InvoiceCreateManyAndReturnArgs>(args?: SelectSubset<T, InvoiceCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$InvoicePayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a Invoice.
     * @param {InvoiceDeleteArgs} args - Arguments to delete one Invoice.
     * @example
     * // Delete one Invoice
     * const Invoice = await prisma.invoice.delete({
     *   where: {
     *     // ... filter to delete one Invoice
     *   }
     * })
     * 
     */
    delete<T extends InvoiceDeleteArgs>(args: SelectSubset<T, InvoiceDeleteArgs<ExtArgs>>): Prisma__InvoiceClient<$Result.GetResult<Prisma.$InvoicePayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one Invoice.
     * @param {InvoiceUpdateArgs} args - Arguments to update one Invoice.
     * @example
     * // Update one Invoice
     * const invoice = await prisma.invoice.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends InvoiceUpdateArgs>(args: SelectSubset<T, InvoiceUpdateArgs<ExtArgs>>): Prisma__InvoiceClient<$Result.GetResult<Prisma.$InvoicePayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more Invoices.
     * @param {InvoiceDeleteManyArgs} args - Arguments to filter Invoices to delete.
     * @example
     * // Delete a few Invoices
     * const { count } = await prisma.invoice.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends InvoiceDeleteManyArgs>(args?: SelectSubset<T, InvoiceDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Invoices.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {InvoiceUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Invoices
     * const invoice = await prisma.invoice.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends InvoiceUpdateManyArgs>(args: SelectSubset<T, InvoiceUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Invoices and returns the data updated in the database.
     * @param {InvoiceUpdateManyAndReturnArgs} args - Arguments to update many Invoices.
     * @example
     * // Update many Invoices
     * const invoice = await prisma.invoice.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more Invoices and only return the `id`
     * const invoiceWithIdOnly = await prisma.invoice.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends InvoiceUpdateManyAndReturnArgs>(args: SelectSubset<T, InvoiceUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$InvoicePayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one Invoice.
     * @param {InvoiceUpsertArgs} args - Arguments to update or create a Invoice.
     * @example
     * // Update or create a Invoice
     * const invoice = await prisma.invoice.upsert({
     *   create: {
     *     // ... data to create a Invoice
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Invoice we want to update
     *   }
     * })
     */
    upsert<T extends InvoiceUpsertArgs>(args: SelectSubset<T, InvoiceUpsertArgs<ExtArgs>>): Prisma__InvoiceClient<$Result.GetResult<Prisma.$InvoicePayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of Invoices.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {InvoiceCountArgs} args - Arguments to filter Invoices to count.
     * @example
     * // Count the number of Invoices
     * const count = await prisma.invoice.count({
     *   where: {
     *     // ... the filter for the Invoices we want to count
     *   }
     * })
    **/
    count<T extends InvoiceCountArgs>(
      args?: Subset<T, InvoiceCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], InvoiceCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Invoice.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {InvoiceAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends InvoiceAggregateArgs>(args: Subset<T, InvoiceAggregateArgs>): Prisma.PrismaPromise<GetInvoiceAggregateType<T>>

    /**
     * Group by Invoice.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {InvoiceGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends InvoiceGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: InvoiceGroupByArgs['orderBy'] }
        : { orderBy?: InvoiceGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, InvoiceGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetInvoiceGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the Invoice model
   */
  readonly fields: InvoiceFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for Invoice.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__InvoiceClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    Customer<T extends Invoice$CustomerArgs<ExtArgs> = {}>(args?: Subset<T, Invoice$CustomerArgs<ExtArgs>>): Prisma__CustomerClient<$Result.GetResult<Prisma.$CustomerPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>
    Supplier<T extends Invoice$SupplierArgs<ExtArgs> = {}>(args?: Subset<T, Invoice$SupplierArgs<ExtArgs>>): Prisma__SupplierClient<$Result.GetResult<Prisma.$SupplierPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the Invoice model
   */
  interface InvoiceFieldRefs {
    readonly id: FieldRef<"Invoice", 'Int'>
    readonly createdAt: FieldRef<"Invoice", 'DateTime'>
    readonly updatedAt: FieldRef<"Invoice", 'DateTime'>
    readonly invoiceDate: FieldRef<"Invoice", 'DateTime'>
    readonly invoiceNumber: FieldRef<"Invoice", 'String'>
    readonly issuerName: FieldRef<"Invoice", 'String'>
    readonly receiverName: FieldRef<"Invoice", 'String'>
    readonly totalSales: FieldRef<"Invoice", 'Decimal'>
    readonly totalDiscount: FieldRef<"Invoice", 'Decimal'>
    readonly netAmount: FieldRef<"Invoice", 'Decimal'>
    readonly total: FieldRef<"Invoice", 'Decimal'>
    readonly invoiceStatus: FieldRef<"Invoice", 'String'>
    readonly currency: FieldRef<"Invoice", 'String'>
    readonly exchangeRate: FieldRef<"Invoice", 'Decimal'>
    readonly taxAmount: FieldRef<"Invoice", 'Decimal'>
    readonly issuerCountry: FieldRef<"Invoice", 'String'>
    readonly receiverCountry: FieldRef<"Invoice", 'String'>
    readonly issuerEtaId: FieldRef<"Invoice", 'String'>
    readonly receiverEtaId: FieldRef<"Invoice", 'String'>
    readonly customerId: FieldRef<"Invoice", 'Int'>
    readonly supplierId: FieldRef<"Invoice", 'Int'>
  }
    

  // Custom InputTypes
  /**
   * Invoice findUnique
   */
  export type InvoiceFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Invoice
     */
    select?: InvoiceSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Invoice
     */
    omit?: InvoiceOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: InvoiceInclude<ExtArgs> | null
    /**
     * Filter, which Invoice to fetch.
     */
    where: InvoiceWhereUniqueInput
  }

  /**
   * Invoice findUniqueOrThrow
   */
  export type InvoiceFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Invoice
     */
    select?: InvoiceSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Invoice
     */
    omit?: InvoiceOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: InvoiceInclude<ExtArgs> | null
    /**
     * Filter, which Invoice to fetch.
     */
    where: InvoiceWhereUniqueInput
  }

  /**
   * Invoice findFirst
   */
  export type InvoiceFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Invoice
     */
    select?: InvoiceSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Invoice
     */
    omit?: InvoiceOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: InvoiceInclude<ExtArgs> | null
    /**
     * Filter, which Invoice to fetch.
     */
    where?: InvoiceWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Invoices to fetch.
     */
    orderBy?: InvoiceOrderByWithRelationInput | InvoiceOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Invoices.
     */
    cursor?: InvoiceWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Invoices from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Invoices.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Invoices.
     */
    distinct?: InvoiceScalarFieldEnum | InvoiceScalarFieldEnum[]
  }

  /**
   * Invoice findFirstOrThrow
   */
  export type InvoiceFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Invoice
     */
    select?: InvoiceSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Invoice
     */
    omit?: InvoiceOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: InvoiceInclude<ExtArgs> | null
    /**
     * Filter, which Invoice to fetch.
     */
    where?: InvoiceWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Invoices to fetch.
     */
    orderBy?: InvoiceOrderByWithRelationInput | InvoiceOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Invoices.
     */
    cursor?: InvoiceWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Invoices from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Invoices.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Invoices.
     */
    distinct?: InvoiceScalarFieldEnum | InvoiceScalarFieldEnum[]
  }

  /**
   * Invoice findMany
   */
  export type InvoiceFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Invoice
     */
    select?: InvoiceSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Invoice
     */
    omit?: InvoiceOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: InvoiceInclude<ExtArgs> | null
    /**
     * Filter, which Invoices to fetch.
     */
    where?: InvoiceWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Invoices to fetch.
     */
    orderBy?: InvoiceOrderByWithRelationInput | InvoiceOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing Invoices.
     */
    cursor?: InvoiceWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Invoices from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Invoices.
     */
    skip?: number
    distinct?: InvoiceScalarFieldEnum | InvoiceScalarFieldEnum[]
  }

  /**
   * Invoice create
   */
  export type InvoiceCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Invoice
     */
    select?: InvoiceSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Invoice
     */
    omit?: InvoiceOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: InvoiceInclude<ExtArgs> | null
    /**
     * The data needed to create a Invoice.
     */
    data: XOR<InvoiceCreateInput, InvoiceUncheckedCreateInput>
  }

  /**
   * Invoice createMany
   */
  export type InvoiceCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many Invoices.
     */
    data: InvoiceCreateManyInput | InvoiceCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * Invoice createManyAndReturn
   */
  export type InvoiceCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Invoice
     */
    select?: InvoiceSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Invoice
     */
    omit?: InvoiceOmit<ExtArgs> | null
    /**
     * The data used to create many Invoices.
     */
    data: InvoiceCreateManyInput | InvoiceCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: InvoiceIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * Invoice update
   */
  export type InvoiceUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Invoice
     */
    select?: InvoiceSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Invoice
     */
    omit?: InvoiceOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: InvoiceInclude<ExtArgs> | null
    /**
     * The data needed to update a Invoice.
     */
    data: XOR<InvoiceUpdateInput, InvoiceUncheckedUpdateInput>
    /**
     * Choose, which Invoice to update.
     */
    where: InvoiceWhereUniqueInput
  }

  /**
   * Invoice updateMany
   */
  export type InvoiceUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update Invoices.
     */
    data: XOR<InvoiceUpdateManyMutationInput, InvoiceUncheckedUpdateManyInput>
    /**
     * Filter which Invoices to update
     */
    where?: InvoiceWhereInput
    /**
     * Limit how many Invoices to update.
     */
    limit?: number
  }

  /**
   * Invoice updateManyAndReturn
   */
  export type InvoiceUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Invoice
     */
    select?: InvoiceSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Invoice
     */
    omit?: InvoiceOmit<ExtArgs> | null
    /**
     * The data used to update Invoices.
     */
    data: XOR<InvoiceUpdateManyMutationInput, InvoiceUncheckedUpdateManyInput>
    /**
     * Filter which Invoices to update
     */
    where?: InvoiceWhereInput
    /**
     * Limit how many Invoices to update.
     */
    limit?: number
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: InvoiceIncludeUpdateManyAndReturn<ExtArgs> | null
  }

  /**
   * Invoice upsert
   */
  export type InvoiceUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Invoice
     */
    select?: InvoiceSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Invoice
     */
    omit?: InvoiceOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: InvoiceInclude<ExtArgs> | null
    /**
     * The filter to search for the Invoice to update in case it exists.
     */
    where: InvoiceWhereUniqueInput
    /**
     * In case the Invoice found by the `where` argument doesn't exist, create a new Invoice with this data.
     */
    create: XOR<InvoiceCreateInput, InvoiceUncheckedCreateInput>
    /**
     * In case the Invoice was found with the provided `where` argument, update it with this data.
     */
    update: XOR<InvoiceUpdateInput, InvoiceUncheckedUpdateInput>
  }

  /**
   * Invoice delete
   */
  export type InvoiceDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Invoice
     */
    select?: InvoiceSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Invoice
     */
    omit?: InvoiceOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: InvoiceInclude<ExtArgs> | null
    /**
     * Filter which Invoice to delete.
     */
    where: InvoiceWhereUniqueInput
  }

  /**
   * Invoice deleteMany
   */
  export type InvoiceDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Invoices to delete
     */
    where?: InvoiceWhereInput
    /**
     * Limit how many Invoices to delete.
     */
    limit?: number
  }

  /**
   * Invoice.Customer
   */
  export type Invoice$CustomerArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Customer
     */
    select?: CustomerSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Customer
     */
    omit?: CustomerOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CustomerInclude<ExtArgs> | null
    where?: CustomerWhereInput
  }

  /**
   * Invoice.Supplier
   */
  export type Invoice$SupplierArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Supplier
     */
    select?: SupplierSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Supplier
     */
    omit?: SupplierOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SupplierInclude<ExtArgs> | null
    where?: SupplierWhereInput
  }

  /**
   * Invoice without action
   */
  export type InvoiceDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Invoice
     */
    select?: InvoiceSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Invoice
     */
    omit?: InvoiceOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: InvoiceInclude<ExtArgs> | null
  }


  /**
   * Model Customer
   */

  export type AggregateCustomer = {
    _count: CustomerCountAggregateOutputType | null
    _avg: CustomerAvgAggregateOutputType | null
    _sum: CustomerSumAggregateOutputType | null
    _min: CustomerMinAggregateOutputType | null
    _max: CustomerMaxAggregateOutputType | null
  }

  export type CustomerAvgAggregateOutputType = {
    id: number | null
    paymentTerms: number | null
  }

  export type CustomerSumAggregateOutputType = {
    id: number | null
    paymentTerms: number | null
  }

  export type CustomerMinAggregateOutputType = {
    id: number | null
    createdAt: Date | null
    updatedAt: Date | null
    name: string | null
    country: string | null
    etaId: string | null
    paymentTerms: number | null
  }

  export type CustomerMaxAggregateOutputType = {
    id: number | null
    createdAt: Date | null
    updatedAt: Date | null
    name: string | null
    country: string | null
    etaId: string | null
    paymentTerms: number | null
  }

  export type CustomerCountAggregateOutputType = {
    id: number
    createdAt: number
    updatedAt: number
    name: number
    country: number
    etaId: number
    paymentTerms: number
    _all: number
  }


  export type CustomerAvgAggregateInputType = {
    id?: true
    paymentTerms?: true
  }

  export type CustomerSumAggregateInputType = {
    id?: true
    paymentTerms?: true
  }

  export type CustomerMinAggregateInputType = {
    id?: true
    createdAt?: true
    updatedAt?: true
    name?: true
    country?: true
    etaId?: true
    paymentTerms?: true
  }

  export type CustomerMaxAggregateInputType = {
    id?: true
    createdAt?: true
    updatedAt?: true
    name?: true
    country?: true
    etaId?: true
    paymentTerms?: true
  }

  export type CustomerCountAggregateInputType = {
    id?: true
    createdAt?: true
    updatedAt?: true
    name?: true
    country?: true
    etaId?: true
    paymentTerms?: true
    _all?: true
  }

  export type CustomerAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Customer to aggregate.
     */
    where?: CustomerWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Customers to fetch.
     */
    orderBy?: CustomerOrderByWithRelationInput | CustomerOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: CustomerWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Customers from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Customers.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned Customers
    **/
    _count?: true | CustomerCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: CustomerAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: CustomerSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: CustomerMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: CustomerMaxAggregateInputType
  }

  export type GetCustomerAggregateType<T extends CustomerAggregateArgs> = {
        [P in keyof T & keyof AggregateCustomer]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateCustomer[P]>
      : GetScalarType<T[P], AggregateCustomer[P]>
  }




  export type CustomerGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: CustomerWhereInput
    orderBy?: CustomerOrderByWithAggregationInput | CustomerOrderByWithAggregationInput[]
    by: CustomerScalarFieldEnum[] | CustomerScalarFieldEnum
    having?: CustomerScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: CustomerCountAggregateInputType | true
    _avg?: CustomerAvgAggregateInputType
    _sum?: CustomerSumAggregateInputType
    _min?: CustomerMinAggregateInputType
    _max?: CustomerMaxAggregateInputType
  }

  export type CustomerGroupByOutputType = {
    id: number
    createdAt: Date
    updatedAt: Date
    name: string
    country: string | null
    etaId: string | null
    paymentTerms: number | null
    _count: CustomerCountAggregateOutputType | null
    _avg: CustomerAvgAggregateOutputType | null
    _sum: CustomerSumAggregateOutputType | null
    _min: CustomerMinAggregateOutputType | null
    _max: CustomerMaxAggregateOutputType | null
  }

  type GetCustomerGroupByPayload<T extends CustomerGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<CustomerGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof CustomerGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], CustomerGroupByOutputType[P]>
            : GetScalarType<T[P], CustomerGroupByOutputType[P]>
        }
      >
    >


  export type CustomerSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    name?: boolean
    country?: boolean
    etaId?: boolean
    paymentTerms?: boolean
    Invoice?: boolean | Customer$InvoiceArgs<ExtArgs>
    BankStatement?: boolean | Customer$BankStatementArgs<ExtArgs>
    _count?: boolean | CustomerCountOutputTypeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["customer"]>

  export type CustomerSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    name?: boolean
    country?: boolean
    etaId?: boolean
    paymentTerms?: boolean
  }, ExtArgs["result"]["customer"]>

  export type CustomerSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    name?: boolean
    country?: boolean
    etaId?: boolean
    paymentTerms?: boolean
  }, ExtArgs["result"]["customer"]>

  export type CustomerSelectScalar = {
    id?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    name?: boolean
    country?: boolean
    etaId?: boolean
    paymentTerms?: boolean
  }

  export type CustomerOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "createdAt" | "updatedAt" | "name" | "country" | "etaId" | "paymentTerms", ExtArgs["result"]["customer"]>
  export type CustomerInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    Invoice?: boolean | Customer$InvoiceArgs<ExtArgs>
    BankStatement?: boolean | Customer$BankStatementArgs<ExtArgs>
    _count?: boolean | CustomerCountOutputTypeDefaultArgs<ExtArgs>
  }
  export type CustomerIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {}
  export type CustomerIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {}

  export type $CustomerPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "Customer"
    objects: {
      Invoice: Prisma.$InvoicePayload<ExtArgs>[]
      BankStatement: Prisma.$BankStatementPayload<ExtArgs>[]
    }
    scalars: $Extensions.GetPayloadResult<{
      id: number
      createdAt: Date
      updatedAt: Date
      name: string
      country: string | null
      etaId: string | null
      paymentTerms: number | null
    }, ExtArgs["result"]["customer"]>
    composites: {}
  }

  type CustomerGetPayload<S extends boolean | null | undefined | CustomerDefaultArgs> = $Result.GetResult<Prisma.$CustomerPayload, S>

  type CustomerCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<CustomerFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: CustomerCountAggregateInputType | true
    }

  export interface CustomerDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['Customer'], meta: { name: 'Customer' } }
    /**
     * Find zero or one Customer that matches the filter.
     * @param {CustomerFindUniqueArgs} args - Arguments to find a Customer
     * @example
     * // Get one Customer
     * const customer = await prisma.customer.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends CustomerFindUniqueArgs>(args: SelectSubset<T, CustomerFindUniqueArgs<ExtArgs>>): Prisma__CustomerClient<$Result.GetResult<Prisma.$CustomerPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one Customer that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {CustomerFindUniqueOrThrowArgs} args - Arguments to find a Customer
     * @example
     * // Get one Customer
     * const customer = await prisma.customer.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends CustomerFindUniqueOrThrowArgs>(args: SelectSubset<T, CustomerFindUniqueOrThrowArgs<ExtArgs>>): Prisma__CustomerClient<$Result.GetResult<Prisma.$CustomerPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Customer that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CustomerFindFirstArgs} args - Arguments to find a Customer
     * @example
     * // Get one Customer
     * const customer = await prisma.customer.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends CustomerFindFirstArgs>(args?: SelectSubset<T, CustomerFindFirstArgs<ExtArgs>>): Prisma__CustomerClient<$Result.GetResult<Prisma.$CustomerPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Customer that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CustomerFindFirstOrThrowArgs} args - Arguments to find a Customer
     * @example
     * // Get one Customer
     * const customer = await prisma.customer.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends CustomerFindFirstOrThrowArgs>(args?: SelectSubset<T, CustomerFindFirstOrThrowArgs<ExtArgs>>): Prisma__CustomerClient<$Result.GetResult<Prisma.$CustomerPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more Customers that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CustomerFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Customers
     * const customers = await prisma.customer.findMany()
     * 
     * // Get first 10 Customers
     * const customers = await prisma.customer.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const customerWithIdOnly = await prisma.customer.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends CustomerFindManyArgs>(args?: SelectSubset<T, CustomerFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$CustomerPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a Customer.
     * @param {CustomerCreateArgs} args - Arguments to create a Customer.
     * @example
     * // Create one Customer
     * const Customer = await prisma.customer.create({
     *   data: {
     *     // ... data to create a Customer
     *   }
     * })
     * 
     */
    create<T extends CustomerCreateArgs>(args: SelectSubset<T, CustomerCreateArgs<ExtArgs>>): Prisma__CustomerClient<$Result.GetResult<Prisma.$CustomerPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many Customers.
     * @param {CustomerCreateManyArgs} args - Arguments to create many Customers.
     * @example
     * // Create many Customers
     * const customer = await prisma.customer.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends CustomerCreateManyArgs>(args?: SelectSubset<T, CustomerCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Customers and returns the data saved in the database.
     * @param {CustomerCreateManyAndReturnArgs} args - Arguments to create many Customers.
     * @example
     * // Create many Customers
     * const customer = await prisma.customer.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Customers and only return the `id`
     * const customerWithIdOnly = await prisma.customer.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends CustomerCreateManyAndReturnArgs>(args?: SelectSubset<T, CustomerCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$CustomerPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a Customer.
     * @param {CustomerDeleteArgs} args - Arguments to delete one Customer.
     * @example
     * // Delete one Customer
     * const Customer = await prisma.customer.delete({
     *   where: {
     *     // ... filter to delete one Customer
     *   }
     * })
     * 
     */
    delete<T extends CustomerDeleteArgs>(args: SelectSubset<T, CustomerDeleteArgs<ExtArgs>>): Prisma__CustomerClient<$Result.GetResult<Prisma.$CustomerPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one Customer.
     * @param {CustomerUpdateArgs} args - Arguments to update one Customer.
     * @example
     * // Update one Customer
     * const customer = await prisma.customer.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends CustomerUpdateArgs>(args: SelectSubset<T, CustomerUpdateArgs<ExtArgs>>): Prisma__CustomerClient<$Result.GetResult<Prisma.$CustomerPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more Customers.
     * @param {CustomerDeleteManyArgs} args - Arguments to filter Customers to delete.
     * @example
     * // Delete a few Customers
     * const { count } = await prisma.customer.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends CustomerDeleteManyArgs>(args?: SelectSubset<T, CustomerDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Customers.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CustomerUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Customers
     * const customer = await prisma.customer.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends CustomerUpdateManyArgs>(args: SelectSubset<T, CustomerUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Customers and returns the data updated in the database.
     * @param {CustomerUpdateManyAndReturnArgs} args - Arguments to update many Customers.
     * @example
     * // Update many Customers
     * const customer = await prisma.customer.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more Customers and only return the `id`
     * const customerWithIdOnly = await prisma.customer.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends CustomerUpdateManyAndReturnArgs>(args: SelectSubset<T, CustomerUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$CustomerPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one Customer.
     * @param {CustomerUpsertArgs} args - Arguments to update or create a Customer.
     * @example
     * // Update or create a Customer
     * const customer = await prisma.customer.upsert({
     *   create: {
     *     // ... data to create a Customer
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Customer we want to update
     *   }
     * })
     */
    upsert<T extends CustomerUpsertArgs>(args: SelectSubset<T, CustomerUpsertArgs<ExtArgs>>): Prisma__CustomerClient<$Result.GetResult<Prisma.$CustomerPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of Customers.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CustomerCountArgs} args - Arguments to filter Customers to count.
     * @example
     * // Count the number of Customers
     * const count = await prisma.customer.count({
     *   where: {
     *     // ... the filter for the Customers we want to count
     *   }
     * })
    **/
    count<T extends CustomerCountArgs>(
      args?: Subset<T, CustomerCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], CustomerCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Customer.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CustomerAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends CustomerAggregateArgs>(args: Subset<T, CustomerAggregateArgs>): Prisma.PrismaPromise<GetCustomerAggregateType<T>>

    /**
     * Group by Customer.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CustomerGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends CustomerGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: CustomerGroupByArgs['orderBy'] }
        : { orderBy?: CustomerGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, CustomerGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetCustomerGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the Customer model
   */
  readonly fields: CustomerFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for Customer.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__CustomerClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    Invoice<T extends Customer$InvoiceArgs<ExtArgs> = {}>(args?: Subset<T, Customer$InvoiceArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$InvoicePayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    BankStatement<T extends Customer$BankStatementArgs<ExtArgs> = {}>(args?: Subset<T, Customer$BankStatementArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$BankStatementPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the Customer model
   */
  interface CustomerFieldRefs {
    readonly id: FieldRef<"Customer", 'Int'>
    readonly createdAt: FieldRef<"Customer", 'DateTime'>
    readonly updatedAt: FieldRef<"Customer", 'DateTime'>
    readonly name: FieldRef<"Customer", 'String'>
    readonly country: FieldRef<"Customer", 'String'>
    readonly etaId: FieldRef<"Customer", 'String'>
    readonly paymentTerms: FieldRef<"Customer", 'Int'>
  }
    

  // Custom InputTypes
  /**
   * Customer findUnique
   */
  export type CustomerFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Customer
     */
    select?: CustomerSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Customer
     */
    omit?: CustomerOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CustomerInclude<ExtArgs> | null
    /**
     * Filter, which Customer to fetch.
     */
    where: CustomerWhereUniqueInput
  }

  /**
   * Customer findUniqueOrThrow
   */
  export type CustomerFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Customer
     */
    select?: CustomerSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Customer
     */
    omit?: CustomerOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CustomerInclude<ExtArgs> | null
    /**
     * Filter, which Customer to fetch.
     */
    where: CustomerWhereUniqueInput
  }

  /**
   * Customer findFirst
   */
  export type CustomerFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Customer
     */
    select?: CustomerSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Customer
     */
    omit?: CustomerOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CustomerInclude<ExtArgs> | null
    /**
     * Filter, which Customer to fetch.
     */
    where?: CustomerWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Customers to fetch.
     */
    orderBy?: CustomerOrderByWithRelationInput | CustomerOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Customers.
     */
    cursor?: CustomerWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Customers from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Customers.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Customers.
     */
    distinct?: CustomerScalarFieldEnum | CustomerScalarFieldEnum[]
  }

  /**
   * Customer findFirstOrThrow
   */
  export type CustomerFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Customer
     */
    select?: CustomerSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Customer
     */
    omit?: CustomerOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CustomerInclude<ExtArgs> | null
    /**
     * Filter, which Customer to fetch.
     */
    where?: CustomerWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Customers to fetch.
     */
    orderBy?: CustomerOrderByWithRelationInput | CustomerOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Customers.
     */
    cursor?: CustomerWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Customers from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Customers.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Customers.
     */
    distinct?: CustomerScalarFieldEnum | CustomerScalarFieldEnum[]
  }

  /**
   * Customer findMany
   */
  export type CustomerFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Customer
     */
    select?: CustomerSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Customer
     */
    omit?: CustomerOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CustomerInclude<ExtArgs> | null
    /**
     * Filter, which Customers to fetch.
     */
    where?: CustomerWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Customers to fetch.
     */
    orderBy?: CustomerOrderByWithRelationInput | CustomerOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing Customers.
     */
    cursor?: CustomerWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Customers from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Customers.
     */
    skip?: number
    distinct?: CustomerScalarFieldEnum | CustomerScalarFieldEnum[]
  }

  /**
   * Customer create
   */
  export type CustomerCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Customer
     */
    select?: CustomerSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Customer
     */
    omit?: CustomerOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CustomerInclude<ExtArgs> | null
    /**
     * The data needed to create a Customer.
     */
    data: XOR<CustomerCreateInput, CustomerUncheckedCreateInput>
  }

  /**
   * Customer createMany
   */
  export type CustomerCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many Customers.
     */
    data: CustomerCreateManyInput | CustomerCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * Customer createManyAndReturn
   */
  export type CustomerCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Customer
     */
    select?: CustomerSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Customer
     */
    omit?: CustomerOmit<ExtArgs> | null
    /**
     * The data used to create many Customers.
     */
    data: CustomerCreateManyInput | CustomerCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * Customer update
   */
  export type CustomerUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Customer
     */
    select?: CustomerSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Customer
     */
    omit?: CustomerOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CustomerInclude<ExtArgs> | null
    /**
     * The data needed to update a Customer.
     */
    data: XOR<CustomerUpdateInput, CustomerUncheckedUpdateInput>
    /**
     * Choose, which Customer to update.
     */
    where: CustomerWhereUniqueInput
  }

  /**
   * Customer updateMany
   */
  export type CustomerUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update Customers.
     */
    data: XOR<CustomerUpdateManyMutationInput, CustomerUncheckedUpdateManyInput>
    /**
     * Filter which Customers to update
     */
    where?: CustomerWhereInput
    /**
     * Limit how many Customers to update.
     */
    limit?: number
  }

  /**
   * Customer updateManyAndReturn
   */
  export type CustomerUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Customer
     */
    select?: CustomerSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Customer
     */
    omit?: CustomerOmit<ExtArgs> | null
    /**
     * The data used to update Customers.
     */
    data: XOR<CustomerUpdateManyMutationInput, CustomerUncheckedUpdateManyInput>
    /**
     * Filter which Customers to update
     */
    where?: CustomerWhereInput
    /**
     * Limit how many Customers to update.
     */
    limit?: number
  }

  /**
   * Customer upsert
   */
  export type CustomerUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Customer
     */
    select?: CustomerSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Customer
     */
    omit?: CustomerOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CustomerInclude<ExtArgs> | null
    /**
     * The filter to search for the Customer to update in case it exists.
     */
    where: CustomerWhereUniqueInput
    /**
     * In case the Customer found by the `where` argument doesn't exist, create a new Customer with this data.
     */
    create: XOR<CustomerCreateInput, CustomerUncheckedCreateInput>
    /**
     * In case the Customer was found with the provided `where` argument, update it with this data.
     */
    update: XOR<CustomerUpdateInput, CustomerUncheckedUpdateInput>
  }

  /**
   * Customer delete
   */
  export type CustomerDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Customer
     */
    select?: CustomerSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Customer
     */
    omit?: CustomerOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CustomerInclude<ExtArgs> | null
    /**
     * Filter which Customer to delete.
     */
    where: CustomerWhereUniqueInput
  }

  /**
   * Customer deleteMany
   */
  export type CustomerDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Customers to delete
     */
    where?: CustomerWhereInput
    /**
     * Limit how many Customers to delete.
     */
    limit?: number
  }

  /**
   * Customer.Invoice
   */
  export type Customer$InvoiceArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Invoice
     */
    select?: InvoiceSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Invoice
     */
    omit?: InvoiceOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: InvoiceInclude<ExtArgs> | null
    where?: InvoiceWhereInput
    orderBy?: InvoiceOrderByWithRelationInput | InvoiceOrderByWithRelationInput[]
    cursor?: InvoiceWhereUniqueInput
    take?: number
    skip?: number
    distinct?: InvoiceScalarFieldEnum | InvoiceScalarFieldEnum[]
  }

  /**
   * Customer.BankStatement
   */
  export type Customer$BankStatementArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the BankStatement
     */
    select?: BankStatementSelect<ExtArgs> | null
    /**
     * Omit specific fields from the BankStatement
     */
    omit?: BankStatementOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: BankStatementInclude<ExtArgs> | null
    where?: BankStatementWhereInput
    orderBy?: BankStatementOrderByWithRelationInput | BankStatementOrderByWithRelationInput[]
    cursor?: BankStatementWhereUniqueInput
    take?: number
    skip?: number
    distinct?: BankStatementScalarFieldEnum | BankStatementScalarFieldEnum[]
  }

  /**
   * Customer without action
   */
  export type CustomerDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Customer
     */
    select?: CustomerSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Customer
     */
    omit?: CustomerOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CustomerInclude<ExtArgs> | null
  }


  /**
   * Model Supplier
   */

  export type AggregateSupplier = {
    _count: SupplierCountAggregateOutputType | null
    _avg: SupplierAvgAggregateOutputType | null
    _sum: SupplierSumAggregateOutputType | null
    _min: SupplierMinAggregateOutputType | null
    _max: SupplierMaxAggregateOutputType | null
  }

  export type SupplierAvgAggregateOutputType = {
    id: number | null
    paymentTerms: number | null
  }

  export type SupplierSumAggregateOutputType = {
    id: number | null
    paymentTerms: number | null
  }

  export type SupplierMinAggregateOutputType = {
    id: number | null
    createdAt: Date | null
    updatedAt: Date | null
    name: string | null
    country: string | null
    etaId: string | null
    paymentTerms: number | null
  }

  export type SupplierMaxAggregateOutputType = {
    id: number | null
    createdAt: Date | null
    updatedAt: Date | null
    name: string | null
    country: string | null
    etaId: string | null
    paymentTerms: number | null
  }

  export type SupplierCountAggregateOutputType = {
    id: number
    createdAt: number
    updatedAt: number
    name: number
    country: number
    etaId: number
    paymentTerms: number
    _all: number
  }


  export type SupplierAvgAggregateInputType = {
    id?: true
    paymentTerms?: true
  }

  export type SupplierSumAggregateInputType = {
    id?: true
    paymentTerms?: true
  }

  export type SupplierMinAggregateInputType = {
    id?: true
    createdAt?: true
    updatedAt?: true
    name?: true
    country?: true
    etaId?: true
    paymentTerms?: true
  }

  export type SupplierMaxAggregateInputType = {
    id?: true
    createdAt?: true
    updatedAt?: true
    name?: true
    country?: true
    etaId?: true
    paymentTerms?: true
  }

  export type SupplierCountAggregateInputType = {
    id?: true
    createdAt?: true
    updatedAt?: true
    name?: true
    country?: true
    etaId?: true
    paymentTerms?: true
    _all?: true
  }

  export type SupplierAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Supplier to aggregate.
     */
    where?: SupplierWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Suppliers to fetch.
     */
    orderBy?: SupplierOrderByWithRelationInput | SupplierOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: SupplierWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Suppliers from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Suppliers.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned Suppliers
    **/
    _count?: true | SupplierCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: SupplierAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: SupplierSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: SupplierMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: SupplierMaxAggregateInputType
  }

  export type GetSupplierAggregateType<T extends SupplierAggregateArgs> = {
        [P in keyof T & keyof AggregateSupplier]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateSupplier[P]>
      : GetScalarType<T[P], AggregateSupplier[P]>
  }




  export type SupplierGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: SupplierWhereInput
    orderBy?: SupplierOrderByWithAggregationInput | SupplierOrderByWithAggregationInput[]
    by: SupplierScalarFieldEnum[] | SupplierScalarFieldEnum
    having?: SupplierScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: SupplierCountAggregateInputType | true
    _avg?: SupplierAvgAggregateInputType
    _sum?: SupplierSumAggregateInputType
    _min?: SupplierMinAggregateInputType
    _max?: SupplierMaxAggregateInputType
  }

  export type SupplierGroupByOutputType = {
    id: number
    createdAt: Date
    updatedAt: Date
    name: string
    country: string | null
    etaId: string | null
    paymentTerms: number | null
    _count: SupplierCountAggregateOutputType | null
    _avg: SupplierAvgAggregateOutputType | null
    _sum: SupplierSumAggregateOutputType | null
    _min: SupplierMinAggregateOutputType | null
    _max: SupplierMaxAggregateOutputType | null
  }

  type GetSupplierGroupByPayload<T extends SupplierGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<SupplierGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof SupplierGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], SupplierGroupByOutputType[P]>
            : GetScalarType<T[P], SupplierGroupByOutputType[P]>
        }
      >
    >


  export type SupplierSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    name?: boolean
    country?: boolean
    etaId?: boolean
    paymentTerms?: boolean
    Invoice?: boolean | Supplier$InvoiceArgs<ExtArgs>
    BankStatement?: boolean | Supplier$BankStatementArgs<ExtArgs>
    _count?: boolean | SupplierCountOutputTypeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["supplier"]>

  export type SupplierSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    name?: boolean
    country?: boolean
    etaId?: boolean
    paymentTerms?: boolean
  }, ExtArgs["result"]["supplier"]>

  export type SupplierSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    name?: boolean
    country?: boolean
    etaId?: boolean
    paymentTerms?: boolean
  }, ExtArgs["result"]["supplier"]>

  export type SupplierSelectScalar = {
    id?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    name?: boolean
    country?: boolean
    etaId?: boolean
    paymentTerms?: boolean
  }

  export type SupplierOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "createdAt" | "updatedAt" | "name" | "country" | "etaId" | "paymentTerms", ExtArgs["result"]["supplier"]>
  export type SupplierInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    Invoice?: boolean | Supplier$InvoiceArgs<ExtArgs>
    BankStatement?: boolean | Supplier$BankStatementArgs<ExtArgs>
    _count?: boolean | SupplierCountOutputTypeDefaultArgs<ExtArgs>
  }
  export type SupplierIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {}
  export type SupplierIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {}

  export type $SupplierPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "Supplier"
    objects: {
      Invoice: Prisma.$InvoicePayload<ExtArgs>[]
      BankStatement: Prisma.$BankStatementPayload<ExtArgs>[]
    }
    scalars: $Extensions.GetPayloadResult<{
      id: number
      createdAt: Date
      updatedAt: Date
      name: string
      country: string | null
      etaId: string | null
      paymentTerms: number | null
    }, ExtArgs["result"]["supplier"]>
    composites: {}
  }

  type SupplierGetPayload<S extends boolean | null | undefined | SupplierDefaultArgs> = $Result.GetResult<Prisma.$SupplierPayload, S>

  type SupplierCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<SupplierFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: SupplierCountAggregateInputType | true
    }

  export interface SupplierDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['Supplier'], meta: { name: 'Supplier' } }
    /**
     * Find zero or one Supplier that matches the filter.
     * @param {SupplierFindUniqueArgs} args - Arguments to find a Supplier
     * @example
     * // Get one Supplier
     * const supplier = await prisma.supplier.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends SupplierFindUniqueArgs>(args: SelectSubset<T, SupplierFindUniqueArgs<ExtArgs>>): Prisma__SupplierClient<$Result.GetResult<Prisma.$SupplierPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one Supplier that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {SupplierFindUniqueOrThrowArgs} args - Arguments to find a Supplier
     * @example
     * // Get one Supplier
     * const supplier = await prisma.supplier.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends SupplierFindUniqueOrThrowArgs>(args: SelectSubset<T, SupplierFindUniqueOrThrowArgs<ExtArgs>>): Prisma__SupplierClient<$Result.GetResult<Prisma.$SupplierPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Supplier that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SupplierFindFirstArgs} args - Arguments to find a Supplier
     * @example
     * // Get one Supplier
     * const supplier = await prisma.supplier.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends SupplierFindFirstArgs>(args?: SelectSubset<T, SupplierFindFirstArgs<ExtArgs>>): Prisma__SupplierClient<$Result.GetResult<Prisma.$SupplierPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Supplier that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SupplierFindFirstOrThrowArgs} args - Arguments to find a Supplier
     * @example
     * // Get one Supplier
     * const supplier = await prisma.supplier.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends SupplierFindFirstOrThrowArgs>(args?: SelectSubset<T, SupplierFindFirstOrThrowArgs<ExtArgs>>): Prisma__SupplierClient<$Result.GetResult<Prisma.$SupplierPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more Suppliers that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SupplierFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Suppliers
     * const suppliers = await prisma.supplier.findMany()
     * 
     * // Get first 10 Suppliers
     * const suppliers = await prisma.supplier.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const supplierWithIdOnly = await prisma.supplier.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends SupplierFindManyArgs>(args?: SelectSubset<T, SupplierFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$SupplierPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a Supplier.
     * @param {SupplierCreateArgs} args - Arguments to create a Supplier.
     * @example
     * // Create one Supplier
     * const Supplier = await prisma.supplier.create({
     *   data: {
     *     // ... data to create a Supplier
     *   }
     * })
     * 
     */
    create<T extends SupplierCreateArgs>(args: SelectSubset<T, SupplierCreateArgs<ExtArgs>>): Prisma__SupplierClient<$Result.GetResult<Prisma.$SupplierPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many Suppliers.
     * @param {SupplierCreateManyArgs} args - Arguments to create many Suppliers.
     * @example
     * // Create many Suppliers
     * const supplier = await prisma.supplier.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends SupplierCreateManyArgs>(args?: SelectSubset<T, SupplierCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Suppliers and returns the data saved in the database.
     * @param {SupplierCreateManyAndReturnArgs} args - Arguments to create many Suppliers.
     * @example
     * // Create many Suppliers
     * const supplier = await prisma.supplier.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Suppliers and only return the `id`
     * const supplierWithIdOnly = await prisma.supplier.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends SupplierCreateManyAndReturnArgs>(args?: SelectSubset<T, SupplierCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$SupplierPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a Supplier.
     * @param {SupplierDeleteArgs} args - Arguments to delete one Supplier.
     * @example
     * // Delete one Supplier
     * const Supplier = await prisma.supplier.delete({
     *   where: {
     *     // ... filter to delete one Supplier
     *   }
     * })
     * 
     */
    delete<T extends SupplierDeleteArgs>(args: SelectSubset<T, SupplierDeleteArgs<ExtArgs>>): Prisma__SupplierClient<$Result.GetResult<Prisma.$SupplierPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one Supplier.
     * @param {SupplierUpdateArgs} args - Arguments to update one Supplier.
     * @example
     * // Update one Supplier
     * const supplier = await prisma.supplier.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends SupplierUpdateArgs>(args: SelectSubset<T, SupplierUpdateArgs<ExtArgs>>): Prisma__SupplierClient<$Result.GetResult<Prisma.$SupplierPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more Suppliers.
     * @param {SupplierDeleteManyArgs} args - Arguments to filter Suppliers to delete.
     * @example
     * // Delete a few Suppliers
     * const { count } = await prisma.supplier.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends SupplierDeleteManyArgs>(args?: SelectSubset<T, SupplierDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Suppliers.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SupplierUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Suppliers
     * const supplier = await prisma.supplier.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends SupplierUpdateManyArgs>(args: SelectSubset<T, SupplierUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Suppliers and returns the data updated in the database.
     * @param {SupplierUpdateManyAndReturnArgs} args - Arguments to update many Suppliers.
     * @example
     * // Update many Suppliers
     * const supplier = await prisma.supplier.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more Suppliers and only return the `id`
     * const supplierWithIdOnly = await prisma.supplier.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends SupplierUpdateManyAndReturnArgs>(args: SelectSubset<T, SupplierUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$SupplierPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one Supplier.
     * @param {SupplierUpsertArgs} args - Arguments to update or create a Supplier.
     * @example
     * // Update or create a Supplier
     * const supplier = await prisma.supplier.upsert({
     *   create: {
     *     // ... data to create a Supplier
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Supplier we want to update
     *   }
     * })
     */
    upsert<T extends SupplierUpsertArgs>(args: SelectSubset<T, SupplierUpsertArgs<ExtArgs>>): Prisma__SupplierClient<$Result.GetResult<Prisma.$SupplierPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of Suppliers.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SupplierCountArgs} args - Arguments to filter Suppliers to count.
     * @example
     * // Count the number of Suppliers
     * const count = await prisma.supplier.count({
     *   where: {
     *     // ... the filter for the Suppliers we want to count
     *   }
     * })
    **/
    count<T extends SupplierCountArgs>(
      args?: Subset<T, SupplierCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], SupplierCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Supplier.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SupplierAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends SupplierAggregateArgs>(args: Subset<T, SupplierAggregateArgs>): Prisma.PrismaPromise<GetSupplierAggregateType<T>>

    /**
     * Group by Supplier.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SupplierGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends SupplierGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: SupplierGroupByArgs['orderBy'] }
        : { orderBy?: SupplierGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, SupplierGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetSupplierGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the Supplier model
   */
  readonly fields: SupplierFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for Supplier.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__SupplierClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    Invoice<T extends Supplier$InvoiceArgs<ExtArgs> = {}>(args?: Subset<T, Supplier$InvoiceArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$InvoicePayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    BankStatement<T extends Supplier$BankStatementArgs<ExtArgs> = {}>(args?: Subset<T, Supplier$BankStatementArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$BankStatementPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the Supplier model
   */
  interface SupplierFieldRefs {
    readonly id: FieldRef<"Supplier", 'Int'>
    readonly createdAt: FieldRef<"Supplier", 'DateTime'>
    readonly updatedAt: FieldRef<"Supplier", 'DateTime'>
    readonly name: FieldRef<"Supplier", 'String'>
    readonly country: FieldRef<"Supplier", 'String'>
    readonly etaId: FieldRef<"Supplier", 'String'>
    readonly paymentTerms: FieldRef<"Supplier", 'Int'>
  }
    

  // Custom InputTypes
  /**
   * Supplier findUnique
   */
  export type SupplierFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Supplier
     */
    select?: SupplierSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Supplier
     */
    omit?: SupplierOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SupplierInclude<ExtArgs> | null
    /**
     * Filter, which Supplier to fetch.
     */
    where: SupplierWhereUniqueInput
  }

  /**
   * Supplier findUniqueOrThrow
   */
  export type SupplierFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Supplier
     */
    select?: SupplierSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Supplier
     */
    omit?: SupplierOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SupplierInclude<ExtArgs> | null
    /**
     * Filter, which Supplier to fetch.
     */
    where: SupplierWhereUniqueInput
  }

  /**
   * Supplier findFirst
   */
  export type SupplierFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Supplier
     */
    select?: SupplierSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Supplier
     */
    omit?: SupplierOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SupplierInclude<ExtArgs> | null
    /**
     * Filter, which Supplier to fetch.
     */
    where?: SupplierWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Suppliers to fetch.
     */
    orderBy?: SupplierOrderByWithRelationInput | SupplierOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Suppliers.
     */
    cursor?: SupplierWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Suppliers from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Suppliers.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Suppliers.
     */
    distinct?: SupplierScalarFieldEnum | SupplierScalarFieldEnum[]
  }

  /**
   * Supplier findFirstOrThrow
   */
  export type SupplierFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Supplier
     */
    select?: SupplierSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Supplier
     */
    omit?: SupplierOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SupplierInclude<ExtArgs> | null
    /**
     * Filter, which Supplier to fetch.
     */
    where?: SupplierWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Suppliers to fetch.
     */
    orderBy?: SupplierOrderByWithRelationInput | SupplierOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Suppliers.
     */
    cursor?: SupplierWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Suppliers from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Suppliers.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Suppliers.
     */
    distinct?: SupplierScalarFieldEnum | SupplierScalarFieldEnum[]
  }

  /**
   * Supplier findMany
   */
  export type SupplierFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Supplier
     */
    select?: SupplierSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Supplier
     */
    omit?: SupplierOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SupplierInclude<ExtArgs> | null
    /**
     * Filter, which Suppliers to fetch.
     */
    where?: SupplierWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Suppliers to fetch.
     */
    orderBy?: SupplierOrderByWithRelationInput | SupplierOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing Suppliers.
     */
    cursor?: SupplierWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Suppliers from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Suppliers.
     */
    skip?: number
    distinct?: SupplierScalarFieldEnum | SupplierScalarFieldEnum[]
  }

  /**
   * Supplier create
   */
  export type SupplierCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Supplier
     */
    select?: SupplierSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Supplier
     */
    omit?: SupplierOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SupplierInclude<ExtArgs> | null
    /**
     * The data needed to create a Supplier.
     */
    data: XOR<SupplierCreateInput, SupplierUncheckedCreateInput>
  }

  /**
   * Supplier createMany
   */
  export type SupplierCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many Suppliers.
     */
    data: SupplierCreateManyInput | SupplierCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * Supplier createManyAndReturn
   */
  export type SupplierCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Supplier
     */
    select?: SupplierSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Supplier
     */
    omit?: SupplierOmit<ExtArgs> | null
    /**
     * The data used to create many Suppliers.
     */
    data: SupplierCreateManyInput | SupplierCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * Supplier update
   */
  export type SupplierUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Supplier
     */
    select?: SupplierSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Supplier
     */
    omit?: SupplierOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SupplierInclude<ExtArgs> | null
    /**
     * The data needed to update a Supplier.
     */
    data: XOR<SupplierUpdateInput, SupplierUncheckedUpdateInput>
    /**
     * Choose, which Supplier to update.
     */
    where: SupplierWhereUniqueInput
  }

  /**
   * Supplier updateMany
   */
  export type SupplierUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update Suppliers.
     */
    data: XOR<SupplierUpdateManyMutationInput, SupplierUncheckedUpdateManyInput>
    /**
     * Filter which Suppliers to update
     */
    where?: SupplierWhereInput
    /**
     * Limit how many Suppliers to update.
     */
    limit?: number
  }

  /**
   * Supplier updateManyAndReturn
   */
  export type SupplierUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Supplier
     */
    select?: SupplierSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Supplier
     */
    omit?: SupplierOmit<ExtArgs> | null
    /**
     * The data used to update Suppliers.
     */
    data: XOR<SupplierUpdateManyMutationInput, SupplierUncheckedUpdateManyInput>
    /**
     * Filter which Suppliers to update
     */
    where?: SupplierWhereInput
    /**
     * Limit how many Suppliers to update.
     */
    limit?: number
  }

  /**
   * Supplier upsert
   */
  export type SupplierUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Supplier
     */
    select?: SupplierSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Supplier
     */
    omit?: SupplierOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SupplierInclude<ExtArgs> | null
    /**
     * The filter to search for the Supplier to update in case it exists.
     */
    where: SupplierWhereUniqueInput
    /**
     * In case the Supplier found by the `where` argument doesn't exist, create a new Supplier with this data.
     */
    create: XOR<SupplierCreateInput, SupplierUncheckedCreateInput>
    /**
     * In case the Supplier was found with the provided `where` argument, update it with this data.
     */
    update: XOR<SupplierUpdateInput, SupplierUncheckedUpdateInput>
  }

  /**
   * Supplier delete
   */
  export type SupplierDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Supplier
     */
    select?: SupplierSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Supplier
     */
    omit?: SupplierOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SupplierInclude<ExtArgs> | null
    /**
     * Filter which Supplier to delete.
     */
    where: SupplierWhereUniqueInput
  }

  /**
   * Supplier deleteMany
   */
  export type SupplierDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Suppliers to delete
     */
    where?: SupplierWhereInput
    /**
     * Limit how many Suppliers to delete.
     */
    limit?: number
  }

  /**
   * Supplier.Invoice
   */
  export type Supplier$InvoiceArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Invoice
     */
    select?: InvoiceSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Invoice
     */
    omit?: InvoiceOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: InvoiceInclude<ExtArgs> | null
    where?: InvoiceWhereInput
    orderBy?: InvoiceOrderByWithRelationInput | InvoiceOrderByWithRelationInput[]
    cursor?: InvoiceWhereUniqueInput
    take?: number
    skip?: number
    distinct?: InvoiceScalarFieldEnum | InvoiceScalarFieldEnum[]
  }

  /**
   * Supplier.BankStatement
   */
  export type Supplier$BankStatementArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the BankStatement
     */
    select?: BankStatementSelect<ExtArgs> | null
    /**
     * Omit specific fields from the BankStatement
     */
    omit?: BankStatementOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: BankStatementInclude<ExtArgs> | null
    where?: BankStatementWhereInput
    orderBy?: BankStatementOrderByWithRelationInput | BankStatementOrderByWithRelationInput[]
    cursor?: BankStatementWhereUniqueInput
    take?: number
    skip?: number
    distinct?: BankStatementScalarFieldEnum | BankStatementScalarFieldEnum[]
  }

  /**
   * Supplier without action
   */
  export type SupplierDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Supplier
     */
    select?: SupplierSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Supplier
     */
    omit?: SupplierOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SupplierInclude<ExtArgs> | null
  }


  /**
   * Model Bank
   */

  export type AggregateBank = {
    _count: BankCountAggregateOutputType | null
    _avg: BankAvgAggregateOutputType | null
    _sum: BankSumAggregateOutputType | null
    _min: BankMinAggregateOutputType | null
    _max: BankMaxAggregateOutputType | null
  }

  export type BankAvgAggregateOutputType = {
    id: number | null
  }

  export type BankSumAggregateOutputType = {
    id: number | null
  }

  export type BankMinAggregateOutputType = {
    id: number | null
    createdAt: Date | null
    updatedAt: Date | null
    name: string | null
  }

  export type BankMaxAggregateOutputType = {
    id: number | null
    createdAt: Date | null
    updatedAt: Date | null
    name: string | null
  }

  export type BankCountAggregateOutputType = {
    id: number
    createdAt: number
    updatedAt: number
    name: number
    _all: number
  }


  export type BankAvgAggregateInputType = {
    id?: true
  }

  export type BankSumAggregateInputType = {
    id?: true
  }

  export type BankMinAggregateInputType = {
    id?: true
    createdAt?: true
    updatedAt?: true
    name?: true
  }

  export type BankMaxAggregateInputType = {
    id?: true
    createdAt?: true
    updatedAt?: true
    name?: true
  }

  export type BankCountAggregateInputType = {
    id?: true
    createdAt?: true
    updatedAt?: true
    name?: true
    _all?: true
  }

  export type BankAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Bank to aggregate.
     */
    where?: BankWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Banks to fetch.
     */
    orderBy?: BankOrderByWithRelationInput | BankOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: BankWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Banks from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Banks.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned Banks
    **/
    _count?: true | BankCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: BankAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: BankSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: BankMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: BankMaxAggregateInputType
  }

  export type GetBankAggregateType<T extends BankAggregateArgs> = {
        [P in keyof T & keyof AggregateBank]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateBank[P]>
      : GetScalarType<T[P], AggregateBank[P]>
  }




  export type BankGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: BankWhereInput
    orderBy?: BankOrderByWithAggregationInput | BankOrderByWithAggregationInput[]
    by: BankScalarFieldEnum[] | BankScalarFieldEnum
    having?: BankScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: BankCountAggregateInputType | true
    _avg?: BankAvgAggregateInputType
    _sum?: BankSumAggregateInputType
    _min?: BankMinAggregateInputType
    _max?: BankMaxAggregateInputType
  }

  export type BankGroupByOutputType = {
    id: number
    createdAt: Date
    updatedAt: Date
    name: string
    _count: BankCountAggregateOutputType | null
    _avg: BankAvgAggregateOutputType | null
    _sum: BankSumAggregateOutputType | null
    _min: BankMinAggregateOutputType | null
    _max: BankMaxAggregateOutputType | null
  }

  type GetBankGroupByPayload<T extends BankGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<BankGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof BankGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], BankGroupByOutputType[P]>
            : GetScalarType<T[P], BankGroupByOutputType[P]>
        }
      >
    >


  export type BankSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    name?: boolean
    bankStatements?: boolean | Bank$bankStatementsArgs<ExtArgs>
    _count?: boolean | BankCountOutputTypeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["bank"]>

  export type BankSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    name?: boolean
  }, ExtArgs["result"]["bank"]>

  export type BankSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    name?: boolean
  }, ExtArgs["result"]["bank"]>

  export type BankSelectScalar = {
    id?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    name?: boolean
  }

  export type BankOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "createdAt" | "updatedAt" | "name", ExtArgs["result"]["bank"]>
  export type BankInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    bankStatements?: boolean | Bank$bankStatementsArgs<ExtArgs>
    _count?: boolean | BankCountOutputTypeDefaultArgs<ExtArgs>
  }
  export type BankIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {}
  export type BankIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {}

  export type $BankPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "Bank"
    objects: {
      bankStatements: Prisma.$BankStatementPayload<ExtArgs>[]
    }
    scalars: $Extensions.GetPayloadResult<{
      id: number
      createdAt: Date
      updatedAt: Date
      name: string
    }, ExtArgs["result"]["bank"]>
    composites: {}
  }

  type BankGetPayload<S extends boolean | null | undefined | BankDefaultArgs> = $Result.GetResult<Prisma.$BankPayload, S>

  type BankCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<BankFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: BankCountAggregateInputType | true
    }

  export interface BankDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['Bank'], meta: { name: 'Bank' } }
    /**
     * Find zero or one Bank that matches the filter.
     * @param {BankFindUniqueArgs} args - Arguments to find a Bank
     * @example
     * // Get one Bank
     * const bank = await prisma.bank.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends BankFindUniqueArgs>(args: SelectSubset<T, BankFindUniqueArgs<ExtArgs>>): Prisma__BankClient<$Result.GetResult<Prisma.$BankPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one Bank that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {BankFindUniqueOrThrowArgs} args - Arguments to find a Bank
     * @example
     * // Get one Bank
     * const bank = await prisma.bank.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends BankFindUniqueOrThrowArgs>(args: SelectSubset<T, BankFindUniqueOrThrowArgs<ExtArgs>>): Prisma__BankClient<$Result.GetResult<Prisma.$BankPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Bank that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {BankFindFirstArgs} args - Arguments to find a Bank
     * @example
     * // Get one Bank
     * const bank = await prisma.bank.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends BankFindFirstArgs>(args?: SelectSubset<T, BankFindFirstArgs<ExtArgs>>): Prisma__BankClient<$Result.GetResult<Prisma.$BankPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Bank that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {BankFindFirstOrThrowArgs} args - Arguments to find a Bank
     * @example
     * // Get one Bank
     * const bank = await prisma.bank.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends BankFindFirstOrThrowArgs>(args?: SelectSubset<T, BankFindFirstOrThrowArgs<ExtArgs>>): Prisma__BankClient<$Result.GetResult<Prisma.$BankPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more Banks that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {BankFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Banks
     * const banks = await prisma.bank.findMany()
     * 
     * // Get first 10 Banks
     * const banks = await prisma.bank.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const bankWithIdOnly = await prisma.bank.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends BankFindManyArgs>(args?: SelectSubset<T, BankFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$BankPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a Bank.
     * @param {BankCreateArgs} args - Arguments to create a Bank.
     * @example
     * // Create one Bank
     * const Bank = await prisma.bank.create({
     *   data: {
     *     // ... data to create a Bank
     *   }
     * })
     * 
     */
    create<T extends BankCreateArgs>(args: SelectSubset<T, BankCreateArgs<ExtArgs>>): Prisma__BankClient<$Result.GetResult<Prisma.$BankPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many Banks.
     * @param {BankCreateManyArgs} args - Arguments to create many Banks.
     * @example
     * // Create many Banks
     * const bank = await prisma.bank.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends BankCreateManyArgs>(args?: SelectSubset<T, BankCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Banks and returns the data saved in the database.
     * @param {BankCreateManyAndReturnArgs} args - Arguments to create many Banks.
     * @example
     * // Create many Banks
     * const bank = await prisma.bank.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Banks and only return the `id`
     * const bankWithIdOnly = await prisma.bank.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends BankCreateManyAndReturnArgs>(args?: SelectSubset<T, BankCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$BankPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a Bank.
     * @param {BankDeleteArgs} args - Arguments to delete one Bank.
     * @example
     * // Delete one Bank
     * const Bank = await prisma.bank.delete({
     *   where: {
     *     // ... filter to delete one Bank
     *   }
     * })
     * 
     */
    delete<T extends BankDeleteArgs>(args: SelectSubset<T, BankDeleteArgs<ExtArgs>>): Prisma__BankClient<$Result.GetResult<Prisma.$BankPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one Bank.
     * @param {BankUpdateArgs} args - Arguments to update one Bank.
     * @example
     * // Update one Bank
     * const bank = await prisma.bank.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends BankUpdateArgs>(args: SelectSubset<T, BankUpdateArgs<ExtArgs>>): Prisma__BankClient<$Result.GetResult<Prisma.$BankPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more Banks.
     * @param {BankDeleteManyArgs} args - Arguments to filter Banks to delete.
     * @example
     * // Delete a few Banks
     * const { count } = await prisma.bank.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends BankDeleteManyArgs>(args?: SelectSubset<T, BankDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Banks.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {BankUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Banks
     * const bank = await prisma.bank.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends BankUpdateManyArgs>(args: SelectSubset<T, BankUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Banks and returns the data updated in the database.
     * @param {BankUpdateManyAndReturnArgs} args - Arguments to update many Banks.
     * @example
     * // Update many Banks
     * const bank = await prisma.bank.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more Banks and only return the `id`
     * const bankWithIdOnly = await prisma.bank.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends BankUpdateManyAndReturnArgs>(args: SelectSubset<T, BankUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$BankPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one Bank.
     * @param {BankUpsertArgs} args - Arguments to update or create a Bank.
     * @example
     * // Update or create a Bank
     * const bank = await prisma.bank.upsert({
     *   create: {
     *     // ... data to create a Bank
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Bank we want to update
     *   }
     * })
     */
    upsert<T extends BankUpsertArgs>(args: SelectSubset<T, BankUpsertArgs<ExtArgs>>): Prisma__BankClient<$Result.GetResult<Prisma.$BankPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of Banks.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {BankCountArgs} args - Arguments to filter Banks to count.
     * @example
     * // Count the number of Banks
     * const count = await prisma.bank.count({
     *   where: {
     *     // ... the filter for the Banks we want to count
     *   }
     * })
    **/
    count<T extends BankCountArgs>(
      args?: Subset<T, BankCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], BankCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Bank.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {BankAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends BankAggregateArgs>(args: Subset<T, BankAggregateArgs>): Prisma.PrismaPromise<GetBankAggregateType<T>>

    /**
     * Group by Bank.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {BankGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends BankGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: BankGroupByArgs['orderBy'] }
        : { orderBy?: BankGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, BankGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetBankGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the Bank model
   */
  readonly fields: BankFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for Bank.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__BankClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    bankStatements<T extends Bank$bankStatementsArgs<ExtArgs> = {}>(args?: Subset<T, Bank$bankStatementsArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$BankStatementPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the Bank model
   */
  interface BankFieldRefs {
    readonly id: FieldRef<"Bank", 'Int'>
    readonly createdAt: FieldRef<"Bank", 'DateTime'>
    readonly updatedAt: FieldRef<"Bank", 'DateTime'>
    readonly name: FieldRef<"Bank", 'String'>
  }
    

  // Custom InputTypes
  /**
   * Bank findUnique
   */
  export type BankFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Bank
     */
    select?: BankSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Bank
     */
    omit?: BankOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: BankInclude<ExtArgs> | null
    /**
     * Filter, which Bank to fetch.
     */
    where: BankWhereUniqueInput
  }

  /**
   * Bank findUniqueOrThrow
   */
  export type BankFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Bank
     */
    select?: BankSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Bank
     */
    omit?: BankOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: BankInclude<ExtArgs> | null
    /**
     * Filter, which Bank to fetch.
     */
    where: BankWhereUniqueInput
  }

  /**
   * Bank findFirst
   */
  export type BankFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Bank
     */
    select?: BankSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Bank
     */
    omit?: BankOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: BankInclude<ExtArgs> | null
    /**
     * Filter, which Bank to fetch.
     */
    where?: BankWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Banks to fetch.
     */
    orderBy?: BankOrderByWithRelationInput | BankOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Banks.
     */
    cursor?: BankWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Banks from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Banks.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Banks.
     */
    distinct?: BankScalarFieldEnum | BankScalarFieldEnum[]
  }

  /**
   * Bank findFirstOrThrow
   */
  export type BankFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Bank
     */
    select?: BankSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Bank
     */
    omit?: BankOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: BankInclude<ExtArgs> | null
    /**
     * Filter, which Bank to fetch.
     */
    where?: BankWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Banks to fetch.
     */
    orderBy?: BankOrderByWithRelationInput | BankOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Banks.
     */
    cursor?: BankWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Banks from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Banks.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Banks.
     */
    distinct?: BankScalarFieldEnum | BankScalarFieldEnum[]
  }

  /**
   * Bank findMany
   */
  export type BankFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Bank
     */
    select?: BankSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Bank
     */
    omit?: BankOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: BankInclude<ExtArgs> | null
    /**
     * Filter, which Banks to fetch.
     */
    where?: BankWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Banks to fetch.
     */
    orderBy?: BankOrderByWithRelationInput | BankOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing Banks.
     */
    cursor?: BankWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Banks from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Banks.
     */
    skip?: number
    distinct?: BankScalarFieldEnum | BankScalarFieldEnum[]
  }

  /**
   * Bank create
   */
  export type BankCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Bank
     */
    select?: BankSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Bank
     */
    omit?: BankOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: BankInclude<ExtArgs> | null
    /**
     * The data needed to create a Bank.
     */
    data: XOR<BankCreateInput, BankUncheckedCreateInput>
  }

  /**
   * Bank createMany
   */
  export type BankCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many Banks.
     */
    data: BankCreateManyInput | BankCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * Bank createManyAndReturn
   */
  export type BankCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Bank
     */
    select?: BankSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Bank
     */
    omit?: BankOmit<ExtArgs> | null
    /**
     * The data used to create many Banks.
     */
    data: BankCreateManyInput | BankCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * Bank update
   */
  export type BankUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Bank
     */
    select?: BankSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Bank
     */
    omit?: BankOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: BankInclude<ExtArgs> | null
    /**
     * The data needed to update a Bank.
     */
    data: XOR<BankUpdateInput, BankUncheckedUpdateInput>
    /**
     * Choose, which Bank to update.
     */
    where: BankWhereUniqueInput
  }

  /**
   * Bank updateMany
   */
  export type BankUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update Banks.
     */
    data: XOR<BankUpdateManyMutationInput, BankUncheckedUpdateManyInput>
    /**
     * Filter which Banks to update
     */
    where?: BankWhereInput
    /**
     * Limit how many Banks to update.
     */
    limit?: number
  }

  /**
   * Bank updateManyAndReturn
   */
  export type BankUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Bank
     */
    select?: BankSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Bank
     */
    omit?: BankOmit<ExtArgs> | null
    /**
     * The data used to update Banks.
     */
    data: XOR<BankUpdateManyMutationInput, BankUncheckedUpdateManyInput>
    /**
     * Filter which Banks to update
     */
    where?: BankWhereInput
    /**
     * Limit how many Banks to update.
     */
    limit?: number
  }

  /**
   * Bank upsert
   */
  export type BankUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Bank
     */
    select?: BankSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Bank
     */
    omit?: BankOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: BankInclude<ExtArgs> | null
    /**
     * The filter to search for the Bank to update in case it exists.
     */
    where: BankWhereUniqueInput
    /**
     * In case the Bank found by the `where` argument doesn't exist, create a new Bank with this data.
     */
    create: XOR<BankCreateInput, BankUncheckedCreateInput>
    /**
     * In case the Bank was found with the provided `where` argument, update it with this data.
     */
    update: XOR<BankUpdateInput, BankUncheckedUpdateInput>
  }

  /**
   * Bank delete
   */
  export type BankDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Bank
     */
    select?: BankSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Bank
     */
    omit?: BankOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: BankInclude<ExtArgs> | null
    /**
     * Filter which Bank to delete.
     */
    where: BankWhereUniqueInput
  }

  /**
   * Bank deleteMany
   */
  export type BankDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Banks to delete
     */
    where?: BankWhereInput
    /**
     * Limit how many Banks to delete.
     */
    limit?: number
  }

  /**
   * Bank.bankStatements
   */
  export type Bank$bankStatementsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the BankStatement
     */
    select?: BankStatementSelect<ExtArgs> | null
    /**
     * Omit specific fields from the BankStatement
     */
    omit?: BankStatementOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: BankStatementInclude<ExtArgs> | null
    where?: BankStatementWhereInput
    orderBy?: BankStatementOrderByWithRelationInput | BankStatementOrderByWithRelationInput[]
    cursor?: BankStatementWhereUniqueInput
    take?: number
    skip?: number
    distinct?: BankStatementScalarFieldEnum | BankStatementScalarFieldEnum[]
  }

  /**
   * Bank without action
   */
  export type BankDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Bank
     */
    select?: BankSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Bank
     */
    omit?: BankOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: BankInclude<ExtArgs> | null
  }


  /**
   * Model BankStatement
   */

  export type AggregateBankStatement = {
    _count: BankStatementCountAggregateOutputType | null
    _avg: BankStatementAvgAggregateOutputType | null
    _sum: BankStatementSumAggregateOutputType | null
    _min: BankStatementMinAggregateOutputType | null
    _max: BankStatementMaxAggregateOutputType | null
  }

  export type BankStatementAvgAggregateOutputType = {
    id: number | null
    startingBalance: Decimal | null
    endingBalance: Decimal | null
    bankId: number | null
    customerId: number | null
    supplierId: number | null
  }

  export type BankStatementSumAggregateOutputType = {
    id: number | null
    startingBalance: Decimal | null
    endingBalance: Decimal | null
    bankId: number | null
    customerId: number | null
    supplierId: number | null
  }

  export type BankStatementMinAggregateOutputType = {
    id: number | null
    createdAt: Date | null
    updatedAt: Date | null
    fileName: string | null
    bankName: string | null
    accountNumber: string | null
    statementPeriodStart: Date | null
    statementPeriodEnd: Date | null
    accountType: string | null
    accountCurrency: string | null
    startingBalance: Decimal | null
    endingBalance: Decimal | null
    rawTextContent: string | null
    processingStatus: string | null
    bankId: number | null
    customerId: number | null
    supplierId: number | null
  }

  export type BankStatementMaxAggregateOutputType = {
    id: number | null
    createdAt: Date | null
    updatedAt: Date | null
    fileName: string | null
    bankName: string | null
    accountNumber: string | null
    statementPeriodStart: Date | null
    statementPeriodEnd: Date | null
    accountType: string | null
    accountCurrency: string | null
    startingBalance: Decimal | null
    endingBalance: Decimal | null
    rawTextContent: string | null
    processingStatus: string | null
    bankId: number | null
    customerId: number | null
    supplierId: number | null
  }

  export type BankStatementCountAggregateOutputType = {
    id: number
    createdAt: number
    updatedAt: number
    fileName: number
    bankName: number
    accountNumber: number
    statementPeriodStart: number
    statementPeriodEnd: number
    accountType: number
    accountCurrency: number
    startingBalance: number
    endingBalance: number
    rawTextContent: number
    processingStatus: number
    bankId: number
    customerId: number
    supplierId: number
    _all: number
  }


  export type BankStatementAvgAggregateInputType = {
    id?: true
    startingBalance?: true
    endingBalance?: true
    bankId?: true
    customerId?: true
    supplierId?: true
  }

  export type BankStatementSumAggregateInputType = {
    id?: true
    startingBalance?: true
    endingBalance?: true
    bankId?: true
    customerId?: true
    supplierId?: true
  }

  export type BankStatementMinAggregateInputType = {
    id?: true
    createdAt?: true
    updatedAt?: true
    fileName?: true
    bankName?: true
    accountNumber?: true
    statementPeriodStart?: true
    statementPeriodEnd?: true
    accountType?: true
    accountCurrency?: true
    startingBalance?: true
    endingBalance?: true
    rawTextContent?: true
    processingStatus?: true
    bankId?: true
    customerId?: true
    supplierId?: true
  }

  export type BankStatementMaxAggregateInputType = {
    id?: true
    createdAt?: true
    updatedAt?: true
    fileName?: true
    bankName?: true
    accountNumber?: true
    statementPeriodStart?: true
    statementPeriodEnd?: true
    accountType?: true
    accountCurrency?: true
    startingBalance?: true
    endingBalance?: true
    rawTextContent?: true
    processingStatus?: true
    bankId?: true
    customerId?: true
    supplierId?: true
  }

  export type BankStatementCountAggregateInputType = {
    id?: true
    createdAt?: true
    updatedAt?: true
    fileName?: true
    bankName?: true
    accountNumber?: true
    statementPeriodStart?: true
    statementPeriodEnd?: true
    accountType?: true
    accountCurrency?: true
    startingBalance?: true
    endingBalance?: true
    rawTextContent?: true
    processingStatus?: true
    bankId?: true
    customerId?: true
    supplierId?: true
    _all?: true
  }

  export type BankStatementAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which BankStatement to aggregate.
     */
    where?: BankStatementWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of BankStatements to fetch.
     */
    orderBy?: BankStatementOrderByWithRelationInput | BankStatementOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: BankStatementWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` BankStatements from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` BankStatements.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned BankStatements
    **/
    _count?: true | BankStatementCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: BankStatementAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: BankStatementSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: BankStatementMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: BankStatementMaxAggregateInputType
  }

  export type GetBankStatementAggregateType<T extends BankStatementAggregateArgs> = {
        [P in keyof T & keyof AggregateBankStatement]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateBankStatement[P]>
      : GetScalarType<T[P], AggregateBankStatement[P]>
  }




  export type BankStatementGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: BankStatementWhereInput
    orderBy?: BankStatementOrderByWithAggregationInput | BankStatementOrderByWithAggregationInput[]
    by: BankStatementScalarFieldEnum[] | BankStatementScalarFieldEnum
    having?: BankStatementScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: BankStatementCountAggregateInputType | true
    _avg?: BankStatementAvgAggregateInputType
    _sum?: BankStatementSumAggregateInputType
    _min?: BankStatementMinAggregateInputType
    _max?: BankStatementMaxAggregateInputType
  }

  export type BankStatementGroupByOutputType = {
    id: number
    createdAt: Date
    updatedAt: Date
    fileName: string | null
    bankName: string
    accountNumber: string
    statementPeriodStart: Date
    statementPeriodEnd: Date
    accountType: string | null
    accountCurrency: string | null
    startingBalance: Decimal
    endingBalance: Decimal
    rawTextContent: string | null
    processingStatus: string
    bankId: number
    customerId: number | null
    supplierId: number | null
    _count: BankStatementCountAggregateOutputType | null
    _avg: BankStatementAvgAggregateOutputType | null
    _sum: BankStatementSumAggregateOutputType | null
    _min: BankStatementMinAggregateOutputType | null
    _max: BankStatementMaxAggregateOutputType | null
  }

  type GetBankStatementGroupByPayload<T extends BankStatementGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<BankStatementGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof BankStatementGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], BankStatementGroupByOutputType[P]>
            : GetScalarType<T[P], BankStatementGroupByOutputType[P]>
        }
      >
    >


  export type BankStatementSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    fileName?: boolean
    bankName?: boolean
    accountNumber?: boolean
    statementPeriodStart?: boolean
    statementPeriodEnd?: boolean
    accountType?: boolean
    accountCurrency?: boolean
    startingBalance?: boolean
    endingBalance?: boolean
    rawTextContent?: boolean
    processingStatus?: boolean
    bankId?: boolean
    customerId?: boolean
    supplierId?: boolean
    bank?: boolean | BankDefaultArgs<ExtArgs>
    Customer?: boolean | BankStatement$CustomerArgs<ExtArgs>
    Supplier?: boolean | BankStatement$SupplierArgs<ExtArgs>
    transactions?: boolean | BankStatement$transactionsArgs<ExtArgs>
    _count?: boolean | BankStatementCountOutputTypeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["bankStatement"]>

  export type BankStatementSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    fileName?: boolean
    bankName?: boolean
    accountNumber?: boolean
    statementPeriodStart?: boolean
    statementPeriodEnd?: boolean
    accountType?: boolean
    accountCurrency?: boolean
    startingBalance?: boolean
    endingBalance?: boolean
    rawTextContent?: boolean
    processingStatus?: boolean
    bankId?: boolean
    customerId?: boolean
    supplierId?: boolean
    bank?: boolean | BankDefaultArgs<ExtArgs>
    Customer?: boolean | BankStatement$CustomerArgs<ExtArgs>
    Supplier?: boolean | BankStatement$SupplierArgs<ExtArgs>
  }, ExtArgs["result"]["bankStatement"]>

  export type BankStatementSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    fileName?: boolean
    bankName?: boolean
    accountNumber?: boolean
    statementPeriodStart?: boolean
    statementPeriodEnd?: boolean
    accountType?: boolean
    accountCurrency?: boolean
    startingBalance?: boolean
    endingBalance?: boolean
    rawTextContent?: boolean
    processingStatus?: boolean
    bankId?: boolean
    customerId?: boolean
    supplierId?: boolean
    bank?: boolean | BankDefaultArgs<ExtArgs>
    Customer?: boolean | BankStatement$CustomerArgs<ExtArgs>
    Supplier?: boolean | BankStatement$SupplierArgs<ExtArgs>
  }, ExtArgs["result"]["bankStatement"]>

  export type BankStatementSelectScalar = {
    id?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    fileName?: boolean
    bankName?: boolean
    accountNumber?: boolean
    statementPeriodStart?: boolean
    statementPeriodEnd?: boolean
    accountType?: boolean
    accountCurrency?: boolean
    startingBalance?: boolean
    endingBalance?: boolean
    rawTextContent?: boolean
    processingStatus?: boolean
    bankId?: boolean
    customerId?: boolean
    supplierId?: boolean
  }

  export type BankStatementOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "createdAt" | "updatedAt" | "fileName" | "bankName" | "accountNumber" | "statementPeriodStart" | "statementPeriodEnd" | "accountType" | "accountCurrency" | "startingBalance" | "endingBalance" | "rawTextContent" | "processingStatus" | "bankId" | "customerId" | "supplierId", ExtArgs["result"]["bankStatement"]>
  export type BankStatementInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    bank?: boolean | BankDefaultArgs<ExtArgs>
    Customer?: boolean | BankStatement$CustomerArgs<ExtArgs>
    Supplier?: boolean | BankStatement$SupplierArgs<ExtArgs>
    transactions?: boolean | BankStatement$transactionsArgs<ExtArgs>
    _count?: boolean | BankStatementCountOutputTypeDefaultArgs<ExtArgs>
  }
  export type BankStatementIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    bank?: boolean | BankDefaultArgs<ExtArgs>
    Customer?: boolean | BankStatement$CustomerArgs<ExtArgs>
    Supplier?: boolean | BankStatement$SupplierArgs<ExtArgs>
  }
  export type BankStatementIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    bank?: boolean | BankDefaultArgs<ExtArgs>
    Customer?: boolean | BankStatement$CustomerArgs<ExtArgs>
    Supplier?: boolean | BankStatement$SupplierArgs<ExtArgs>
  }

  export type $BankStatementPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "BankStatement"
    objects: {
      bank: Prisma.$BankPayload<ExtArgs>
      Customer: Prisma.$CustomerPayload<ExtArgs> | null
      Supplier: Prisma.$SupplierPayload<ExtArgs> | null
      transactions: Prisma.$TransactionPayload<ExtArgs>[]
    }
    scalars: $Extensions.GetPayloadResult<{
      id: number
      createdAt: Date
      updatedAt: Date
      fileName: string | null
      bankName: string
      accountNumber: string
      statementPeriodStart: Date
      statementPeriodEnd: Date
      accountType: string | null
      accountCurrency: string | null
      startingBalance: Prisma.Decimal
      endingBalance: Prisma.Decimal
      rawTextContent: string | null
      processingStatus: string
      bankId: number
      customerId: number | null
      supplierId: number | null
    }, ExtArgs["result"]["bankStatement"]>
    composites: {}
  }

  type BankStatementGetPayload<S extends boolean | null | undefined | BankStatementDefaultArgs> = $Result.GetResult<Prisma.$BankStatementPayload, S>

  type BankStatementCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<BankStatementFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: BankStatementCountAggregateInputType | true
    }

  export interface BankStatementDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['BankStatement'], meta: { name: 'BankStatement' } }
    /**
     * Find zero or one BankStatement that matches the filter.
     * @param {BankStatementFindUniqueArgs} args - Arguments to find a BankStatement
     * @example
     * // Get one BankStatement
     * const bankStatement = await prisma.bankStatement.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends BankStatementFindUniqueArgs>(args: SelectSubset<T, BankStatementFindUniqueArgs<ExtArgs>>): Prisma__BankStatementClient<$Result.GetResult<Prisma.$BankStatementPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one BankStatement that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {BankStatementFindUniqueOrThrowArgs} args - Arguments to find a BankStatement
     * @example
     * // Get one BankStatement
     * const bankStatement = await prisma.bankStatement.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends BankStatementFindUniqueOrThrowArgs>(args: SelectSubset<T, BankStatementFindUniqueOrThrowArgs<ExtArgs>>): Prisma__BankStatementClient<$Result.GetResult<Prisma.$BankStatementPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first BankStatement that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {BankStatementFindFirstArgs} args - Arguments to find a BankStatement
     * @example
     * // Get one BankStatement
     * const bankStatement = await prisma.bankStatement.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends BankStatementFindFirstArgs>(args?: SelectSubset<T, BankStatementFindFirstArgs<ExtArgs>>): Prisma__BankStatementClient<$Result.GetResult<Prisma.$BankStatementPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first BankStatement that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {BankStatementFindFirstOrThrowArgs} args - Arguments to find a BankStatement
     * @example
     * // Get one BankStatement
     * const bankStatement = await prisma.bankStatement.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends BankStatementFindFirstOrThrowArgs>(args?: SelectSubset<T, BankStatementFindFirstOrThrowArgs<ExtArgs>>): Prisma__BankStatementClient<$Result.GetResult<Prisma.$BankStatementPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more BankStatements that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {BankStatementFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all BankStatements
     * const bankStatements = await prisma.bankStatement.findMany()
     * 
     * // Get first 10 BankStatements
     * const bankStatements = await prisma.bankStatement.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const bankStatementWithIdOnly = await prisma.bankStatement.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends BankStatementFindManyArgs>(args?: SelectSubset<T, BankStatementFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$BankStatementPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a BankStatement.
     * @param {BankStatementCreateArgs} args - Arguments to create a BankStatement.
     * @example
     * // Create one BankStatement
     * const BankStatement = await prisma.bankStatement.create({
     *   data: {
     *     // ... data to create a BankStatement
     *   }
     * })
     * 
     */
    create<T extends BankStatementCreateArgs>(args: SelectSubset<T, BankStatementCreateArgs<ExtArgs>>): Prisma__BankStatementClient<$Result.GetResult<Prisma.$BankStatementPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many BankStatements.
     * @param {BankStatementCreateManyArgs} args - Arguments to create many BankStatements.
     * @example
     * // Create many BankStatements
     * const bankStatement = await prisma.bankStatement.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends BankStatementCreateManyArgs>(args?: SelectSubset<T, BankStatementCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many BankStatements and returns the data saved in the database.
     * @param {BankStatementCreateManyAndReturnArgs} args - Arguments to create many BankStatements.
     * @example
     * // Create many BankStatements
     * const bankStatement = await prisma.bankStatement.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many BankStatements and only return the `id`
     * const bankStatementWithIdOnly = await prisma.bankStatement.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends BankStatementCreateManyAndReturnArgs>(args?: SelectSubset<T, BankStatementCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$BankStatementPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a BankStatement.
     * @param {BankStatementDeleteArgs} args - Arguments to delete one BankStatement.
     * @example
     * // Delete one BankStatement
     * const BankStatement = await prisma.bankStatement.delete({
     *   where: {
     *     // ... filter to delete one BankStatement
     *   }
     * })
     * 
     */
    delete<T extends BankStatementDeleteArgs>(args: SelectSubset<T, BankStatementDeleteArgs<ExtArgs>>): Prisma__BankStatementClient<$Result.GetResult<Prisma.$BankStatementPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one BankStatement.
     * @param {BankStatementUpdateArgs} args - Arguments to update one BankStatement.
     * @example
     * // Update one BankStatement
     * const bankStatement = await prisma.bankStatement.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends BankStatementUpdateArgs>(args: SelectSubset<T, BankStatementUpdateArgs<ExtArgs>>): Prisma__BankStatementClient<$Result.GetResult<Prisma.$BankStatementPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more BankStatements.
     * @param {BankStatementDeleteManyArgs} args - Arguments to filter BankStatements to delete.
     * @example
     * // Delete a few BankStatements
     * const { count } = await prisma.bankStatement.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends BankStatementDeleteManyArgs>(args?: SelectSubset<T, BankStatementDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more BankStatements.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {BankStatementUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many BankStatements
     * const bankStatement = await prisma.bankStatement.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends BankStatementUpdateManyArgs>(args: SelectSubset<T, BankStatementUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more BankStatements and returns the data updated in the database.
     * @param {BankStatementUpdateManyAndReturnArgs} args - Arguments to update many BankStatements.
     * @example
     * // Update many BankStatements
     * const bankStatement = await prisma.bankStatement.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more BankStatements and only return the `id`
     * const bankStatementWithIdOnly = await prisma.bankStatement.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends BankStatementUpdateManyAndReturnArgs>(args: SelectSubset<T, BankStatementUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$BankStatementPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one BankStatement.
     * @param {BankStatementUpsertArgs} args - Arguments to update or create a BankStatement.
     * @example
     * // Update or create a BankStatement
     * const bankStatement = await prisma.bankStatement.upsert({
     *   create: {
     *     // ... data to create a BankStatement
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the BankStatement we want to update
     *   }
     * })
     */
    upsert<T extends BankStatementUpsertArgs>(args: SelectSubset<T, BankStatementUpsertArgs<ExtArgs>>): Prisma__BankStatementClient<$Result.GetResult<Prisma.$BankStatementPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of BankStatements.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {BankStatementCountArgs} args - Arguments to filter BankStatements to count.
     * @example
     * // Count the number of BankStatements
     * const count = await prisma.bankStatement.count({
     *   where: {
     *     // ... the filter for the BankStatements we want to count
     *   }
     * })
    **/
    count<T extends BankStatementCountArgs>(
      args?: Subset<T, BankStatementCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], BankStatementCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a BankStatement.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {BankStatementAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends BankStatementAggregateArgs>(args: Subset<T, BankStatementAggregateArgs>): Prisma.PrismaPromise<GetBankStatementAggregateType<T>>

    /**
     * Group by BankStatement.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {BankStatementGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends BankStatementGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: BankStatementGroupByArgs['orderBy'] }
        : { orderBy?: BankStatementGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, BankStatementGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetBankStatementGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the BankStatement model
   */
  readonly fields: BankStatementFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for BankStatement.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__BankStatementClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    bank<T extends BankDefaultArgs<ExtArgs> = {}>(args?: Subset<T, BankDefaultArgs<ExtArgs>>): Prisma__BankClient<$Result.GetResult<Prisma.$BankPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    Customer<T extends BankStatement$CustomerArgs<ExtArgs> = {}>(args?: Subset<T, BankStatement$CustomerArgs<ExtArgs>>): Prisma__CustomerClient<$Result.GetResult<Prisma.$CustomerPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>
    Supplier<T extends BankStatement$SupplierArgs<ExtArgs> = {}>(args?: Subset<T, BankStatement$SupplierArgs<ExtArgs>>): Prisma__SupplierClient<$Result.GetResult<Prisma.$SupplierPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>
    transactions<T extends BankStatement$transactionsArgs<ExtArgs> = {}>(args?: Subset<T, BankStatement$transactionsArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$TransactionPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the BankStatement model
   */
  interface BankStatementFieldRefs {
    readonly id: FieldRef<"BankStatement", 'Int'>
    readonly createdAt: FieldRef<"BankStatement", 'DateTime'>
    readonly updatedAt: FieldRef<"BankStatement", 'DateTime'>
    readonly fileName: FieldRef<"BankStatement", 'String'>
    readonly bankName: FieldRef<"BankStatement", 'String'>
    readonly accountNumber: FieldRef<"BankStatement", 'String'>
    readonly statementPeriodStart: FieldRef<"BankStatement", 'DateTime'>
    readonly statementPeriodEnd: FieldRef<"BankStatement", 'DateTime'>
    readonly accountType: FieldRef<"BankStatement", 'String'>
    readonly accountCurrency: FieldRef<"BankStatement", 'String'>
    readonly startingBalance: FieldRef<"BankStatement", 'Decimal'>
    readonly endingBalance: FieldRef<"BankStatement", 'Decimal'>
    readonly rawTextContent: FieldRef<"BankStatement", 'String'>
    readonly processingStatus: FieldRef<"BankStatement", 'String'>
    readonly bankId: FieldRef<"BankStatement", 'Int'>
    readonly customerId: FieldRef<"BankStatement", 'Int'>
    readonly supplierId: FieldRef<"BankStatement", 'Int'>
  }
    

  // Custom InputTypes
  /**
   * BankStatement findUnique
   */
  export type BankStatementFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the BankStatement
     */
    select?: BankStatementSelect<ExtArgs> | null
    /**
     * Omit specific fields from the BankStatement
     */
    omit?: BankStatementOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: BankStatementInclude<ExtArgs> | null
    /**
     * Filter, which BankStatement to fetch.
     */
    where: BankStatementWhereUniqueInput
  }

  /**
   * BankStatement findUniqueOrThrow
   */
  export type BankStatementFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the BankStatement
     */
    select?: BankStatementSelect<ExtArgs> | null
    /**
     * Omit specific fields from the BankStatement
     */
    omit?: BankStatementOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: BankStatementInclude<ExtArgs> | null
    /**
     * Filter, which BankStatement to fetch.
     */
    where: BankStatementWhereUniqueInput
  }

  /**
   * BankStatement findFirst
   */
  export type BankStatementFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the BankStatement
     */
    select?: BankStatementSelect<ExtArgs> | null
    /**
     * Omit specific fields from the BankStatement
     */
    omit?: BankStatementOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: BankStatementInclude<ExtArgs> | null
    /**
     * Filter, which BankStatement to fetch.
     */
    where?: BankStatementWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of BankStatements to fetch.
     */
    orderBy?: BankStatementOrderByWithRelationInput | BankStatementOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for BankStatements.
     */
    cursor?: BankStatementWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` BankStatements from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` BankStatements.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of BankStatements.
     */
    distinct?: BankStatementScalarFieldEnum | BankStatementScalarFieldEnum[]
  }

  /**
   * BankStatement findFirstOrThrow
   */
  export type BankStatementFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the BankStatement
     */
    select?: BankStatementSelect<ExtArgs> | null
    /**
     * Omit specific fields from the BankStatement
     */
    omit?: BankStatementOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: BankStatementInclude<ExtArgs> | null
    /**
     * Filter, which BankStatement to fetch.
     */
    where?: BankStatementWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of BankStatements to fetch.
     */
    orderBy?: BankStatementOrderByWithRelationInput | BankStatementOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for BankStatements.
     */
    cursor?: BankStatementWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` BankStatements from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` BankStatements.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of BankStatements.
     */
    distinct?: BankStatementScalarFieldEnum | BankStatementScalarFieldEnum[]
  }

  /**
   * BankStatement findMany
   */
  export type BankStatementFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the BankStatement
     */
    select?: BankStatementSelect<ExtArgs> | null
    /**
     * Omit specific fields from the BankStatement
     */
    omit?: BankStatementOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: BankStatementInclude<ExtArgs> | null
    /**
     * Filter, which BankStatements to fetch.
     */
    where?: BankStatementWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of BankStatements to fetch.
     */
    orderBy?: BankStatementOrderByWithRelationInput | BankStatementOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing BankStatements.
     */
    cursor?: BankStatementWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` BankStatements from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` BankStatements.
     */
    skip?: number
    distinct?: BankStatementScalarFieldEnum | BankStatementScalarFieldEnum[]
  }

  /**
   * BankStatement create
   */
  export type BankStatementCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the BankStatement
     */
    select?: BankStatementSelect<ExtArgs> | null
    /**
     * Omit specific fields from the BankStatement
     */
    omit?: BankStatementOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: BankStatementInclude<ExtArgs> | null
    /**
     * The data needed to create a BankStatement.
     */
    data: XOR<BankStatementCreateInput, BankStatementUncheckedCreateInput>
  }

  /**
   * BankStatement createMany
   */
  export type BankStatementCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many BankStatements.
     */
    data: BankStatementCreateManyInput | BankStatementCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * BankStatement createManyAndReturn
   */
  export type BankStatementCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the BankStatement
     */
    select?: BankStatementSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the BankStatement
     */
    omit?: BankStatementOmit<ExtArgs> | null
    /**
     * The data used to create many BankStatements.
     */
    data: BankStatementCreateManyInput | BankStatementCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: BankStatementIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * BankStatement update
   */
  export type BankStatementUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the BankStatement
     */
    select?: BankStatementSelect<ExtArgs> | null
    /**
     * Omit specific fields from the BankStatement
     */
    omit?: BankStatementOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: BankStatementInclude<ExtArgs> | null
    /**
     * The data needed to update a BankStatement.
     */
    data: XOR<BankStatementUpdateInput, BankStatementUncheckedUpdateInput>
    /**
     * Choose, which BankStatement to update.
     */
    where: BankStatementWhereUniqueInput
  }

  /**
   * BankStatement updateMany
   */
  export type BankStatementUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update BankStatements.
     */
    data: XOR<BankStatementUpdateManyMutationInput, BankStatementUncheckedUpdateManyInput>
    /**
     * Filter which BankStatements to update
     */
    where?: BankStatementWhereInput
    /**
     * Limit how many BankStatements to update.
     */
    limit?: number
  }

  /**
   * BankStatement updateManyAndReturn
   */
  export type BankStatementUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the BankStatement
     */
    select?: BankStatementSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the BankStatement
     */
    omit?: BankStatementOmit<ExtArgs> | null
    /**
     * The data used to update BankStatements.
     */
    data: XOR<BankStatementUpdateManyMutationInput, BankStatementUncheckedUpdateManyInput>
    /**
     * Filter which BankStatements to update
     */
    where?: BankStatementWhereInput
    /**
     * Limit how many BankStatements to update.
     */
    limit?: number
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: BankStatementIncludeUpdateManyAndReturn<ExtArgs> | null
  }

  /**
   * BankStatement upsert
   */
  export type BankStatementUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the BankStatement
     */
    select?: BankStatementSelect<ExtArgs> | null
    /**
     * Omit specific fields from the BankStatement
     */
    omit?: BankStatementOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: BankStatementInclude<ExtArgs> | null
    /**
     * The filter to search for the BankStatement to update in case it exists.
     */
    where: BankStatementWhereUniqueInput
    /**
     * In case the BankStatement found by the `where` argument doesn't exist, create a new BankStatement with this data.
     */
    create: XOR<BankStatementCreateInput, BankStatementUncheckedCreateInput>
    /**
     * In case the BankStatement was found with the provided `where` argument, update it with this data.
     */
    update: XOR<BankStatementUpdateInput, BankStatementUncheckedUpdateInput>
  }

  /**
   * BankStatement delete
   */
  export type BankStatementDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the BankStatement
     */
    select?: BankStatementSelect<ExtArgs> | null
    /**
     * Omit specific fields from the BankStatement
     */
    omit?: BankStatementOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: BankStatementInclude<ExtArgs> | null
    /**
     * Filter which BankStatement to delete.
     */
    where: BankStatementWhereUniqueInput
  }

  /**
   * BankStatement deleteMany
   */
  export type BankStatementDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which BankStatements to delete
     */
    where?: BankStatementWhereInput
    /**
     * Limit how many BankStatements to delete.
     */
    limit?: number
  }

  /**
   * BankStatement.Customer
   */
  export type BankStatement$CustomerArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Customer
     */
    select?: CustomerSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Customer
     */
    omit?: CustomerOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CustomerInclude<ExtArgs> | null
    where?: CustomerWhereInput
  }

  /**
   * BankStatement.Supplier
   */
  export type BankStatement$SupplierArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Supplier
     */
    select?: SupplierSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Supplier
     */
    omit?: SupplierOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SupplierInclude<ExtArgs> | null
    where?: SupplierWhereInput
  }

  /**
   * BankStatement.transactions
   */
  export type BankStatement$transactionsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Transaction
     */
    select?: TransactionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Transaction
     */
    omit?: TransactionOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TransactionInclude<ExtArgs> | null
    where?: TransactionWhereInput
    orderBy?: TransactionOrderByWithRelationInput | TransactionOrderByWithRelationInput[]
    cursor?: TransactionWhereUniqueInput
    take?: number
    skip?: number
    distinct?: TransactionScalarFieldEnum | TransactionScalarFieldEnum[]
  }

  /**
   * BankStatement without action
   */
  export type BankStatementDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the BankStatement
     */
    select?: BankStatementSelect<ExtArgs> | null
    /**
     * Omit specific fields from the BankStatement
     */
    omit?: BankStatementOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: BankStatementInclude<ExtArgs> | null
  }


  /**
   * Model Transaction
   */

  export type AggregateTransaction = {
    _count: TransactionCountAggregateOutputType | null
    _avg: TransactionAvgAggregateOutputType | null
    _sum: TransactionSumAggregateOutputType | null
    _min: TransactionMinAggregateOutputType | null
    _max: TransactionMaxAggregateOutputType | null
  }

  export type TransactionAvgAggregateOutputType = {
    id: number | null
    creditAmount: Decimal | null
    debitAmount: Decimal | null
    balance: Decimal | null
    bankStatementId: number | null
  }

  export type TransactionSumAggregateOutputType = {
    id: number | null
    creditAmount: Decimal | null
    debitAmount: Decimal | null
    balance: Decimal | null
    bankStatementId: number | null
  }

  export type TransactionMinAggregateOutputType = {
    id: number | null
    createdAt: Date | null
    updatedAt: Date | null
    transactionDate: Date | null
    creditAmount: Decimal | null
    debitAmount: Decimal | null
    description: string | null
    balance: Decimal | null
    pageNumber: string | null
    entityName: string | null
    bankStatementId: number | null
  }

  export type TransactionMaxAggregateOutputType = {
    id: number | null
    createdAt: Date | null
    updatedAt: Date | null
    transactionDate: Date | null
    creditAmount: Decimal | null
    debitAmount: Decimal | null
    description: string | null
    balance: Decimal | null
    pageNumber: string | null
    entityName: string | null
    bankStatementId: number | null
  }

  export type TransactionCountAggregateOutputType = {
    id: number
    createdAt: number
    updatedAt: number
    transactionDate: number
    creditAmount: number
    debitAmount: number
    description: number
    balance: number
    pageNumber: number
    entityName: number
    bankStatementId: number
    _all: number
  }


  export type TransactionAvgAggregateInputType = {
    id?: true
    creditAmount?: true
    debitAmount?: true
    balance?: true
    bankStatementId?: true
  }

  export type TransactionSumAggregateInputType = {
    id?: true
    creditAmount?: true
    debitAmount?: true
    balance?: true
    bankStatementId?: true
  }

  export type TransactionMinAggregateInputType = {
    id?: true
    createdAt?: true
    updatedAt?: true
    transactionDate?: true
    creditAmount?: true
    debitAmount?: true
    description?: true
    balance?: true
    pageNumber?: true
    entityName?: true
    bankStatementId?: true
  }

  export type TransactionMaxAggregateInputType = {
    id?: true
    createdAt?: true
    updatedAt?: true
    transactionDate?: true
    creditAmount?: true
    debitAmount?: true
    description?: true
    balance?: true
    pageNumber?: true
    entityName?: true
    bankStatementId?: true
  }

  export type TransactionCountAggregateInputType = {
    id?: true
    createdAt?: true
    updatedAt?: true
    transactionDate?: true
    creditAmount?: true
    debitAmount?: true
    description?: true
    balance?: true
    pageNumber?: true
    entityName?: true
    bankStatementId?: true
    _all?: true
  }

  export type TransactionAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Transaction to aggregate.
     */
    where?: TransactionWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Transactions to fetch.
     */
    orderBy?: TransactionOrderByWithRelationInput | TransactionOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: TransactionWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Transactions from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Transactions.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned Transactions
    **/
    _count?: true | TransactionCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: TransactionAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: TransactionSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: TransactionMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: TransactionMaxAggregateInputType
  }

  export type GetTransactionAggregateType<T extends TransactionAggregateArgs> = {
        [P in keyof T & keyof AggregateTransaction]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateTransaction[P]>
      : GetScalarType<T[P], AggregateTransaction[P]>
  }




  export type TransactionGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: TransactionWhereInput
    orderBy?: TransactionOrderByWithAggregationInput | TransactionOrderByWithAggregationInput[]
    by: TransactionScalarFieldEnum[] | TransactionScalarFieldEnum
    having?: TransactionScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: TransactionCountAggregateInputType | true
    _avg?: TransactionAvgAggregateInputType
    _sum?: TransactionSumAggregateInputType
    _min?: TransactionMinAggregateInputType
    _max?: TransactionMaxAggregateInputType
  }

  export type TransactionGroupByOutputType = {
    id: number
    createdAt: Date
    updatedAt: Date
    transactionDate: Date
    creditAmount: Decimal | null
    debitAmount: Decimal | null
    description: string | null
    balance: Decimal | null
    pageNumber: string | null
    entityName: string | null
    bankStatementId: number
    _count: TransactionCountAggregateOutputType | null
    _avg: TransactionAvgAggregateOutputType | null
    _sum: TransactionSumAggregateOutputType | null
    _min: TransactionMinAggregateOutputType | null
    _max: TransactionMaxAggregateOutputType | null
  }

  type GetTransactionGroupByPayload<T extends TransactionGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<TransactionGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof TransactionGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], TransactionGroupByOutputType[P]>
            : GetScalarType<T[P], TransactionGroupByOutputType[P]>
        }
      >
    >


  export type TransactionSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    transactionDate?: boolean
    creditAmount?: boolean
    debitAmount?: boolean
    description?: boolean
    balance?: boolean
    pageNumber?: boolean
    entityName?: boolean
    bankStatementId?: boolean
    bankStatement?: boolean | BankStatementDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["transaction"]>

  export type TransactionSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    transactionDate?: boolean
    creditAmount?: boolean
    debitAmount?: boolean
    description?: boolean
    balance?: boolean
    pageNumber?: boolean
    entityName?: boolean
    bankStatementId?: boolean
    bankStatement?: boolean | BankStatementDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["transaction"]>

  export type TransactionSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    transactionDate?: boolean
    creditAmount?: boolean
    debitAmount?: boolean
    description?: boolean
    balance?: boolean
    pageNumber?: boolean
    entityName?: boolean
    bankStatementId?: boolean
    bankStatement?: boolean | BankStatementDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["transaction"]>

  export type TransactionSelectScalar = {
    id?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    transactionDate?: boolean
    creditAmount?: boolean
    debitAmount?: boolean
    description?: boolean
    balance?: boolean
    pageNumber?: boolean
    entityName?: boolean
    bankStatementId?: boolean
  }

  export type TransactionOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "createdAt" | "updatedAt" | "transactionDate" | "creditAmount" | "debitAmount" | "description" | "balance" | "pageNumber" | "entityName" | "bankStatementId", ExtArgs["result"]["transaction"]>
  export type TransactionInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    bankStatement?: boolean | BankStatementDefaultArgs<ExtArgs>
  }
  export type TransactionIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    bankStatement?: boolean | BankStatementDefaultArgs<ExtArgs>
  }
  export type TransactionIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    bankStatement?: boolean | BankStatementDefaultArgs<ExtArgs>
  }

  export type $TransactionPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "Transaction"
    objects: {
      bankStatement: Prisma.$BankStatementPayload<ExtArgs>
    }
    scalars: $Extensions.GetPayloadResult<{
      id: number
      createdAt: Date
      updatedAt: Date
      transactionDate: Date
      creditAmount: Prisma.Decimal | null
      debitAmount: Prisma.Decimal | null
      description: string | null
      balance: Prisma.Decimal | null
      pageNumber: string | null
      entityName: string | null
      bankStatementId: number
    }, ExtArgs["result"]["transaction"]>
    composites: {}
  }

  type TransactionGetPayload<S extends boolean | null | undefined | TransactionDefaultArgs> = $Result.GetResult<Prisma.$TransactionPayload, S>

  type TransactionCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<TransactionFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: TransactionCountAggregateInputType | true
    }

  export interface TransactionDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['Transaction'], meta: { name: 'Transaction' } }
    /**
     * Find zero or one Transaction that matches the filter.
     * @param {TransactionFindUniqueArgs} args - Arguments to find a Transaction
     * @example
     * // Get one Transaction
     * const transaction = await prisma.transaction.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends TransactionFindUniqueArgs>(args: SelectSubset<T, TransactionFindUniqueArgs<ExtArgs>>): Prisma__TransactionClient<$Result.GetResult<Prisma.$TransactionPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one Transaction that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {TransactionFindUniqueOrThrowArgs} args - Arguments to find a Transaction
     * @example
     * // Get one Transaction
     * const transaction = await prisma.transaction.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends TransactionFindUniqueOrThrowArgs>(args: SelectSubset<T, TransactionFindUniqueOrThrowArgs<ExtArgs>>): Prisma__TransactionClient<$Result.GetResult<Prisma.$TransactionPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Transaction that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TransactionFindFirstArgs} args - Arguments to find a Transaction
     * @example
     * // Get one Transaction
     * const transaction = await prisma.transaction.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends TransactionFindFirstArgs>(args?: SelectSubset<T, TransactionFindFirstArgs<ExtArgs>>): Prisma__TransactionClient<$Result.GetResult<Prisma.$TransactionPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Transaction that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TransactionFindFirstOrThrowArgs} args - Arguments to find a Transaction
     * @example
     * // Get one Transaction
     * const transaction = await prisma.transaction.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends TransactionFindFirstOrThrowArgs>(args?: SelectSubset<T, TransactionFindFirstOrThrowArgs<ExtArgs>>): Prisma__TransactionClient<$Result.GetResult<Prisma.$TransactionPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more Transactions that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TransactionFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Transactions
     * const transactions = await prisma.transaction.findMany()
     * 
     * // Get first 10 Transactions
     * const transactions = await prisma.transaction.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const transactionWithIdOnly = await prisma.transaction.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends TransactionFindManyArgs>(args?: SelectSubset<T, TransactionFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$TransactionPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a Transaction.
     * @param {TransactionCreateArgs} args - Arguments to create a Transaction.
     * @example
     * // Create one Transaction
     * const Transaction = await prisma.transaction.create({
     *   data: {
     *     // ... data to create a Transaction
     *   }
     * })
     * 
     */
    create<T extends TransactionCreateArgs>(args: SelectSubset<T, TransactionCreateArgs<ExtArgs>>): Prisma__TransactionClient<$Result.GetResult<Prisma.$TransactionPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many Transactions.
     * @param {TransactionCreateManyArgs} args - Arguments to create many Transactions.
     * @example
     * // Create many Transactions
     * const transaction = await prisma.transaction.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends TransactionCreateManyArgs>(args?: SelectSubset<T, TransactionCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Transactions and returns the data saved in the database.
     * @param {TransactionCreateManyAndReturnArgs} args - Arguments to create many Transactions.
     * @example
     * // Create many Transactions
     * const transaction = await prisma.transaction.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Transactions and only return the `id`
     * const transactionWithIdOnly = await prisma.transaction.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends TransactionCreateManyAndReturnArgs>(args?: SelectSubset<T, TransactionCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$TransactionPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a Transaction.
     * @param {TransactionDeleteArgs} args - Arguments to delete one Transaction.
     * @example
     * // Delete one Transaction
     * const Transaction = await prisma.transaction.delete({
     *   where: {
     *     // ... filter to delete one Transaction
     *   }
     * })
     * 
     */
    delete<T extends TransactionDeleteArgs>(args: SelectSubset<T, TransactionDeleteArgs<ExtArgs>>): Prisma__TransactionClient<$Result.GetResult<Prisma.$TransactionPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one Transaction.
     * @param {TransactionUpdateArgs} args - Arguments to update one Transaction.
     * @example
     * // Update one Transaction
     * const transaction = await prisma.transaction.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends TransactionUpdateArgs>(args: SelectSubset<T, TransactionUpdateArgs<ExtArgs>>): Prisma__TransactionClient<$Result.GetResult<Prisma.$TransactionPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more Transactions.
     * @param {TransactionDeleteManyArgs} args - Arguments to filter Transactions to delete.
     * @example
     * // Delete a few Transactions
     * const { count } = await prisma.transaction.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends TransactionDeleteManyArgs>(args?: SelectSubset<T, TransactionDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Transactions.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TransactionUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Transactions
     * const transaction = await prisma.transaction.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends TransactionUpdateManyArgs>(args: SelectSubset<T, TransactionUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Transactions and returns the data updated in the database.
     * @param {TransactionUpdateManyAndReturnArgs} args - Arguments to update many Transactions.
     * @example
     * // Update many Transactions
     * const transaction = await prisma.transaction.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more Transactions and only return the `id`
     * const transactionWithIdOnly = await prisma.transaction.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends TransactionUpdateManyAndReturnArgs>(args: SelectSubset<T, TransactionUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$TransactionPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one Transaction.
     * @param {TransactionUpsertArgs} args - Arguments to update or create a Transaction.
     * @example
     * // Update or create a Transaction
     * const transaction = await prisma.transaction.upsert({
     *   create: {
     *     // ... data to create a Transaction
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Transaction we want to update
     *   }
     * })
     */
    upsert<T extends TransactionUpsertArgs>(args: SelectSubset<T, TransactionUpsertArgs<ExtArgs>>): Prisma__TransactionClient<$Result.GetResult<Prisma.$TransactionPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of Transactions.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TransactionCountArgs} args - Arguments to filter Transactions to count.
     * @example
     * // Count the number of Transactions
     * const count = await prisma.transaction.count({
     *   where: {
     *     // ... the filter for the Transactions we want to count
     *   }
     * })
    **/
    count<T extends TransactionCountArgs>(
      args?: Subset<T, TransactionCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], TransactionCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Transaction.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TransactionAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends TransactionAggregateArgs>(args: Subset<T, TransactionAggregateArgs>): Prisma.PrismaPromise<GetTransactionAggregateType<T>>

    /**
     * Group by Transaction.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TransactionGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends TransactionGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: TransactionGroupByArgs['orderBy'] }
        : { orderBy?: TransactionGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, TransactionGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetTransactionGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the Transaction model
   */
  readonly fields: TransactionFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for Transaction.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__TransactionClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    bankStatement<T extends BankStatementDefaultArgs<ExtArgs> = {}>(args?: Subset<T, BankStatementDefaultArgs<ExtArgs>>): Prisma__BankStatementClient<$Result.GetResult<Prisma.$BankStatementPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the Transaction model
   */
  interface TransactionFieldRefs {
    readonly id: FieldRef<"Transaction", 'Int'>
    readonly createdAt: FieldRef<"Transaction", 'DateTime'>
    readonly updatedAt: FieldRef<"Transaction", 'DateTime'>
    readonly transactionDate: FieldRef<"Transaction", 'DateTime'>
    readonly creditAmount: FieldRef<"Transaction", 'Decimal'>
    readonly debitAmount: FieldRef<"Transaction", 'Decimal'>
    readonly description: FieldRef<"Transaction", 'String'>
    readonly balance: FieldRef<"Transaction", 'Decimal'>
    readonly pageNumber: FieldRef<"Transaction", 'String'>
    readonly entityName: FieldRef<"Transaction", 'String'>
    readonly bankStatementId: FieldRef<"Transaction", 'Int'>
  }
    

  // Custom InputTypes
  /**
   * Transaction findUnique
   */
  export type TransactionFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Transaction
     */
    select?: TransactionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Transaction
     */
    omit?: TransactionOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TransactionInclude<ExtArgs> | null
    /**
     * Filter, which Transaction to fetch.
     */
    where: TransactionWhereUniqueInput
  }

  /**
   * Transaction findUniqueOrThrow
   */
  export type TransactionFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Transaction
     */
    select?: TransactionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Transaction
     */
    omit?: TransactionOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TransactionInclude<ExtArgs> | null
    /**
     * Filter, which Transaction to fetch.
     */
    where: TransactionWhereUniqueInput
  }

  /**
   * Transaction findFirst
   */
  export type TransactionFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Transaction
     */
    select?: TransactionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Transaction
     */
    omit?: TransactionOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TransactionInclude<ExtArgs> | null
    /**
     * Filter, which Transaction to fetch.
     */
    where?: TransactionWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Transactions to fetch.
     */
    orderBy?: TransactionOrderByWithRelationInput | TransactionOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Transactions.
     */
    cursor?: TransactionWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Transactions from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Transactions.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Transactions.
     */
    distinct?: TransactionScalarFieldEnum | TransactionScalarFieldEnum[]
  }

  /**
   * Transaction findFirstOrThrow
   */
  export type TransactionFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Transaction
     */
    select?: TransactionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Transaction
     */
    omit?: TransactionOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TransactionInclude<ExtArgs> | null
    /**
     * Filter, which Transaction to fetch.
     */
    where?: TransactionWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Transactions to fetch.
     */
    orderBy?: TransactionOrderByWithRelationInput | TransactionOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Transactions.
     */
    cursor?: TransactionWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Transactions from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Transactions.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Transactions.
     */
    distinct?: TransactionScalarFieldEnum | TransactionScalarFieldEnum[]
  }

  /**
   * Transaction findMany
   */
  export type TransactionFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Transaction
     */
    select?: TransactionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Transaction
     */
    omit?: TransactionOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TransactionInclude<ExtArgs> | null
    /**
     * Filter, which Transactions to fetch.
     */
    where?: TransactionWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Transactions to fetch.
     */
    orderBy?: TransactionOrderByWithRelationInput | TransactionOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing Transactions.
     */
    cursor?: TransactionWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Transactions from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Transactions.
     */
    skip?: number
    distinct?: TransactionScalarFieldEnum | TransactionScalarFieldEnum[]
  }

  /**
   * Transaction create
   */
  export type TransactionCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Transaction
     */
    select?: TransactionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Transaction
     */
    omit?: TransactionOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TransactionInclude<ExtArgs> | null
    /**
     * The data needed to create a Transaction.
     */
    data: XOR<TransactionCreateInput, TransactionUncheckedCreateInput>
  }

  /**
   * Transaction createMany
   */
  export type TransactionCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many Transactions.
     */
    data: TransactionCreateManyInput | TransactionCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * Transaction createManyAndReturn
   */
  export type TransactionCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Transaction
     */
    select?: TransactionSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Transaction
     */
    omit?: TransactionOmit<ExtArgs> | null
    /**
     * The data used to create many Transactions.
     */
    data: TransactionCreateManyInput | TransactionCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TransactionIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * Transaction update
   */
  export type TransactionUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Transaction
     */
    select?: TransactionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Transaction
     */
    omit?: TransactionOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TransactionInclude<ExtArgs> | null
    /**
     * The data needed to update a Transaction.
     */
    data: XOR<TransactionUpdateInput, TransactionUncheckedUpdateInput>
    /**
     * Choose, which Transaction to update.
     */
    where: TransactionWhereUniqueInput
  }

  /**
   * Transaction updateMany
   */
  export type TransactionUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update Transactions.
     */
    data: XOR<TransactionUpdateManyMutationInput, TransactionUncheckedUpdateManyInput>
    /**
     * Filter which Transactions to update
     */
    where?: TransactionWhereInput
    /**
     * Limit how many Transactions to update.
     */
    limit?: number
  }

  /**
   * Transaction updateManyAndReturn
   */
  export type TransactionUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Transaction
     */
    select?: TransactionSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Transaction
     */
    omit?: TransactionOmit<ExtArgs> | null
    /**
     * The data used to update Transactions.
     */
    data: XOR<TransactionUpdateManyMutationInput, TransactionUncheckedUpdateManyInput>
    /**
     * Filter which Transactions to update
     */
    where?: TransactionWhereInput
    /**
     * Limit how many Transactions to update.
     */
    limit?: number
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TransactionIncludeUpdateManyAndReturn<ExtArgs> | null
  }

  /**
   * Transaction upsert
   */
  export type TransactionUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Transaction
     */
    select?: TransactionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Transaction
     */
    omit?: TransactionOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TransactionInclude<ExtArgs> | null
    /**
     * The filter to search for the Transaction to update in case it exists.
     */
    where: TransactionWhereUniqueInput
    /**
     * In case the Transaction found by the `where` argument doesn't exist, create a new Transaction with this data.
     */
    create: XOR<TransactionCreateInput, TransactionUncheckedCreateInput>
    /**
     * In case the Transaction was found with the provided `where` argument, update it with this data.
     */
    update: XOR<TransactionUpdateInput, TransactionUncheckedUpdateInput>
  }

  /**
   * Transaction delete
   */
  export type TransactionDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Transaction
     */
    select?: TransactionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Transaction
     */
    omit?: TransactionOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TransactionInclude<ExtArgs> | null
    /**
     * Filter which Transaction to delete.
     */
    where: TransactionWhereUniqueInput
  }

  /**
   * Transaction deleteMany
   */
  export type TransactionDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Transactions to delete
     */
    where?: TransactionWhereInput
    /**
     * Limit how many Transactions to delete.
     */
    limit?: number
  }

  /**
   * Transaction without action
   */
  export type TransactionDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Transaction
     */
    select?: TransactionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Transaction
     */
    omit?: TransactionOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TransactionInclude<ExtArgs> | null
  }


  /**
   * Enums
   */

  export const TransactionIsolationLevel: {
    ReadUncommitted: 'ReadUncommitted',
    ReadCommitted: 'ReadCommitted',
    RepeatableRead: 'RepeatableRead',
    Serializable: 'Serializable'
  };

  export type TransactionIsolationLevel = (typeof TransactionIsolationLevel)[keyof typeof TransactionIsolationLevel]


  export const InvoiceScalarFieldEnum: {
    id: 'id',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt',
    invoiceDate: 'invoiceDate',
    invoiceNumber: 'invoiceNumber',
    issuerName: 'issuerName',
    receiverName: 'receiverName',
    totalSales: 'totalSales',
    totalDiscount: 'totalDiscount',
    netAmount: 'netAmount',
    total: 'total',
    invoiceStatus: 'invoiceStatus',
    currency: 'currency',
    exchangeRate: 'exchangeRate',
    taxAmount: 'taxAmount',
    issuerCountry: 'issuerCountry',
    receiverCountry: 'receiverCountry',
    issuerEtaId: 'issuerEtaId',
    receiverEtaId: 'receiverEtaId',
    customerId: 'customerId',
    supplierId: 'supplierId'
  };

  export type InvoiceScalarFieldEnum = (typeof InvoiceScalarFieldEnum)[keyof typeof InvoiceScalarFieldEnum]


  export const CustomerScalarFieldEnum: {
    id: 'id',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt',
    name: 'name',
    country: 'country',
    etaId: 'etaId',
    paymentTerms: 'paymentTerms'
  };

  export type CustomerScalarFieldEnum = (typeof CustomerScalarFieldEnum)[keyof typeof CustomerScalarFieldEnum]


  export const SupplierScalarFieldEnum: {
    id: 'id',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt',
    name: 'name',
    country: 'country',
    etaId: 'etaId',
    paymentTerms: 'paymentTerms'
  };

  export type SupplierScalarFieldEnum = (typeof SupplierScalarFieldEnum)[keyof typeof SupplierScalarFieldEnum]


  export const BankScalarFieldEnum: {
    id: 'id',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt',
    name: 'name'
  };

  export type BankScalarFieldEnum = (typeof BankScalarFieldEnum)[keyof typeof BankScalarFieldEnum]


  export const BankStatementScalarFieldEnum: {
    id: 'id',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt',
    fileName: 'fileName',
    bankName: 'bankName',
    accountNumber: 'accountNumber',
    statementPeriodStart: 'statementPeriodStart',
    statementPeriodEnd: 'statementPeriodEnd',
    accountType: 'accountType',
    accountCurrency: 'accountCurrency',
    startingBalance: 'startingBalance',
    endingBalance: 'endingBalance',
    rawTextContent: 'rawTextContent',
    processingStatus: 'processingStatus',
    bankId: 'bankId',
    customerId: 'customerId',
    supplierId: 'supplierId'
  };

  export type BankStatementScalarFieldEnum = (typeof BankStatementScalarFieldEnum)[keyof typeof BankStatementScalarFieldEnum]


  export const TransactionScalarFieldEnum: {
    id: 'id',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt',
    transactionDate: 'transactionDate',
    creditAmount: 'creditAmount',
    debitAmount: 'debitAmount',
    description: 'description',
    balance: 'balance',
    pageNumber: 'pageNumber',
    entityName: 'entityName',
    bankStatementId: 'bankStatementId'
  };

  export type TransactionScalarFieldEnum = (typeof TransactionScalarFieldEnum)[keyof typeof TransactionScalarFieldEnum]


  export const SortOrder: {
    asc: 'asc',
    desc: 'desc'
  };

  export type SortOrder = (typeof SortOrder)[keyof typeof SortOrder]


  export const QueryMode: {
    default: 'default',
    insensitive: 'insensitive'
  };

  export type QueryMode = (typeof QueryMode)[keyof typeof QueryMode]


  export const NullsOrder: {
    first: 'first',
    last: 'last'
  };

  export type NullsOrder = (typeof NullsOrder)[keyof typeof NullsOrder]


  /**
   * Field references
   */


  /**
   * Reference to a field of type 'Int'
   */
  export type IntFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Int'>
    


  /**
   * Reference to a field of type 'Int[]'
   */
  export type ListIntFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Int[]'>
    


  /**
   * Reference to a field of type 'DateTime'
   */
  export type DateTimeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'DateTime'>
    


  /**
   * Reference to a field of type 'DateTime[]'
   */
  export type ListDateTimeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'DateTime[]'>
    


  /**
   * Reference to a field of type 'String'
   */
  export type StringFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'String'>
    


  /**
   * Reference to a field of type 'String[]'
   */
  export type ListStringFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'String[]'>
    


  /**
   * Reference to a field of type 'Decimal'
   */
  export type DecimalFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Decimal'>
    


  /**
   * Reference to a field of type 'Decimal[]'
   */
  export type ListDecimalFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Decimal[]'>
    


  /**
   * Reference to a field of type 'Float'
   */
  export type FloatFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Float'>
    


  /**
   * Reference to a field of type 'Float[]'
   */
  export type ListFloatFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Float[]'>
    
  /**
   * Deep Input Types
   */


  export type InvoiceWhereInput = {
    AND?: InvoiceWhereInput | InvoiceWhereInput[]
    OR?: InvoiceWhereInput[]
    NOT?: InvoiceWhereInput | InvoiceWhereInput[]
    id?: IntFilter<"Invoice"> | number
    createdAt?: DateTimeFilter<"Invoice"> | Date | string
    updatedAt?: DateTimeFilter<"Invoice"> | Date | string
    invoiceDate?: DateTimeFilter<"Invoice"> | Date | string
    invoiceNumber?: StringFilter<"Invoice"> | string
    issuerName?: StringFilter<"Invoice"> | string
    receiverName?: StringFilter<"Invoice"> | string
    totalSales?: DecimalFilter<"Invoice"> | Decimal | DecimalJsLike | number | string
    totalDiscount?: DecimalFilter<"Invoice"> | Decimal | DecimalJsLike | number | string
    netAmount?: DecimalFilter<"Invoice"> | Decimal | DecimalJsLike | number | string
    total?: DecimalFilter<"Invoice"> | Decimal | DecimalJsLike | number | string
    invoiceStatus?: StringFilter<"Invoice"> | string
    currency?: StringFilter<"Invoice"> | string
    exchangeRate?: DecimalFilter<"Invoice"> | Decimal | DecimalJsLike | number | string
    taxAmount?: DecimalFilter<"Invoice"> | Decimal | DecimalJsLike | number | string
    issuerCountry?: StringFilter<"Invoice"> | string
    receiverCountry?: StringFilter<"Invoice"> | string
    issuerEtaId?: StringFilter<"Invoice"> | string
    receiverEtaId?: StringFilter<"Invoice"> | string
    customerId?: IntNullableFilter<"Invoice"> | number | null
    supplierId?: IntNullableFilter<"Invoice"> | number | null
    Customer?: XOR<CustomerNullableScalarRelationFilter, CustomerWhereInput> | null
    Supplier?: XOR<SupplierNullableScalarRelationFilter, SupplierWhereInput> | null
  }

  export type InvoiceOrderByWithRelationInput = {
    id?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    invoiceDate?: SortOrder
    invoiceNumber?: SortOrder
    issuerName?: SortOrder
    receiverName?: SortOrder
    totalSales?: SortOrder
    totalDiscount?: SortOrder
    netAmount?: SortOrder
    total?: SortOrder
    invoiceStatus?: SortOrder
    currency?: SortOrder
    exchangeRate?: SortOrder
    taxAmount?: SortOrder
    issuerCountry?: SortOrder
    receiverCountry?: SortOrder
    issuerEtaId?: SortOrder
    receiverEtaId?: SortOrder
    customerId?: SortOrderInput | SortOrder
    supplierId?: SortOrderInput | SortOrder
    Customer?: CustomerOrderByWithRelationInput
    Supplier?: SupplierOrderByWithRelationInput
  }

  export type InvoiceWhereUniqueInput = Prisma.AtLeast<{
    id?: number
    invoiceNumber?: string
    AND?: InvoiceWhereInput | InvoiceWhereInput[]
    OR?: InvoiceWhereInput[]
    NOT?: InvoiceWhereInput | InvoiceWhereInput[]
    createdAt?: DateTimeFilter<"Invoice"> | Date | string
    updatedAt?: DateTimeFilter<"Invoice"> | Date | string
    invoiceDate?: DateTimeFilter<"Invoice"> | Date | string
    issuerName?: StringFilter<"Invoice"> | string
    receiverName?: StringFilter<"Invoice"> | string
    totalSales?: DecimalFilter<"Invoice"> | Decimal | DecimalJsLike | number | string
    totalDiscount?: DecimalFilter<"Invoice"> | Decimal | DecimalJsLike | number | string
    netAmount?: DecimalFilter<"Invoice"> | Decimal | DecimalJsLike | number | string
    total?: DecimalFilter<"Invoice"> | Decimal | DecimalJsLike | number | string
    invoiceStatus?: StringFilter<"Invoice"> | string
    currency?: StringFilter<"Invoice"> | string
    exchangeRate?: DecimalFilter<"Invoice"> | Decimal | DecimalJsLike | number | string
    taxAmount?: DecimalFilter<"Invoice"> | Decimal | DecimalJsLike | number | string
    issuerCountry?: StringFilter<"Invoice"> | string
    receiverCountry?: StringFilter<"Invoice"> | string
    issuerEtaId?: StringFilter<"Invoice"> | string
    receiverEtaId?: StringFilter<"Invoice"> | string
    customerId?: IntNullableFilter<"Invoice"> | number | null
    supplierId?: IntNullableFilter<"Invoice"> | number | null
    Customer?: XOR<CustomerNullableScalarRelationFilter, CustomerWhereInput> | null
    Supplier?: XOR<SupplierNullableScalarRelationFilter, SupplierWhereInput> | null
  }, "id" | "invoiceNumber">

  export type InvoiceOrderByWithAggregationInput = {
    id?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    invoiceDate?: SortOrder
    invoiceNumber?: SortOrder
    issuerName?: SortOrder
    receiverName?: SortOrder
    totalSales?: SortOrder
    totalDiscount?: SortOrder
    netAmount?: SortOrder
    total?: SortOrder
    invoiceStatus?: SortOrder
    currency?: SortOrder
    exchangeRate?: SortOrder
    taxAmount?: SortOrder
    issuerCountry?: SortOrder
    receiverCountry?: SortOrder
    issuerEtaId?: SortOrder
    receiverEtaId?: SortOrder
    customerId?: SortOrderInput | SortOrder
    supplierId?: SortOrderInput | SortOrder
    _count?: InvoiceCountOrderByAggregateInput
    _avg?: InvoiceAvgOrderByAggregateInput
    _max?: InvoiceMaxOrderByAggregateInput
    _min?: InvoiceMinOrderByAggregateInput
    _sum?: InvoiceSumOrderByAggregateInput
  }

  export type InvoiceScalarWhereWithAggregatesInput = {
    AND?: InvoiceScalarWhereWithAggregatesInput | InvoiceScalarWhereWithAggregatesInput[]
    OR?: InvoiceScalarWhereWithAggregatesInput[]
    NOT?: InvoiceScalarWhereWithAggregatesInput | InvoiceScalarWhereWithAggregatesInput[]
    id?: IntWithAggregatesFilter<"Invoice"> | number
    createdAt?: DateTimeWithAggregatesFilter<"Invoice"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"Invoice"> | Date | string
    invoiceDate?: DateTimeWithAggregatesFilter<"Invoice"> | Date | string
    invoiceNumber?: StringWithAggregatesFilter<"Invoice"> | string
    issuerName?: StringWithAggregatesFilter<"Invoice"> | string
    receiverName?: StringWithAggregatesFilter<"Invoice"> | string
    totalSales?: DecimalWithAggregatesFilter<"Invoice"> | Decimal | DecimalJsLike | number | string
    totalDiscount?: DecimalWithAggregatesFilter<"Invoice"> | Decimal | DecimalJsLike | number | string
    netAmount?: DecimalWithAggregatesFilter<"Invoice"> | Decimal | DecimalJsLike | number | string
    total?: DecimalWithAggregatesFilter<"Invoice"> | Decimal | DecimalJsLike | number | string
    invoiceStatus?: StringWithAggregatesFilter<"Invoice"> | string
    currency?: StringWithAggregatesFilter<"Invoice"> | string
    exchangeRate?: DecimalWithAggregatesFilter<"Invoice"> | Decimal | DecimalJsLike | number | string
    taxAmount?: DecimalWithAggregatesFilter<"Invoice"> | Decimal | DecimalJsLike | number | string
    issuerCountry?: StringWithAggregatesFilter<"Invoice"> | string
    receiverCountry?: StringWithAggregatesFilter<"Invoice"> | string
    issuerEtaId?: StringWithAggregatesFilter<"Invoice"> | string
    receiverEtaId?: StringWithAggregatesFilter<"Invoice"> | string
    customerId?: IntNullableWithAggregatesFilter<"Invoice"> | number | null
    supplierId?: IntNullableWithAggregatesFilter<"Invoice"> | number | null
  }

  export type CustomerWhereInput = {
    AND?: CustomerWhereInput | CustomerWhereInput[]
    OR?: CustomerWhereInput[]
    NOT?: CustomerWhereInput | CustomerWhereInput[]
    id?: IntFilter<"Customer"> | number
    createdAt?: DateTimeFilter<"Customer"> | Date | string
    updatedAt?: DateTimeFilter<"Customer"> | Date | string
    name?: StringFilter<"Customer"> | string
    country?: StringNullableFilter<"Customer"> | string | null
    etaId?: StringNullableFilter<"Customer"> | string | null
    paymentTerms?: IntNullableFilter<"Customer"> | number | null
    Invoice?: InvoiceListRelationFilter
    BankStatement?: BankStatementListRelationFilter
  }

  export type CustomerOrderByWithRelationInput = {
    id?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    name?: SortOrder
    country?: SortOrderInput | SortOrder
    etaId?: SortOrderInput | SortOrder
    paymentTerms?: SortOrderInput | SortOrder
    Invoice?: InvoiceOrderByRelationAggregateInput
    BankStatement?: BankStatementOrderByRelationAggregateInput
  }

  export type CustomerWhereUniqueInput = Prisma.AtLeast<{
    id?: number
    AND?: CustomerWhereInput | CustomerWhereInput[]
    OR?: CustomerWhereInput[]
    NOT?: CustomerWhereInput | CustomerWhereInput[]
    createdAt?: DateTimeFilter<"Customer"> | Date | string
    updatedAt?: DateTimeFilter<"Customer"> | Date | string
    name?: StringFilter<"Customer"> | string
    country?: StringNullableFilter<"Customer"> | string | null
    etaId?: StringNullableFilter<"Customer"> | string | null
    paymentTerms?: IntNullableFilter<"Customer"> | number | null
    Invoice?: InvoiceListRelationFilter
    BankStatement?: BankStatementListRelationFilter
  }, "id">

  export type CustomerOrderByWithAggregationInput = {
    id?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    name?: SortOrder
    country?: SortOrderInput | SortOrder
    etaId?: SortOrderInput | SortOrder
    paymentTerms?: SortOrderInput | SortOrder
    _count?: CustomerCountOrderByAggregateInput
    _avg?: CustomerAvgOrderByAggregateInput
    _max?: CustomerMaxOrderByAggregateInput
    _min?: CustomerMinOrderByAggregateInput
    _sum?: CustomerSumOrderByAggregateInput
  }

  export type CustomerScalarWhereWithAggregatesInput = {
    AND?: CustomerScalarWhereWithAggregatesInput | CustomerScalarWhereWithAggregatesInput[]
    OR?: CustomerScalarWhereWithAggregatesInput[]
    NOT?: CustomerScalarWhereWithAggregatesInput | CustomerScalarWhereWithAggregatesInput[]
    id?: IntWithAggregatesFilter<"Customer"> | number
    createdAt?: DateTimeWithAggregatesFilter<"Customer"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"Customer"> | Date | string
    name?: StringWithAggregatesFilter<"Customer"> | string
    country?: StringNullableWithAggregatesFilter<"Customer"> | string | null
    etaId?: StringNullableWithAggregatesFilter<"Customer"> | string | null
    paymentTerms?: IntNullableWithAggregatesFilter<"Customer"> | number | null
  }

  export type SupplierWhereInput = {
    AND?: SupplierWhereInput | SupplierWhereInput[]
    OR?: SupplierWhereInput[]
    NOT?: SupplierWhereInput | SupplierWhereInput[]
    id?: IntFilter<"Supplier"> | number
    createdAt?: DateTimeFilter<"Supplier"> | Date | string
    updatedAt?: DateTimeFilter<"Supplier"> | Date | string
    name?: StringFilter<"Supplier"> | string
    country?: StringNullableFilter<"Supplier"> | string | null
    etaId?: StringNullableFilter<"Supplier"> | string | null
    paymentTerms?: IntNullableFilter<"Supplier"> | number | null
    Invoice?: InvoiceListRelationFilter
    BankStatement?: BankStatementListRelationFilter
  }

  export type SupplierOrderByWithRelationInput = {
    id?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    name?: SortOrder
    country?: SortOrderInput | SortOrder
    etaId?: SortOrderInput | SortOrder
    paymentTerms?: SortOrderInput | SortOrder
    Invoice?: InvoiceOrderByRelationAggregateInput
    BankStatement?: BankStatementOrderByRelationAggregateInput
  }

  export type SupplierWhereUniqueInput = Prisma.AtLeast<{
    id?: number
    AND?: SupplierWhereInput | SupplierWhereInput[]
    OR?: SupplierWhereInput[]
    NOT?: SupplierWhereInput | SupplierWhereInput[]
    createdAt?: DateTimeFilter<"Supplier"> | Date | string
    updatedAt?: DateTimeFilter<"Supplier"> | Date | string
    name?: StringFilter<"Supplier"> | string
    country?: StringNullableFilter<"Supplier"> | string | null
    etaId?: StringNullableFilter<"Supplier"> | string | null
    paymentTerms?: IntNullableFilter<"Supplier"> | number | null
    Invoice?: InvoiceListRelationFilter
    BankStatement?: BankStatementListRelationFilter
  }, "id">

  export type SupplierOrderByWithAggregationInput = {
    id?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    name?: SortOrder
    country?: SortOrderInput | SortOrder
    etaId?: SortOrderInput | SortOrder
    paymentTerms?: SortOrderInput | SortOrder
    _count?: SupplierCountOrderByAggregateInput
    _avg?: SupplierAvgOrderByAggregateInput
    _max?: SupplierMaxOrderByAggregateInput
    _min?: SupplierMinOrderByAggregateInput
    _sum?: SupplierSumOrderByAggregateInput
  }

  export type SupplierScalarWhereWithAggregatesInput = {
    AND?: SupplierScalarWhereWithAggregatesInput | SupplierScalarWhereWithAggregatesInput[]
    OR?: SupplierScalarWhereWithAggregatesInput[]
    NOT?: SupplierScalarWhereWithAggregatesInput | SupplierScalarWhereWithAggregatesInput[]
    id?: IntWithAggregatesFilter<"Supplier"> | number
    createdAt?: DateTimeWithAggregatesFilter<"Supplier"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"Supplier"> | Date | string
    name?: StringWithAggregatesFilter<"Supplier"> | string
    country?: StringNullableWithAggregatesFilter<"Supplier"> | string | null
    etaId?: StringNullableWithAggregatesFilter<"Supplier"> | string | null
    paymentTerms?: IntNullableWithAggregatesFilter<"Supplier"> | number | null
  }

  export type BankWhereInput = {
    AND?: BankWhereInput | BankWhereInput[]
    OR?: BankWhereInput[]
    NOT?: BankWhereInput | BankWhereInput[]
    id?: IntFilter<"Bank"> | number
    createdAt?: DateTimeFilter<"Bank"> | Date | string
    updatedAt?: DateTimeFilter<"Bank"> | Date | string
    name?: StringFilter<"Bank"> | string
    bankStatements?: BankStatementListRelationFilter
  }

  export type BankOrderByWithRelationInput = {
    id?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    name?: SortOrder
    bankStatements?: BankStatementOrderByRelationAggregateInput
  }

  export type BankWhereUniqueInput = Prisma.AtLeast<{
    id?: number
    name?: string
    AND?: BankWhereInput | BankWhereInput[]
    OR?: BankWhereInput[]
    NOT?: BankWhereInput | BankWhereInput[]
    createdAt?: DateTimeFilter<"Bank"> | Date | string
    updatedAt?: DateTimeFilter<"Bank"> | Date | string
    bankStatements?: BankStatementListRelationFilter
  }, "id" | "name">

  export type BankOrderByWithAggregationInput = {
    id?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    name?: SortOrder
    _count?: BankCountOrderByAggregateInput
    _avg?: BankAvgOrderByAggregateInput
    _max?: BankMaxOrderByAggregateInput
    _min?: BankMinOrderByAggregateInput
    _sum?: BankSumOrderByAggregateInput
  }

  export type BankScalarWhereWithAggregatesInput = {
    AND?: BankScalarWhereWithAggregatesInput | BankScalarWhereWithAggregatesInput[]
    OR?: BankScalarWhereWithAggregatesInput[]
    NOT?: BankScalarWhereWithAggregatesInput | BankScalarWhereWithAggregatesInput[]
    id?: IntWithAggregatesFilter<"Bank"> | number
    createdAt?: DateTimeWithAggregatesFilter<"Bank"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"Bank"> | Date | string
    name?: StringWithAggregatesFilter<"Bank"> | string
  }

  export type BankStatementWhereInput = {
    AND?: BankStatementWhereInput | BankStatementWhereInput[]
    OR?: BankStatementWhereInput[]
    NOT?: BankStatementWhereInput | BankStatementWhereInput[]
    id?: IntFilter<"BankStatement"> | number
    createdAt?: DateTimeFilter<"BankStatement"> | Date | string
    updatedAt?: DateTimeFilter<"BankStatement"> | Date | string
    fileName?: StringNullableFilter<"BankStatement"> | string | null
    bankName?: StringFilter<"BankStatement"> | string
    accountNumber?: StringFilter<"BankStatement"> | string
    statementPeriodStart?: DateTimeFilter<"BankStatement"> | Date | string
    statementPeriodEnd?: DateTimeFilter<"BankStatement"> | Date | string
    accountType?: StringNullableFilter<"BankStatement"> | string | null
    accountCurrency?: StringNullableFilter<"BankStatement"> | string | null
    startingBalance?: DecimalFilter<"BankStatement"> | Decimal | DecimalJsLike | number | string
    endingBalance?: DecimalFilter<"BankStatement"> | Decimal | DecimalJsLike | number | string
    rawTextContent?: StringNullableFilter<"BankStatement"> | string | null
    processingStatus?: StringFilter<"BankStatement"> | string
    bankId?: IntFilter<"BankStatement"> | number
    customerId?: IntNullableFilter<"BankStatement"> | number | null
    supplierId?: IntNullableFilter<"BankStatement"> | number | null
    bank?: XOR<BankScalarRelationFilter, BankWhereInput>
    Customer?: XOR<CustomerNullableScalarRelationFilter, CustomerWhereInput> | null
    Supplier?: XOR<SupplierNullableScalarRelationFilter, SupplierWhereInput> | null
    transactions?: TransactionListRelationFilter
  }

  export type BankStatementOrderByWithRelationInput = {
    id?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    fileName?: SortOrderInput | SortOrder
    bankName?: SortOrder
    accountNumber?: SortOrder
    statementPeriodStart?: SortOrder
    statementPeriodEnd?: SortOrder
    accountType?: SortOrderInput | SortOrder
    accountCurrency?: SortOrderInput | SortOrder
    startingBalance?: SortOrder
    endingBalance?: SortOrder
    rawTextContent?: SortOrderInput | SortOrder
    processingStatus?: SortOrder
    bankId?: SortOrder
    customerId?: SortOrderInput | SortOrder
    supplierId?: SortOrderInput | SortOrder
    bank?: BankOrderByWithRelationInput
    Customer?: CustomerOrderByWithRelationInput
    Supplier?: SupplierOrderByWithRelationInput
    transactions?: TransactionOrderByRelationAggregateInput
  }

  export type BankStatementWhereUniqueInput = Prisma.AtLeast<{
    id?: number
    AND?: BankStatementWhereInput | BankStatementWhereInput[]
    OR?: BankStatementWhereInput[]
    NOT?: BankStatementWhereInput | BankStatementWhereInput[]
    createdAt?: DateTimeFilter<"BankStatement"> | Date | string
    updatedAt?: DateTimeFilter<"BankStatement"> | Date | string
    fileName?: StringNullableFilter<"BankStatement"> | string | null
    bankName?: StringFilter<"BankStatement"> | string
    accountNumber?: StringFilter<"BankStatement"> | string
    statementPeriodStart?: DateTimeFilter<"BankStatement"> | Date | string
    statementPeriodEnd?: DateTimeFilter<"BankStatement"> | Date | string
    accountType?: StringNullableFilter<"BankStatement"> | string | null
    accountCurrency?: StringNullableFilter<"BankStatement"> | string | null
    startingBalance?: DecimalFilter<"BankStatement"> | Decimal | DecimalJsLike | number | string
    endingBalance?: DecimalFilter<"BankStatement"> | Decimal | DecimalJsLike | number | string
    rawTextContent?: StringNullableFilter<"BankStatement"> | string | null
    processingStatus?: StringFilter<"BankStatement"> | string
    bankId?: IntFilter<"BankStatement"> | number
    customerId?: IntNullableFilter<"BankStatement"> | number | null
    supplierId?: IntNullableFilter<"BankStatement"> | number | null
    bank?: XOR<BankScalarRelationFilter, BankWhereInput>
    Customer?: XOR<CustomerNullableScalarRelationFilter, CustomerWhereInput> | null
    Supplier?: XOR<SupplierNullableScalarRelationFilter, SupplierWhereInput> | null
    transactions?: TransactionListRelationFilter
  }, "id">

  export type BankStatementOrderByWithAggregationInput = {
    id?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    fileName?: SortOrderInput | SortOrder
    bankName?: SortOrder
    accountNumber?: SortOrder
    statementPeriodStart?: SortOrder
    statementPeriodEnd?: SortOrder
    accountType?: SortOrderInput | SortOrder
    accountCurrency?: SortOrderInput | SortOrder
    startingBalance?: SortOrder
    endingBalance?: SortOrder
    rawTextContent?: SortOrderInput | SortOrder
    processingStatus?: SortOrder
    bankId?: SortOrder
    customerId?: SortOrderInput | SortOrder
    supplierId?: SortOrderInput | SortOrder
    _count?: BankStatementCountOrderByAggregateInput
    _avg?: BankStatementAvgOrderByAggregateInput
    _max?: BankStatementMaxOrderByAggregateInput
    _min?: BankStatementMinOrderByAggregateInput
    _sum?: BankStatementSumOrderByAggregateInput
  }

  export type BankStatementScalarWhereWithAggregatesInput = {
    AND?: BankStatementScalarWhereWithAggregatesInput | BankStatementScalarWhereWithAggregatesInput[]
    OR?: BankStatementScalarWhereWithAggregatesInput[]
    NOT?: BankStatementScalarWhereWithAggregatesInput | BankStatementScalarWhereWithAggregatesInput[]
    id?: IntWithAggregatesFilter<"BankStatement"> | number
    createdAt?: DateTimeWithAggregatesFilter<"BankStatement"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"BankStatement"> | Date | string
    fileName?: StringNullableWithAggregatesFilter<"BankStatement"> | string | null
    bankName?: StringWithAggregatesFilter<"BankStatement"> | string
    accountNumber?: StringWithAggregatesFilter<"BankStatement"> | string
    statementPeriodStart?: DateTimeWithAggregatesFilter<"BankStatement"> | Date | string
    statementPeriodEnd?: DateTimeWithAggregatesFilter<"BankStatement"> | Date | string
    accountType?: StringNullableWithAggregatesFilter<"BankStatement"> | string | null
    accountCurrency?: StringNullableWithAggregatesFilter<"BankStatement"> | string | null
    startingBalance?: DecimalWithAggregatesFilter<"BankStatement"> | Decimal | DecimalJsLike | number | string
    endingBalance?: DecimalWithAggregatesFilter<"BankStatement"> | Decimal | DecimalJsLike | number | string
    rawTextContent?: StringNullableWithAggregatesFilter<"BankStatement"> | string | null
    processingStatus?: StringWithAggregatesFilter<"BankStatement"> | string
    bankId?: IntWithAggregatesFilter<"BankStatement"> | number
    customerId?: IntNullableWithAggregatesFilter<"BankStatement"> | number | null
    supplierId?: IntNullableWithAggregatesFilter<"BankStatement"> | number | null
  }

  export type TransactionWhereInput = {
    AND?: TransactionWhereInput | TransactionWhereInput[]
    OR?: TransactionWhereInput[]
    NOT?: TransactionWhereInput | TransactionWhereInput[]
    id?: IntFilter<"Transaction"> | number
    createdAt?: DateTimeFilter<"Transaction"> | Date | string
    updatedAt?: DateTimeFilter<"Transaction"> | Date | string
    transactionDate?: DateTimeFilter<"Transaction"> | Date | string
    creditAmount?: DecimalNullableFilter<"Transaction"> | Decimal | DecimalJsLike | number | string | null
    debitAmount?: DecimalNullableFilter<"Transaction"> | Decimal | DecimalJsLike | number | string | null
    description?: StringNullableFilter<"Transaction"> | string | null
    balance?: DecimalNullableFilter<"Transaction"> | Decimal | DecimalJsLike | number | string | null
    pageNumber?: StringNullableFilter<"Transaction"> | string | null
    entityName?: StringNullableFilter<"Transaction"> | string | null
    bankStatementId?: IntFilter<"Transaction"> | number
    bankStatement?: XOR<BankStatementScalarRelationFilter, BankStatementWhereInput>
  }

  export type TransactionOrderByWithRelationInput = {
    id?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    transactionDate?: SortOrder
    creditAmount?: SortOrderInput | SortOrder
    debitAmount?: SortOrderInput | SortOrder
    description?: SortOrderInput | SortOrder
    balance?: SortOrderInput | SortOrder
    pageNumber?: SortOrderInput | SortOrder
    entityName?: SortOrderInput | SortOrder
    bankStatementId?: SortOrder
    bankStatement?: BankStatementOrderByWithRelationInput
  }

  export type TransactionWhereUniqueInput = Prisma.AtLeast<{
    id?: number
    AND?: TransactionWhereInput | TransactionWhereInput[]
    OR?: TransactionWhereInput[]
    NOT?: TransactionWhereInput | TransactionWhereInput[]
    createdAt?: DateTimeFilter<"Transaction"> | Date | string
    updatedAt?: DateTimeFilter<"Transaction"> | Date | string
    transactionDate?: DateTimeFilter<"Transaction"> | Date | string
    creditAmount?: DecimalNullableFilter<"Transaction"> | Decimal | DecimalJsLike | number | string | null
    debitAmount?: DecimalNullableFilter<"Transaction"> | Decimal | DecimalJsLike | number | string | null
    description?: StringNullableFilter<"Transaction"> | string | null
    balance?: DecimalNullableFilter<"Transaction"> | Decimal | DecimalJsLike | number | string | null
    pageNumber?: StringNullableFilter<"Transaction"> | string | null
    entityName?: StringNullableFilter<"Transaction"> | string | null
    bankStatementId?: IntFilter<"Transaction"> | number
    bankStatement?: XOR<BankStatementScalarRelationFilter, BankStatementWhereInput>
  }, "id">

  export type TransactionOrderByWithAggregationInput = {
    id?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    transactionDate?: SortOrder
    creditAmount?: SortOrderInput | SortOrder
    debitAmount?: SortOrderInput | SortOrder
    description?: SortOrderInput | SortOrder
    balance?: SortOrderInput | SortOrder
    pageNumber?: SortOrderInput | SortOrder
    entityName?: SortOrderInput | SortOrder
    bankStatementId?: SortOrder
    _count?: TransactionCountOrderByAggregateInput
    _avg?: TransactionAvgOrderByAggregateInput
    _max?: TransactionMaxOrderByAggregateInput
    _min?: TransactionMinOrderByAggregateInput
    _sum?: TransactionSumOrderByAggregateInput
  }

  export type TransactionScalarWhereWithAggregatesInput = {
    AND?: TransactionScalarWhereWithAggregatesInput | TransactionScalarWhereWithAggregatesInput[]
    OR?: TransactionScalarWhereWithAggregatesInput[]
    NOT?: TransactionScalarWhereWithAggregatesInput | TransactionScalarWhereWithAggregatesInput[]
    id?: IntWithAggregatesFilter<"Transaction"> | number
    createdAt?: DateTimeWithAggregatesFilter<"Transaction"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"Transaction"> | Date | string
    transactionDate?: DateTimeWithAggregatesFilter<"Transaction"> | Date | string
    creditAmount?: DecimalNullableWithAggregatesFilter<"Transaction"> | Decimal | DecimalJsLike | number | string | null
    debitAmount?: DecimalNullableWithAggregatesFilter<"Transaction"> | Decimal | DecimalJsLike | number | string | null
    description?: StringNullableWithAggregatesFilter<"Transaction"> | string | null
    balance?: DecimalNullableWithAggregatesFilter<"Transaction"> | Decimal | DecimalJsLike | number | string | null
    pageNumber?: StringNullableWithAggregatesFilter<"Transaction"> | string | null
    entityName?: StringNullableWithAggregatesFilter<"Transaction"> | string | null
    bankStatementId?: IntWithAggregatesFilter<"Transaction"> | number
  }

  export type InvoiceCreateInput = {
    createdAt?: Date | string
    updatedAt: Date | string
    invoiceDate: Date | string
    invoiceNumber: string
    issuerName: string
    receiverName: string
    totalSales: Decimal | DecimalJsLike | number | string
    totalDiscount: Decimal | DecimalJsLike | number | string
    netAmount: Decimal | DecimalJsLike | number | string
    total: Decimal | DecimalJsLike | number | string
    invoiceStatus: string
    currency?: string
    exchangeRate: Decimal | DecimalJsLike | number | string
    taxAmount: Decimal | DecimalJsLike | number | string
    issuerCountry: string
    receiverCountry: string
    issuerEtaId: string
    receiverEtaId: string
    Customer?: CustomerCreateNestedOneWithoutInvoiceInput
    Supplier?: SupplierCreateNestedOneWithoutInvoiceInput
  }

  export type InvoiceUncheckedCreateInput = {
    id?: number
    createdAt?: Date | string
    updatedAt: Date | string
    invoiceDate: Date | string
    invoiceNumber: string
    issuerName: string
    receiverName: string
    totalSales: Decimal | DecimalJsLike | number | string
    totalDiscount: Decimal | DecimalJsLike | number | string
    netAmount: Decimal | DecimalJsLike | number | string
    total: Decimal | DecimalJsLike | number | string
    invoiceStatus: string
    currency?: string
    exchangeRate: Decimal | DecimalJsLike | number | string
    taxAmount: Decimal | DecimalJsLike | number | string
    issuerCountry: string
    receiverCountry: string
    issuerEtaId: string
    receiverEtaId: string
    customerId?: number | null
    supplierId?: number | null
  }

  export type InvoiceUpdateInput = {
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    invoiceDate?: DateTimeFieldUpdateOperationsInput | Date | string
    invoiceNumber?: StringFieldUpdateOperationsInput | string
    issuerName?: StringFieldUpdateOperationsInput | string
    receiverName?: StringFieldUpdateOperationsInput | string
    totalSales?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    totalDiscount?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    netAmount?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    total?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    invoiceStatus?: StringFieldUpdateOperationsInput | string
    currency?: StringFieldUpdateOperationsInput | string
    exchangeRate?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    taxAmount?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    issuerCountry?: StringFieldUpdateOperationsInput | string
    receiverCountry?: StringFieldUpdateOperationsInput | string
    issuerEtaId?: StringFieldUpdateOperationsInput | string
    receiverEtaId?: StringFieldUpdateOperationsInput | string
    Customer?: CustomerUpdateOneWithoutInvoiceNestedInput
    Supplier?: SupplierUpdateOneWithoutInvoiceNestedInput
  }

  export type InvoiceUncheckedUpdateInput = {
    id?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    invoiceDate?: DateTimeFieldUpdateOperationsInput | Date | string
    invoiceNumber?: StringFieldUpdateOperationsInput | string
    issuerName?: StringFieldUpdateOperationsInput | string
    receiverName?: StringFieldUpdateOperationsInput | string
    totalSales?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    totalDiscount?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    netAmount?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    total?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    invoiceStatus?: StringFieldUpdateOperationsInput | string
    currency?: StringFieldUpdateOperationsInput | string
    exchangeRate?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    taxAmount?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    issuerCountry?: StringFieldUpdateOperationsInput | string
    receiverCountry?: StringFieldUpdateOperationsInput | string
    issuerEtaId?: StringFieldUpdateOperationsInput | string
    receiverEtaId?: StringFieldUpdateOperationsInput | string
    customerId?: NullableIntFieldUpdateOperationsInput | number | null
    supplierId?: NullableIntFieldUpdateOperationsInput | number | null
  }

  export type InvoiceCreateManyInput = {
    id?: number
    createdAt?: Date | string
    updatedAt: Date | string
    invoiceDate: Date | string
    invoiceNumber: string
    issuerName: string
    receiverName: string
    totalSales: Decimal | DecimalJsLike | number | string
    totalDiscount: Decimal | DecimalJsLike | number | string
    netAmount: Decimal | DecimalJsLike | number | string
    total: Decimal | DecimalJsLike | number | string
    invoiceStatus: string
    currency?: string
    exchangeRate: Decimal | DecimalJsLike | number | string
    taxAmount: Decimal | DecimalJsLike | number | string
    issuerCountry: string
    receiverCountry: string
    issuerEtaId: string
    receiverEtaId: string
    customerId?: number | null
    supplierId?: number | null
  }

  export type InvoiceUpdateManyMutationInput = {
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    invoiceDate?: DateTimeFieldUpdateOperationsInput | Date | string
    invoiceNumber?: StringFieldUpdateOperationsInput | string
    issuerName?: StringFieldUpdateOperationsInput | string
    receiverName?: StringFieldUpdateOperationsInput | string
    totalSales?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    totalDiscount?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    netAmount?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    total?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    invoiceStatus?: StringFieldUpdateOperationsInput | string
    currency?: StringFieldUpdateOperationsInput | string
    exchangeRate?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    taxAmount?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    issuerCountry?: StringFieldUpdateOperationsInput | string
    receiverCountry?: StringFieldUpdateOperationsInput | string
    issuerEtaId?: StringFieldUpdateOperationsInput | string
    receiverEtaId?: StringFieldUpdateOperationsInput | string
  }

  export type InvoiceUncheckedUpdateManyInput = {
    id?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    invoiceDate?: DateTimeFieldUpdateOperationsInput | Date | string
    invoiceNumber?: StringFieldUpdateOperationsInput | string
    issuerName?: StringFieldUpdateOperationsInput | string
    receiverName?: StringFieldUpdateOperationsInput | string
    totalSales?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    totalDiscount?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    netAmount?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    total?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    invoiceStatus?: StringFieldUpdateOperationsInput | string
    currency?: StringFieldUpdateOperationsInput | string
    exchangeRate?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    taxAmount?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    issuerCountry?: StringFieldUpdateOperationsInput | string
    receiverCountry?: StringFieldUpdateOperationsInput | string
    issuerEtaId?: StringFieldUpdateOperationsInput | string
    receiverEtaId?: StringFieldUpdateOperationsInput | string
    customerId?: NullableIntFieldUpdateOperationsInput | number | null
    supplierId?: NullableIntFieldUpdateOperationsInput | number | null
  }

  export type CustomerCreateInput = {
    createdAt?: Date | string
    updatedAt: Date | string
    name: string
    country?: string | null
    etaId?: string | null
    paymentTerms?: number | null
    Invoice?: InvoiceCreateNestedManyWithoutCustomerInput
    BankStatement?: BankStatementCreateNestedManyWithoutCustomerInput
  }

  export type CustomerUncheckedCreateInput = {
    id?: number
    createdAt?: Date | string
    updatedAt: Date | string
    name: string
    country?: string | null
    etaId?: string | null
    paymentTerms?: number | null
    Invoice?: InvoiceUncheckedCreateNestedManyWithoutCustomerInput
    BankStatement?: BankStatementUncheckedCreateNestedManyWithoutCustomerInput
  }

  export type CustomerUpdateInput = {
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    name?: StringFieldUpdateOperationsInput | string
    country?: NullableStringFieldUpdateOperationsInput | string | null
    etaId?: NullableStringFieldUpdateOperationsInput | string | null
    paymentTerms?: NullableIntFieldUpdateOperationsInput | number | null
    Invoice?: InvoiceUpdateManyWithoutCustomerNestedInput
    BankStatement?: BankStatementUpdateManyWithoutCustomerNestedInput
  }

  export type CustomerUncheckedUpdateInput = {
    id?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    name?: StringFieldUpdateOperationsInput | string
    country?: NullableStringFieldUpdateOperationsInput | string | null
    etaId?: NullableStringFieldUpdateOperationsInput | string | null
    paymentTerms?: NullableIntFieldUpdateOperationsInput | number | null
    Invoice?: InvoiceUncheckedUpdateManyWithoutCustomerNestedInput
    BankStatement?: BankStatementUncheckedUpdateManyWithoutCustomerNestedInput
  }

  export type CustomerCreateManyInput = {
    id?: number
    createdAt?: Date | string
    updatedAt: Date | string
    name: string
    country?: string | null
    etaId?: string | null
    paymentTerms?: number | null
  }

  export type CustomerUpdateManyMutationInput = {
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    name?: StringFieldUpdateOperationsInput | string
    country?: NullableStringFieldUpdateOperationsInput | string | null
    etaId?: NullableStringFieldUpdateOperationsInput | string | null
    paymentTerms?: NullableIntFieldUpdateOperationsInput | number | null
  }

  export type CustomerUncheckedUpdateManyInput = {
    id?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    name?: StringFieldUpdateOperationsInput | string
    country?: NullableStringFieldUpdateOperationsInput | string | null
    etaId?: NullableStringFieldUpdateOperationsInput | string | null
    paymentTerms?: NullableIntFieldUpdateOperationsInput | number | null
  }

  export type SupplierCreateInput = {
    createdAt?: Date | string
    updatedAt: Date | string
    name: string
    country?: string | null
    etaId?: string | null
    paymentTerms?: number | null
    Invoice?: InvoiceCreateNestedManyWithoutSupplierInput
    BankStatement?: BankStatementCreateNestedManyWithoutSupplierInput
  }

  export type SupplierUncheckedCreateInput = {
    id?: number
    createdAt?: Date | string
    updatedAt: Date | string
    name: string
    country?: string | null
    etaId?: string | null
    paymentTerms?: number | null
    Invoice?: InvoiceUncheckedCreateNestedManyWithoutSupplierInput
    BankStatement?: BankStatementUncheckedCreateNestedManyWithoutSupplierInput
  }

  export type SupplierUpdateInput = {
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    name?: StringFieldUpdateOperationsInput | string
    country?: NullableStringFieldUpdateOperationsInput | string | null
    etaId?: NullableStringFieldUpdateOperationsInput | string | null
    paymentTerms?: NullableIntFieldUpdateOperationsInput | number | null
    Invoice?: InvoiceUpdateManyWithoutSupplierNestedInput
    BankStatement?: BankStatementUpdateManyWithoutSupplierNestedInput
  }

  export type SupplierUncheckedUpdateInput = {
    id?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    name?: StringFieldUpdateOperationsInput | string
    country?: NullableStringFieldUpdateOperationsInput | string | null
    etaId?: NullableStringFieldUpdateOperationsInput | string | null
    paymentTerms?: NullableIntFieldUpdateOperationsInput | number | null
    Invoice?: InvoiceUncheckedUpdateManyWithoutSupplierNestedInput
    BankStatement?: BankStatementUncheckedUpdateManyWithoutSupplierNestedInput
  }

  export type SupplierCreateManyInput = {
    id?: number
    createdAt?: Date | string
    updatedAt: Date | string
    name: string
    country?: string | null
    etaId?: string | null
    paymentTerms?: number | null
  }

  export type SupplierUpdateManyMutationInput = {
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    name?: StringFieldUpdateOperationsInput | string
    country?: NullableStringFieldUpdateOperationsInput | string | null
    etaId?: NullableStringFieldUpdateOperationsInput | string | null
    paymentTerms?: NullableIntFieldUpdateOperationsInput | number | null
  }

  export type SupplierUncheckedUpdateManyInput = {
    id?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    name?: StringFieldUpdateOperationsInput | string
    country?: NullableStringFieldUpdateOperationsInput | string | null
    etaId?: NullableStringFieldUpdateOperationsInput | string | null
    paymentTerms?: NullableIntFieldUpdateOperationsInput | number | null
  }

  export type BankCreateInput = {
    createdAt?: Date | string
    updatedAt?: Date | string
    name: string
    bankStatements?: BankStatementCreateNestedManyWithoutBankInput
  }

  export type BankUncheckedCreateInput = {
    id?: number
    createdAt?: Date | string
    updatedAt?: Date | string
    name: string
    bankStatements?: BankStatementUncheckedCreateNestedManyWithoutBankInput
  }

  export type BankUpdateInput = {
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    name?: StringFieldUpdateOperationsInput | string
    bankStatements?: BankStatementUpdateManyWithoutBankNestedInput
  }

  export type BankUncheckedUpdateInput = {
    id?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    name?: StringFieldUpdateOperationsInput | string
    bankStatements?: BankStatementUncheckedUpdateManyWithoutBankNestedInput
  }

  export type BankCreateManyInput = {
    id?: number
    createdAt?: Date | string
    updatedAt?: Date | string
    name: string
  }

  export type BankUpdateManyMutationInput = {
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    name?: StringFieldUpdateOperationsInput | string
  }

  export type BankUncheckedUpdateManyInput = {
    id?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    name?: StringFieldUpdateOperationsInput | string
  }

  export type BankStatementCreateInput = {
    createdAt?: Date | string
    updatedAt?: Date | string
    fileName?: string | null
    bankName: string
    accountNumber: string
    statementPeriodStart: Date | string
    statementPeriodEnd: Date | string
    accountType?: string | null
    accountCurrency?: string | null
    startingBalance: Decimal | DecimalJsLike | number | string
    endingBalance: Decimal | DecimalJsLike | number | string
    rawTextContent?: string | null
    processingStatus?: string
    bank: BankCreateNestedOneWithoutBankStatementsInput
    Customer?: CustomerCreateNestedOneWithoutBankStatementInput
    Supplier?: SupplierCreateNestedOneWithoutBankStatementInput
    transactions?: TransactionCreateNestedManyWithoutBankStatementInput
  }

  export type BankStatementUncheckedCreateInput = {
    id?: number
    createdAt?: Date | string
    updatedAt?: Date | string
    fileName?: string | null
    bankName: string
    accountNumber: string
    statementPeriodStart: Date | string
    statementPeriodEnd: Date | string
    accountType?: string | null
    accountCurrency?: string | null
    startingBalance: Decimal | DecimalJsLike | number | string
    endingBalance: Decimal | DecimalJsLike | number | string
    rawTextContent?: string | null
    processingStatus?: string
    bankId: number
    customerId?: number | null
    supplierId?: number | null
    transactions?: TransactionUncheckedCreateNestedManyWithoutBankStatementInput
  }

  export type BankStatementUpdateInput = {
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    fileName?: NullableStringFieldUpdateOperationsInput | string | null
    bankName?: StringFieldUpdateOperationsInput | string
    accountNumber?: StringFieldUpdateOperationsInput | string
    statementPeriodStart?: DateTimeFieldUpdateOperationsInput | Date | string
    statementPeriodEnd?: DateTimeFieldUpdateOperationsInput | Date | string
    accountType?: NullableStringFieldUpdateOperationsInput | string | null
    accountCurrency?: NullableStringFieldUpdateOperationsInput | string | null
    startingBalance?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    endingBalance?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    rawTextContent?: NullableStringFieldUpdateOperationsInput | string | null
    processingStatus?: StringFieldUpdateOperationsInput | string
    bank?: BankUpdateOneRequiredWithoutBankStatementsNestedInput
    Customer?: CustomerUpdateOneWithoutBankStatementNestedInput
    Supplier?: SupplierUpdateOneWithoutBankStatementNestedInput
    transactions?: TransactionUpdateManyWithoutBankStatementNestedInput
  }

  export type BankStatementUncheckedUpdateInput = {
    id?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    fileName?: NullableStringFieldUpdateOperationsInput | string | null
    bankName?: StringFieldUpdateOperationsInput | string
    accountNumber?: StringFieldUpdateOperationsInput | string
    statementPeriodStart?: DateTimeFieldUpdateOperationsInput | Date | string
    statementPeriodEnd?: DateTimeFieldUpdateOperationsInput | Date | string
    accountType?: NullableStringFieldUpdateOperationsInput | string | null
    accountCurrency?: NullableStringFieldUpdateOperationsInput | string | null
    startingBalance?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    endingBalance?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    rawTextContent?: NullableStringFieldUpdateOperationsInput | string | null
    processingStatus?: StringFieldUpdateOperationsInput | string
    bankId?: IntFieldUpdateOperationsInput | number
    customerId?: NullableIntFieldUpdateOperationsInput | number | null
    supplierId?: NullableIntFieldUpdateOperationsInput | number | null
    transactions?: TransactionUncheckedUpdateManyWithoutBankStatementNestedInput
  }

  export type BankStatementCreateManyInput = {
    id?: number
    createdAt?: Date | string
    updatedAt?: Date | string
    fileName?: string | null
    bankName: string
    accountNumber: string
    statementPeriodStart: Date | string
    statementPeriodEnd: Date | string
    accountType?: string | null
    accountCurrency?: string | null
    startingBalance: Decimal | DecimalJsLike | number | string
    endingBalance: Decimal | DecimalJsLike | number | string
    rawTextContent?: string | null
    processingStatus?: string
    bankId: number
    customerId?: number | null
    supplierId?: number | null
  }

  export type BankStatementUpdateManyMutationInput = {
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    fileName?: NullableStringFieldUpdateOperationsInput | string | null
    bankName?: StringFieldUpdateOperationsInput | string
    accountNumber?: StringFieldUpdateOperationsInput | string
    statementPeriodStart?: DateTimeFieldUpdateOperationsInput | Date | string
    statementPeriodEnd?: DateTimeFieldUpdateOperationsInput | Date | string
    accountType?: NullableStringFieldUpdateOperationsInput | string | null
    accountCurrency?: NullableStringFieldUpdateOperationsInput | string | null
    startingBalance?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    endingBalance?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    rawTextContent?: NullableStringFieldUpdateOperationsInput | string | null
    processingStatus?: StringFieldUpdateOperationsInput | string
  }

  export type BankStatementUncheckedUpdateManyInput = {
    id?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    fileName?: NullableStringFieldUpdateOperationsInput | string | null
    bankName?: StringFieldUpdateOperationsInput | string
    accountNumber?: StringFieldUpdateOperationsInput | string
    statementPeriodStart?: DateTimeFieldUpdateOperationsInput | Date | string
    statementPeriodEnd?: DateTimeFieldUpdateOperationsInput | Date | string
    accountType?: NullableStringFieldUpdateOperationsInput | string | null
    accountCurrency?: NullableStringFieldUpdateOperationsInput | string | null
    startingBalance?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    endingBalance?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    rawTextContent?: NullableStringFieldUpdateOperationsInput | string | null
    processingStatus?: StringFieldUpdateOperationsInput | string
    bankId?: IntFieldUpdateOperationsInput | number
    customerId?: NullableIntFieldUpdateOperationsInput | number | null
    supplierId?: NullableIntFieldUpdateOperationsInput | number | null
  }

  export type TransactionCreateInput = {
    createdAt?: Date | string
    updatedAt?: Date | string
    transactionDate: Date | string
    creditAmount?: Decimal | DecimalJsLike | number | string | null
    debitAmount?: Decimal | DecimalJsLike | number | string | null
    description?: string | null
    balance?: Decimal | DecimalJsLike | number | string | null
    pageNumber?: string | null
    entityName?: string | null
    bankStatement: BankStatementCreateNestedOneWithoutTransactionsInput
  }

  export type TransactionUncheckedCreateInput = {
    id?: number
    createdAt?: Date | string
    updatedAt?: Date | string
    transactionDate: Date | string
    creditAmount?: Decimal | DecimalJsLike | number | string | null
    debitAmount?: Decimal | DecimalJsLike | number | string | null
    description?: string | null
    balance?: Decimal | DecimalJsLike | number | string | null
    pageNumber?: string | null
    entityName?: string | null
    bankStatementId: number
  }

  export type TransactionUpdateInput = {
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    transactionDate?: DateTimeFieldUpdateOperationsInput | Date | string
    creditAmount?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    debitAmount?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    description?: NullableStringFieldUpdateOperationsInput | string | null
    balance?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    pageNumber?: NullableStringFieldUpdateOperationsInput | string | null
    entityName?: NullableStringFieldUpdateOperationsInput | string | null
    bankStatement?: BankStatementUpdateOneRequiredWithoutTransactionsNestedInput
  }

  export type TransactionUncheckedUpdateInput = {
    id?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    transactionDate?: DateTimeFieldUpdateOperationsInput | Date | string
    creditAmount?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    debitAmount?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    description?: NullableStringFieldUpdateOperationsInput | string | null
    balance?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    pageNumber?: NullableStringFieldUpdateOperationsInput | string | null
    entityName?: NullableStringFieldUpdateOperationsInput | string | null
    bankStatementId?: IntFieldUpdateOperationsInput | number
  }

  export type TransactionCreateManyInput = {
    id?: number
    createdAt?: Date | string
    updatedAt?: Date | string
    transactionDate: Date | string
    creditAmount?: Decimal | DecimalJsLike | number | string | null
    debitAmount?: Decimal | DecimalJsLike | number | string | null
    description?: string | null
    balance?: Decimal | DecimalJsLike | number | string | null
    pageNumber?: string | null
    entityName?: string | null
    bankStatementId: number
  }

  export type TransactionUpdateManyMutationInput = {
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    transactionDate?: DateTimeFieldUpdateOperationsInput | Date | string
    creditAmount?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    debitAmount?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    description?: NullableStringFieldUpdateOperationsInput | string | null
    balance?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    pageNumber?: NullableStringFieldUpdateOperationsInput | string | null
    entityName?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type TransactionUncheckedUpdateManyInput = {
    id?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    transactionDate?: DateTimeFieldUpdateOperationsInput | Date | string
    creditAmount?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    debitAmount?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    description?: NullableStringFieldUpdateOperationsInput | string | null
    balance?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    pageNumber?: NullableStringFieldUpdateOperationsInput | string | null
    entityName?: NullableStringFieldUpdateOperationsInput | string | null
    bankStatementId?: IntFieldUpdateOperationsInput | number
  }

  export type IntFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[] | ListIntFieldRefInput<$PrismaModel>
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel>
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntFilter<$PrismaModel> | number
  }

  export type DateTimeFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeFilter<$PrismaModel> | Date | string
  }

  export type StringFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedStringFilter<$PrismaModel> | string
  }

  export type DecimalFilter<$PrismaModel = never> = {
    equals?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    in?: Decimal[] | DecimalJsLike[] | number[] | string[] | ListDecimalFieldRefInput<$PrismaModel>
    notIn?: Decimal[] | DecimalJsLike[] | number[] | string[] | ListDecimalFieldRefInput<$PrismaModel>
    lt?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    lte?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    gt?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    gte?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    not?: NestedDecimalFilter<$PrismaModel> | Decimal | DecimalJsLike | number | string
  }

  export type IntNullableFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel> | null
    in?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntNullableFilter<$PrismaModel> | number | null
  }

  export type CustomerNullableScalarRelationFilter = {
    is?: CustomerWhereInput | null
    isNot?: CustomerWhereInput | null
  }

  export type SupplierNullableScalarRelationFilter = {
    is?: SupplierWhereInput | null
    isNot?: SupplierWhereInput | null
  }

  export type SortOrderInput = {
    sort: SortOrder
    nulls?: NullsOrder
  }

  export type InvoiceCountOrderByAggregateInput = {
    id?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    invoiceDate?: SortOrder
    invoiceNumber?: SortOrder
    issuerName?: SortOrder
    receiverName?: SortOrder
    totalSales?: SortOrder
    totalDiscount?: SortOrder
    netAmount?: SortOrder
    total?: SortOrder
    invoiceStatus?: SortOrder
    currency?: SortOrder
    exchangeRate?: SortOrder
    taxAmount?: SortOrder
    issuerCountry?: SortOrder
    receiverCountry?: SortOrder
    issuerEtaId?: SortOrder
    receiverEtaId?: SortOrder
    customerId?: SortOrder
    supplierId?: SortOrder
  }

  export type InvoiceAvgOrderByAggregateInput = {
    id?: SortOrder
    totalSales?: SortOrder
    totalDiscount?: SortOrder
    netAmount?: SortOrder
    total?: SortOrder
    exchangeRate?: SortOrder
    taxAmount?: SortOrder
    customerId?: SortOrder
    supplierId?: SortOrder
  }

  export type InvoiceMaxOrderByAggregateInput = {
    id?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    invoiceDate?: SortOrder
    invoiceNumber?: SortOrder
    issuerName?: SortOrder
    receiverName?: SortOrder
    totalSales?: SortOrder
    totalDiscount?: SortOrder
    netAmount?: SortOrder
    total?: SortOrder
    invoiceStatus?: SortOrder
    currency?: SortOrder
    exchangeRate?: SortOrder
    taxAmount?: SortOrder
    issuerCountry?: SortOrder
    receiverCountry?: SortOrder
    issuerEtaId?: SortOrder
    receiverEtaId?: SortOrder
    customerId?: SortOrder
    supplierId?: SortOrder
  }

  export type InvoiceMinOrderByAggregateInput = {
    id?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    invoiceDate?: SortOrder
    invoiceNumber?: SortOrder
    issuerName?: SortOrder
    receiverName?: SortOrder
    totalSales?: SortOrder
    totalDiscount?: SortOrder
    netAmount?: SortOrder
    total?: SortOrder
    invoiceStatus?: SortOrder
    currency?: SortOrder
    exchangeRate?: SortOrder
    taxAmount?: SortOrder
    issuerCountry?: SortOrder
    receiverCountry?: SortOrder
    issuerEtaId?: SortOrder
    receiverEtaId?: SortOrder
    customerId?: SortOrder
    supplierId?: SortOrder
  }

  export type InvoiceSumOrderByAggregateInput = {
    id?: SortOrder
    totalSales?: SortOrder
    totalDiscount?: SortOrder
    netAmount?: SortOrder
    total?: SortOrder
    exchangeRate?: SortOrder
    taxAmount?: SortOrder
    customerId?: SortOrder
    supplierId?: SortOrder
  }

  export type IntWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[] | ListIntFieldRefInput<$PrismaModel>
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel>
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntWithAggregatesFilter<$PrismaModel> | number
    _count?: NestedIntFilter<$PrismaModel>
    _avg?: NestedFloatFilter<$PrismaModel>
    _sum?: NestedIntFilter<$PrismaModel>
    _min?: NestedIntFilter<$PrismaModel>
    _max?: NestedIntFilter<$PrismaModel>
  }

  export type DateTimeWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeWithAggregatesFilter<$PrismaModel> | Date | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedDateTimeFilter<$PrismaModel>
    _max?: NestedDateTimeFilter<$PrismaModel>
  }

  export type StringWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedStringWithAggregatesFilter<$PrismaModel> | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedStringFilter<$PrismaModel>
    _max?: NestedStringFilter<$PrismaModel>
  }

  export type DecimalWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    in?: Decimal[] | DecimalJsLike[] | number[] | string[] | ListDecimalFieldRefInput<$PrismaModel>
    notIn?: Decimal[] | DecimalJsLike[] | number[] | string[] | ListDecimalFieldRefInput<$PrismaModel>
    lt?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    lte?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    gt?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    gte?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    not?: NestedDecimalWithAggregatesFilter<$PrismaModel> | Decimal | DecimalJsLike | number | string
    _count?: NestedIntFilter<$PrismaModel>
    _avg?: NestedDecimalFilter<$PrismaModel>
    _sum?: NestedDecimalFilter<$PrismaModel>
    _min?: NestedDecimalFilter<$PrismaModel>
    _max?: NestedDecimalFilter<$PrismaModel>
  }

  export type IntNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel> | null
    in?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntNullableWithAggregatesFilter<$PrismaModel> | number | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _avg?: NestedFloatNullableFilter<$PrismaModel>
    _sum?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedIntNullableFilter<$PrismaModel>
    _max?: NestedIntNullableFilter<$PrismaModel>
  }

  export type StringNullableFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedStringNullableFilter<$PrismaModel> | string | null
  }

  export type InvoiceListRelationFilter = {
    every?: InvoiceWhereInput
    some?: InvoiceWhereInput
    none?: InvoiceWhereInput
  }

  export type BankStatementListRelationFilter = {
    every?: BankStatementWhereInput
    some?: BankStatementWhereInput
    none?: BankStatementWhereInput
  }

  export type InvoiceOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type BankStatementOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type CustomerCountOrderByAggregateInput = {
    id?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    name?: SortOrder
    country?: SortOrder
    etaId?: SortOrder
    paymentTerms?: SortOrder
  }

  export type CustomerAvgOrderByAggregateInput = {
    id?: SortOrder
    paymentTerms?: SortOrder
  }

  export type CustomerMaxOrderByAggregateInput = {
    id?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    name?: SortOrder
    country?: SortOrder
    etaId?: SortOrder
    paymentTerms?: SortOrder
  }

  export type CustomerMinOrderByAggregateInput = {
    id?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    name?: SortOrder
    country?: SortOrder
    etaId?: SortOrder
    paymentTerms?: SortOrder
  }

  export type CustomerSumOrderByAggregateInput = {
    id?: SortOrder
    paymentTerms?: SortOrder
  }

  export type StringNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedStringNullableWithAggregatesFilter<$PrismaModel> | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedStringNullableFilter<$PrismaModel>
    _max?: NestedStringNullableFilter<$PrismaModel>
  }

  export type SupplierCountOrderByAggregateInput = {
    id?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    name?: SortOrder
    country?: SortOrder
    etaId?: SortOrder
    paymentTerms?: SortOrder
  }

  export type SupplierAvgOrderByAggregateInput = {
    id?: SortOrder
    paymentTerms?: SortOrder
  }

  export type SupplierMaxOrderByAggregateInput = {
    id?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    name?: SortOrder
    country?: SortOrder
    etaId?: SortOrder
    paymentTerms?: SortOrder
  }

  export type SupplierMinOrderByAggregateInput = {
    id?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    name?: SortOrder
    country?: SortOrder
    etaId?: SortOrder
    paymentTerms?: SortOrder
  }

  export type SupplierSumOrderByAggregateInput = {
    id?: SortOrder
    paymentTerms?: SortOrder
  }

  export type BankCountOrderByAggregateInput = {
    id?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    name?: SortOrder
  }

  export type BankAvgOrderByAggregateInput = {
    id?: SortOrder
  }

  export type BankMaxOrderByAggregateInput = {
    id?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    name?: SortOrder
  }

  export type BankMinOrderByAggregateInput = {
    id?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    name?: SortOrder
  }

  export type BankSumOrderByAggregateInput = {
    id?: SortOrder
  }

  export type BankScalarRelationFilter = {
    is?: BankWhereInput
    isNot?: BankWhereInput
  }

  export type TransactionListRelationFilter = {
    every?: TransactionWhereInput
    some?: TransactionWhereInput
    none?: TransactionWhereInput
  }

  export type TransactionOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type BankStatementCountOrderByAggregateInput = {
    id?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    fileName?: SortOrder
    bankName?: SortOrder
    accountNumber?: SortOrder
    statementPeriodStart?: SortOrder
    statementPeriodEnd?: SortOrder
    accountType?: SortOrder
    accountCurrency?: SortOrder
    startingBalance?: SortOrder
    endingBalance?: SortOrder
    rawTextContent?: SortOrder
    processingStatus?: SortOrder
    bankId?: SortOrder
    customerId?: SortOrder
    supplierId?: SortOrder
  }

  export type BankStatementAvgOrderByAggregateInput = {
    id?: SortOrder
    startingBalance?: SortOrder
    endingBalance?: SortOrder
    bankId?: SortOrder
    customerId?: SortOrder
    supplierId?: SortOrder
  }

  export type BankStatementMaxOrderByAggregateInput = {
    id?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    fileName?: SortOrder
    bankName?: SortOrder
    accountNumber?: SortOrder
    statementPeriodStart?: SortOrder
    statementPeriodEnd?: SortOrder
    accountType?: SortOrder
    accountCurrency?: SortOrder
    startingBalance?: SortOrder
    endingBalance?: SortOrder
    rawTextContent?: SortOrder
    processingStatus?: SortOrder
    bankId?: SortOrder
    customerId?: SortOrder
    supplierId?: SortOrder
  }

  export type BankStatementMinOrderByAggregateInput = {
    id?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    fileName?: SortOrder
    bankName?: SortOrder
    accountNumber?: SortOrder
    statementPeriodStart?: SortOrder
    statementPeriodEnd?: SortOrder
    accountType?: SortOrder
    accountCurrency?: SortOrder
    startingBalance?: SortOrder
    endingBalance?: SortOrder
    rawTextContent?: SortOrder
    processingStatus?: SortOrder
    bankId?: SortOrder
    customerId?: SortOrder
    supplierId?: SortOrder
  }

  export type BankStatementSumOrderByAggregateInput = {
    id?: SortOrder
    startingBalance?: SortOrder
    endingBalance?: SortOrder
    bankId?: SortOrder
    customerId?: SortOrder
    supplierId?: SortOrder
  }

  export type DecimalNullableFilter<$PrismaModel = never> = {
    equals?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel> | null
    in?: Decimal[] | DecimalJsLike[] | number[] | string[] | ListDecimalFieldRefInput<$PrismaModel> | null
    notIn?: Decimal[] | DecimalJsLike[] | number[] | string[] | ListDecimalFieldRefInput<$PrismaModel> | null
    lt?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    lte?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    gt?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    gte?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    not?: NestedDecimalNullableFilter<$PrismaModel> | Decimal | DecimalJsLike | number | string | null
  }

  export type BankStatementScalarRelationFilter = {
    is?: BankStatementWhereInput
    isNot?: BankStatementWhereInput
  }

  export type TransactionCountOrderByAggregateInput = {
    id?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    transactionDate?: SortOrder
    creditAmount?: SortOrder
    debitAmount?: SortOrder
    description?: SortOrder
    balance?: SortOrder
    pageNumber?: SortOrder
    entityName?: SortOrder
    bankStatementId?: SortOrder
  }

  export type TransactionAvgOrderByAggregateInput = {
    id?: SortOrder
    creditAmount?: SortOrder
    debitAmount?: SortOrder
    balance?: SortOrder
    bankStatementId?: SortOrder
  }

  export type TransactionMaxOrderByAggregateInput = {
    id?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    transactionDate?: SortOrder
    creditAmount?: SortOrder
    debitAmount?: SortOrder
    description?: SortOrder
    balance?: SortOrder
    pageNumber?: SortOrder
    entityName?: SortOrder
    bankStatementId?: SortOrder
  }

  export type TransactionMinOrderByAggregateInput = {
    id?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    transactionDate?: SortOrder
    creditAmount?: SortOrder
    debitAmount?: SortOrder
    description?: SortOrder
    balance?: SortOrder
    pageNumber?: SortOrder
    entityName?: SortOrder
    bankStatementId?: SortOrder
  }

  export type TransactionSumOrderByAggregateInput = {
    id?: SortOrder
    creditAmount?: SortOrder
    debitAmount?: SortOrder
    balance?: SortOrder
    bankStatementId?: SortOrder
  }

  export type DecimalNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel> | null
    in?: Decimal[] | DecimalJsLike[] | number[] | string[] | ListDecimalFieldRefInput<$PrismaModel> | null
    notIn?: Decimal[] | DecimalJsLike[] | number[] | string[] | ListDecimalFieldRefInput<$PrismaModel> | null
    lt?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    lte?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    gt?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    gte?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    not?: NestedDecimalNullableWithAggregatesFilter<$PrismaModel> | Decimal | DecimalJsLike | number | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _avg?: NestedDecimalNullableFilter<$PrismaModel>
    _sum?: NestedDecimalNullableFilter<$PrismaModel>
    _min?: NestedDecimalNullableFilter<$PrismaModel>
    _max?: NestedDecimalNullableFilter<$PrismaModel>
  }

  export type CustomerCreateNestedOneWithoutInvoiceInput = {
    create?: XOR<CustomerCreateWithoutInvoiceInput, CustomerUncheckedCreateWithoutInvoiceInput>
    connectOrCreate?: CustomerCreateOrConnectWithoutInvoiceInput
    connect?: CustomerWhereUniqueInput
  }

  export type SupplierCreateNestedOneWithoutInvoiceInput = {
    create?: XOR<SupplierCreateWithoutInvoiceInput, SupplierUncheckedCreateWithoutInvoiceInput>
    connectOrCreate?: SupplierCreateOrConnectWithoutInvoiceInput
    connect?: SupplierWhereUniqueInput
  }

  export type DateTimeFieldUpdateOperationsInput = {
    set?: Date | string
  }

  export type StringFieldUpdateOperationsInput = {
    set?: string
  }

  export type DecimalFieldUpdateOperationsInput = {
    set?: Decimal | DecimalJsLike | number | string
    increment?: Decimal | DecimalJsLike | number | string
    decrement?: Decimal | DecimalJsLike | number | string
    multiply?: Decimal | DecimalJsLike | number | string
    divide?: Decimal | DecimalJsLike | number | string
  }

  export type CustomerUpdateOneWithoutInvoiceNestedInput = {
    create?: XOR<CustomerCreateWithoutInvoiceInput, CustomerUncheckedCreateWithoutInvoiceInput>
    connectOrCreate?: CustomerCreateOrConnectWithoutInvoiceInput
    upsert?: CustomerUpsertWithoutInvoiceInput
    disconnect?: CustomerWhereInput | boolean
    delete?: CustomerWhereInput | boolean
    connect?: CustomerWhereUniqueInput
    update?: XOR<XOR<CustomerUpdateToOneWithWhereWithoutInvoiceInput, CustomerUpdateWithoutInvoiceInput>, CustomerUncheckedUpdateWithoutInvoiceInput>
  }

  export type SupplierUpdateOneWithoutInvoiceNestedInput = {
    create?: XOR<SupplierCreateWithoutInvoiceInput, SupplierUncheckedCreateWithoutInvoiceInput>
    connectOrCreate?: SupplierCreateOrConnectWithoutInvoiceInput
    upsert?: SupplierUpsertWithoutInvoiceInput
    disconnect?: SupplierWhereInput | boolean
    delete?: SupplierWhereInput | boolean
    connect?: SupplierWhereUniqueInput
    update?: XOR<XOR<SupplierUpdateToOneWithWhereWithoutInvoiceInput, SupplierUpdateWithoutInvoiceInput>, SupplierUncheckedUpdateWithoutInvoiceInput>
  }

  export type IntFieldUpdateOperationsInput = {
    set?: number
    increment?: number
    decrement?: number
    multiply?: number
    divide?: number
  }

  export type NullableIntFieldUpdateOperationsInput = {
    set?: number | null
    increment?: number
    decrement?: number
    multiply?: number
    divide?: number
  }

  export type InvoiceCreateNestedManyWithoutCustomerInput = {
    create?: XOR<InvoiceCreateWithoutCustomerInput, InvoiceUncheckedCreateWithoutCustomerInput> | InvoiceCreateWithoutCustomerInput[] | InvoiceUncheckedCreateWithoutCustomerInput[]
    connectOrCreate?: InvoiceCreateOrConnectWithoutCustomerInput | InvoiceCreateOrConnectWithoutCustomerInput[]
    createMany?: InvoiceCreateManyCustomerInputEnvelope
    connect?: InvoiceWhereUniqueInput | InvoiceWhereUniqueInput[]
  }

  export type BankStatementCreateNestedManyWithoutCustomerInput = {
    create?: XOR<BankStatementCreateWithoutCustomerInput, BankStatementUncheckedCreateWithoutCustomerInput> | BankStatementCreateWithoutCustomerInput[] | BankStatementUncheckedCreateWithoutCustomerInput[]
    connectOrCreate?: BankStatementCreateOrConnectWithoutCustomerInput | BankStatementCreateOrConnectWithoutCustomerInput[]
    createMany?: BankStatementCreateManyCustomerInputEnvelope
    connect?: BankStatementWhereUniqueInput | BankStatementWhereUniqueInput[]
  }

  export type InvoiceUncheckedCreateNestedManyWithoutCustomerInput = {
    create?: XOR<InvoiceCreateWithoutCustomerInput, InvoiceUncheckedCreateWithoutCustomerInput> | InvoiceCreateWithoutCustomerInput[] | InvoiceUncheckedCreateWithoutCustomerInput[]
    connectOrCreate?: InvoiceCreateOrConnectWithoutCustomerInput | InvoiceCreateOrConnectWithoutCustomerInput[]
    createMany?: InvoiceCreateManyCustomerInputEnvelope
    connect?: InvoiceWhereUniqueInput | InvoiceWhereUniqueInput[]
  }

  export type BankStatementUncheckedCreateNestedManyWithoutCustomerInput = {
    create?: XOR<BankStatementCreateWithoutCustomerInput, BankStatementUncheckedCreateWithoutCustomerInput> | BankStatementCreateWithoutCustomerInput[] | BankStatementUncheckedCreateWithoutCustomerInput[]
    connectOrCreate?: BankStatementCreateOrConnectWithoutCustomerInput | BankStatementCreateOrConnectWithoutCustomerInput[]
    createMany?: BankStatementCreateManyCustomerInputEnvelope
    connect?: BankStatementWhereUniqueInput | BankStatementWhereUniqueInput[]
  }

  export type NullableStringFieldUpdateOperationsInput = {
    set?: string | null
  }

  export type InvoiceUpdateManyWithoutCustomerNestedInput = {
    create?: XOR<InvoiceCreateWithoutCustomerInput, InvoiceUncheckedCreateWithoutCustomerInput> | InvoiceCreateWithoutCustomerInput[] | InvoiceUncheckedCreateWithoutCustomerInput[]
    connectOrCreate?: InvoiceCreateOrConnectWithoutCustomerInput | InvoiceCreateOrConnectWithoutCustomerInput[]
    upsert?: InvoiceUpsertWithWhereUniqueWithoutCustomerInput | InvoiceUpsertWithWhereUniqueWithoutCustomerInput[]
    createMany?: InvoiceCreateManyCustomerInputEnvelope
    set?: InvoiceWhereUniqueInput | InvoiceWhereUniqueInput[]
    disconnect?: InvoiceWhereUniqueInput | InvoiceWhereUniqueInput[]
    delete?: InvoiceWhereUniqueInput | InvoiceWhereUniqueInput[]
    connect?: InvoiceWhereUniqueInput | InvoiceWhereUniqueInput[]
    update?: InvoiceUpdateWithWhereUniqueWithoutCustomerInput | InvoiceUpdateWithWhereUniqueWithoutCustomerInput[]
    updateMany?: InvoiceUpdateManyWithWhereWithoutCustomerInput | InvoiceUpdateManyWithWhereWithoutCustomerInput[]
    deleteMany?: InvoiceScalarWhereInput | InvoiceScalarWhereInput[]
  }

  export type BankStatementUpdateManyWithoutCustomerNestedInput = {
    create?: XOR<BankStatementCreateWithoutCustomerInput, BankStatementUncheckedCreateWithoutCustomerInput> | BankStatementCreateWithoutCustomerInput[] | BankStatementUncheckedCreateWithoutCustomerInput[]
    connectOrCreate?: BankStatementCreateOrConnectWithoutCustomerInput | BankStatementCreateOrConnectWithoutCustomerInput[]
    upsert?: BankStatementUpsertWithWhereUniqueWithoutCustomerInput | BankStatementUpsertWithWhereUniqueWithoutCustomerInput[]
    createMany?: BankStatementCreateManyCustomerInputEnvelope
    set?: BankStatementWhereUniqueInput | BankStatementWhereUniqueInput[]
    disconnect?: BankStatementWhereUniqueInput | BankStatementWhereUniqueInput[]
    delete?: BankStatementWhereUniqueInput | BankStatementWhereUniqueInput[]
    connect?: BankStatementWhereUniqueInput | BankStatementWhereUniqueInput[]
    update?: BankStatementUpdateWithWhereUniqueWithoutCustomerInput | BankStatementUpdateWithWhereUniqueWithoutCustomerInput[]
    updateMany?: BankStatementUpdateManyWithWhereWithoutCustomerInput | BankStatementUpdateManyWithWhereWithoutCustomerInput[]
    deleteMany?: BankStatementScalarWhereInput | BankStatementScalarWhereInput[]
  }

  export type InvoiceUncheckedUpdateManyWithoutCustomerNestedInput = {
    create?: XOR<InvoiceCreateWithoutCustomerInput, InvoiceUncheckedCreateWithoutCustomerInput> | InvoiceCreateWithoutCustomerInput[] | InvoiceUncheckedCreateWithoutCustomerInput[]
    connectOrCreate?: InvoiceCreateOrConnectWithoutCustomerInput | InvoiceCreateOrConnectWithoutCustomerInput[]
    upsert?: InvoiceUpsertWithWhereUniqueWithoutCustomerInput | InvoiceUpsertWithWhereUniqueWithoutCustomerInput[]
    createMany?: InvoiceCreateManyCustomerInputEnvelope
    set?: InvoiceWhereUniqueInput | InvoiceWhereUniqueInput[]
    disconnect?: InvoiceWhereUniqueInput | InvoiceWhereUniqueInput[]
    delete?: InvoiceWhereUniqueInput | InvoiceWhereUniqueInput[]
    connect?: InvoiceWhereUniqueInput | InvoiceWhereUniqueInput[]
    update?: InvoiceUpdateWithWhereUniqueWithoutCustomerInput | InvoiceUpdateWithWhereUniqueWithoutCustomerInput[]
    updateMany?: InvoiceUpdateManyWithWhereWithoutCustomerInput | InvoiceUpdateManyWithWhereWithoutCustomerInput[]
    deleteMany?: InvoiceScalarWhereInput | InvoiceScalarWhereInput[]
  }

  export type BankStatementUncheckedUpdateManyWithoutCustomerNestedInput = {
    create?: XOR<BankStatementCreateWithoutCustomerInput, BankStatementUncheckedCreateWithoutCustomerInput> | BankStatementCreateWithoutCustomerInput[] | BankStatementUncheckedCreateWithoutCustomerInput[]
    connectOrCreate?: BankStatementCreateOrConnectWithoutCustomerInput | BankStatementCreateOrConnectWithoutCustomerInput[]
    upsert?: BankStatementUpsertWithWhereUniqueWithoutCustomerInput | BankStatementUpsertWithWhereUniqueWithoutCustomerInput[]
    createMany?: BankStatementCreateManyCustomerInputEnvelope
    set?: BankStatementWhereUniqueInput | BankStatementWhereUniqueInput[]
    disconnect?: BankStatementWhereUniqueInput | BankStatementWhereUniqueInput[]
    delete?: BankStatementWhereUniqueInput | BankStatementWhereUniqueInput[]
    connect?: BankStatementWhereUniqueInput | BankStatementWhereUniqueInput[]
    update?: BankStatementUpdateWithWhereUniqueWithoutCustomerInput | BankStatementUpdateWithWhereUniqueWithoutCustomerInput[]
    updateMany?: BankStatementUpdateManyWithWhereWithoutCustomerInput | BankStatementUpdateManyWithWhereWithoutCustomerInput[]
    deleteMany?: BankStatementScalarWhereInput | BankStatementScalarWhereInput[]
  }

  export type InvoiceCreateNestedManyWithoutSupplierInput = {
    create?: XOR<InvoiceCreateWithoutSupplierInput, InvoiceUncheckedCreateWithoutSupplierInput> | InvoiceCreateWithoutSupplierInput[] | InvoiceUncheckedCreateWithoutSupplierInput[]
    connectOrCreate?: InvoiceCreateOrConnectWithoutSupplierInput | InvoiceCreateOrConnectWithoutSupplierInput[]
    createMany?: InvoiceCreateManySupplierInputEnvelope
    connect?: InvoiceWhereUniqueInput | InvoiceWhereUniqueInput[]
  }

  export type BankStatementCreateNestedManyWithoutSupplierInput = {
    create?: XOR<BankStatementCreateWithoutSupplierInput, BankStatementUncheckedCreateWithoutSupplierInput> | BankStatementCreateWithoutSupplierInput[] | BankStatementUncheckedCreateWithoutSupplierInput[]
    connectOrCreate?: BankStatementCreateOrConnectWithoutSupplierInput | BankStatementCreateOrConnectWithoutSupplierInput[]
    createMany?: BankStatementCreateManySupplierInputEnvelope
    connect?: BankStatementWhereUniqueInput | BankStatementWhereUniqueInput[]
  }

  export type InvoiceUncheckedCreateNestedManyWithoutSupplierInput = {
    create?: XOR<InvoiceCreateWithoutSupplierInput, InvoiceUncheckedCreateWithoutSupplierInput> | InvoiceCreateWithoutSupplierInput[] | InvoiceUncheckedCreateWithoutSupplierInput[]
    connectOrCreate?: InvoiceCreateOrConnectWithoutSupplierInput | InvoiceCreateOrConnectWithoutSupplierInput[]
    createMany?: InvoiceCreateManySupplierInputEnvelope
    connect?: InvoiceWhereUniqueInput | InvoiceWhereUniqueInput[]
  }

  export type BankStatementUncheckedCreateNestedManyWithoutSupplierInput = {
    create?: XOR<BankStatementCreateWithoutSupplierInput, BankStatementUncheckedCreateWithoutSupplierInput> | BankStatementCreateWithoutSupplierInput[] | BankStatementUncheckedCreateWithoutSupplierInput[]
    connectOrCreate?: BankStatementCreateOrConnectWithoutSupplierInput | BankStatementCreateOrConnectWithoutSupplierInput[]
    createMany?: BankStatementCreateManySupplierInputEnvelope
    connect?: BankStatementWhereUniqueInput | BankStatementWhereUniqueInput[]
  }

  export type InvoiceUpdateManyWithoutSupplierNestedInput = {
    create?: XOR<InvoiceCreateWithoutSupplierInput, InvoiceUncheckedCreateWithoutSupplierInput> | InvoiceCreateWithoutSupplierInput[] | InvoiceUncheckedCreateWithoutSupplierInput[]
    connectOrCreate?: InvoiceCreateOrConnectWithoutSupplierInput | InvoiceCreateOrConnectWithoutSupplierInput[]
    upsert?: InvoiceUpsertWithWhereUniqueWithoutSupplierInput | InvoiceUpsertWithWhereUniqueWithoutSupplierInput[]
    createMany?: InvoiceCreateManySupplierInputEnvelope
    set?: InvoiceWhereUniqueInput | InvoiceWhereUniqueInput[]
    disconnect?: InvoiceWhereUniqueInput | InvoiceWhereUniqueInput[]
    delete?: InvoiceWhereUniqueInput | InvoiceWhereUniqueInput[]
    connect?: InvoiceWhereUniqueInput | InvoiceWhereUniqueInput[]
    update?: InvoiceUpdateWithWhereUniqueWithoutSupplierInput | InvoiceUpdateWithWhereUniqueWithoutSupplierInput[]
    updateMany?: InvoiceUpdateManyWithWhereWithoutSupplierInput | InvoiceUpdateManyWithWhereWithoutSupplierInput[]
    deleteMany?: InvoiceScalarWhereInput | InvoiceScalarWhereInput[]
  }

  export type BankStatementUpdateManyWithoutSupplierNestedInput = {
    create?: XOR<BankStatementCreateWithoutSupplierInput, BankStatementUncheckedCreateWithoutSupplierInput> | BankStatementCreateWithoutSupplierInput[] | BankStatementUncheckedCreateWithoutSupplierInput[]
    connectOrCreate?: BankStatementCreateOrConnectWithoutSupplierInput | BankStatementCreateOrConnectWithoutSupplierInput[]
    upsert?: BankStatementUpsertWithWhereUniqueWithoutSupplierInput | BankStatementUpsertWithWhereUniqueWithoutSupplierInput[]
    createMany?: BankStatementCreateManySupplierInputEnvelope
    set?: BankStatementWhereUniqueInput | BankStatementWhereUniqueInput[]
    disconnect?: BankStatementWhereUniqueInput | BankStatementWhereUniqueInput[]
    delete?: BankStatementWhereUniqueInput | BankStatementWhereUniqueInput[]
    connect?: BankStatementWhereUniqueInput | BankStatementWhereUniqueInput[]
    update?: BankStatementUpdateWithWhereUniqueWithoutSupplierInput | BankStatementUpdateWithWhereUniqueWithoutSupplierInput[]
    updateMany?: BankStatementUpdateManyWithWhereWithoutSupplierInput | BankStatementUpdateManyWithWhereWithoutSupplierInput[]
    deleteMany?: BankStatementScalarWhereInput | BankStatementScalarWhereInput[]
  }

  export type InvoiceUncheckedUpdateManyWithoutSupplierNestedInput = {
    create?: XOR<InvoiceCreateWithoutSupplierInput, InvoiceUncheckedCreateWithoutSupplierInput> | InvoiceCreateWithoutSupplierInput[] | InvoiceUncheckedCreateWithoutSupplierInput[]
    connectOrCreate?: InvoiceCreateOrConnectWithoutSupplierInput | InvoiceCreateOrConnectWithoutSupplierInput[]
    upsert?: InvoiceUpsertWithWhereUniqueWithoutSupplierInput | InvoiceUpsertWithWhereUniqueWithoutSupplierInput[]
    createMany?: InvoiceCreateManySupplierInputEnvelope
    set?: InvoiceWhereUniqueInput | InvoiceWhereUniqueInput[]
    disconnect?: InvoiceWhereUniqueInput | InvoiceWhereUniqueInput[]
    delete?: InvoiceWhereUniqueInput | InvoiceWhereUniqueInput[]
    connect?: InvoiceWhereUniqueInput | InvoiceWhereUniqueInput[]
    update?: InvoiceUpdateWithWhereUniqueWithoutSupplierInput | InvoiceUpdateWithWhereUniqueWithoutSupplierInput[]
    updateMany?: InvoiceUpdateManyWithWhereWithoutSupplierInput | InvoiceUpdateManyWithWhereWithoutSupplierInput[]
    deleteMany?: InvoiceScalarWhereInput | InvoiceScalarWhereInput[]
  }

  export type BankStatementUncheckedUpdateManyWithoutSupplierNestedInput = {
    create?: XOR<BankStatementCreateWithoutSupplierInput, BankStatementUncheckedCreateWithoutSupplierInput> | BankStatementCreateWithoutSupplierInput[] | BankStatementUncheckedCreateWithoutSupplierInput[]
    connectOrCreate?: BankStatementCreateOrConnectWithoutSupplierInput | BankStatementCreateOrConnectWithoutSupplierInput[]
    upsert?: BankStatementUpsertWithWhereUniqueWithoutSupplierInput | BankStatementUpsertWithWhereUniqueWithoutSupplierInput[]
    createMany?: BankStatementCreateManySupplierInputEnvelope
    set?: BankStatementWhereUniqueInput | BankStatementWhereUniqueInput[]
    disconnect?: BankStatementWhereUniqueInput | BankStatementWhereUniqueInput[]
    delete?: BankStatementWhereUniqueInput | BankStatementWhereUniqueInput[]
    connect?: BankStatementWhereUniqueInput | BankStatementWhereUniqueInput[]
    update?: BankStatementUpdateWithWhereUniqueWithoutSupplierInput | BankStatementUpdateWithWhereUniqueWithoutSupplierInput[]
    updateMany?: BankStatementUpdateManyWithWhereWithoutSupplierInput | BankStatementUpdateManyWithWhereWithoutSupplierInput[]
    deleteMany?: BankStatementScalarWhereInput | BankStatementScalarWhereInput[]
  }

  export type BankStatementCreateNestedManyWithoutBankInput = {
    create?: XOR<BankStatementCreateWithoutBankInput, BankStatementUncheckedCreateWithoutBankInput> | BankStatementCreateWithoutBankInput[] | BankStatementUncheckedCreateWithoutBankInput[]
    connectOrCreate?: BankStatementCreateOrConnectWithoutBankInput | BankStatementCreateOrConnectWithoutBankInput[]
    createMany?: BankStatementCreateManyBankInputEnvelope
    connect?: BankStatementWhereUniqueInput | BankStatementWhereUniqueInput[]
  }

  export type BankStatementUncheckedCreateNestedManyWithoutBankInput = {
    create?: XOR<BankStatementCreateWithoutBankInput, BankStatementUncheckedCreateWithoutBankInput> | BankStatementCreateWithoutBankInput[] | BankStatementUncheckedCreateWithoutBankInput[]
    connectOrCreate?: BankStatementCreateOrConnectWithoutBankInput | BankStatementCreateOrConnectWithoutBankInput[]
    createMany?: BankStatementCreateManyBankInputEnvelope
    connect?: BankStatementWhereUniqueInput | BankStatementWhereUniqueInput[]
  }

  export type BankStatementUpdateManyWithoutBankNestedInput = {
    create?: XOR<BankStatementCreateWithoutBankInput, BankStatementUncheckedCreateWithoutBankInput> | BankStatementCreateWithoutBankInput[] | BankStatementUncheckedCreateWithoutBankInput[]
    connectOrCreate?: BankStatementCreateOrConnectWithoutBankInput | BankStatementCreateOrConnectWithoutBankInput[]
    upsert?: BankStatementUpsertWithWhereUniqueWithoutBankInput | BankStatementUpsertWithWhereUniqueWithoutBankInput[]
    createMany?: BankStatementCreateManyBankInputEnvelope
    set?: BankStatementWhereUniqueInput | BankStatementWhereUniqueInput[]
    disconnect?: BankStatementWhereUniqueInput | BankStatementWhereUniqueInput[]
    delete?: BankStatementWhereUniqueInput | BankStatementWhereUniqueInput[]
    connect?: BankStatementWhereUniqueInput | BankStatementWhereUniqueInput[]
    update?: BankStatementUpdateWithWhereUniqueWithoutBankInput | BankStatementUpdateWithWhereUniqueWithoutBankInput[]
    updateMany?: BankStatementUpdateManyWithWhereWithoutBankInput | BankStatementUpdateManyWithWhereWithoutBankInput[]
    deleteMany?: BankStatementScalarWhereInput | BankStatementScalarWhereInput[]
  }

  export type BankStatementUncheckedUpdateManyWithoutBankNestedInput = {
    create?: XOR<BankStatementCreateWithoutBankInput, BankStatementUncheckedCreateWithoutBankInput> | BankStatementCreateWithoutBankInput[] | BankStatementUncheckedCreateWithoutBankInput[]
    connectOrCreate?: BankStatementCreateOrConnectWithoutBankInput | BankStatementCreateOrConnectWithoutBankInput[]
    upsert?: BankStatementUpsertWithWhereUniqueWithoutBankInput | BankStatementUpsertWithWhereUniqueWithoutBankInput[]
    createMany?: BankStatementCreateManyBankInputEnvelope
    set?: BankStatementWhereUniqueInput | BankStatementWhereUniqueInput[]
    disconnect?: BankStatementWhereUniqueInput | BankStatementWhereUniqueInput[]
    delete?: BankStatementWhereUniqueInput | BankStatementWhereUniqueInput[]
    connect?: BankStatementWhereUniqueInput | BankStatementWhereUniqueInput[]
    update?: BankStatementUpdateWithWhereUniqueWithoutBankInput | BankStatementUpdateWithWhereUniqueWithoutBankInput[]
    updateMany?: BankStatementUpdateManyWithWhereWithoutBankInput | BankStatementUpdateManyWithWhereWithoutBankInput[]
    deleteMany?: BankStatementScalarWhereInput | BankStatementScalarWhereInput[]
  }

  export type BankCreateNestedOneWithoutBankStatementsInput = {
    create?: XOR<BankCreateWithoutBankStatementsInput, BankUncheckedCreateWithoutBankStatementsInput>
    connectOrCreate?: BankCreateOrConnectWithoutBankStatementsInput
    connect?: BankWhereUniqueInput
  }

  export type CustomerCreateNestedOneWithoutBankStatementInput = {
    create?: XOR<CustomerCreateWithoutBankStatementInput, CustomerUncheckedCreateWithoutBankStatementInput>
    connectOrCreate?: CustomerCreateOrConnectWithoutBankStatementInput
    connect?: CustomerWhereUniqueInput
  }

  export type SupplierCreateNestedOneWithoutBankStatementInput = {
    create?: XOR<SupplierCreateWithoutBankStatementInput, SupplierUncheckedCreateWithoutBankStatementInput>
    connectOrCreate?: SupplierCreateOrConnectWithoutBankStatementInput
    connect?: SupplierWhereUniqueInput
  }

  export type TransactionCreateNestedManyWithoutBankStatementInput = {
    create?: XOR<TransactionCreateWithoutBankStatementInput, TransactionUncheckedCreateWithoutBankStatementInput> | TransactionCreateWithoutBankStatementInput[] | TransactionUncheckedCreateWithoutBankStatementInput[]
    connectOrCreate?: TransactionCreateOrConnectWithoutBankStatementInput | TransactionCreateOrConnectWithoutBankStatementInput[]
    createMany?: TransactionCreateManyBankStatementInputEnvelope
    connect?: TransactionWhereUniqueInput | TransactionWhereUniqueInput[]
  }

  export type TransactionUncheckedCreateNestedManyWithoutBankStatementInput = {
    create?: XOR<TransactionCreateWithoutBankStatementInput, TransactionUncheckedCreateWithoutBankStatementInput> | TransactionCreateWithoutBankStatementInput[] | TransactionUncheckedCreateWithoutBankStatementInput[]
    connectOrCreate?: TransactionCreateOrConnectWithoutBankStatementInput | TransactionCreateOrConnectWithoutBankStatementInput[]
    createMany?: TransactionCreateManyBankStatementInputEnvelope
    connect?: TransactionWhereUniqueInput | TransactionWhereUniqueInput[]
  }

  export type BankUpdateOneRequiredWithoutBankStatementsNestedInput = {
    create?: XOR<BankCreateWithoutBankStatementsInput, BankUncheckedCreateWithoutBankStatementsInput>
    connectOrCreate?: BankCreateOrConnectWithoutBankStatementsInput
    upsert?: BankUpsertWithoutBankStatementsInput
    connect?: BankWhereUniqueInput
    update?: XOR<XOR<BankUpdateToOneWithWhereWithoutBankStatementsInput, BankUpdateWithoutBankStatementsInput>, BankUncheckedUpdateWithoutBankStatementsInput>
  }

  export type CustomerUpdateOneWithoutBankStatementNestedInput = {
    create?: XOR<CustomerCreateWithoutBankStatementInput, CustomerUncheckedCreateWithoutBankStatementInput>
    connectOrCreate?: CustomerCreateOrConnectWithoutBankStatementInput
    upsert?: CustomerUpsertWithoutBankStatementInput
    disconnect?: CustomerWhereInput | boolean
    delete?: CustomerWhereInput | boolean
    connect?: CustomerWhereUniqueInput
    update?: XOR<XOR<CustomerUpdateToOneWithWhereWithoutBankStatementInput, CustomerUpdateWithoutBankStatementInput>, CustomerUncheckedUpdateWithoutBankStatementInput>
  }

  export type SupplierUpdateOneWithoutBankStatementNestedInput = {
    create?: XOR<SupplierCreateWithoutBankStatementInput, SupplierUncheckedCreateWithoutBankStatementInput>
    connectOrCreate?: SupplierCreateOrConnectWithoutBankStatementInput
    upsert?: SupplierUpsertWithoutBankStatementInput
    disconnect?: SupplierWhereInput | boolean
    delete?: SupplierWhereInput | boolean
    connect?: SupplierWhereUniqueInput
    update?: XOR<XOR<SupplierUpdateToOneWithWhereWithoutBankStatementInput, SupplierUpdateWithoutBankStatementInput>, SupplierUncheckedUpdateWithoutBankStatementInput>
  }

  export type TransactionUpdateManyWithoutBankStatementNestedInput = {
    create?: XOR<TransactionCreateWithoutBankStatementInput, TransactionUncheckedCreateWithoutBankStatementInput> | TransactionCreateWithoutBankStatementInput[] | TransactionUncheckedCreateWithoutBankStatementInput[]
    connectOrCreate?: TransactionCreateOrConnectWithoutBankStatementInput | TransactionCreateOrConnectWithoutBankStatementInput[]
    upsert?: TransactionUpsertWithWhereUniqueWithoutBankStatementInput | TransactionUpsertWithWhereUniqueWithoutBankStatementInput[]
    createMany?: TransactionCreateManyBankStatementInputEnvelope
    set?: TransactionWhereUniqueInput | TransactionWhereUniqueInput[]
    disconnect?: TransactionWhereUniqueInput | TransactionWhereUniqueInput[]
    delete?: TransactionWhereUniqueInput | TransactionWhereUniqueInput[]
    connect?: TransactionWhereUniqueInput | TransactionWhereUniqueInput[]
    update?: TransactionUpdateWithWhereUniqueWithoutBankStatementInput | TransactionUpdateWithWhereUniqueWithoutBankStatementInput[]
    updateMany?: TransactionUpdateManyWithWhereWithoutBankStatementInput | TransactionUpdateManyWithWhereWithoutBankStatementInput[]
    deleteMany?: TransactionScalarWhereInput | TransactionScalarWhereInput[]
  }

  export type TransactionUncheckedUpdateManyWithoutBankStatementNestedInput = {
    create?: XOR<TransactionCreateWithoutBankStatementInput, TransactionUncheckedCreateWithoutBankStatementInput> | TransactionCreateWithoutBankStatementInput[] | TransactionUncheckedCreateWithoutBankStatementInput[]
    connectOrCreate?: TransactionCreateOrConnectWithoutBankStatementInput | TransactionCreateOrConnectWithoutBankStatementInput[]
    upsert?: TransactionUpsertWithWhereUniqueWithoutBankStatementInput | TransactionUpsertWithWhereUniqueWithoutBankStatementInput[]
    createMany?: TransactionCreateManyBankStatementInputEnvelope
    set?: TransactionWhereUniqueInput | TransactionWhereUniqueInput[]
    disconnect?: TransactionWhereUniqueInput | TransactionWhereUniqueInput[]
    delete?: TransactionWhereUniqueInput | TransactionWhereUniqueInput[]
    connect?: TransactionWhereUniqueInput | TransactionWhereUniqueInput[]
    update?: TransactionUpdateWithWhereUniqueWithoutBankStatementInput | TransactionUpdateWithWhereUniqueWithoutBankStatementInput[]
    updateMany?: TransactionUpdateManyWithWhereWithoutBankStatementInput | TransactionUpdateManyWithWhereWithoutBankStatementInput[]
    deleteMany?: TransactionScalarWhereInput | TransactionScalarWhereInput[]
  }

  export type BankStatementCreateNestedOneWithoutTransactionsInput = {
    create?: XOR<BankStatementCreateWithoutTransactionsInput, BankStatementUncheckedCreateWithoutTransactionsInput>
    connectOrCreate?: BankStatementCreateOrConnectWithoutTransactionsInput
    connect?: BankStatementWhereUniqueInput
  }

  export type NullableDecimalFieldUpdateOperationsInput = {
    set?: Decimal | DecimalJsLike | number | string | null
    increment?: Decimal | DecimalJsLike | number | string
    decrement?: Decimal | DecimalJsLike | number | string
    multiply?: Decimal | DecimalJsLike | number | string
    divide?: Decimal | DecimalJsLike | number | string
  }

  export type BankStatementUpdateOneRequiredWithoutTransactionsNestedInput = {
    create?: XOR<BankStatementCreateWithoutTransactionsInput, BankStatementUncheckedCreateWithoutTransactionsInput>
    connectOrCreate?: BankStatementCreateOrConnectWithoutTransactionsInput
    upsert?: BankStatementUpsertWithoutTransactionsInput
    connect?: BankStatementWhereUniqueInput
    update?: XOR<XOR<BankStatementUpdateToOneWithWhereWithoutTransactionsInput, BankStatementUpdateWithoutTransactionsInput>, BankStatementUncheckedUpdateWithoutTransactionsInput>
  }

  export type NestedIntFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[] | ListIntFieldRefInput<$PrismaModel>
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel>
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntFilter<$PrismaModel> | number
  }

  export type NestedDateTimeFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeFilter<$PrismaModel> | Date | string
  }

  export type NestedStringFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringFilter<$PrismaModel> | string
  }

  export type NestedDecimalFilter<$PrismaModel = never> = {
    equals?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    in?: Decimal[] | DecimalJsLike[] | number[] | string[] | ListDecimalFieldRefInput<$PrismaModel>
    notIn?: Decimal[] | DecimalJsLike[] | number[] | string[] | ListDecimalFieldRefInput<$PrismaModel>
    lt?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    lte?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    gt?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    gte?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    not?: NestedDecimalFilter<$PrismaModel> | Decimal | DecimalJsLike | number | string
  }

  export type NestedIntNullableFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel> | null
    in?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntNullableFilter<$PrismaModel> | number | null
  }

  export type NestedIntWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[] | ListIntFieldRefInput<$PrismaModel>
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel>
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntWithAggregatesFilter<$PrismaModel> | number
    _count?: NestedIntFilter<$PrismaModel>
    _avg?: NestedFloatFilter<$PrismaModel>
    _sum?: NestedIntFilter<$PrismaModel>
    _min?: NestedIntFilter<$PrismaModel>
    _max?: NestedIntFilter<$PrismaModel>
  }

  export type NestedFloatFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel>
    in?: number[] | ListFloatFieldRefInput<$PrismaModel>
    notIn?: number[] | ListFloatFieldRefInput<$PrismaModel>
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatFilter<$PrismaModel> | number
  }

  export type NestedDateTimeWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeWithAggregatesFilter<$PrismaModel> | Date | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedDateTimeFilter<$PrismaModel>
    _max?: NestedDateTimeFilter<$PrismaModel>
  }

  export type NestedStringWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringWithAggregatesFilter<$PrismaModel> | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedStringFilter<$PrismaModel>
    _max?: NestedStringFilter<$PrismaModel>
  }

  export type NestedDecimalWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    in?: Decimal[] | DecimalJsLike[] | number[] | string[] | ListDecimalFieldRefInput<$PrismaModel>
    notIn?: Decimal[] | DecimalJsLike[] | number[] | string[] | ListDecimalFieldRefInput<$PrismaModel>
    lt?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    lte?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    gt?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    gte?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    not?: NestedDecimalWithAggregatesFilter<$PrismaModel> | Decimal | DecimalJsLike | number | string
    _count?: NestedIntFilter<$PrismaModel>
    _avg?: NestedDecimalFilter<$PrismaModel>
    _sum?: NestedDecimalFilter<$PrismaModel>
    _min?: NestedDecimalFilter<$PrismaModel>
    _max?: NestedDecimalFilter<$PrismaModel>
  }

  export type NestedIntNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel> | null
    in?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntNullableWithAggregatesFilter<$PrismaModel> | number | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _avg?: NestedFloatNullableFilter<$PrismaModel>
    _sum?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedIntNullableFilter<$PrismaModel>
    _max?: NestedIntNullableFilter<$PrismaModel>
  }

  export type NestedFloatNullableFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel> | null
    in?: number[] | ListFloatFieldRefInput<$PrismaModel> | null
    notIn?: number[] | ListFloatFieldRefInput<$PrismaModel> | null
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatNullableFilter<$PrismaModel> | number | null
  }

  export type NestedStringNullableFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringNullableFilter<$PrismaModel> | string | null
  }

  export type NestedStringNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringNullableWithAggregatesFilter<$PrismaModel> | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedStringNullableFilter<$PrismaModel>
    _max?: NestedStringNullableFilter<$PrismaModel>
  }

  export type NestedDecimalNullableFilter<$PrismaModel = never> = {
    equals?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel> | null
    in?: Decimal[] | DecimalJsLike[] | number[] | string[] | ListDecimalFieldRefInput<$PrismaModel> | null
    notIn?: Decimal[] | DecimalJsLike[] | number[] | string[] | ListDecimalFieldRefInput<$PrismaModel> | null
    lt?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    lte?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    gt?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    gte?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    not?: NestedDecimalNullableFilter<$PrismaModel> | Decimal | DecimalJsLike | number | string | null
  }

  export type NestedDecimalNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel> | null
    in?: Decimal[] | DecimalJsLike[] | number[] | string[] | ListDecimalFieldRefInput<$PrismaModel> | null
    notIn?: Decimal[] | DecimalJsLike[] | number[] | string[] | ListDecimalFieldRefInput<$PrismaModel> | null
    lt?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    lte?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    gt?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    gte?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    not?: NestedDecimalNullableWithAggregatesFilter<$PrismaModel> | Decimal | DecimalJsLike | number | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _avg?: NestedDecimalNullableFilter<$PrismaModel>
    _sum?: NestedDecimalNullableFilter<$PrismaModel>
    _min?: NestedDecimalNullableFilter<$PrismaModel>
    _max?: NestedDecimalNullableFilter<$PrismaModel>
  }

  export type CustomerCreateWithoutInvoiceInput = {
    createdAt?: Date | string
    updatedAt: Date | string
    name: string
    country?: string | null
    etaId?: string | null
    paymentTerms?: number | null
    BankStatement?: BankStatementCreateNestedManyWithoutCustomerInput
  }

  export type CustomerUncheckedCreateWithoutInvoiceInput = {
    id?: number
    createdAt?: Date | string
    updatedAt: Date | string
    name: string
    country?: string | null
    etaId?: string | null
    paymentTerms?: number | null
    BankStatement?: BankStatementUncheckedCreateNestedManyWithoutCustomerInput
  }

  export type CustomerCreateOrConnectWithoutInvoiceInput = {
    where: CustomerWhereUniqueInput
    create: XOR<CustomerCreateWithoutInvoiceInput, CustomerUncheckedCreateWithoutInvoiceInput>
  }

  export type SupplierCreateWithoutInvoiceInput = {
    createdAt?: Date | string
    updatedAt: Date | string
    name: string
    country?: string | null
    etaId?: string | null
    paymentTerms?: number | null
    BankStatement?: BankStatementCreateNestedManyWithoutSupplierInput
  }

  export type SupplierUncheckedCreateWithoutInvoiceInput = {
    id?: number
    createdAt?: Date | string
    updatedAt: Date | string
    name: string
    country?: string | null
    etaId?: string | null
    paymentTerms?: number | null
    BankStatement?: BankStatementUncheckedCreateNestedManyWithoutSupplierInput
  }

  export type SupplierCreateOrConnectWithoutInvoiceInput = {
    where: SupplierWhereUniqueInput
    create: XOR<SupplierCreateWithoutInvoiceInput, SupplierUncheckedCreateWithoutInvoiceInput>
  }

  export type CustomerUpsertWithoutInvoiceInput = {
    update: XOR<CustomerUpdateWithoutInvoiceInput, CustomerUncheckedUpdateWithoutInvoiceInput>
    create: XOR<CustomerCreateWithoutInvoiceInput, CustomerUncheckedCreateWithoutInvoiceInput>
    where?: CustomerWhereInput
  }

  export type CustomerUpdateToOneWithWhereWithoutInvoiceInput = {
    where?: CustomerWhereInput
    data: XOR<CustomerUpdateWithoutInvoiceInput, CustomerUncheckedUpdateWithoutInvoiceInput>
  }

  export type CustomerUpdateWithoutInvoiceInput = {
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    name?: StringFieldUpdateOperationsInput | string
    country?: NullableStringFieldUpdateOperationsInput | string | null
    etaId?: NullableStringFieldUpdateOperationsInput | string | null
    paymentTerms?: NullableIntFieldUpdateOperationsInput | number | null
    BankStatement?: BankStatementUpdateManyWithoutCustomerNestedInput
  }

  export type CustomerUncheckedUpdateWithoutInvoiceInput = {
    id?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    name?: StringFieldUpdateOperationsInput | string
    country?: NullableStringFieldUpdateOperationsInput | string | null
    etaId?: NullableStringFieldUpdateOperationsInput | string | null
    paymentTerms?: NullableIntFieldUpdateOperationsInput | number | null
    BankStatement?: BankStatementUncheckedUpdateManyWithoutCustomerNestedInput
  }

  export type SupplierUpsertWithoutInvoiceInput = {
    update: XOR<SupplierUpdateWithoutInvoiceInput, SupplierUncheckedUpdateWithoutInvoiceInput>
    create: XOR<SupplierCreateWithoutInvoiceInput, SupplierUncheckedCreateWithoutInvoiceInput>
    where?: SupplierWhereInput
  }

  export type SupplierUpdateToOneWithWhereWithoutInvoiceInput = {
    where?: SupplierWhereInput
    data: XOR<SupplierUpdateWithoutInvoiceInput, SupplierUncheckedUpdateWithoutInvoiceInput>
  }

  export type SupplierUpdateWithoutInvoiceInput = {
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    name?: StringFieldUpdateOperationsInput | string
    country?: NullableStringFieldUpdateOperationsInput | string | null
    etaId?: NullableStringFieldUpdateOperationsInput | string | null
    paymentTerms?: NullableIntFieldUpdateOperationsInput | number | null
    BankStatement?: BankStatementUpdateManyWithoutSupplierNestedInput
  }

  export type SupplierUncheckedUpdateWithoutInvoiceInput = {
    id?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    name?: StringFieldUpdateOperationsInput | string
    country?: NullableStringFieldUpdateOperationsInput | string | null
    etaId?: NullableStringFieldUpdateOperationsInput | string | null
    paymentTerms?: NullableIntFieldUpdateOperationsInput | number | null
    BankStatement?: BankStatementUncheckedUpdateManyWithoutSupplierNestedInput
  }

  export type InvoiceCreateWithoutCustomerInput = {
    createdAt?: Date | string
    updatedAt: Date | string
    invoiceDate: Date | string
    invoiceNumber: string
    issuerName: string
    receiverName: string
    totalSales: Decimal | DecimalJsLike | number | string
    totalDiscount: Decimal | DecimalJsLike | number | string
    netAmount: Decimal | DecimalJsLike | number | string
    total: Decimal | DecimalJsLike | number | string
    invoiceStatus: string
    currency?: string
    exchangeRate: Decimal | DecimalJsLike | number | string
    taxAmount: Decimal | DecimalJsLike | number | string
    issuerCountry: string
    receiverCountry: string
    issuerEtaId: string
    receiverEtaId: string
    Supplier?: SupplierCreateNestedOneWithoutInvoiceInput
  }

  export type InvoiceUncheckedCreateWithoutCustomerInput = {
    id?: number
    createdAt?: Date | string
    updatedAt: Date | string
    invoiceDate: Date | string
    invoiceNumber: string
    issuerName: string
    receiverName: string
    totalSales: Decimal | DecimalJsLike | number | string
    totalDiscount: Decimal | DecimalJsLike | number | string
    netAmount: Decimal | DecimalJsLike | number | string
    total: Decimal | DecimalJsLike | number | string
    invoiceStatus: string
    currency?: string
    exchangeRate: Decimal | DecimalJsLike | number | string
    taxAmount: Decimal | DecimalJsLike | number | string
    issuerCountry: string
    receiverCountry: string
    issuerEtaId: string
    receiverEtaId: string
    supplierId?: number | null
  }

  export type InvoiceCreateOrConnectWithoutCustomerInput = {
    where: InvoiceWhereUniqueInput
    create: XOR<InvoiceCreateWithoutCustomerInput, InvoiceUncheckedCreateWithoutCustomerInput>
  }

  export type InvoiceCreateManyCustomerInputEnvelope = {
    data: InvoiceCreateManyCustomerInput | InvoiceCreateManyCustomerInput[]
    skipDuplicates?: boolean
  }

  export type BankStatementCreateWithoutCustomerInput = {
    createdAt?: Date | string
    updatedAt?: Date | string
    fileName?: string | null
    bankName: string
    accountNumber: string
    statementPeriodStart: Date | string
    statementPeriodEnd: Date | string
    accountType?: string | null
    accountCurrency?: string | null
    startingBalance: Decimal | DecimalJsLike | number | string
    endingBalance: Decimal | DecimalJsLike | number | string
    rawTextContent?: string | null
    processingStatus?: string
    bank: BankCreateNestedOneWithoutBankStatementsInput
    Supplier?: SupplierCreateNestedOneWithoutBankStatementInput
    transactions?: TransactionCreateNestedManyWithoutBankStatementInput
  }

  export type BankStatementUncheckedCreateWithoutCustomerInput = {
    id?: number
    createdAt?: Date | string
    updatedAt?: Date | string
    fileName?: string | null
    bankName: string
    accountNumber: string
    statementPeriodStart: Date | string
    statementPeriodEnd: Date | string
    accountType?: string | null
    accountCurrency?: string | null
    startingBalance: Decimal | DecimalJsLike | number | string
    endingBalance: Decimal | DecimalJsLike | number | string
    rawTextContent?: string | null
    processingStatus?: string
    bankId: number
    supplierId?: number | null
    transactions?: TransactionUncheckedCreateNestedManyWithoutBankStatementInput
  }

  export type BankStatementCreateOrConnectWithoutCustomerInput = {
    where: BankStatementWhereUniqueInput
    create: XOR<BankStatementCreateWithoutCustomerInput, BankStatementUncheckedCreateWithoutCustomerInput>
  }

  export type BankStatementCreateManyCustomerInputEnvelope = {
    data: BankStatementCreateManyCustomerInput | BankStatementCreateManyCustomerInput[]
    skipDuplicates?: boolean
  }

  export type InvoiceUpsertWithWhereUniqueWithoutCustomerInput = {
    where: InvoiceWhereUniqueInput
    update: XOR<InvoiceUpdateWithoutCustomerInput, InvoiceUncheckedUpdateWithoutCustomerInput>
    create: XOR<InvoiceCreateWithoutCustomerInput, InvoiceUncheckedCreateWithoutCustomerInput>
  }

  export type InvoiceUpdateWithWhereUniqueWithoutCustomerInput = {
    where: InvoiceWhereUniqueInput
    data: XOR<InvoiceUpdateWithoutCustomerInput, InvoiceUncheckedUpdateWithoutCustomerInput>
  }

  export type InvoiceUpdateManyWithWhereWithoutCustomerInput = {
    where: InvoiceScalarWhereInput
    data: XOR<InvoiceUpdateManyMutationInput, InvoiceUncheckedUpdateManyWithoutCustomerInput>
  }

  export type InvoiceScalarWhereInput = {
    AND?: InvoiceScalarWhereInput | InvoiceScalarWhereInput[]
    OR?: InvoiceScalarWhereInput[]
    NOT?: InvoiceScalarWhereInput | InvoiceScalarWhereInput[]
    id?: IntFilter<"Invoice"> | number
    createdAt?: DateTimeFilter<"Invoice"> | Date | string
    updatedAt?: DateTimeFilter<"Invoice"> | Date | string
    invoiceDate?: DateTimeFilter<"Invoice"> | Date | string
    invoiceNumber?: StringFilter<"Invoice"> | string
    issuerName?: StringFilter<"Invoice"> | string
    receiverName?: StringFilter<"Invoice"> | string
    totalSales?: DecimalFilter<"Invoice"> | Decimal | DecimalJsLike | number | string
    totalDiscount?: DecimalFilter<"Invoice"> | Decimal | DecimalJsLike | number | string
    netAmount?: DecimalFilter<"Invoice"> | Decimal | DecimalJsLike | number | string
    total?: DecimalFilter<"Invoice"> | Decimal | DecimalJsLike | number | string
    invoiceStatus?: StringFilter<"Invoice"> | string
    currency?: StringFilter<"Invoice"> | string
    exchangeRate?: DecimalFilter<"Invoice"> | Decimal | DecimalJsLike | number | string
    taxAmount?: DecimalFilter<"Invoice"> | Decimal | DecimalJsLike | number | string
    issuerCountry?: StringFilter<"Invoice"> | string
    receiverCountry?: StringFilter<"Invoice"> | string
    issuerEtaId?: StringFilter<"Invoice"> | string
    receiverEtaId?: StringFilter<"Invoice"> | string
    customerId?: IntNullableFilter<"Invoice"> | number | null
    supplierId?: IntNullableFilter<"Invoice"> | number | null
  }

  export type BankStatementUpsertWithWhereUniqueWithoutCustomerInput = {
    where: BankStatementWhereUniqueInput
    update: XOR<BankStatementUpdateWithoutCustomerInput, BankStatementUncheckedUpdateWithoutCustomerInput>
    create: XOR<BankStatementCreateWithoutCustomerInput, BankStatementUncheckedCreateWithoutCustomerInput>
  }

  export type BankStatementUpdateWithWhereUniqueWithoutCustomerInput = {
    where: BankStatementWhereUniqueInput
    data: XOR<BankStatementUpdateWithoutCustomerInput, BankStatementUncheckedUpdateWithoutCustomerInput>
  }

  export type BankStatementUpdateManyWithWhereWithoutCustomerInput = {
    where: BankStatementScalarWhereInput
    data: XOR<BankStatementUpdateManyMutationInput, BankStatementUncheckedUpdateManyWithoutCustomerInput>
  }

  export type BankStatementScalarWhereInput = {
    AND?: BankStatementScalarWhereInput | BankStatementScalarWhereInput[]
    OR?: BankStatementScalarWhereInput[]
    NOT?: BankStatementScalarWhereInput | BankStatementScalarWhereInput[]
    id?: IntFilter<"BankStatement"> | number
    createdAt?: DateTimeFilter<"BankStatement"> | Date | string
    updatedAt?: DateTimeFilter<"BankStatement"> | Date | string
    fileName?: StringNullableFilter<"BankStatement"> | string | null
    bankName?: StringFilter<"BankStatement"> | string
    accountNumber?: StringFilter<"BankStatement"> | string
    statementPeriodStart?: DateTimeFilter<"BankStatement"> | Date | string
    statementPeriodEnd?: DateTimeFilter<"BankStatement"> | Date | string
    accountType?: StringNullableFilter<"BankStatement"> | string | null
    accountCurrency?: StringNullableFilter<"BankStatement"> | string | null
    startingBalance?: DecimalFilter<"BankStatement"> | Decimal | DecimalJsLike | number | string
    endingBalance?: DecimalFilter<"BankStatement"> | Decimal | DecimalJsLike | number | string
    rawTextContent?: StringNullableFilter<"BankStatement"> | string | null
    processingStatus?: StringFilter<"BankStatement"> | string
    bankId?: IntFilter<"BankStatement"> | number
    customerId?: IntNullableFilter<"BankStatement"> | number | null
    supplierId?: IntNullableFilter<"BankStatement"> | number | null
  }

  export type InvoiceCreateWithoutSupplierInput = {
    createdAt?: Date | string
    updatedAt: Date | string
    invoiceDate: Date | string
    invoiceNumber: string
    issuerName: string
    receiverName: string
    totalSales: Decimal | DecimalJsLike | number | string
    totalDiscount: Decimal | DecimalJsLike | number | string
    netAmount: Decimal | DecimalJsLike | number | string
    total: Decimal | DecimalJsLike | number | string
    invoiceStatus: string
    currency?: string
    exchangeRate: Decimal | DecimalJsLike | number | string
    taxAmount: Decimal | DecimalJsLike | number | string
    issuerCountry: string
    receiverCountry: string
    issuerEtaId: string
    receiverEtaId: string
    Customer?: CustomerCreateNestedOneWithoutInvoiceInput
  }

  export type InvoiceUncheckedCreateWithoutSupplierInput = {
    id?: number
    createdAt?: Date | string
    updatedAt: Date | string
    invoiceDate: Date | string
    invoiceNumber: string
    issuerName: string
    receiverName: string
    totalSales: Decimal | DecimalJsLike | number | string
    totalDiscount: Decimal | DecimalJsLike | number | string
    netAmount: Decimal | DecimalJsLike | number | string
    total: Decimal | DecimalJsLike | number | string
    invoiceStatus: string
    currency?: string
    exchangeRate: Decimal | DecimalJsLike | number | string
    taxAmount: Decimal | DecimalJsLike | number | string
    issuerCountry: string
    receiverCountry: string
    issuerEtaId: string
    receiverEtaId: string
    customerId?: number | null
  }

  export type InvoiceCreateOrConnectWithoutSupplierInput = {
    where: InvoiceWhereUniqueInput
    create: XOR<InvoiceCreateWithoutSupplierInput, InvoiceUncheckedCreateWithoutSupplierInput>
  }

  export type InvoiceCreateManySupplierInputEnvelope = {
    data: InvoiceCreateManySupplierInput | InvoiceCreateManySupplierInput[]
    skipDuplicates?: boolean
  }

  export type BankStatementCreateWithoutSupplierInput = {
    createdAt?: Date | string
    updatedAt?: Date | string
    fileName?: string | null
    bankName: string
    accountNumber: string
    statementPeriodStart: Date | string
    statementPeriodEnd: Date | string
    accountType?: string | null
    accountCurrency?: string | null
    startingBalance: Decimal | DecimalJsLike | number | string
    endingBalance: Decimal | DecimalJsLike | number | string
    rawTextContent?: string | null
    processingStatus?: string
    bank: BankCreateNestedOneWithoutBankStatementsInput
    Customer?: CustomerCreateNestedOneWithoutBankStatementInput
    transactions?: TransactionCreateNestedManyWithoutBankStatementInput
  }

  export type BankStatementUncheckedCreateWithoutSupplierInput = {
    id?: number
    createdAt?: Date | string
    updatedAt?: Date | string
    fileName?: string | null
    bankName: string
    accountNumber: string
    statementPeriodStart: Date | string
    statementPeriodEnd: Date | string
    accountType?: string | null
    accountCurrency?: string | null
    startingBalance: Decimal | DecimalJsLike | number | string
    endingBalance: Decimal | DecimalJsLike | number | string
    rawTextContent?: string | null
    processingStatus?: string
    bankId: number
    customerId?: number | null
    transactions?: TransactionUncheckedCreateNestedManyWithoutBankStatementInput
  }

  export type BankStatementCreateOrConnectWithoutSupplierInput = {
    where: BankStatementWhereUniqueInput
    create: XOR<BankStatementCreateWithoutSupplierInput, BankStatementUncheckedCreateWithoutSupplierInput>
  }

  export type BankStatementCreateManySupplierInputEnvelope = {
    data: BankStatementCreateManySupplierInput | BankStatementCreateManySupplierInput[]
    skipDuplicates?: boolean
  }

  export type InvoiceUpsertWithWhereUniqueWithoutSupplierInput = {
    where: InvoiceWhereUniqueInput
    update: XOR<InvoiceUpdateWithoutSupplierInput, InvoiceUncheckedUpdateWithoutSupplierInput>
    create: XOR<InvoiceCreateWithoutSupplierInput, InvoiceUncheckedCreateWithoutSupplierInput>
  }

  export type InvoiceUpdateWithWhereUniqueWithoutSupplierInput = {
    where: InvoiceWhereUniqueInput
    data: XOR<InvoiceUpdateWithoutSupplierInput, InvoiceUncheckedUpdateWithoutSupplierInput>
  }

  export type InvoiceUpdateManyWithWhereWithoutSupplierInput = {
    where: InvoiceScalarWhereInput
    data: XOR<InvoiceUpdateManyMutationInput, InvoiceUncheckedUpdateManyWithoutSupplierInput>
  }

  export type BankStatementUpsertWithWhereUniqueWithoutSupplierInput = {
    where: BankStatementWhereUniqueInput
    update: XOR<BankStatementUpdateWithoutSupplierInput, BankStatementUncheckedUpdateWithoutSupplierInput>
    create: XOR<BankStatementCreateWithoutSupplierInput, BankStatementUncheckedCreateWithoutSupplierInput>
  }

  export type BankStatementUpdateWithWhereUniqueWithoutSupplierInput = {
    where: BankStatementWhereUniqueInput
    data: XOR<BankStatementUpdateWithoutSupplierInput, BankStatementUncheckedUpdateWithoutSupplierInput>
  }

  export type BankStatementUpdateManyWithWhereWithoutSupplierInput = {
    where: BankStatementScalarWhereInput
    data: XOR<BankStatementUpdateManyMutationInput, BankStatementUncheckedUpdateManyWithoutSupplierInput>
  }

  export type BankStatementCreateWithoutBankInput = {
    createdAt?: Date | string
    updatedAt?: Date | string
    fileName?: string | null
    bankName: string
    accountNumber: string
    statementPeriodStart: Date | string
    statementPeriodEnd: Date | string
    accountType?: string | null
    accountCurrency?: string | null
    startingBalance: Decimal | DecimalJsLike | number | string
    endingBalance: Decimal | DecimalJsLike | number | string
    rawTextContent?: string | null
    processingStatus?: string
    Customer?: CustomerCreateNestedOneWithoutBankStatementInput
    Supplier?: SupplierCreateNestedOneWithoutBankStatementInput
    transactions?: TransactionCreateNestedManyWithoutBankStatementInput
  }

  export type BankStatementUncheckedCreateWithoutBankInput = {
    id?: number
    createdAt?: Date | string
    updatedAt?: Date | string
    fileName?: string | null
    bankName: string
    accountNumber: string
    statementPeriodStart: Date | string
    statementPeriodEnd: Date | string
    accountType?: string | null
    accountCurrency?: string | null
    startingBalance: Decimal | DecimalJsLike | number | string
    endingBalance: Decimal | DecimalJsLike | number | string
    rawTextContent?: string | null
    processingStatus?: string
    customerId?: number | null
    supplierId?: number | null
    transactions?: TransactionUncheckedCreateNestedManyWithoutBankStatementInput
  }

  export type BankStatementCreateOrConnectWithoutBankInput = {
    where: BankStatementWhereUniqueInput
    create: XOR<BankStatementCreateWithoutBankInput, BankStatementUncheckedCreateWithoutBankInput>
  }

  export type BankStatementCreateManyBankInputEnvelope = {
    data: BankStatementCreateManyBankInput | BankStatementCreateManyBankInput[]
    skipDuplicates?: boolean
  }

  export type BankStatementUpsertWithWhereUniqueWithoutBankInput = {
    where: BankStatementWhereUniqueInput
    update: XOR<BankStatementUpdateWithoutBankInput, BankStatementUncheckedUpdateWithoutBankInput>
    create: XOR<BankStatementCreateWithoutBankInput, BankStatementUncheckedCreateWithoutBankInput>
  }

  export type BankStatementUpdateWithWhereUniqueWithoutBankInput = {
    where: BankStatementWhereUniqueInput
    data: XOR<BankStatementUpdateWithoutBankInput, BankStatementUncheckedUpdateWithoutBankInput>
  }

  export type BankStatementUpdateManyWithWhereWithoutBankInput = {
    where: BankStatementScalarWhereInput
    data: XOR<BankStatementUpdateManyMutationInput, BankStatementUncheckedUpdateManyWithoutBankInput>
  }

  export type BankCreateWithoutBankStatementsInput = {
    createdAt?: Date | string
    updatedAt?: Date | string
    name: string
  }

  export type BankUncheckedCreateWithoutBankStatementsInput = {
    id?: number
    createdAt?: Date | string
    updatedAt?: Date | string
    name: string
  }

  export type BankCreateOrConnectWithoutBankStatementsInput = {
    where: BankWhereUniqueInput
    create: XOR<BankCreateWithoutBankStatementsInput, BankUncheckedCreateWithoutBankStatementsInput>
  }

  export type CustomerCreateWithoutBankStatementInput = {
    createdAt?: Date | string
    updatedAt: Date | string
    name: string
    country?: string | null
    etaId?: string | null
    paymentTerms?: number | null
    Invoice?: InvoiceCreateNestedManyWithoutCustomerInput
  }

  export type CustomerUncheckedCreateWithoutBankStatementInput = {
    id?: number
    createdAt?: Date | string
    updatedAt: Date | string
    name: string
    country?: string | null
    etaId?: string | null
    paymentTerms?: number | null
    Invoice?: InvoiceUncheckedCreateNestedManyWithoutCustomerInput
  }

  export type CustomerCreateOrConnectWithoutBankStatementInput = {
    where: CustomerWhereUniqueInput
    create: XOR<CustomerCreateWithoutBankStatementInput, CustomerUncheckedCreateWithoutBankStatementInput>
  }

  export type SupplierCreateWithoutBankStatementInput = {
    createdAt?: Date | string
    updatedAt: Date | string
    name: string
    country?: string | null
    etaId?: string | null
    paymentTerms?: number | null
    Invoice?: InvoiceCreateNestedManyWithoutSupplierInput
  }

  export type SupplierUncheckedCreateWithoutBankStatementInput = {
    id?: number
    createdAt?: Date | string
    updatedAt: Date | string
    name: string
    country?: string | null
    etaId?: string | null
    paymentTerms?: number | null
    Invoice?: InvoiceUncheckedCreateNestedManyWithoutSupplierInput
  }

  export type SupplierCreateOrConnectWithoutBankStatementInput = {
    where: SupplierWhereUniqueInput
    create: XOR<SupplierCreateWithoutBankStatementInput, SupplierUncheckedCreateWithoutBankStatementInput>
  }

  export type TransactionCreateWithoutBankStatementInput = {
    createdAt?: Date | string
    updatedAt?: Date | string
    transactionDate: Date | string
    creditAmount?: Decimal | DecimalJsLike | number | string | null
    debitAmount?: Decimal | DecimalJsLike | number | string | null
    description?: string | null
    balance?: Decimal | DecimalJsLike | number | string | null
    pageNumber?: string | null
    entityName?: string | null
  }

  export type TransactionUncheckedCreateWithoutBankStatementInput = {
    id?: number
    createdAt?: Date | string
    updatedAt?: Date | string
    transactionDate: Date | string
    creditAmount?: Decimal | DecimalJsLike | number | string | null
    debitAmount?: Decimal | DecimalJsLike | number | string | null
    description?: string | null
    balance?: Decimal | DecimalJsLike | number | string | null
    pageNumber?: string | null
    entityName?: string | null
  }

  export type TransactionCreateOrConnectWithoutBankStatementInput = {
    where: TransactionWhereUniqueInput
    create: XOR<TransactionCreateWithoutBankStatementInput, TransactionUncheckedCreateWithoutBankStatementInput>
  }

  export type TransactionCreateManyBankStatementInputEnvelope = {
    data: TransactionCreateManyBankStatementInput | TransactionCreateManyBankStatementInput[]
    skipDuplicates?: boolean
  }

  export type BankUpsertWithoutBankStatementsInput = {
    update: XOR<BankUpdateWithoutBankStatementsInput, BankUncheckedUpdateWithoutBankStatementsInput>
    create: XOR<BankCreateWithoutBankStatementsInput, BankUncheckedCreateWithoutBankStatementsInput>
    where?: BankWhereInput
  }

  export type BankUpdateToOneWithWhereWithoutBankStatementsInput = {
    where?: BankWhereInput
    data: XOR<BankUpdateWithoutBankStatementsInput, BankUncheckedUpdateWithoutBankStatementsInput>
  }

  export type BankUpdateWithoutBankStatementsInput = {
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    name?: StringFieldUpdateOperationsInput | string
  }

  export type BankUncheckedUpdateWithoutBankStatementsInput = {
    id?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    name?: StringFieldUpdateOperationsInput | string
  }

  export type CustomerUpsertWithoutBankStatementInput = {
    update: XOR<CustomerUpdateWithoutBankStatementInput, CustomerUncheckedUpdateWithoutBankStatementInput>
    create: XOR<CustomerCreateWithoutBankStatementInput, CustomerUncheckedCreateWithoutBankStatementInput>
    where?: CustomerWhereInput
  }

  export type CustomerUpdateToOneWithWhereWithoutBankStatementInput = {
    where?: CustomerWhereInput
    data: XOR<CustomerUpdateWithoutBankStatementInput, CustomerUncheckedUpdateWithoutBankStatementInput>
  }

  export type CustomerUpdateWithoutBankStatementInput = {
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    name?: StringFieldUpdateOperationsInput | string
    country?: NullableStringFieldUpdateOperationsInput | string | null
    etaId?: NullableStringFieldUpdateOperationsInput | string | null
    paymentTerms?: NullableIntFieldUpdateOperationsInput | number | null
    Invoice?: InvoiceUpdateManyWithoutCustomerNestedInput
  }

  export type CustomerUncheckedUpdateWithoutBankStatementInput = {
    id?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    name?: StringFieldUpdateOperationsInput | string
    country?: NullableStringFieldUpdateOperationsInput | string | null
    etaId?: NullableStringFieldUpdateOperationsInput | string | null
    paymentTerms?: NullableIntFieldUpdateOperationsInput | number | null
    Invoice?: InvoiceUncheckedUpdateManyWithoutCustomerNestedInput
  }

  export type SupplierUpsertWithoutBankStatementInput = {
    update: XOR<SupplierUpdateWithoutBankStatementInput, SupplierUncheckedUpdateWithoutBankStatementInput>
    create: XOR<SupplierCreateWithoutBankStatementInput, SupplierUncheckedCreateWithoutBankStatementInput>
    where?: SupplierWhereInput
  }

  export type SupplierUpdateToOneWithWhereWithoutBankStatementInput = {
    where?: SupplierWhereInput
    data: XOR<SupplierUpdateWithoutBankStatementInput, SupplierUncheckedUpdateWithoutBankStatementInput>
  }

  export type SupplierUpdateWithoutBankStatementInput = {
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    name?: StringFieldUpdateOperationsInput | string
    country?: NullableStringFieldUpdateOperationsInput | string | null
    etaId?: NullableStringFieldUpdateOperationsInput | string | null
    paymentTerms?: NullableIntFieldUpdateOperationsInput | number | null
    Invoice?: InvoiceUpdateManyWithoutSupplierNestedInput
  }

  export type SupplierUncheckedUpdateWithoutBankStatementInput = {
    id?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    name?: StringFieldUpdateOperationsInput | string
    country?: NullableStringFieldUpdateOperationsInput | string | null
    etaId?: NullableStringFieldUpdateOperationsInput | string | null
    paymentTerms?: NullableIntFieldUpdateOperationsInput | number | null
    Invoice?: InvoiceUncheckedUpdateManyWithoutSupplierNestedInput
  }

  export type TransactionUpsertWithWhereUniqueWithoutBankStatementInput = {
    where: TransactionWhereUniqueInput
    update: XOR<TransactionUpdateWithoutBankStatementInput, TransactionUncheckedUpdateWithoutBankStatementInput>
    create: XOR<TransactionCreateWithoutBankStatementInput, TransactionUncheckedCreateWithoutBankStatementInput>
  }

  export type TransactionUpdateWithWhereUniqueWithoutBankStatementInput = {
    where: TransactionWhereUniqueInput
    data: XOR<TransactionUpdateWithoutBankStatementInput, TransactionUncheckedUpdateWithoutBankStatementInput>
  }

  export type TransactionUpdateManyWithWhereWithoutBankStatementInput = {
    where: TransactionScalarWhereInput
    data: XOR<TransactionUpdateManyMutationInput, TransactionUncheckedUpdateManyWithoutBankStatementInput>
  }

  export type TransactionScalarWhereInput = {
    AND?: TransactionScalarWhereInput | TransactionScalarWhereInput[]
    OR?: TransactionScalarWhereInput[]
    NOT?: TransactionScalarWhereInput | TransactionScalarWhereInput[]
    id?: IntFilter<"Transaction"> | number
    createdAt?: DateTimeFilter<"Transaction"> | Date | string
    updatedAt?: DateTimeFilter<"Transaction"> | Date | string
    transactionDate?: DateTimeFilter<"Transaction"> | Date | string
    creditAmount?: DecimalNullableFilter<"Transaction"> | Decimal | DecimalJsLike | number | string | null
    debitAmount?: DecimalNullableFilter<"Transaction"> | Decimal | DecimalJsLike | number | string | null
    description?: StringNullableFilter<"Transaction"> | string | null
    balance?: DecimalNullableFilter<"Transaction"> | Decimal | DecimalJsLike | number | string | null
    pageNumber?: StringNullableFilter<"Transaction"> | string | null
    entityName?: StringNullableFilter<"Transaction"> | string | null
    bankStatementId?: IntFilter<"Transaction"> | number
  }

  export type BankStatementCreateWithoutTransactionsInput = {
    createdAt?: Date | string
    updatedAt?: Date | string
    fileName?: string | null
    bankName: string
    accountNumber: string
    statementPeriodStart: Date | string
    statementPeriodEnd: Date | string
    accountType?: string | null
    accountCurrency?: string | null
    startingBalance: Decimal | DecimalJsLike | number | string
    endingBalance: Decimal | DecimalJsLike | number | string
    rawTextContent?: string | null
    processingStatus?: string
    bank: BankCreateNestedOneWithoutBankStatementsInput
    Customer?: CustomerCreateNestedOneWithoutBankStatementInput
    Supplier?: SupplierCreateNestedOneWithoutBankStatementInput
  }

  export type BankStatementUncheckedCreateWithoutTransactionsInput = {
    id?: number
    createdAt?: Date | string
    updatedAt?: Date | string
    fileName?: string | null
    bankName: string
    accountNumber: string
    statementPeriodStart: Date | string
    statementPeriodEnd: Date | string
    accountType?: string | null
    accountCurrency?: string | null
    startingBalance: Decimal | DecimalJsLike | number | string
    endingBalance: Decimal | DecimalJsLike | number | string
    rawTextContent?: string | null
    processingStatus?: string
    bankId: number
    customerId?: number | null
    supplierId?: number | null
  }

  export type BankStatementCreateOrConnectWithoutTransactionsInput = {
    where: BankStatementWhereUniqueInput
    create: XOR<BankStatementCreateWithoutTransactionsInput, BankStatementUncheckedCreateWithoutTransactionsInput>
  }

  export type BankStatementUpsertWithoutTransactionsInput = {
    update: XOR<BankStatementUpdateWithoutTransactionsInput, BankStatementUncheckedUpdateWithoutTransactionsInput>
    create: XOR<BankStatementCreateWithoutTransactionsInput, BankStatementUncheckedCreateWithoutTransactionsInput>
    where?: BankStatementWhereInput
  }

  export type BankStatementUpdateToOneWithWhereWithoutTransactionsInput = {
    where?: BankStatementWhereInput
    data: XOR<BankStatementUpdateWithoutTransactionsInput, BankStatementUncheckedUpdateWithoutTransactionsInput>
  }

  export type BankStatementUpdateWithoutTransactionsInput = {
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    fileName?: NullableStringFieldUpdateOperationsInput | string | null
    bankName?: StringFieldUpdateOperationsInput | string
    accountNumber?: StringFieldUpdateOperationsInput | string
    statementPeriodStart?: DateTimeFieldUpdateOperationsInput | Date | string
    statementPeriodEnd?: DateTimeFieldUpdateOperationsInput | Date | string
    accountType?: NullableStringFieldUpdateOperationsInput | string | null
    accountCurrency?: NullableStringFieldUpdateOperationsInput | string | null
    startingBalance?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    endingBalance?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    rawTextContent?: NullableStringFieldUpdateOperationsInput | string | null
    processingStatus?: StringFieldUpdateOperationsInput | string
    bank?: BankUpdateOneRequiredWithoutBankStatementsNestedInput
    Customer?: CustomerUpdateOneWithoutBankStatementNestedInput
    Supplier?: SupplierUpdateOneWithoutBankStatementNestedInput
  }

  export type BankStatementUncheckedUpdateWithoutTransactionsInput = {
    id?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    fileName?: NullableStringFieldUpdateOperationsInput | string | null
    bankName?: StringFieldUpdateOperationsInput | string
    accountNumber?: StringFieldUpdateOperationsInput | string
    statementPeriodStart?: DateTimeFieldUpdateOperationsInput | Date | string
    statementPeriodEnd?: DateTimeFieldUpdateOperationsInput | Date | string
    accountType?: NullableStringFieldUpdateOperationsInput | string | null
    accountCurrency?: NullableStringFieldUpdateOperationsInput | string | null
    startingBalance?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    endingBalance?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    rawTextContent?: NullableStringFieldUpdateOperationsInput | string | null
    processingStatus?: StringFieldUpdateOperationsInput | string
    bankId?: IntFieldUpdateOperationsInput | number
    customerId?: NullableIntFieldUpdateOperationsInput | number | null
    supplierId?: NullableIntFieldUpdateOperationsInput | number | null
  }

  export type InvoiceCreateManyCustomerInput = {
    id?: number
    createdAt?: Date | string
    updatedAt: Date | string
    invoiceDate: Date | string
    invoiceNumber: string
    issuerName: string
    receiverName: string
    totalSales: Decimal | DecimalJsLike | number | string
    totalDiscount: Decimal | DecimalJsLike | number | string
    netAmount: Decimal | DecimalJsLike | number | string
    total: Decimal | DecimalJsLike | number | string
    invoiceStatus: string
    currency?: string
    exchangeRate: Decimal | DecimalJsLike | number | string
    taxAmount: Decimal | DecimalJsLike | number | string
    issuerCountry: string
    receiverCountry: string
    issuerEtaId: string
    receiverEtaId: string
    supplierId?: number | null
  }

  export type BankStatementCreateManyCustomerInput = {
    id?: number
    createdAt?: Date | string
    updatedAt?: Date | string
    fileName?: string | null
    bankName: string
    accountNumber: string
    statementPeriodStart: Date | string
    statementPeriodEnd: Date | string
    accountType?: string | null
    accountCurrency?: string | null
    startingBalance: Decimal | DecimalJsLike | number | string
    endingBalance: Decimal | DecimalJsLike | number | string
    rawTextContent?: string | null
    processingStatus?: string
    bankId: number
    supplierId?: number | null
  }

  export type InvoiceUpdateWithoutCustomerInput = {
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    invoiceDate?: DateTimeFieldUpdateOperationsInput | Date | string
    invoiceNumber?: StringFieldUpdateOperationsInput | string
    issuerName?: StringFieldUpdateOperationsInput | string
    receiverName?: StringFieldUpdateOperationsInput | string
    totalSales?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    totalDiscount?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    netAmount?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    total?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    invoiceStatus?: StringFieldUpdateOperationsInput | string
    currency?: StringFieldUpdateOperationsInput | string
    exchangeRate?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    taxAmount?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    issuerCountry?: StringFieldUpdateOperationsInput | string
    receiverCountry?: StringFieldUpdateOperationsInput | string
    issuerEtaId?: StringFieldUpdateOperationsInput | string
    receiverEtaId?: StringFieldUpdateOperationsInput | string
    Supplier?: SupplierUpdateOneWithoutInvoiceNestedInput
  }

  export type InvoiceUncheckedUpdateWithoutCustomerInput = {
    id?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    invoiceDate?: DateTimeFieldUpdateOperationsInput | Date | string
    invoiceNumber?: StringFieldUpdateOperationsInput | string
    issuerName?: StringFieldUpdateOperationsInput | string
    receiverName?: StringFieldUpdateOperationsInput | string
    totalSales?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    totalDiscount?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    netAmount?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    total?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    invoiceStatus?: StringFieldUpdateOperationsInput | string
    currency?: StringFieldUpdateOperationsInput | string
    exchangeRate?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    taxAmount?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    issuerCountry?: StringFieldUpdateOperationsInput | string
    receiverCountry?: StringFieldUpdateOperationsInput | string
    issuerEtaId?: StringFieldUpdateOperationsInput | string
    receiverEtaId?: StringFieldUpdateOperationsInput | string
    supplierId?: NullableIntFieldUpdateOperationsInput | number | null
  }

  export type InvoiceUncheckedUpdateManyWithoutCustomerInput = {
    id?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    invoiceDate?: DateTimeFieldUpdateOperationsInput | Date | string
    invoiceNumber?: StringFieldUpdateOperationsInput | string
    issuerName?: StringFieldUpdateOperationsInput | string
    receiverName?: StringFieldUpdateOperationsInput | string
    totalSales?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    totalDiscount?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    netAmount?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    total?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    invoiceStatus?: StringFieldUpdateOperationsInput | string
    currency?: StringFieldUpdateOperationsInput | string
    exchangeRate?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    taxAmount?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    issuerCountry?: StringFieldUpdateOperationsInput | string
    receiverCountry?: StringFieldUpdateOperationsInput | string
    issuerEtaId?: StringFieldUpdateOperationsInput | string
    receiverEtaId?: StringFieldUpdateOperationsInput | string
    supplierId?: NullableIntFieldUpdateOperationsInput | number | null
  }

  export type BankStatementUpdateWithoutCustomerInput = {
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    fileName?: NullableStringFieldUpdateOperationsInput | string | null
    bankName?: StringFieldUpdateOperationsInput | string
    accountNumber?: StringFieldUpdateOperationsInput | string
    statementPeriodStart?: DateTimeFieldUpdateOperationsInput | Date | string
    statementPeriodEnd?: DateTimeFieldUpdateOperationsInput | Date | string
    accountType?: NullableStringFieldUpdateOperationsInput | string | null
    accountCurrency?: NullableStringFieldUpdateOperationsInput | string | null
    startingBalance?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    endingBalance?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    rawTextContent?: NullableStringFieldUpdateOperationsInput | string | null
    processingStatus?: StringFieldUpdateOperationsInput | string
    bank?: BankUpdateOneRequiredWithoutBankStatementsNestedInput
    Supplier?: SupplierUpdateOneWithoutBankStatementNestedInput
    transactions?: TransactionUpdateManyWithoutBankStatementNestedInput
  }

  export type BankStatementUncheckedUpdateWithoutCustomerInput = {
    id?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    fileName?: NullableStringFieldUpdateOperationsInput | string | null
    bankName?: StringFieldUpdateOperationsInput | string
    accountNumber?: StringFieldUpdateOperationsInput | string
    statementPeriodStart?: DateTimeFieldUpdateOperationsInput | Date | string
    statementPeriodEnd?: DateTimeFieldUpdateOperationsInput | Date | string
    accountType?: NullableStringFieldUpdateOperationsInput | string | null
    accountCurrency?: NullableStringFieldUpdateOperationsInput | string | null
    startingBalance?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    endingBalance?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    rawTextContent?: NullableStringFieldUpdateOperationsInput | string | null
    processingStatus?: StringFieldUpdateOperationsInput | string
    bankId?: IntFieldUpdateOperationsInput | number
    supplierId?: NullableIntFieldUpdateOperationsInput | number | null
    transactions?: TransactionUncheckedUpdateManyWithoutBankStatementNestedInput
  }

  export type BankStatementUncheckedUpdateManyWithoutCustomerInput = {
    id?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    fileName?: NullableStringFieldUpdateOperationsInput | string | null
    bankName?: StringFieldUpdateOperationsInput | string
    accountNumber?: StringFieldUpdateOperationsInput | string
    statementPeriodStart?: DateTimeFieldUpdateOperationsInput | Date | string
    statementPeriodEnd?: DateTimeFieldUpdateOperationsInput | Date | string
    accountType?: NullableStringFieldUpdateOperationsInput | string | null
    accountCurrency?: NullableStringFieldUpdateOperationsInput | string | null
    startingBalance?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    endingBalance?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    rawTextContent?: NullableStringFieldUpdateOperationsInput | string | null
    processingStatus?: StringFieldUpdateOperationsInput | string
    bankId?: IntFieldUpdateOperationsInput | number
    supplierId?: NullableIntFieldUpdateOperationsInput | number | null
  }

  export type InvoiceCreateManySupplierInput = {
    id?: number
    createdAt?: Date | string
    updatedAt: Date | string
    invoiceDate: Date | string
    invoiceNumber: string
    issuerName: string
    receiverName: string
    totalSales: Decimal | DecimalJsLike | number | string
    totalDiscount: Decimal | DecimalJsLike | number | string
    netAmount: Decimal | DecimalJsLike | number | string
    total: Decimal | DecimalJsLike | number | string
    invoiceStatus: string
    currency?: string
    exchangeRate: Decimal | DecimalJsLike | number | string
    taxAmount: Decimal | DecimalJsLike | number | string
    issuerCountry: string
    receiverCountry: string
    issuerEtaId: string
    receiverEtaId: string
    customerId?: number | null
  }

  export type BankStatementCreateManySupplierInput = {
    id?: number
    createdAt?: Date | string
    updatedAt?: Date | string
    fileName?: string | null
    bankName: string
    accountNumber: string
    statementPeriodStart: Date | string
    statementPeriodEnd: Date | string
    accountType?: string | null
    accountCurrency?: string | null
    startingBalance: Decimal | DecimalJsLike | number | string
    endingBalance: Decimal | DecimalJsLike | number | string
    rawTextContent?: string | null
    processingStatus?: string
    bankId: number
    customerId?: number | null
  }

  export type InvoiceUpdateWithoutSupplierInput = {
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    invoiceDate?: DateTimeFieldUpdateOperationsInput | Date | string
    invoiceNumber?: StringFieldUpdateOperationsInput | string
    issuerName?: StringFieldUpdateOperationsInput | string
    receiverName?: StringFieldUpdateOperationsInput | string
    totalSales?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    totalDiscount?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    netAmount?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    total?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    invoiceStatus?: StringFieldUpdateOperationsInput | string
    currency?: StringFieldUpdateOperationsInput | string
    exchangeRate?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    taxAmount?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    issuerCountry?: StringFieldUpdateOperationsInput | string
    receiverCountry?: StringFieldUpdateOperationsInput | string
    issuerEtaId?: StringFieldUpdateOperationsInput | string
    receiverEtaId?: StringFieldUpdateOperationsInput | string
    Customer?: CustomerUpdateOneWithoutInvoiceNestedInput
  }

  export type InvoiceUncheckedUpdateWithoutSupplierInput = {
    id?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    invoiceDate?: DateTimeFieldUpdateOperationsInput | Date | string
    invoiceNumber?: StringFieldUpdateOperationsInput | string
    issuerName?: StringFieldUpdateOperationsInput | string
    receiverName?: StringFieldUpdateOperationsInput | string
    totalSales?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    totalDiscount?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    netAmount?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    total?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    invoiceStatus?: StringFieldUpdateOperationsInput | string
    currency?: StringFieldUpdateOperationsInput | string
    exchangeRate?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    taxAmount?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    issuerCountry?: StringFieldUpdateOperationsInput | string
    receiverCountry?: StringFieldUpdateOperationsInput | string
    issuerEtaId?: StringFieldUpdateOperationsInput | string
    receiverEtaId?: StringFieldUpdateOperationsInput | string
    customerId?: NullableIntFieldUpdateOperationsInput | number | null
  }

  export type InvoiceUncheckedUpdateManyWithoutSupplierInput = {
    id?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    invoiceDate?: DateTimeFieldUpdateOperationsInput | Date | string
    invoiceNumber?: StringFieldUpdateOperationsInput | string
    issuerName?: StringFieldUpdateOperationsInput | string
    receiverName?: StringFieldUpdateOperationsInput | string
    totalSales?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    totalDiscount?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    netAmount?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    total?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    invoiceStatus?: StringFieldUpdateOperationsInput | string
    currency?: StringFieldUpdateOperationsInput | string
    exchangeRate?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    taxAmount?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    issuerCountry?: StringFieldUpdateOperationsInput | string
    receiverCountry?: StringFieldUpdateOperationsInput | string
    issuerEtaId?: StringFieldUpdateOperationsInput | string
    receiverEtaId?: StringFieldUpdateOperationsInput | string
    customerId?: NullableIntFieldUpdateOperationsInput | number | null
  }

  export type BankStatementUpdateWithoutSupplierInput = {
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    fileName?: NullableStringFieldUpdateOperationsInput | string | null
    bankName?: StringFieldUpdateOperationsInput | string
    accountNumber?: StringFieldUpdateOperationsInput | string
    statementPeriodStart?: DateTimeFieldUpdateOperationsInput | Date | string
    statementPeriodEnd?: DateTimeFieldUpdateOperationsInput | Date | string
    accountType?: NullableStringFieldUpdateOperationsInput | string | null
    accountCurrency?: NullableStringFieldUpdateOperationsInput | string | null
    startingBalance?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    endingBalance?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    rawTextContent?: NullableStringFieldUpdateOperationsInput | string | null
    processingStatus?: StringFieldUpdateOperationsInput | string
    bank?: BankUpdateOneRequiredWithoutBankStatementsNestedInput
    Customer?: CustomerUpdateOneWithoutBankStatementNestedInput
    transactions?: TransactionUpdateManyWithoutBankStatementNestedInput
  }

  export type BankStatementUncheckedUpdateWithoutSupplierInput = {
    id?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    fileName?: NullableStringFieldUpdateOperationsInput | string | null
    bankName?: StringFieldUpdateOperationsInput | string
    accountNumber?: StringFieldUpdateOperationsInput | string
    statementPeriodStart?: DateTimeFieldUpdateOperationsInput | Date | string
    statementPeriodEnd?: DateTimeFieldUpdateOperationsInput | Date | string
    accountType?: NullableStringFieldUpdateOperationsInput | string | null
    accountCurrency?: NullableStringFieldUpdateOperationsInput | string | null
    startingBalance?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    endingBalance?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    rawTextContent?: NullableStringFieldUpdateOperationsInput | string | null
    processingStatus?: StringFieldUpdateOperationsInput | string
    bankId?: IntFieldUpdateOperationsInput | number
    customerId?: NullableIntFieldUpdateOperationsInput | number | null
    transactions?: TransactionUncheckedUpdateManyWithoutBankStatementNestedInput
  }

  export type BankStatementUncheckedUpdateManyWithoutSupplierInput = {
    id?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    fileName?: NullableStringFieldUpdateOperationsInput | string | null
    bankName?: StringFieldUpdateOperationsInput | string
    accountNumber?: StringFieldUpdateOperationsInput | string
    statementPeriodStart?: DateTimeFieldUpdateOperationsInput | Date | string
    statementPeriodEnd?: DateTimeFieldUpdateOperationsInput | Date | string
    accountType?: NullableStringFieldUpdateOperationsInput | string | null
    accountCurrency?: NullableStringFieldUpdateOperationsInput | string | null
    startingBalance?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    endingBalance?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    rawTextContent?: NullableStringFieldUpdateOperationsInput | string | null
    processingStatus?: StringFieldUpdateOperationsInput | string
    bankId?: IntFieldUpdateOperationsInput | number
    customerId?: NullableIntFieldUpdateOperationsInput | number | null
  }

  export type BankStatementCreateManyBankInput = {
    id?: number
    createdAt?: Date | string
    updatedAt?: Date | string
    fileName?: string | null
    bankName: string
    accountNumber: string
    statementPeriodStart: Date | string
    statementPeriodEnd: Date | string
    accountType?: string | null
    accountCurrency?: string | null
    startingBalance: Decimal | DecimalJsLike | number | string
    endingBalance: Decimal | DecimalJsLike | number | string
    rawTextContent?: string | null
    processingStatus?: string
    customerId?: number | null
    supplierId?: number | null
  }

  export type BankStatementUpdateWithoutBankInput = {
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    fileName?: NullableStringFieldUpdateOperationsInput | string | null
    bankName?: StringFieldUpdateOperationsInput | string
    accountNumber?: StringFieldUpdateOperationsInput | string
    statementPeriodStart?: DateTimeFieldUpdateOperationsInput | Date | string
    statementPeriodEnd?: DateTimeFieldUpdateOperationsInput | Date | string
    accountType?: NullableStringFieldUpdateOperationsInput | string | null
    accountCurrency?: NullableStringFieldUpdateOperationsInput | string | null
    startingBalance?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    endingBalance?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    rawTextContent?: NullableStringFieldUpdateOperationsInput | string | null
    processingStatus?: StringFieldUpdateOperationsInput | string
    Customer?: CustomerUpdateOneWithoutBankStatementNestedInput
    Supplier?: SupplierUpdateOneWithoutBankStatementNestedInput
    transactions?: TransactionUpdateManyWithoutBankStatementNestedInput
  }

  export type BankStatementUncheckedUpdateWithoutBankInput = {
    id?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    fileName?: NullableStringFieldUpdateOperationsInput | string | null
    bankName?: StringFieldUpdateOperationsInput | string
    accountNumber?: StringFieldUpdateOperationsInput | string
    statementPeriodStart?: DateTimeFieldUpdateOperationsInput | Date | string
    statementPeriodEnd?: DateTimeFieldUpdateOperationsInput | Date | string
    accountType?: NullableStringFieldUpdateOperationsInput | string | null
    accountCurrency?: NullableStringFieldUpdateOperationsInput | string | null
    startingBalance?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    endingBalance?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    rawTextContent?: NullableStringFieldUpdateOperationsInput | string | null
    processingStatus?: StringFieldUpdateOperationsInput | string
    customerId?: NullableIntFieldUpdateOperationsInput | number | null
    supplierId?: NullableIntFieldUpdateOperationsInput | number | null
    transactions?: TransactionUncheckedUpdateManyWithoutBankStatementNestedInput
  }

  export type BankStatementUncheckedUpdateManyWithoutBankInput = {
    id?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    fileName?: NullableStringFieldUpdateOperationsInput | string | null
    bankName?: StringFieldUpdateOperationsInput | string
    accountNumber?: StringFieldUpdateOperationsInput | string
    statementPeriodStart?: DateTimeFieldUpdateOperationsInput | Date | string
    statementPeriodEnd?: DateTimeFieldUpdateOperationsInput | Date | string
    accountType?: NullableStringFieldUpdateOperationsInput | string | null
    accountCurrency?: NullableStringFieldUpdateOperationsInput | string | null
    startingBalance?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    endingBalance?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    rawTextContent?: NullableStringFieldUpdateOperationsInput | string | null
    processingStatus?: StringFieldUpdateOperationsInput | string
    customerId?: NullableIntFieldUpdateOperationsInput | number | null
    supplierId?: NullableIntFieldUpdateOperationsInput | number | null
  }

  export type TransactionCreateManyBankStatementInput = {
    id?: number
    createdAt?: Date | string
    updatedAt?: Date | string
    transactionDate: Date | string
    creditAmount?: Decimal | DecimalJsLike | number | string | null
    debitAmount?: Decimal | DecimalJsLike | number | string | null
    description?: string | null
    balance?: Decimal | DecimalJsLike | number | string | null
    pageNumber?: string | null
    entityName?: string | null
  }

  export type TransactionUpdateWithoutBankStatementInput = {
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    transactionDate?: DateTimeFieldUpdateOperationsInput | Date | string
    creditAmount?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    debitAmount?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    description?: NullableStringFieldUpdateOperationsInput | string | null
    balance?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    pageNumber?: NullableStringFieldUpdateOperationsInput | string | null
    entityName?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type TransactionUncheckedUpdateWithoutBankStatementInput = {
    id?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    transactionDate?: DateTimeFieldUpdateOperationsInput | Date | string
    creditAmount?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    debitAmount?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    description?: NullableStringFieldUpdateOperationsInput | string | null
    balance?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    pageNumber?: NullableStringFieldUpdateOperationsInput | string | null
    entityName?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type TransactionUncheckedUpdateManyWithoutBankStatementInput = {
    id?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    transactionDate?: DateTimeFieldUpdateOperationsInput | Date | string
    creditAmount?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    debitAmount?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    description?: NullableStringFieldUpdateOperationsInput | string | null
    balance?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    pageNumber?: NullableStringFieldUpdateOperationsInput | string | null
    entityName?: NullableStringFieldUpdateOperationsInput | string | null
  }



  /**
   * Batch Payload for updateMany & deleteMany & createMany
   */

  export type BatchPayload = {
    count: number
  }

  /**
   * DMMF
   */
  export const dmmf: runtime.BaseDMMF
}