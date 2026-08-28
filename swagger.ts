import 'dotenv/config'
import path from 'path'
import { generateApi } from 'swagger-typescript-api'

const env = process.argv[2] || process.env.INVO_ENV || 'production'

// Usar swagger-internal.json que incluye todos los endpoints (incluidos los internos)
let url = 'https://api.invo.rest/swagger-internal.json'
if (env === 'sandbox') {
    url = 'https://sandbox.invo.rest/swagger-internal.json'
} else if (env === 'localhost') {
    url = 'http://localhost:3000/swagger-internal.json'
}

console.log(`🌍 Generating API from ${url}`)

generateApi({
    fileName: 'api.types.ts',
    output: path.resolve(process.cwd(), './src/types'),
    url: url,
})
