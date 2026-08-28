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

export interface WorkspaceDto {
  /**
   * ID del workspace
   * @example "550e8400-e29b-41d4-a716-446655440000"
   */
  workspace_id: string;
  /**
   * Nombre del workspace
   * @example "Mi Empresa S.L."
   */
  name: string;
  /**
   * Rol del usuario en este workspace
   * @example "owner"
   */
  role: "owner" | "admin" | "member" | "viewer";
}

export interface LoginResponseDto {
  /**
   * Access token JWT, de corta duración
   * @example "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
   */
  access_token: string;
  /**
   * Refresh token opaco, canjeable en /auth/refresh
   * @example "a1b2c3d4e5f6..."
   */
  refresh_token: string;
  /**
   * Tiempo de expiración del token en segundos
   * @example 3600
   */
  expires_in: number;
  /** Información del usuario */
  user: UserDto;
  /** Workspaces activos del usuario */
  workspaces: WorkspaceDto[];
  /**
   * ID del workspace actual (incluido en el JWT)
   * @example "550e8400-e29b-41d4-a716-446655440000"
   */
  current_workspace_id: string;
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

export interface LoginTotpDto {
  /**
   * mfa_token de POST /auth/login; opcional si viaja en cookie (OAuth)
   * @example "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
   */
  mfa_token?: string;
  /**
   * Código TOTP de 6 dígitos o un código de recuperación
   * @example "123456"
   */
  code: string;
}

export interface EnableTotpDto {
  /**
   * Contraseña actual, obligatoria salvo en cuentas solo-OAuth
   * @example "password123"
   */
  password?: string;
  /**
   * Código enviado por email, obligatorio en cuentas solo-OAuth
   * @example "123456"
   */
  email_code?: string;
}

export interface ConfirmTotpDto {
  /**
   * Código TOTP
   * @example "123456"
   */
  code: string;
}

export interface DisableTotpDto {
  /**
   * Código TOTP vigente o código de recuperación sin usar. Opcional solo si no queda ninguno y se manda emailCode en su lugar
   * @example "123456"
   */
  code?: string;
  /**
   * Código enviado por email, solo si no queda ningún código de recuperación (ver /totp/disable/challenge)
   * @example "123456"
   */
  email_code?: string;
}

export interface ForgotPasswordDto {
  /**
   * Email de la cuenta a recuperar
   * @example "user@example.com"
   */
  email: string;
}

export interface ResetPasswordDto {
  /**
   * Token recibido por email
   * @example "a1b2c3d4..."
   */
  token: string;
  /**
   * Nueva contraseña
   * @example "nueva-contraseña-segura"
   */
  newPassword: string;
}

export interface LogoutDto {
  /**
   * Refresh token a revocar. Opcional: si no se manda, se usa la cookie httpOnly
   * @example "a1b2c3d4e5f6..."
   */
  refresh_token?: string;
}

export interface LoginWithApiTokenDto {
  /**
   * Token de API para autenticación
   * @example "invo_tok_prod_abc123xyz789..."
   */
  api_token: string;
}

export interface UpdateUserRoleDto {
  /**
   * Rol de plataforma que se asigna al usuario
   * @example "client"
   */
  role: "admin" | "client" | "api";
}

export interface SwitchWorkspaceDto {
  /**
   * ID del workspace al que se quiere cambiar
   * @example "550e8400-e29b-41d4-a716-446655440000"
   */
  workspace_id: string;
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

export interface CreateWorkspaceDto {
  /**
   * Nombre de la empresa/workspace
   * @example "Mi Empresa S.L."
   */
  name: string;
  /**
   * Razón social ante la AEAT. Si se omite, se usa el nombre
   * @example "Mi Empresa S.L."
   */
  legal_name?: string;
  /**
   * NIF/CIF de la empresa
   * @example "B12345678"
   */
  tax_id: string;
  /**
   * Descripción del workspace
   * @example "Workspace principal de la empresa"
   */
  description?: string;
  /**
   * URL del logo de la empresa
   * @example "https://example.com/logo.png"
   */
  logo_url?: string;
}

export interface UpdateWorkspaceDto {
  /**
   * Nombre de la empresa/workspace
   * @example "Mi Empresa S.L."
   */
  name?: string;
  /**
   * Razón social ante la AEAT. Si se omite, se usa el nombre
   * @example "Mi Empresa S.L."
   */
  legal_name?: string;
  /**
   * NIF/CIF de la empresa
   * @example "B12345678"
   */
  tax_id?: string;
  /**
   * Descripción del workspace
   * @example "Workspace principal de la empresa"
   */
  description?: string;
  /** Estado activo del workspace */
  is_active?: boolean;
  /** Configuración del workspace (JSON) */
  settings?: object;
  /**
   * URL del logo de la empresa
   * @example "https://example.com/logo.png"
   */
  logo_url?: string;
}

export interface AddMemberDto {
  /**
   * Email del usuario, que ya debe estar registrado en INVO
   * @example "socio@empresa.com"
   */
  email: string;
  /**
   * Rol del usuario en el workspace
   * @example "member"
   */
  role: "owner" | "admin" | "member" | "viewer";
}

export interface UpdateMemberRoleDto {
  /**
   * Nuevo rol del usuario
   * @example "admin"
   */
  role: "owner" | "admin" | "member" | "viewer";
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
   * Tipo impositivo (porcentaje). IVA: 0, 2, 4, 5, 7.5, 10 o 21, según la fecha de la operación (Validaciones §15.1); IGIC: 0, 3, 7, 9.5, 13.5, 20; IPSI: 0, 0.5, 1, 4, 10
   * @example 21
   */
  taxRate: number;
  /**
   * Base imponible para este tipo de IVA. Negativa en un abono
   * @example 1000
   */
  baseAmount: number;
  /**
   * Cuota de impuesto para este tipo de IVA. Negativa en un abono
   * @example 210
   */
  taxAmount: number;
  /**
   * Recargo de equivalencia (solo para comercios minoristas sujetos a recargo)
   * @example 5.2
   */
  surchargeAmount?: number;
  /**
   * Porcentaje de recargo de equivalencia: 0, 0.26, 0.5, 0.62, 1, 1.4, 1.75 o 5.2, según el tipo impositivo y la fecha de la operación
   * @example 5.2
   */
  surchargeRate?: number;
  /**
   * Causa de exención (solo para operaciones exentas): E1-E6 según normativa
   * @example "E5"
   */
  taxExemptionReason?: "E1" | "E2" | "E3" | "E4" | "E5" | "E6";
  /**
   * CalificacionOperacion: S1=Sujeta y no exenta, S2=Inversión del sujeto pasivo, N1=No sujeta art. 7/14/otros, N2=No sujeta por reglas de localización. Si se omite se deduce del tipo impositivo. Excluyente con taxExemptionReason
   * @example "S1"
   */
  operationType?: "S1" | "S2" | "N1" | "N2";
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
   * Importe total de la factura (base + impuestos). Negativo en un abono
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
   * Nombre o razón social del emisor. Si se omite, se toma del certificado
   * @example "Mi Empresa SL"
   */
  emitterName?: string;
  /**
   * NIF/CIF del emisor (formato español)
   * @example "B87654321"
   */
  emitterTaxId: string;
  /**
   * Tipo de factura según VERIFACTU: F1 (completa), F2 (simplificada), F3 (sustitutiva), R1-R5 (rectificativas)
   * @default "F1"
   * @example "F1"
   */
  type?: "F1" | "F2" | "F3" | "R1" | "R2" | "R3" | "R4" | "R5";
  /**
   * Tipo de rectificativa: S (por sustitución) o I (por diferencias). Obligatorio con R1-R5
   * @example "S"
   */
  rectificationType?: "S" | "I";
  /**
   * Descripción de la operación reflejada en la factura
   * @example "Venta de servicios de consultoría tecnológica"
   */
  description?: string;
  /**
   * Factura completa expedida como simplificada cualificada (arts. 7.2 y 7.3): lleva los datos del destinatario para que pueda deducir. Sólo en F1, F3 y R1-R4
   * @example false
   */
  simplifiedQualified?: boolean;
  /**
   * Factura completa en la que no es obligatorio identificar al destinatario (art. 6.1.d). Se remite con clave F2 y no tiene límite de importe. Sólo en F2 y R5
   * @example false
   */
  unidentifiedRecipient?: boolean;
  /**
   * Número del acuerdo de facturación registrado en la AEAT, cuando factura el destinatario o un tercero
   * @example "ACU-2026-001"
   */
  billingAgreementNumber?: string;
  /**
   * Array de UUIDs de facturas rectificadas (obligatorio para tipos R1-R5)
   * @example ["550e8400-e29b-41d4-a716-446655440000"]
   */
  rectifiedInvoiceIds?: string[];
  /**
   * Array de UUIDs de facturas simplificadas sustituidas (sólo aplica al tipo F3)
   * @example ["550e8400-e29b-41d4-a716-446655440000"]
   */
  substitutedInvoiceIds?: string[];
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

export interface BulkCreateInvoiceDto {
  /** Facturas a crear en una sola petición (máx. 50). Cada elemento se valida con las mismas reglas que POST /invoice/store; si una falla no bloquea al resto -- la respuesta indica el resultado factura a factura */
  invoices: CreateInvoiceDto[];
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
   * Importe total de la factura (base + impuestos). Negativo en un abono
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
   * Nombre o razón social del emisor. Si se omite, se toma del certificado
   * @example "Mi Empresa SL"
   */
  emitterName?: string;
  /**
   * NIF/CIF del emisor (formato español)
   * @example "B87654321"
   */
  emitterTaxId?: string;
  /**
   * Tipo de factura según VERIFACTU: F1 (completa), F2 (simplificada), F3 (sustitutiva), R1-R5 (rectificativas)
   * @default "F1"
   * @example "F1"
   */
  type?: "F1" | "F2" | "F3" | "R1" | "R2" | "R3" | "R4" | "R5";
  /**
   * Tipo de rectificativa: S (por sustitución) o I (por diferencias). Obligatorio con R1-R5
   * @example "S"
   */
  rectificationType?: "S" | "I";
  /**
   * Descripción de la operación reflejada en la factura
   * @example "Venta de servicios de consultoría tecnológica"
   */
  description?: string;
  /**
   * Factura completa expedida como simplificada cualificada (arts. 7.2 y 7.3): lleva los datos del destinatario para que pueda deducir. Sólo en F1, F3 y R1-R4
   * @example false
   */
  simplifiedQualified?: boolean;
  /**
   * Factura completa en la que no es obligatorio identificar al destinatario (art. 6.1.d). Se remite con clave F2 y no tiene límite de importe. Sólo en F2 y R5
   * @example false
   */
  unidentifiedRecipient?: boolean;
  /**
   * Número del acuerdo de facturación registrado en la AEAT, cuando factura el destinatario o un tercero
   * @example "ACU-2026-001"
   */
  billingAgreementNumber?: string;
  /**
   * Array de UUIDs de facturas rectificadas (obligatorio para tipos R1-R5)
   * @example ["550e8400-e29b-41d4-a716-446655440000"]
   */
  rectifiedInvoiceIds?: string[];
  /**
   * Array de UUIDs de facturas simplificadas sustituidas (sólo aplica al tipo F3)
   * @example ["550e8400-e29b-41d4-a716-446655440000"]
   */
  substitutedInvoiceIds?: string[];
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

export interface MakeupPDFConceptDto {
  /**
   * Descripción
   * @example "Papel A4"
   */
  name: string;
  /**
   * Precio
   * @example 10
   */
  price: number;
  /**
   * Cantidad
   * @example 5
   */
  quantity: number;
  /**
   * Total
   * @example 50
   */
  total: number;
  /**
   * Subtotal
   * @example 41.32
   */
  subtotal: number;
  /**
   * Valor de descuento
   * @example 8.68
   */
  discount_value: number;
  /**
   * Porcentaje de descuento
   * @example 15
   */
  discount_percent: number;
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
   * SVG del QR de VERI*FACTU. Si viene, el PDF lo pinta con la leyenda de la AEAT
   * @example "<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 49 49"></svg>"
   */
  verifactu_qr: string;
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
  concepts: MakeupPDFConceptDto[];
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
     * No description
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
     * @name AuthControllerLoginTotp
     * @request POST:/auth/login/totp
     */
    authControllerLoginTotp: (data: LoginTotpDto, params: RequestParams = {}) =>
      this.request<void, any>({
        path: `/auth/login/totp`,
        method: "POST",
        body: data,
        type: ContentType.Json,
        ...params,
      }),

