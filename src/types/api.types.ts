/* eslint-disable */
/* tslint:disable */
// @ts-nocheck
/*
 * ---------------------------------------------------------------
 * ## THIS FILE WAS GENERATED VIA SWAGGER-TYPESCRIPT-API        ##
 * ##                                                           ##
 * ## AUTHOR: acacode                                           ##
 * ## SOURCE: https://github.com/acacode/swagger-typescript-api ##
 * ---------------------------------------------------------------
 */

export interface UserDto {
  /**
   * ID del usuario
   * @example "550e8400-e29b-41d4-a716-446655440000"
   */
  id: string;
  /**
   * Email del usuario
   * @example "user@example.com"
   */
  email: string;
  /**
   * Rol del usuario
   * @example "client"
   */
  role: "client" | "admin";
}

export interface LoginResponseDto {
  /**
   * Access token JWT de Supabase
   * @example "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
   */
  access_token: string;
  /**
   * Refresh token de Supabase
   * @example "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
   */
  refresh_token: string;
  /**
   * Tiempo de expiración del token en segundos
   * @example 3600
   */
  expires_in: number;
  /** Información del usuario */
  user: UserDto;
}

export interface RegisterDto {
  /**
   * Email del usuario
   * @example "user@example.com"
   */
  email: string;
  /**
   * Contraseña del usuario
   * @example "password123"
   */
  password: string;
}

export interface LoginDto {
  /**
   * Email del usuario
   * @example "user@example.com"
   */
  email: string;
  /**
   * Contraseña del usuario
   * @example "password123"
   */
  password: string;
}

export interface LoginWithApiTokenDto {
  /**
   * Token de API para autenticación
   * @example "invo_tok_prod_abc123xyz789..."
   */
  api_token: string;
}

export interface OAuthCallbackDto {
  /**
   * Access token recibido del callback OAuth
   * @example "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
   */
  access_token: string;
  /**
   * Refresh token recibido del callback OAuth
   * @example "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
   */
  refresh_token: string;
  /**
   * Tiempo de expiración del token en segundos
   * @example 3600
   */
  expires_in?: number;
}

export interface CreateApiTokenDto {
  /**
   * Nombre descriptivo del token
   * @example "Partner ABC - Integración Facturas"
   */
  name: string;
  /**
   * Días hasta la expiración del token (opcional, null = nunca expira)
   * @example 365
   */
  expires_in?: number;
  /**
   * Permisos del token (opcional, futuro uso)
   * @example ["invoices:create","invoices:read"]
   */
  scopes?: any[][];
}

export interface UploadCertificateDto {
  /**
   * Contraseña del certificado
   * @example "password123"
   */
  password: string;
}

export interface InvoiceTaxLineDto {
  /**
   * Tipo de impuesto: 01=IVA, 02=IPSI (Ceuta/Melilla), 03=IGIC (Canarias), 04=Otros
   * @default "01"
   * @example "01"
   */
  taxType?: "01" | "02" | "03" | "04";
  /**
   * Tipo impositivo (porcentaje). IVA: 0, 4, 5, 10, 21; IGIC: 0, 3, 7, 9.5, 13.5, 20; IPSI: 0, 0.5, 1, 4, 10
   * @example 21
   */
  taxRate: number;
  /**
   * Base imponible para este tipo de IVA
   * @example 1000
   */
  baseAmount: number;
  /**
   * Cuota de impuesto para este tipo de IVA
   * @example 210
   */
  taxAmount: number;
  /**
   * Recargo de equivalencia (solo para comercios minoristas sujetos a recargo)
   * @example 5.2
   */
  surchargeAmount?: number;
  /**
   * Porcentaje de recargo de equivalencia: 0.5, 0.62, 1.4, 1.75, 5.2
   * @example 5.2
   */
  surchargeRate?: number;
  /**
   * Causa de exención (solo para operaciones exentas): E1-E6 según normativa
   * @example "E5"
   */
  taxExemptionReason?: "E1" | "E2" | "E3" | "E4" | "E5" | "E6";
  /**
   * Clave de régimen fiscal: 01=General, 02=Exportación, 03=REBU, 05=Agencias de viajes, 07=Criterio de caja, 08=Reverse charge, etc.
   * @default "01"
   * @example "01"
   */
  regimeKey?:
    | "01"
    | "02"
    | "03"
    | "04"
    | "05"
    | "06"
    | "07"
    | "08"
    | "09"
    | "10"
    | "11"
    | "12"
    | "13"
    | "14"
    | "15"
    | "17"
    | "18"
    | "19";
}

