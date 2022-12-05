import { Controller, getControllerData } from '../src/controller'

describe('Controller', () => {
    it('Controller', () => {
        @Controller('/my')
        class TestClass {}

        @Controller({
            prefix: '/my2',
        })
        class TestClass2 {}

        class TestClass3 {}

        const controller1 = getControllerData(TestClass)
        const controller2 = getControllerData(TestClass2)
        const controller3 = getControllerData(TestClass3)

        expect(controller1).toEqual({
            prefix: '/my',
        })

        expect(controller2).toEqual({
            prefix: '/my2',
        })

        expect(controller3).toEqual({})
    })
})
