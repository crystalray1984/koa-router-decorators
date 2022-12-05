import { Middleware, ParameterizedContext } from 'koa'
import { Use, getMiddlewareData } from '../src/use'

describe('Use', () => {
    it('Use Decorator', async () => {
        const middleare1: Middleware = (ctx, next) => {
            ctx.state.middleare1 = true
            return next()
        }

        const middleare2: Middleware = (ctx, next) => {
            ctx.state.middleare2 = true
            return next()
        }

        @Use([middleare1])
        class TestController {
            @Use([middleare1, middleare2])
            route1() {}

            route2() {}
        }

        const controllerMiddleware = getMiddlewareData(TestController)
        expect(typeof controllerMiddleware).toBe('function')

        const route1Middleawre = getMiddlewareData(
            TestController.prototype,
            'route1'
        )
        expect(typeof route1Middleawre).toBe('function')

        const route2Middleawre = getMiddlewareData(
            TestController.prototype,
            'route2'
        )
        expect(route2Middleawre).toBeUndefined()

        const classCtx = {
            state: {},
        } as ParameterizedContext

        const routeCtx = {
            state: {},
        } as ParameterizedContext

        await controllerMiddleware!(classCtx, async () => {})
        expect(classCtx.state).toEqual({ middleare1: true })

        await route1Middleawre!(routeCtx, async () => {})
        expect(routeCtx.state).toEqual({ middleare1: true, middleare2: true })
    })

    it('Use error', () => {
        @Use(undefined as any)
        class TestController {
            // @ts-ignore
            @Use([])
            name: string = ''

            @Use([])
            route() {}
        }

        expect(getMiddlewareData(TestController)).toBeUndefined()
        expect(
            getMiddlewareData(TestController.prototype, 'name')
        ).toBeUndefined()
        expect(
            getMiddlewareData(TestController.prototype, 'route')
        ).toBeUndefined()
    })
})