export interface CreateInvoiceDto {
  /**
   * Fecha de emisión de la factura en formato ISO 8601
   * @example "2024-01-15T10:30:00Z"
   */
  issueDate: string;
  /**
   * Número de factura oficial (serie + número). NO puede contener: " ' < > =
   * @example "FAC-2024-001"
   */
  invoiceNumber: string;
  /**
   * Identificador externo único de la factura en el sistema origen
   * @example "order-12345-invoice"
   */
  externalId: string;
  /**
   * Importe total de la factura (base + impuestos)
   * @example 121
   */
  totalAmount: number;
  /**
   * Código de moneda ISO 4217
   * @default "EUR"
   * @example "EUR"
   */
  currency?: string;
  /**
   * Nombre o razón social del cliente
   * @example "Cliente Ejemplo SL"
   */
  customerName: string;
  /**
   * NIF/CIF del cliente. Formatos: español (9 caracteres) o NIF-IVA europeo (ej: DE123456789, FR12345678901)
   * @example "B12345678"
   */
  customerTaxId: string;
  /**
   * Nombre o razón social del emisor de la factura
   * @example "Mi Empresa SL"
   */
  emitterName: string;
  /**
   * NIF/CIF del emisor (formato español)
   * @example "B87654321"
   */
  emitterTaxId: string;
  /**
   * Tipo de factura según VERIFACTU: F1 (completa), F2 (simplificada), F3 (sustitutiva), R1-R4 (rectificativas)
   * @default "F1"
   * @example "F1"
   */
  type?: "F1" | "F2" | "F3" | "R1" | "R2" | "R3" | "R4";
  /**
   * Descripción de la operación reflejada en la factura
   * @example "Venta de servicios de consultoría tecnológica"
   */
  description?: string;
  /**
   * Array de UUIDs de facturas rectificadas (obligatorio para tipos R1, R2, R3, R4)
   * @example ["550e8400-e29b-41d4-a716-446655440000"]
   */
  rectifiedInvoiceIds?: string[];
  /**
   * Líneas de desglose de impuestos (una por cada tipo de IVA). Para facturas con un solo tipo de IVA, enviar un array con un solo elemento. Para facturas con múltiples tipos de IVA, enviar un array con múltiples elementos.
   * @example [{"taxType":"01","taxRate":21,"baseAmount":1000,"taxAmount":210},{"taxType":"01","taxRate":10,"baseAmount":500,"taxAmount":50}]
   */
  taxLines: InvoiceTaxLineDto[];
  /**
   * URL del webhook para recibir actualizaciones de estado de la factura
   * @example "https://myapp.com/webhooks/verifactu"
   */
  callback?: string;
}

export interface UpdateInvoiceDto {
  /**
   * Fecha de emisión de la factura en formato ISO 8601
   * @example "2024-01-15T10:30:00Z"
   */
  issueDate?: string;
  /**
   * Número de factura oficial (serie + número). NO puede contener: " ' < > =
   * @example "FAC-2024-001"
   */
  invoiceNumber?: string;
  /**
   * Identificador externo único de la factura en el sistema origen
   * @example "order-12345-invoice"
   */
  externalId?: string;
  /**
   * Importe total de la factura (base + impuestos)
   * @example 121
   */
  totalAmount?: number;
  /**
   * Código de moneda ISO 4217
   * @default "EUR"
   * @example "EUR"
   */
  currency?: string;
  /**
   * Nombre o razón social del cliente
   * @example "Cliente Ejemplo SL"
   */
  customerName?: string;
  /**
   * NIF/CIF del cliente. Formatos: español (9 caracteres) o NIF-IVA europeo (ej: DE123456789, FR12345678901)
   * @example "B12345678"
   */
  customerTaxId?: string;
  /**
   * Nombre o razón social del emisor de la factura
   * @example "Mi Empresa SL"
   */
  emitterName?: string;
  /**
   * NIF/CIF del emisor (formato español)
   * @example "B87654321"
   */
  emitterTaxId?: string;
  /**
   * Tipo de factura según VERIFACTU: F1 (completa), F2 (simplificada), F3 (sustitutiva), R1-R4 (rectificativas)
   * @default "F1"
   * @example "F1"
   */
  type?: "F1" | "F2" | "F3" | "R1" | "R2" | "R3" | "R4";
  /**
   * Descripción de la operación reflejada en la factura
   * @example "Venta de servicios de consultoría tecnológica"
   */
  description?: string;
  /**
   * Array de UUIDs de facturas rectificadas (obligatorio para tipos R1, R2, R3, R4)
   * @example ["550e8400-e29b-41d4-a716-446655440000"]
   */
  rectifiedInvoiceIds?: string[];
  /**
   * Líneas de desglose de impuestos (una por cada tipo de IVA). Para facturas con un solo tipo de IVA, enviar un array con un solo elemento. Para facturas con múltiples tipos de IVA, enviar un array con múltiples elementos.
   * @example [{"taxType":"01","taxRate":21,"baseAmount":1000,"taxAmount":210},{"taxType":"01","taxRate":10,"baseAmount":500,"taxAmount":50}]
   */
  taxLines?: InvoiceTaxLineDto[];
  /**
   * URL del webhook para recibir actualizaciones de estado de la factura
   * @example "https://myapp.com/webhooks/verifactu"
   */
  callback?: string;
}

