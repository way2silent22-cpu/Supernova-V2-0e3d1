const AUTH_COOKIE_NAME = 'calcsolver_access'
const AUTH_COOKIE_VALUE = 'granted'
const SITE_PASSWORD = 'low cortisol'

function getCookieValue(cookieHeader: string, name: string): string | null {
  const cookies = cookieHeader.split(';')

  for (const cookie of cookies) {
    const [rawName, ...rawValue] = cookie.trim().split('=')
    if (rawName === name) {
      return decodeURIComponent(rawValue.join('='))
    }
  }

  return null
}

function redirect(location: string): Response {
  return new Response(null, {
    status: 303,
    headers: {
      Location: location,
    },
  })
}

export default async (req: Request, context: any) => {
  const url = new URL(req.url)
  const { pathname } = url

  if (pathname === '/unlock') {
    if (req.method !== 'POST') {
      return redirect('/unlock.html')
    }

    const formData = await req.formData()
    const submittedPassword = String(formData.get('password') || '')

    if (submittedPassword === SITE_PASSWORD) {
      const response = redirect('/')
      response.headers.append(
        'Set-Cookie',
        `${AUTH_COOKIE_NAME}=${AUTH_COOKIE_VALUE}; Path=/; Max-Age=604800; HttpOnly; Secure; SameSite=Lax`,
      )
      return response
    }

    return redirect('/unlock.html?error=1')
  }

  if (pathname === '/unlock.html') {
    return context.next()
  }

  const cookieHeader = req.headers.get('cookie') || ''
  const authCookie = getCookieValue(cookieHeader, AUTH_COOKIE_NAME)

  if (authCookie === AUTH_COOKIE_VALUE) {
    return context.next()
  }

  return redirect('/unlock.html')
}

export const config = {
  path: '/*',
}
