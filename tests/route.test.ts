import { Route, getRouteData, Get, Post } from '../src/route'

describe('Route', () => {
    it('Route decorator', () => {
        const regexpPath = /^\/method2/

        class TestClass {
            @Route('/method1')
            method1() {}

            @Route(regexpPath)
            static method2() {}

            @Route({
                path: '/method3',
                methods: ['GET', 'POST'],
            })
            method3() {}

            method4() {}
        }

        const route1 = getRouteData(TestClass.prototype, 'method1')
        const route2 = getRouteData(TestClass, 'method2')
        const route3 = getRouteData(TestClass.prototype, 'method3')
        const route4 = getRouteData(TestClass.prototype, 'method4')

        expect(route1).toEqual({ path: '/method1' })
        expect(route2).toEqual({ path: regexpPath })
        expect(route3).toEqual({ path: '/method3', methods: ['GET', 'POST'] })
        expect(route4).toBeUndefined()
    })

    it('Shortcut route', () => {
        class TestClass {
            @Get('/method1')
            method1() {}

            @Post('/method2')
            static method2() {}
        }

        const route1 = getRouteData(TestClass.prototype, 'method1')
        const route2 = getRouteData(TestClass, 'method2')

        expect(route1).toEqual({ path: '/method1', methods: ['GET'] })
        expect(route2).toEqual({ path: '/method2', methods: ['POST'] })
    })

    it('Route error usage', () => {
        class TestClass {
            @Route(undefined as unknown as string)
            method1() {}
        }

        const route1 = getRouteData(TestClass.prototype, 'method1')
        expect(route1).toBeUndefined()
    })
})