export interface UpdateBatchStatusDto {
  /**
   * Nuevo estado del batch
   * @example "OPEN"
   */
  status: "OPEN" | "READY" | "PROCESSING" | "SENT" | "CLOSED";
}

export interface MakeupPDFBrandDto {
  /** Logo */
  logo: string;
  /** Icono */
  favicon: string;
  /**
   * Color primario
   * @default "#000"
   * @example "#ff0000"
   */
  accent_color: string;
  /**
   * Color secundario
   * @default "#fff"
   * @example "#ffffff"
   */
  foreground_color: string;
}

export interface MakeupPDFClientDto {
  /**
   * Nombre
   * @example "Jhon Doe"
   */
  name: string;
  /**
   * NIF/CIF
   * @example "12345678A"
   */
  cif: string;
  /**
   * Dirección
   * @example "C/ Fake 123, 28080 Madrid"
   */
  address: string;
  /**
   * Teléfono
   * @example "+34 666 123 123"
   */
  phone: string;
  /**
   * Email
   * @example "jhon@doe.com"
   */
  email: string;
}

export interface MakeupPDFBusinessDto {
  /**
   * Nombre
   * @example "Business S.L."
   */
  name: string;
  /**
   * NIF/CIF
   * @example "B12345678"
   */
  cif: string;
  /**
   * Dirección
   * @example "C/ Fake 456, 28080 Madrid"
   */
  address: string;
  /**
   * Teléfono
   * @example "+34 911 123 123"
   */
  phone: string;
  /**
   * Email
   * @example "business@example.com"
   */
  email: string;
}

export interface MakeupPDFDto {
  /**
   * Nº serie
   * @example "INV-0001"
   */
  id: string;
  /**
   * Fecha de emisión
   * @example "2023-01-01"
   */
  date: string;
  /** Marca del PDF */
  branding: MakeupPDFBrandDto;
  /** Datos del receptor */
  client: MakeupPDFClientDto;
  /** Datos del emisor */
  business: MakeupPDFBusinessDto;
  /**
   * Total
   * @example 1210
   */
  total: number;
  /**
   * Subtotal
   * @example 1000
   */
  subtotal: number;
  /**
   * Valor total de impuesto
   * @example 210
   */
  tax_value: number;
  /**
   * Porcentaje total de impuesto
   * @example 21
   */
  tax_percent: number;
  /**
   * Valor total de recargo
   * @example 0
   */
  surcharge_value: number;
  /**
   * Porcentaje total de recargo
   * @example 0
   */
  surcharge_percent: number;
  /**
   * Observaciones
   * @example "Gracias por su compra!"
   */
  observations: string;
  /**
   * Instrucciones de pago
   * @example "Transferencia bancaria a la cuenta ES00 0000 0000 0000 0000 0000"
   */
  payment_instructions: string;
  /** Texto RGPD */
  RGPD: string;
  /**
   * Tipo de documento
   * @default "invoice"
   * @example "invoice"
   */
  type: "invoice" | "budget" | "proforma";
  /**
   * Plantilla del documento
   * @default "classic"
   * @example "classic"
   */
  template: string;
  /** Conceptos del documento */
  concepts: any[][];
}

export type QueryParamsType = Record<string | number, any>;
export type ResponseFormat = keyof Omit<Body, "body" | "bodyUsed">;