    /**
     * No description
     *
     * @tags 🔐 Autenticación, Internal
     * @name AuthControllerTotpStatus
     * @request GET:/auth/totp/status
     */
    authControllerTotpStatus: (params: RequestParams = {}) =>
      this.request<void, any>({
        path: `/auth/totp/status`,
        method: "GET",
        ...params,
      }),

    /**
     * No description
     *
     * @tags 🔐 Autenticación, Internal
     * @name AuthControllerEnableTotp
     * @request POST:/auth/totp/enable
     */
    authControllerEnableTotp: (
      data: EnableTotpDto,
      params: RequestParams = {},
    ) =>
      this.request<void, any>({
        path: `/auth/totp/enable`,
        method: "POST",
        body: data,
        type: ContentType.Json,
        ...params,
      }),

    /**
     * No description
     *
     * @tags 🔐 Autenticación, Internal
     * @name AuthControllerRequestTotpEnrollmentCode
     * @request POST:/auth/totp/enable/challenge
     */
    authControllerRequestTotpEnrollmentCode: (params: RequestParams = {}) =>
      this.request<void, any>({
        path: `/auth/totp/enable/challenge`,
        method: "POST",
        ...params,
      }),

    /**
     * No description
     *
     * @tags 🔐 Autenticación, Internal
     * @name AuthControllerConfirmTotp
     * @request POST:/auth/totp/confirm
     */
    authControllerConfirmTotp: (
      data: ConfirmTotpDto,
      params: RequestParams = {},
    ) =>
      this.request<void, any>({
        path: `/auth/totp/confirm`,
        method: "POST",
        body: data,
        type: ContentType.Json,
        ...params,
      }),

