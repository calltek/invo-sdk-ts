import path from 'path'
import { generateApi } from 'swagger-typescript-api'

const env = process.argv[2] || 'production'

let url = 'https://api.invo.rest/swagger'
if (env === 'sandbox') {
    url = 'https://sandbox.invo.rest/swagger'
} else if (env === 'localhost') {
    url = 'http://localhost:3000/swagger'
}

console.log(`🌍 Generating API from ${url}`)

generateApi({
    fileName: 'api.types.ts',
    output: path.resolve(process.cwd(), './src/types'),
    url: url,
})
