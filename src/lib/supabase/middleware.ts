import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
    let supabaseResponse = NextResponse.next({
        request,
    })

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return request.cookies.getAll()
                },
                setAll(cookiesToSet) {
                    cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value))
                    supabaseResponse = NextResponse.next({
                        request,
                    })
                    cookiesToSet.forEach(({ name, value, options }) =>
                        supabaseResponse.cookies.set(name, value, options)
                    )
                },
            },
        }
    )

    // IMPORTANT: Avoid writing any logic between createServerClient and
    // supabase.auth.getUser(). A simple mistake could make it very hard to debug
    // issues with users being randomly logged out.

    const {
        data: { user },
    } = await supabase.auth.getUser()

    // Admin route protection - check role from database
    if (request.nextUrl.pathname.startsWith('/application/enter')) {
        if (!user) {
            const url = request.nextUrl.clone()
            url.pathname = '/'
            url.search = ''
            url.searchParams.set('auth', 'login')
            url.searchParams.set('redirect', '/application/enter')
            return NextResponse.redirect(url)
        }

        // Check user role from database
        const { data: userData } = await supabase
            .from('users')
            .select('role')
            .eq('id', user.id)
            .single()

        if (!userData || userData.role !== 'admin') {
            const url = request.nextUrl.clone()
            url.pathname = '/'
            return NextResponse.redirect(url)
        }
    }

    // Redirect professionals away from the public consultants directory
    if (user && request.nextUrl.pathname.includes('/consultants')) {
        const userRole = user.user_metadata?.role || user.app_metadata?.role;
        if (userRole === 'professional') {
            const url = request.nextUrl.clone();
            url.pathname = '/';
            return NextResponse.redirect(url);
        }
    }

    const pathname = request.nextUrl.pathname

    // Legacy /login and /register URLs → open auth modal on home
    if (pathname === '/login' || pathname.startsWith('/login/')) {
        const url = request.nextUrl.clone()
        const redirect = url.searchParams.get('redirect')
        const registered = url.searchParams.get('registered')
        url.pathname = '/'
        url.search = ''
        url.searchParams.set('auth', 'login')
        if (redirect) url.searchParams.set('redirect', redirect)
        if (registered === 'true') url.searchParams.set('registered', 'true')
        return NextResponse.redirect(url)
    }

    if (pathname === '/register' || pathname.startsWith('/register/')) {
        const url = request.nextUrl.clone()
        const redirect = url.searchParams.get('redirect')
        const role = url.searchParams.get('role')
        url.pathname = '/'
        url.search = ''
        url.searchParams.set('auth', 'signup')
        if (redirect) url.searchParams.set('redirect', redirect)
        if (role === 'client' || role === 'professional') url.searchParams.set('role', role)
        return NextResponse.redirect(url)
    }

    const isBookConsultationSuccessRoute = pathname.startsWith('/book-consultation/success')

    if (
        !user &&
        !request.nextUrl.pathname.startsWith('/auth') &&
        !request.nextUrl.pathname.startsWith('/consultants') &&
        !request.nextUrl.pathname.startsWith('/book-consultation') &&
        !request.nextUrl.pathname.startsWith('/application/enter') &&
        request.nextUrl.pathname !== '/' &&
        !isBookConsultationSuccessRoute
    ) {
        const url = request.nextUrl.clone()
        const returnTo = request.nextUrl.pathname + request.nextUrl.search
        url.pathname = '/'
        url.search = ''
        url.searchParams.set('auth', 'login')
        url.searchParams.set('redirect', returnTo)
        return NextResponse.redirect(url)
    }

    // IMPORTANT: You *must* return the supabaseResponse object as it is. If you're
    // creating a new response object with NextResponse.next() make sure to:
    // 1. Pass the request in it, like so:
    //    const myNewResponse = NextResponse.next({ request })
    // 2. Copy over the cookies, like so:
    //    myNewResponse.cookies.setAll(supabaseResponse.cookies.getAll())
    // 3. Change the myNewResponse object to fit your needs, but avoid changing
    //    the cookies!
    // 4. Finally: return myNewResponse
    // If this is not done, you may be causing the browser and server to go out
    // of sync and terminate the user's session prematurely!

    return supabaseResponse
}