export interface FullRequestParams extends Omit<RequestInit, "body"> {
  /** set parameter to `true` for call `securityWorker` for this request */
  secure?: boolean;
  /** request path */
  path: string;
  /** content type of request body */
  type?: ContentType;
  /** query params */
  query?: QueryParamsType;
  /** format of response (i.e. response.json() -> format: "json") */
  format?: ResponseFormat;
  /** request body */
  body?: unknown;
  /** base url */
  baseUrl?: string;
  /** request cancellation token */
  cancelToken?: CancelToken;
}

export type RequestParams = Omit<
  FullRequestParams,
  "body" | "method" | "query" | "path"
>;

export interface ApiConfig<SecurityDataType = unknown> {
  baseUrl?: string;
  baseApiParams?: Omit<RequestParams, "baseUrl" | "cancelToken" | "signal">;
  securityWorker?: (
    securityData: SecurityDataType | null,
  ) => Promise<RequestParams | void> | RequestParams | void;
  customFetch?: typeof fetch;
}

export interface HttpResponse<D extends unknown, E extends unknown = unknown>
  extends Response {
  data: D;
  error: E;
}

type CancelToken = Symbol | string | number;

export enum ContentType {
  Json = "application/json",
  JsonApi = "application/vnd.api+json",
  FormData = "multipart/form-data",
  UrlEncoded = "application/x-www-form-urlencoded",
  Text = "text/plain",
}

export class HttpClient<SecurityDataType = unknown> {
  public baseUrl: string = "https://sandbox.invo.rest";
  private securityData: SecurityDataType | null = null;
  private securityWorker?: ApiConfig<SecurityDataType>["securityWorker"];
  private abortControllers = new Map<CancelToken, AbortController>();
  private customFetch = (...fetchParams: Parameters<typeof fetch>) =>
    fetch(...fetchParams);

  private baseApiParams: RequestParams = {
    credentials: "same-origin",
    headers: {},
    redirect: "follow",
    referrerPolicy: "no-referrer",
  };

  constructor(apiConfig: ApiConfig<SecurityDataType> = {}) {
    Object.assign(this, apiConfig);
  }

  public setSecurityData = (data: SecurityDataType | null) => {
    this.securityData = data;
  };

  protected encodeQueryParam(key: string, value: any) {
    const encodedKey = encodeURIComponent(key);
    return `${encodedKey}=${encodeURIComponent(typeof value === "number" ? value : `${value}`)}`;
  }

  protected addQueryParam(query: QueryParamsType, key: string) {
    return this.encodeQueryParam(key, query[key]);
  }

  protected addArrayQueryParam(query: QueryParamsType, key: string) {
    const value = query[key];
    return value.map((v: any) => this.encodeQueryParam(key, v)).join("&");
  }

  protected toQueryString(rawQuery?: QueryParamsType): string {
    const query = rawQuery || {};
    const keys = Object.keys(query).filter(
      (key) => "undefined" !== typeof query[key],
    );
    return keys
      .map((key) =>
        Array.isArray(query[key])
          ? this.addArrayQueryParam(query, key)
          : this.addQueryParam(query, key),
      )
      .join("&");
  }

  protected addQueryParams(rawQuery?: QueryParamsType): string {
    const queryString = this.toQueryString(rawQuery);
    return queryString ? `?${queryString}` : "";
  }

  private contentFormatters: Record<ContentType, (input: any) => any> = {
    [ContentType.Json]: (input: any) =>
      input !== null && (typeof input === "object" || typeof input === "string")
        ? JSON.stringify(input)
        : input,
    [ContentType.JsonApi]: (input: any) =>
      input !== null && (typeof input === "object" || typeof input === "string")
        ? JSON.stringify(input)
        : input,
    [ContentType.Text]: (input: any) =>
      input !== null && typeof input !== "string"
        ? JSON.stringify(input)
        : input,
    [ContentType.FormData]: (input: any) => {
      if (input instanceof FormData) {
        return input;
      }

      return Object.keys(input || {}).reduce((formData, key) => {
        const property = input[key];
        formData.append(
          key,
          property instanceof Blob
            ? property
            : typeof property === "object" && property !== null
              ? JSON.stringify(property)
              : `${property}`,
        );
        return formData;
      }, new FormData());
    },
    [ContentType.UrlEncoded]: (input: any) => this.toQueryString(input),
  };

  protected mergeRequestParams(
    params1: RequestParams,
    params2?: RequestParams,
  ): RequestParams {
    return {
      ...this.baseApiParams,
      ...params1,
      ...(params2 || {}),
      headers: {
        ...(this.baseApiParams.headers || {}),
        ...(params1.headers || {}),
        ...((params2 && params2.headers) || {}),
      },
    };
  }