    /**
     * No description
     *
     * @tags 🔐 Autenticación, Internal
     * @name AuthControllerRequestTotpDisableCode
     * @request POST:/auth/totp/disable/challenge
     */
    authControllerRequestTotpDisableCode: (params: RequestParams = {}) =>
      this.request<void, any>({
        path: `/auth/totp/disable/challenge`,
        method: "POST",
        ...params,
      }),

    /**
     * No description
     *
     * @tags 🔐 Autenticación, Internal
     * @name AuthControllerDisableTotp
     * @request POST:/auth/totp/disable
     */
    authControllerDisableTotp: (
      data: DisableTotpDto,
      params: RequestParams = {},
    ) =>
      this.request<void, any>({
        path: `/auth/totp/disable`,
        method: "POST",
        body: data,
        type: ContentType.Json,
        ...params,
      }),

    /**
     * No description
     *
     * @tags 🔐 Autenticación, Internal
     * @name AuthControllerForgotPassword
     * @request POST:/auth/forgot-password
     */
    authControllerForgotPassword: (
      data: ForgotPasswordDto,
      params: RequestParams = {},
    ) =>
      this.request<void, any>({
        path: `/auth/forgot-password`,
        method: "POST",
        body: data,
        type: ContentType.Json,
        ...params,
      }),

