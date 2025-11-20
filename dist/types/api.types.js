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
export var ContentType;
(function (ContentType) {
    ContentType["Json"] = "application/json";
    ContentType["JsonApi"] = "application/vnd.api+json";
    ContentType["FormData"] = "multipart/form-data";
    ContentType["UrlEncoded"] = "application/x-www-form-urlencoded";
    ContentType["Text"] = "text/plain";
})(ContentType || (ContentType = {}));
export class HttpClient {
    constructor(apiConfig = {}) {
        this.baseUrl = 'https://sandbox.invo.rest';
        this.securityData = null;
        this.abortControllers = new Map();
        this.customFetch = (...fetchParams) => fetch(...fetchParams);
        this.baseApiParams = {
            credentials: 'same-origin',
            headers: {},
            redirect: 'follow',
            referrerPolicy: 'no-referrer',
        };
        this.setSecurityData = (data) => {
            this.securityData = data;
        };
        this.contentFormatters = {
            [ContentType.Json]: (input) => input !== null && (typeof input === 'object' || typeof input === 'string')
                ? JSON.stringify(input)
                : input,
            [ContentType.JsonApi]: (input) => input !== null && (typeof input === 'object' || typeof input === 'string')
                ? JSON.stringify(input)
                : input,
            [ContentType.Text]: (input) => input !== null && typeof input !== 'string' ? JSON.stringify(input) : input,
            [ContentType.FormData]: (input) => {
                if (input instanceof FormData) {
                    return input;
                }
                return Object.keys(input || {}).reduce((formData, key) => {
                    const property = input[key];
                    formData.append(key, property instanceof Blob
                        ? property
                        : typeof property === 'object' && property !== null
                            ? JSON.stringify(property)
                            : `${property}`);
                    return formData;
                }, new FormData());
            },
            [ContentType.UrlEncoded]: (input) => this.toQueryString(input),
        };
        this.createAbortSignal = (cancelToken) => {
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
        this.abortRequest = (cancelToken) => {
            const abortController = this.abortControllers.get(cancelToken);
            if (abortController) {
                abortController.abort();
                this.abortControllers.delete(cancelToken);
            }
        };
        this.request = async ({ body, secure, path, type, query, format, baseUrl, cancelToken, ...params }) => {
            const secureParams = ((typeof secure === 'boolean' ? secure : this.baseApiParams.secure) &&
                this.securityWorker &&
                (await this.securityWorker(this.securityData))) ||
                {};
            const requestParams = this.mergeRequestParams(params, secureParams);
            const queryString = query && this.toQueryString(query);
            const payloadFormatter = this.contentFormatters[type || ContentType.Json];
            const responseFormat = format || requestParams.format;
            return this.customFetch(`${baseUrl || this.baseUrl || ''}${path}${queryString ? `?${queryString}` : ''}`, {
                ...requestParams,
                headers: {
                    ...(requestParams.headers || {}),
                    ...(type && type !== ContentType.FormData ? { 'Content-Type': type } : {}),
                },
                signal: (cancelToken ? this.createAbortSignal(cancelToken) : requestParams.signal) ||
                    null,
                body: typeof body === 'undefined' || body === null ? null : payloadFormatter(body),
            }).then(async (response) => {
                const r = response;
                r.data = null;
                r.error = null;
                const responseToParse = responseFormat ? response.clone() : response;
                const data = !responseFormat
                    ? r
                    : await responseToParse[responseFormat]()
                        .then((data) => {
                        if (r.ok) {
                            r.data = data;
                        }
                        else {
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
                if (!response.ok)
                    throw data;
                return data;
            });
        };
        Object.assign(this, apiConfig);
    }
    encodeQueryParam(key, value) {
        const encodedKey = encodeURIComponent(key);
        return `${encodedKey}=${encodeURIComponent(typeof value === 'number' ? value : `${value}`)}`;
    }
    addQueryParam(query, key) {
        return this.encodeQueryParam(key, query[key]);
    }
    addArrayQueryParam(query, key) {
        const value = query[key];
        return value.map((v) => this.encodeQueryParam(key, v)).join('&');
    }
    toQueryString(rawQuery) {
        const query = rawQuery || {};
        const keys = Object.keys(query).filter((key) => 'undefined' !== typeof query[key]);
        return keys
            .map((key) => Array.isArray(query[key])
            ? this.addArrayQueryParam(query, key)
            : this.addQueryParam(query, key))
            .join('&');
    }
    addQueryParams(rawQuery) {
        const queryString = this.toQueryString(rawQuery);
        return queryString ? `?${queryString}` : '';
    }
    mergeRequestParams(params1, params2) {
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
}
/**
 * @title INVO API Rest
 * @version 0.0.1
 * @baseUrl https://sandbox.invo.rest
 * @contact
 *
 * Servicio API de INVO
 */
export class Api extends HttpClient {
    constructor() {
        super(...arguments);
        this.ping = {
            /**
             * No description
             *
             * @tags App
             * @name AppControllerPing
             * @request GET:/ping
             */
            appControllerPing: (params = {}) => this.request({
                path: `/ping`,
                method: 'GET',
                ...params,
            }),
        };
        this.auth = {
            /**
             * No description
             *
             * @tags Auth
             * @name AuthControllerRegister
             * @summary Registrar nuevo usuario
             * @request POST:/auth/register
             */
            authControllerRegister: (data, params = {}) => this.request({
                path: `/auth/register`,
                method: 'POST',
                body: data,
                type: ContentType.Json,
                format: 'json',
                ...params,
            }),
            /**
             * No description
             *
             * @tags Auth
             * @name AuthControllerLogin
             * @summary Login con email y contraseña
             * @request POST:/auth/login
             */
            authControllerLogin: (data, params = {}) => this.request({
                path: `/auth/login`,
                method: 'POST',
                body: data,
                type: ContentType.Json,
                format: 'json',
                ...params,
            }),
            /**
             * No description
             *
             * @tags Auth
             * @name AuthControllerRefresh
             * @summary Refrescar token de acceso
             * @request POST:/auth/refresh
             */
            authControllerRefresh: (params = {}) => this.request({
                path: `/auth/refresh`,
                method: 'POST',
                format: 'json',
                ...params,
            }),
            /**
             * No description
             *
             * @tags Auth
             * @name AuthControllerInitiateOAuth
             * @summary Iniciar flujo de OAuth con un proveedor
             * @request GET:/auth/oauth/{provider}
             */
            authControllerInitiateOAuth: (provider, params = {}) => this.request({
                path: `/auth/oauth/${provider}`,
                method: 'GET',
                format: 'json',
                ...params,
            }),
            /**
             * No description
             *
             * @tags Auth
             * @name AuthControllerHandleOAuthCallback
             * @summary Procesar callback de OAuth y validar tokens
             * @request POST:/auth/oauth/callback
             */
            authControllerHandleOAuthCallback: (data, params = {}) => this.request({
                path: `/auth/oauth/callback`,
                method: 'POST',
                body: data,
                type: ContentType.Json,
                format: 'json',
                ...params,
            }),
            /**
             * No description
             *
             * @tags Auth
             * @name AuthControllerGetUsers
             * @summary Listar todos los usuarios (solo admin)
             * @request GET:/auth/users
             */
            authControllerGetUsers: (params = {}) => this.request({
                path: `/auth/users`,
                method: 'GET',
                ...params,
            }),
            /**
             * No description
             *
             * @tags Auth
             * @name AuthControllerUpdateUserRole
             * @summary Actualizar rol de un usuario (solo admin)
             * @request PATCH:/auth/users/{userId}/role
             */
            authControllerUpdateUserRole: (userId, params = {}) => this.request({
                path: `/auth/users/${userId}/role`,
                method: 'PATCH',
                ...params,
            }),
        };
        this.certificate = {
            /**
             * No description
             *
             * @tags Cert
             * @name CertControllerUploadCert
             * @request POST:/certificate/upload
             */
            certControllerUploadCert: (data, params = {}) => this.request({
                path: `/certificate/upload`,
                method: 'POST',
                body: data,
                type: ContentType.Json,
                ...params,
            }),
            /**
             * No description
             *
             * @tags Cert
             * @name CertControllerGetCertificateInfo
             * @request GET:/certificate/info
             */
            certControllerGetCertificateInfo: (params = {}) => this.request({
                path: `/certificate/info`,
                method: 'GET',
                ...params,
            }),
            /**
             * No description
             *
             * @tags Cert
             * @name CertControllerDeleteCertificate
             * @request DELETE:/certificate
             */
            certControllerDeleteCertificate: (params = {}) => this.request({
                path: `/certificate`,
                method: 'DELETE',
                ...params,
            }),
        };
        this.invoice = {
            /**
             * No description
             *
             * @tags invoice
             * @name InvoiceControllerStore
             * @summary Crear y almacenar una nueva factura
             * @request POST:/invoice/store
             */
            invoiceControllerStore: (data, params = {}) => this.request({
                path: `/invoice/store`,
                method: 'POST',
                body: data,
                type: ContentType.Json,
                ...params,
            }),
            /**
             * No description
             *
             * @tags invoice
             * @name InvoiceControllerGetAll
             * @summary Listar facturas con paginación y filtros
             * @request GET:/invoice
             */
            invoiceControllerGetAll: (query, params = {}) => this.request({
                path: `/invoice`,
                method: 'GET',
                query: query,
                ...params,
            }),
            /**
             * No description
             *
             * @tags invoice
             * @name InvoiceControllerSubmit
             * @summary Enviar factura individual a AEAT (forzar envío manual)
             * @request POST:/invoice/{id}/submit
             */
            invoiceControllerSubmit: (id, params = {}) => this.request({
                path: `/invoice/${id}/submit`,
                method: 'POST',
                ...params,
            }),
            /**
             * No description
             *
             * @tags invoice
             * @name InvoiceControllerGetReport
             * @summary Obtener reporte de facturas por rango de fechas
             * @request GET:/invoice/report/range
             */
            invoiceControllerGetReport: (query, params = {}) => this.request({
                path: `/invoice/report/range`,
                method: 'GET',
                query: query,
                ...params,
            }),
            /**
             * No description
             *
             * @tags invoice
             * @name InvoiceControllerGetByCustomer
             * @summary Obtener facturas por NIF de cliente
             * @request GET:/invoice/customer/{taxId}
             */
            invoiceControllerGetByCustomer: (taxId, params = {}) => this.request({
                path: `/invoice/customer/${taxId}`,
                method: 'GET',
                ...params,
            }),
            /**
             * No description
             *
             * @tags invoice
             * @name InvoiceControllerGetDashboardStats
             * @summary Obtener estadísticas para el dashboard
             * @request GET:/invoice/dashboard/stats
             */
            invoiceControllerGetDashboardStats: (params = {}) => this.request({
                path: `/invoice/dashboard/stats`,
                method: 'GET',
                ...params,
            }),
            /**
             * No description
             *
             * @tags invoice
             * @name InvoiceControllerGetBatches
             * @summary Listar batches de envío con paginación
             * @request GET:/invoice/batches
             */
            invoiceControllerGetBatches: (query, params = {}) => this.request({
                path: `/invoice/batches`,
                method: 'GET',
                query: query,
                ...params,
            }),
            /**
             * No description
             *
             * @tags invoice
             * @name InvoiceControllerUpdateBatchStatus
             * @summary Actualizar estado de un batch (solo admin)
             * @request PATCH:/invoice/batches/{batchId}/status
             */
            invoiceControllerUpdateBatchStatus: (batchId, data, params = {}) => this.request({
                path: `/invoice/batches/${batchId}/status`,
                method: 'PATCH',
                body: data,
                type: ContentType.Json,
                ...params,
            }),
            /**
             * No description
             *
             * @tags invoice
             * @name InvoiceControllerGetErrors
             * @summary Listar errores con paginación
             * @request GET:/invoice/errors
             */
            invoiceControllerGetErrors: (query, params = {}) => this.request({
                path: `/invoice/errors`,
                method: 'GET',
                query: query,
                ...params,
            }),
            /**
             * No description
             *
             * @tags invoice
             * @name InvoiceControllerResolveError
             * @summary Marcar error como resuelto
             * @request PATCH:/invoice/errors/{errorId}/resolve
             */
            invoiceControllerResolveError: (errorId, params = {}) => this.request({
                path: `/invoice/errors/${errorId}/resolve`,
                method: 'PATCH',
                ...params,
            }),
            /**
             * No description
             *
             * @tags invoice
             * @name InvoiceControllerGetById
             * @summary Obtener una factura específica por ID
             * @request GET:/invoice/{id}
             */
            invoiceControllerGetById: (id, params = {}) => this.request({
                path: `/invoice/${id}`,
                method: 'GET',
                ...params,
            }),
        };
        this.reader = {
            /**
             * @description ## Lectura de Facturas ...
             *
             * @tags Reader
             * @name ReadInvoice
             * @summary 🟩 Leer datos de factura
             * @request POST:/reader
             * @secure
             */
            readInvoice: (params = {}) => this.request({
                path: `/reader`,
                method: 'POST',
                secure: true,
                ...params,
            }),
        };
        this.makeup = {
            /**
             * No description
             *
             * @tags Makeup
             * @name MakeupPdf
             * @summary 🟩 Generar PDF de factura
             * @request POST:/makeup
             * @secure
             */
            makeupPdf: (data, params = {}) => this.request({
                path: `/makeup`,
                method: 'POST',
                body: data,
                secure: true,
                type: ContentType.Json,
                ...params,
            }),
        };
    }
}
//# sourceMappingURL=api.types.js.map