  protected createAbortSignal = (
    cancelToken: CancelToken,
  ): AbortSignal | undefined => {
    if (this.abortControllers.has(cancelToken)) {
      const abortController = this.abortControllers.get(cancelToken);
      if (abortController) {
        return abortController.signal;
      }
      return void 0;
    }

    const abortController = new AbortController();
    this.abortControllers.set(cancelToken, abortController);
    return abortController.signal;
  };

  public abortRequest = (cancelToken: CancelToken) => {
    const abortController = this.abortControllers.get(cancelToken);

    if (abortController) {
      abortController.abort();
      this.abortControllers.delete(cancelToken);
    }
  };

  public request = async <T = any, E = any>({
    body,
    secure,
    path,
    type,
    query,
    format,
    baseUrl,
    cancelToken,
    ...params
  }: FullRequestParams): Promise<HttpResponse<T, E>> => {
    const secureParams =
      ((typeof secure === "boolean" ? secure : this.baseApiParams.secure) &&
        this.securityWorker &&
        (await this.securityWorker(this.securityData))) ||
      {};
    const requestParams = this.mergeRequestParams(params, secureParams);
    const queryString = query && this.toQueryString(query);
    const payloadFormatter = this.contentFormatters[type || ContentType.Json];
    const responseFormat = format || requestParams.format;

    return this.customFetch(
      `${baseUrl || this.baseUrl || ""}${path}${queryString ? `?${queryString}` : ""}`,
      {
        ...requestParams,
        headers: {
          ...(requestParams.headers || {}),
          ...(type && type !== ContentType.FormData
            ? { "Content-Type": type }
            : {}),
        },
        signal:
          (cancelToken
            ? this.createAbortSignal(cancelToken)
            : requestParams.signal) || null,
        body:
          typeof body === "undefined" || body === null
            ? null
            : payloadFormatter(body),
      },
    ).then(async (response) => {
      const r = response as HttpResponse<T, E>;
      r.data = null as unknown as T;
      r.error = null as unknown as E;

      const responseToParse = responseFormat ? response.clone() : response;
      const data = !responseFormat
        ? r
        : await responseToParse[responseFormat]()
            .then((data) => {
              if (r.ok) {
                r.data = data;
              } else {
                r.error = data;
              }
              return r;
            })
            .catch((e) => {
              r.error = e;
              return r;
            });

      if (cancelToken) {
        this.abortControllers.delete(cancelToken);
      }

      if (!response.ok) throw data;
      return data;
    });
  };
}

/**
 * @title INVO API Rest
 * @version 0.0.1
 * @baseUrl https://sandbox.invo.rest
 * @contact
 *
 * Servicio API de INVO
 */
export class Api<
  SecurityDataType extends unknown,
