/*
 * A stand-in for the endpoints the api does not have yet, for development only. It answers what
 * its handlers know and lets everything else through to the api, so the app is wired as if they
 * were there: once they are, their handlers go. On with VITE_MOCK_API=true (.env.development.local)
 */

export type MockRequest = {
  method: string
  path: string                      // after /api, without the query
  params: URLSearchParams
  body: unknown                     // parsed from JSON, or the FormData as it was sent
  forward: (body: unknown) => Promise<Response>    // on to the api, with this body instead
}

/* What a handler answers with. Undefined when the request is not its own */
export type MockHandler = (request: MockRequest) => unknown | Promise<unknown>

const LATENCY = 250

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } })

export const startMocks = (handlers: MockHandler[]) => {
  const passThrough = globalThis.fetch.bind(globalThis)

  globalThis.fetch = async (input, init) => {
    const url = new URL(input instanceof Request ? input.url : String(input), location.origin)
    const [ , path ] = url.pathname.split(/^\/api(?=\/)/)

    if (path) {
      const request = {
        method: (init?.method ?? 'GET').toUpperCase(),
        path,
        params: url.searchParams,
        body: init?.body instanceof FormData ? init.body : init?.body ? JSON.parse(String(init.body)) : undefined,
        forward: (body: unknown) => passThrough(input, { ...init, body: JSON.stringify(body) }),
      }

      for (const handler of handlers) {
        const answer = await handler(request)

        if (answer !== undefined) {
          await new Promise(resolve => setTimeout(resolve, LATENCY))
          console.debug('[mock]', request.method, path, request.body ?? '', answer)
          return answer instanceof Response ? answer : json(answer)
        }
      }
    }

    return passThrough(input, init)
  }
}