    /**
     * No description
     *
     * @tags 🔐 Autenticación, Internal
     * @name AuthControllerResetPassword
     * @request POST:/auth/reset-password
     */
    authControllerResetPassword: (
      data: ResetPasswordDto,
      params: RequestParams = {},
    ) =>
      this.request<void, any>({
        path: `/auth/reset-password`,
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
     * @name AuthControllerLogout
     * @request POST:/auth/logout
     */
    authControllerLogout: (data: LogoutDto, params: RequestParams = {}) =>
      this.request<void, any>({
        path: `/auth/logout`,
        method: "POST",
        body: data,
        type: ContentType.Json,
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
     * No description
     *
     * @tags 🔐 Autenticación, Internal
     * @name InitiateGoogleOAuth
     * @summary Iniciar login con Google
     * @request GET:/auth/oauth/google
     */
    initiateGoogleOAuth: (params: RequestParams = {}) =>
      this.request<void, any>({
        path: `/auth/oauth/google`,
        method: "GET",
        ...params,
      }),

    /**
     * No description
     *
     * @tags 🔐 Autenticación, Internal
     * @name GoogleOAuthCallback
     * @summary Callback de Google OAuth
     * @request GET:/auth/oauth/google/callback
     */
    googleOAuthCallback: (params: RequestParams = {}) =>
      this.request<void, any>({
        path: `/auth/oauth/google/callback`,
        method: "GET",
        ...params,
      }),

    /**
     * No description
     *
     * @tags 🔐 Autenticación, Internal
     * @name InitiateGithubOAuth
     * @summary Iniciar login con GitHub
     * @request GET:/auth/oauth/github
     */
    initiateGithubOAuth: (params: RequestParams = {}) =>
      this.request<void, any>({
        path: `/auth/oauth/github`,
        method: "GET",
        ...params,
      }),

    /**
     * No description
     *
     * @tags 🔐 Autenticación, Internal
     * @name GithubOAuthCallback
     * @summary Callback de GitHub OAuth
     * @request GET:/auth/oauth/github/callback
     */
    githubOAuthCallback: (params: RequestParams = {}) =>
      this.request<void, any>({
        path: `/auth/oauth/github/callback`,
        method: "GET",
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
      data: UpdateUserRoleDto,
      params: RequestParams = {},
    ) =>
      this.request<void, any>({
        path: `/auth/users/${userId}/role`,
        method: "PATCH",
        body: data,
        type: ContentType.Json,
        ...params,
      }),

    /**
     * No description
     *
     * @tags 🔐 Autenticación, Internal
     * @name AuthControllerSwitchWorkspace
     * @request POST:/auth/switch-workspace
     */
    authControllerSwitchWorkspace: (
      data: SwitchWorkspaceDto,
      params: RequestParams = {},
    ) =>
      this.request<void, any>({
        path: `/auth/switch-workspace`,
        method: "POST",
        body: data,
        type: ContentType.Json,
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
     * @name ApiTokenControllerDeleteToken
     * @request DELETE:/api-token/{tokenId}
     */
    apiTokenControllerDeleteToken: (
      tokenId: string,
      params: RequestParams = {},
    ) =>
      this.request<void, any>({
        path: `/api-token/${tokenId}`,
        method: "DELETE",
        ...params,
      }),

    /**
     * No description
     *
     * @tags 🔑 API Tokens, Internal
     * @name ApiTokenControllerRevokeToken
     * @request PUT:/api-token/{tokenId}
     */
    apiTokenControllerRevokeToken: (
      tokenId: string,
      params: RequestParams = {},
    ) =>
      this.request<void, any>({
        path: `/api-token/${tokenId}`,
        method: "PUT",
        ...params,
      }),
  };
  workspace = {
    /**
     * No description
     *
     * @tags 🏢 Workspaces, Internal
     * @name WorkspaceControllerCreateWorkspace
     * @request POST:/workspace
     */
    workspaceControllerCreateWorkspace: (
      data: CreateWorkspaceDto,
      params: RequestParams = {},
    ) =>
      this.request<void, any>({
        path: `/workspace`,
        method: "POST",
        body: data,
        type: ContentType.Json,
        ...params,
      }),

    /**
     * No description
     *
     * @tags 🏢 Workspaces, Internal
     * @name WorkspaceControllerGetUserWorkspaces
     * @request GET:/workspace
     */
    workspaceControllerGetUserWorkspaces: (params: RequestParams = {}) =>
      this.request<void, any>({
        path: `/workspace`,
        method: "GET",
        ...params,
      }),

    /**
     * No description
     *
     * @tags 🏢 Workspaces, Internal
     * @name WorkspaceControllerGetCurrentWorkspace
     * @request GET:/workspace/current
     */
    workspaceControllerGetCurrentWorkspace: (params: RequestParams = {}) =>
      this.request<void, any>({
        path: `/workspace/current`,
        method: "GET",
        ...params,
      }),

    /**
     * No description
     *
     * @tags 🏢 Workspaces, Internal
     * @name WorkspaceControllerGetWorkspace
     * @request GET:/workspace/{id}
     */
    workspaceControllerGetWorkspace: (id: string, params: RequestParams = {}) =>
      this.request<void, any>({
        path: `/workspace/${id}`,
        method: "GET",
        ...params,
      }),

    /**
     * No description
     *
     * @tags 🏢 Workspaces, Internal
     * @name WorkspaceControllerUpdateWorkspace
     * @request PUT:/workspace/{id}
     */
    workspaceControllerUpdateWorkspace: (
      id: string,
      data: UpdateWorkspaceDto,
      params: RequestParams = {},
    ) =>
      this.request<void, any>({
        path: `/workspace/${id}`,
        method: "PUT",
        body: data,
        type: ContentType.Json,
        ...params,
      }),

    /**
     * No description
     *
     * @tags 🏢 Workspaces, Internal
     * @name WorkspaceControllerDeleteWorkspace
     * @request DELETE:/workspace/{id}
     */
    workspaceControllerDeleteWorkspace: (
      id: string,
      params: RequestParams = {},
    ) =>
      this.request<void, any>({
        path: `/workspace/${id}`,
        method: "DELETE",
        ...params,
      }),

    /**
     * No description
     *
     * @tags 🏢 Workspaces, Internal
     * @name WorkspaceControllerGetMembers
     * @request GET:/workspace/{id}/members
     */
    workspaceControllerGetMembers: (id: string, params: RequestParams = {}) =>
      this.request<void, any>({
        path: `/workspace/${id}/members`,
        method: "GET",
        ...params,
      }),

    /**
     * No description
     *
     * @tags 🏢 Workspaces, Internal
     * @name WorkspaceControllerAddMember
     * @request POST:/workspace/{id}/members
     */
    workspaceControllerAddMember: (
      id: string,
      data: AddMemberDto,
      params: RequestParams = {},
    ) =>
      this.request<void, any>({
        path: `/workspace/${id}/members`,
        method: "POST",
        body: data,
        type: ContentType.Json,
        ...params,
      }),

    /**
     * No description
     *
     * @tags 🏢 Workspaces, Internal
     * @name WorkspaceControllerUpdateMemberRole
     * @request PUT:/workspace/{id}/members/{memberId}
     */
    workspaceControllerUpdateMemberRole: (
      id: string,
      memberId: string,
      data: UpdateMemberRoleDto,
      params: RequestParams = {},
    ) =>
      this.request<void, any>({
        path: `/workspace/${id}/members/${memberId}`,
        method: "PUT",
        body: data,
        type: ContentType.Json,
        ...params,
      }),

    /**
     * No description
     *
     * @tags 🏢 Workspaces, Internal
     * @name WorkspaceControllerRemoveMember
     * @request DELETE:/workspace/{id}/members/{memberId}
     */
    workspaceControllerRemoveMember: (
      id: string,
      memberId: string,
      params: RequestParams = {},
    ) =>
      this.request<void, any>({
        path: `/workspace/${id}/members/${memberId}`,
        method: "DELETE",
        ...params,
      }),
  };
  certificate = {
    /**
     * No description
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
     * No description
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
     * No description
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
     * No description
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
          | "FAILED"
          | "ANNULLED";
        /**
         * Tipo de registro: ALTA (por defecto) devuelve facturas, ANULACION sólo los registros de anulación remitidos a la AEAT, ALL ambos
         * @default "ALTA"
         * @example "ALTA"
         */
        recordType?: "ALTA" | "ANULACION" | "ALL";
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
     * No description
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
     * No description
     *
     * @tags 📝 Facturas
     * @name BulkCreateInvoice
     * @summary Crear varias facturas en una sola petición. Responde 200 aunque alguna factura del lote falle (semántica ParcialmenteCorrecto): comprobar `data.failed`/`data.results[].success`, no sólo el código HTTP. Con Idempotency-Key, cada factura reclama su propia clave derivada: un reintento no duplica lo ya creado, pero no es atómico a nivel de lote -- si se reintenta mientras el primero sigue en curso, los elementos que ese primer intento aún no ha alcanzado pueden devolver 409 sin ser un error real. Sólo un lote en curso por workspace: 429 si ya hay otro en marcha
     * @request POST:/invoice/store/bulk
     * @secure
     */
    bulkCreateInvoice: (
      data: BulkCreateInvoiceDto,
      params: RequestParams = {},
    ) =>
      this.request<void, any>({
        path: `/invoice/store/bulk`,
        method: "POST",
        body: data,
        secure: true,
        type: ContentType.Json,
        ...params,
      }),

    /**
     * No description
     *
     * @tags 📝 Facturas
     * @name GetWebhookSecret
     * @summary Obtener el secreto para verificar la firma HMAC (X-Invo-Signature) de los webhooks de callback_url
     * @request GET:/invoice/webhook-secret
     * @secure
     */
    getWebhookSecret: (params: RequestParams = {}) =>
      this.request<void, any>({
        path: `/invoice/webhook-secret`,
        method: "GET",
        secure: true,
        ...params,
      }),

    /**
     * No description
     *
     * @tags 📝 Facturas
     * @name RotateWebhookSecret
     * @summary Invalidar el secreto del webhook actual y emitir uno nuevo
     * @request POST:/invoice/webhook-secret/rotate
     * @secure
     */
    rotateWebhookSecret: (params: RequestParams = {}) =>
      this.request<void, any>({
        path: `/invoice/webhook-secret/rotate`,
        method: "POST",
        secure: true,
        ...params,
      }),

    /**
     * No description
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
        status?: "OPEN" | "READY" | "PROCESSING" | "SENT" | "CLOSED";
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
     * No description
     *
     * @tags 📝 Facturas, Internal
     * @name InvoiceControllerGetPlatformBatches
     * @request GET:/invoice/batches/platform
     */
    invoiceControllerGetPlatformBatches: (
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
        status?: "OPEN" | "READY" | "PROCESSING" | "SENT" | "CLOSED";
      },
      params: RequestParams = {},
    ) =>
      this.request<void, any>({
        path: `/invoice/batches/platform`,
        method: "GET",
        query: query,
        ...params,
      }),

    /**
     * No description
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
     * No description
     *
     * @tags 📝 Facturas, Internal
     * @name InvoiceControllerGetPlatformErrors
     * @request GET:/invoice/errors/platform
     */
    invoiceControllerGetPlatformErrors: (
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
        path: `/invoice/errors/platform`,
        method: "GET",
        query: query,
        ...params,
      }),

    /**
     * No description
     *
     * @tags 📝 Facturas, Internal
     * @name InvoiceControllerGetPlatformQueueAttempts
     * @request GET:/invoice/queue-attempts/platform
     */
    invoiceControllerGetPlatformQueueAttempts: (
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
         * Filtrar por intentos exitosos o fallidos
         * @example false
         */
        success?: boolean;
      },
      params: RequestParams = {},
    ) =>
      this.request<void, any>({
        path: `/invoice/queue-attempts/platform`,
        method: "GET",
        query: query,
        ...params,
      }),

    /**
     * No description
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
     * No description
     *
     * @tags 📝 Facturas
     * @name GetInvoicePdf
     * @summary Descargar el PDF de la factura
     * @request GET:/invoice/{id}/pdf
     * @secure
     */
    getInvoicePdf: (id: string, params: RequestParams = {}) =>
      this.request<void, any>({
        path: `/invoice/${id}/pdf`,
        method: "GET",
        secure: true,
        ...params,
      }),

    /**
     * No description
     *
     * @tags 📝 Facturas
     * @name GetInvoiceRecords
     * @summary Histórico de registros de la factura
     * @request GET:/invoice/{id}/records
     * @secure
     */
    getInvoiceRecords: (id: string, params: RequestParams = {}) =>
      this.request<void, any>({
        path: `/invoice/${id}/records`,
        method: "GET",
        secure: true,
        ...params,
      }),

    /**
     * No description
     *
     * @tags 📝 Facturas
     * @name GetInvoiceRecordXml
     * @summary XML enviado/recibido de la AEAT para un registro
     * @request GET:/invoice/{id}/records/{recordId}/xml
     * @secure
     */
    getInvoiceRecordXml: (
      id: string,
      recordId: string,
      params: RequestParams = {},
    ) =>
      this.request<void, any>({
        path: `/invoice/${id}/records/${recordId}/xml`,
        method: "GET",
        secure: true,
        ...params,
      }),

    /**
     * No description
     *
     * @tags 📝 Facturas
     * @name GetInvoiceRecordAttempts
     * @summary Historial de intentos de envío a la AEAT para un registro
     * @request GET:/invoice/{id}/records/{recordId}/attempts
     * @secure
     */
    getInvoiceRecordAttempts: (
      id: string,
      recordId: string,
      params: RequestParams = {},
    ) =>
      this.request<void, any>({
        path: `/invoice/${id}/records/${recordId}/attempts`,
        method: "GET",
        secure: true,
        ...params,
      }),

    /**
     * No description
     *
     * @tags 📝 Facturas
     * @name CorrectInvoice
     * @summary Subsanar una factura ya aceptada
     * @request POST:/invoice/{id}/correct
     * @secure
     */
    correctInvoice: (
      id: string,
      data: CreateInvoiceDto,
      params: RequestParams = {},
    ) =>
      this.request<void, any>({
        path: `/invoice/${id}/correct`,
        method: "POST",
        body: data,
        secure: true,
        type: ContentType.Json,
        ...params,
      }),

    /**
     * No description
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
     * @tags 📝 Facturas
     * @name AnnulInvoice
     * @summary Anular una factura ya remitida
     * @request POST:/invoice/{id}/annul
     * @secure
     */
    annulInvoice: (id: string, params: RequestParams = {}) =>
      this.request<void, any>({
        path: `/invoice/${id}/annul`,
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
     * @name InvoiceControllerGetPlatformStats
     * @request GET:/invoice/dashboard/platform
     */
    invoiceControllerGetPlatformStats: (params: RequestParams = {}) =>
      this.request<void, any>({
        path: `/invoice/dashboard/platform`,
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
     * No description
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
  makeup = {
    /**
     * No description
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
  reader = {
    /**
     * No description
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
}