> extends HttpClient<SecurityDataType> {
  ping = {
    /**
     * @description Endpoint de health check para verificar que el servicio está activo y responde correctamente.
     *
     * @tags 🦄 Otros
     * @name Ping
     * @summary Verificar estado del servicio
     * @request GET:/ping
     */
    ping: (params: RequestParams = {}) =>
      this.request<void, any>({
        path: `/ping`,
        method: "GET",
        ...params,
      }),
  };
  auth = {
    /**
     * No description
     *
     * @tags 🔐 Autenticación, Internal
     * @name AuthControllerRegister
     * @request POST:/auth/register
     */
    authControllerRegister: (data: RegisterDto, params: RequestParams = {}) =>
      this.request<void, any>({
        path: `/auth/register`,
        method: "POST",
        body: data,
        type: ContentType.Json,
        ...params,
      }),

    /**
     * No description
     *
     * @tags 🔐 Autenticación, Internal
     * @name AuthControllerLogin
     * @request POST:/auth/login
     */
    authControllerLogin: (data: LoginDto, params: RequestParams = {}) =>
      this.request<void, any>({
        path: `/auth/login`,
        method: "POST",
        body: data,
        type: ContentType.Json,
        ...params,
      }),

    /**
     * No description
     *
     * @tags 🔐 Autenticación, Internal
     * @name AuthControllerRefresh
     * @request POST:/auth/refresh
     */
    authControllerRefresh: (params: RequestParams = {}) =>
      this.request<void, any>({
        path: `/auth/refresh`,
        method: "POST",
        ...params,
      }),

    /**
     * No description
     *
     * @tags 🔐 Autenticación, Internal
     * @name AuthControllerLoginWithApiToken
     * @request POST:/auth/token
     */
    authControllerLoginWithApiToken: (
      data: LoginWithApiTokenDto,
      params: RequestParams = {},
    ) =>
      this.request<void, any>({
        path: `/auth/token`,
        method: "POST",
        body: data,
        type: ContentType.Json,
        ...params,
      }),

    /**
     * @description Inicia el flujo de autenticación OAuth con proveedores externos (Google, GitHub).
     *
     * @tags 🔐 Autenticación, Internal
     * @name InitiateOAuth
     * @summary Iniciar flujo de OAuth con un proveedor
     * @request GET:/auth/oauth/{provider}
     */
    initiateOAuth: (provider: string, params: RequestParams = {}) =>
      this.request<void, any>({
        path: `/auth/oauth/${provider}`,
        method: "GET",
        ...params,
      }),

    /**
     * @description Procesa el callback de autenticación OAuth y valida los tokens recibidos del proveedor externo.
     *
     * @tags 🔐 Autenticación, Internal
     * @name OAuthCallback
     * @summary Procesar callback de OAuth y validar tokens
     * @request POST:/auth/oauth/callback
     */
    oAuthCallback: (data: OAuthCallbackDto, params: RequestParams = {}) =>
      this.request<void, any>({
        path: `/auth/oauth/callback`,
        method: "POST",
        body: data,
        type: ContentType.Json,
        ...params,
      }),

    /**
     * No description
     *
     * @tags 🔐 Autenticación, Internal
     * @name AuthControllerGetUsers
     * @request GET:/auth/users
     */
    authControllerGetUsers: (params: RequestParams = {}) =>
      this.request<void, any>({
        path: `/auth/users`,
        method: "GET",
        ...params,
      }),

    /**
     * No description
     *
     * @tags 🔐 Autenticación, Internal
     * @name AuthControllerUpdateUserRole
     * @request PATCH:/auth/users/{userId}/role
     */
    authControllerUpdateUserRole: (
      userId: string,
      params: RequestParams = {},
    ) =>
      this.request<void, any>({
        path: `/auth/users/${userId}/role`,
        method: "PATCH",
        ...params,
      }),
  };
  apiToken = {
    /**
     * No description
     *
     * @tags 🔑 API Tokens, Internal
     * @name ApiTokenControllerListTokens
     * @request GET:/api-token
     */
    apiTokenControllerListTokens: (params: RequestParams = {}) =>
      this.request<void, any>({
        path: `/api-token`,
        method: "GET",
        ...params,
      }),

    /**
     * No description
     *
     * @tags 🔑 API Tokens, Internal
     * @name ApiTokenControllerCreateToken
     * @request POST:/api-token
     */
    apiTokenControllerCreateToken: (
      data: CreateApiTokenDto,
      params: RequestParams = {},
    ) =>
      this.request<void, any>({
        path: `/api-token`,
        method: "POST",
        body: data,
        type: ContentType.Json,
        ...params,
      }),

    /**
     * No description
     *
     * @tags 🔑 API Tokens, Internal
     * @name ApiTokenControllerGetToken
     * @request GET:/api-token/{tokenId}
     */
    apiTokenControllerGetToken: (tokenId: string, params: RequestParams = {}) =>
      this.request<void, any>({
        path: `/api-token/${tokenId}`,
        method: "GET",
        ...params,
      }),

    /**
     * No description
     *
     * @tags 🔑 API Tokens, Internal
     * @name ApiTokenControllerRevokeToken
     * @request DELETE:/api-token/{tokenId}
     */
    apiTokenControllerRevokeToken: (
      tokenId: string,
      params: RequestParams = {},
    ) =>
      this.request<void, any>({
        path: `/api-token/${tokenId}`,
        method: "DELETE",
        ...params,
      }),
  };
  certificate = {
    /**
     * @description Sube y configura el certificado digital (FNMT/P12) necesario para firmar y enviar facturas a la AEAT.
     *
     * @tags 🫆 Certificado digital
     * @name UploadCertificate
     * @summary Subir certificado
     * @request POST:/certificate/upload
     * @secure
     */
    uploadCertificate: (
      data: UploadCertificateDto,
      params: RequestParams = {},
    ) =>
      this.request<void, any>({
        path: `/certificate/upload`,
        method: "POST",
        body: data,
        secure: true,
        type: ContentType.Json,
        ...params,
      }),

    /**
     * @description Obtiene la información del certificado digital actual del usuario (fecha de expiración, emisor, etc.).
     *
     * @tags 🫆 Certificado digital
     * @name GetCertificateInfo
     * @summary Información del certificado
     * @request GET:/certificate/info
     * @secure
     */
    getCertificateInfo: (params: RequestParams = {}) =>
      this.request<void, any>({
        path: `/certificate/info`,
        method: "GET",
        secure: true,
        ...params,
      }),

    /**
     * @description Elimina el certificado digital del usuario del sistema, tanto del almacenamiento como de la base de datos.
     *
     * @tags 🫆 Certificado digital
     * @name DeleteCertificate
     * @summary Eliminar certificado
     * @request DELETE:/certificate
     * @secure
     */
    deleteCertificate: (params: RequestParams = {}) =>
      this.request<void, any>({
        path: `/certificate`,
        method: "DELETE",
        secure: true,
        ...params,
      }),
  };
  invoice = {
    /**
     * @description Obtiene el listado paginado de facturas con filtros por fecha, estado, cliente y búsqueda libre.
     *
     * @tags 📝 Facturas
     * @name GetInvoices
     * @summary Listar facturas
     * @request GET:/invoice
     * @secure
     */
    getInvoices: (
      query?: {
        /**
         * Número de página
         * @min 1
         * @default 1
         * @example 1
         */
        page?: number;
        /**
         * Número de elementos por página
         * @min 1
         * @max 100
         * @default 50
         * @example 50
         */
        limit?: number;
        /**
         * Fecha desde (ISO 8601)
         * @example "2024-01-01"
         */
        from?: string;
        /**
         * Fecha hasta (ISO 8601)
         * @example "2024-12-31"
         */
        to?: string;
        /**
         * Filtrar por estado
         * @example "ACCEPTED"
         */
        status?:
          | "PENDING"
          | "SENT"
          | "ACCEPTED"
          | "ACCEPTED_WITH_WARNINGS"
          | "REJECTED"
          | "FAILED";
        /**
         * Filtrar por NIF/CIF del cliente
         * @example "B12345678"
         */
        customerTaxId?: string;
        /**
         * Buscar por número de factura, descripción o nombre del cliente
         * @example "FAC-2024-001"
         */
        search?: string;
      },
      params: RequestParams = {},
    ) =>
      this.request<void, any>({
        path: `/invoice`,
        method: "GET",
        query: query,
        secure: true,
        ...params,
      }),

    /**
     * @description Crea y registra una nueva factura en el sistema VERIFACTU con validación automática de datos y generación de hash.
     *
     * @tags 📝 Facturas
     * @name CreateInvoice
     * @summary Crear/Almacenar factura
     * @request POST:/invoice/store
     * @secure
     */
    createInvoice: (data: CreateInvoiceDto, params: RequestParams = {}) =>
      this.request<void, any>({
        path: `/invoice/store`,
        method: "POST",
        body: data,
        secure: true,
        type: ContentType.Json,
        ...params,
      }),

    /**
     * @description Lista los batches de envío masivo de facturas a la AEAT con información de estado y resultado.
     *
     * @tags 📝 Facturas
     * @name GetBatches
     * @summary Listar colas de envío
     * @request GET:/invoice/batches
     * @secure
     */
    getBatches: (
      query?: {
        /**
         * Número de página
         * @min 1
         * @default 1
         * @example 1
         */
        page?: number;
        /**
         * Número de elementos por página
         * @min 1
         * @max 100
         * @default 50
         * @example 50
         */
        limit?: number;
        /**
         * Filtrar por estado del batch
         * @example "OPEN"
         */
        status?: "OPEN" | "READY" | "SENT" | "CLOSED";
      },
      params: RequestParams = {},
    ) =>
      this.request<void, any>({
        path: `/invoice/batches`,
        method: "GET",
        query: query,
        secure: true,
        ...params,
      }),

    /**
     * @description Obtiene el registro paginado de errores ocurridos durante el procesamiento de facturas.
     *
     * @tags 📝 Facturas
     * @name GetErrors
     * @summary Listar errores
     * @request GET:/invoice/errors
     * @secure
     */
    getErrors: (
      query?: {
        /**
         * Número de página
         * @min 1
         * @default 1
         * @example 1
         */
        page?: number;
        /**
         * Número de elementos por página
         * @min 1
         * @max 100
         * @default 50
         * @example 50
         */
        limit?: number;
        /**
         * Filtrar por errores resueltos o no resueltos
         * @example false
         */
        resolved?: boolean;
      },
      params: RequestParams = {},
    ) =>
      this.request<void, any>({
        path: `/invoice/errors`,
        method: "GET",
        query: query,
        secure: true,
        ...params,
      }),

    /**
     * @description Recupera los datos completos de una factura específica mediante su identificador único (UUID).
     *
     * @tags 📝 Facturas
     * @name GetInvoiceById
     * @summary Obtener factura
     * @request GET:/invoice/{id}
     * @secure
     */
    getInvoiceById: (id: string, params: RequestParams = {}) =>
      this.request<void, any>({
        path: `/invoice/${id}`,
        method: "GET",
        secure: true,
        ...params,
      }),

    /**
     * No description
     *
     * @tags 📝 Facturas
     * @name EditInvoiceById
     * @summary Editar factura
     * @request PATCH:/invoice/{id}
     * @secure
     */
    editInvoiceById: (
      id: string,
      data: UpdateInvoiceDto,
      params: RequestParams = {},
    ) =>
      this.request<void, any>({
        path: `/invoice/${id}`,
        method: "PATCH",
        body: data,
        secure: true,
        type: ContentType.Json,
        ...params,
      }),

    /**
     * No description
     *
     * @tags 📝 Facturas
     * @name DeleteInvoiceById
     * @summary Eliminar factura
     * @request DELETE:/invoice/{id}
     * @secure
     */
    deleteInvoiceById: (id: string, params: RequestParams = {}) =>
      this.request<void, any>({
        path: `/invoice/${id}`,
        method: "DELETE",
        secure: true,
        ...params,
      }),

    /**
     * @description Fuerza el envío manual inmediato de una factura específica a la Agencia Tributaria (AEAT).
     *
     * @tags 📝 Facturas
     * @name SubmitInvoice
     * @summary Enviar a AEAT
     * @request POST:/invoice/{id}/submit
     * @secure
     */
    submitInvoice: (id: string, params: RequestParams = {}) =>
      this.request<void, any>({
        path: `/invoice/${id}/submit`,
        method: "POST",
        secure: true,
        ...params,
      }),

    /**
     * No description
     *
     * @tags 📝 Facturas, Internal
     * @name InvoiceControllerGetDashboardStats
     * @request GET:/invoice/dashboard/stats
     */
    invoiceControllerGetDashboardStats: (params: RequestParams = {}) =>
      this.request<void, any>({
        path: `/invoice/dashboard/stats`,
        method: "GET",
        ...params,
      }),

    /**
     * No description
     *
     * @tags 📝 Facturas, Internal
     * @name InvoiceControllerUpdateBatchStatus
     * @request PATCH:/invoice/batches/{batchId}/status
     */
    invoiceControllerUpdateBatchStatus: (
      batchId: string,
      data: UpdateBatchStatusDto,
      params: RequestParams = {},
    ) =>
      this.request<void, any>({
        path: `/invoice/batches/${batchId}/status`,
        method: "PATCH",
        body: data,
        type: ContentType.Json,
        ...params,
      }),

    /**
     * @description Marca un error como resuelto después de haber aplicado las acciones correctivas necesarias.
     *
     * @tags 📝 Facturas
     * @name ResolveError
     * @summary Resolver error
     * @request PATCH:/invoice/errors/{errorId}/resolve
     * @secure
     */
    resolveError: (errorId: string, params: RequestParams = {}) =>
      this.request<void, any>({
        path: `/invoice/errors/${errorId}/resolve`,
        method: "PATCH",
        secure: true,
        ...params,
      }),
  };
  reader = {
    /**
     * @description Extrae y procesa automáticamente los datos de una factura desde una imagen o PDF utilizando OCR e IA.
     *
     * @tags 🛠️ Herramientas
     * @name ReadInvoice
     * @summary Leer datos de factura
     * @request POST:/reader
     * @secure
     */
    readInvoice: (params: RequestParams = {}) =>
      this.request<void, any>({
        path: `/reader`,
        method: "POST",
        secure: true,
        ...params,
      }),
  };
  makeup = {
    /**
     * @description Genera un PDF personalizado de factura con branding, colores y plantillas configurables para impresión o envío.
     *
     * @tags 🛠️ Herramientas
     * @name MakeupPdf
     * @summary Generar PDF
     * @request POST:/makeup
     * @secure
     */
    makeupPdf: (data: MakeupPDFDto, params: RequestParams = {}) =>
      this.request<void, any>({
        path: `/makeup`,
        method: "POST",
        body: data,
        secure: true,
        type: ContentType.Json,
        ...params,
      }),
  };
}
