export function validateOrigin(value: string, name: string, allowHttp: boolean): URL {
  let parsedOrigin: URL
  try {
    parsedOrigin = new URL(value)
  } catch {
    throw new Error(`${name} must be an absolute ${allowHttp ? 'HTTP(S)' : 'HTTPS'} origin`)
  }

  if (
    !(allowHttp ? ['http:', 'https:'] : ['https:']).includes(parsedOrigin.protocol) ||
    parsedOrigin.username ||
    parsedOrigin.password ||
    parsedOrigin.origin !== value
  ) {
    throw new Error(`${name} must be an origin without credentials, a path, or query parameters`)
  }
  return parsedOrigin
}
