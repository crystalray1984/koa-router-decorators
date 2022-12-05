import { getMetadata, getOwnMetadata, defineMetadata } from '../src/metadata'

it('metadata', () => {
    const classMeta = Symbol()
    const method1Meta = Symbol()
    const method2Meta = Symbol()
    const method3Meta = Symbol()
    const method4Meta = Symbol()
    const subMethod4Meta = Symbol()

    class BaseClass {
        method1() {}

        static method2() {}

        method3() {}

        method4() {}
    }

    class SubClass extends BaseClass {
        method3() {}

        method4() {}
    }

    defineMetadata('classMeta', classMeta, BaseClass)
    defineMetadata('method1Meta', method1Meta, BaseClass.prototype, 'method1')
    defineMetadata('method2Meta', method2Meta, BaseClass, 'method2')
    defineMetadata('method4Meta', method4Meta, BaseClass.prototype, 'method4')
    defineMetadata('method3Meta', method3Meta, SubClass.prototype, 'method3')
    defineMetadata('method4Meta', subMethod4Meta, SubClass.prototype, 'method4')

    expect(getMetadata('classMeta', BaseClass)).toBe(classMeta)
    expect(getMetadata('method1Meta', BaseClass.prototype, 'method1')).toBe(
        method1Meta
    )
    expect(getMetadata('method2Meta', BaseClass, 'method2')).toBe(method2Meta)
    expect(
        getMetadata('method3Meta', BaseClass.prototype, 'method3')
    ).toBeUndefined()
    expect(getMetadata('method4Meta', BaseClass.prototype, 'method4')).toBe(
        method4Meta
    )

    expect(getMetadata('classMeta', SubClass)).toBe(classMeta)
    expect(getMetadata('method1Meta', SubClass.prototype, 'method1')).toBe(
        method1Meta
    )
    expect(getMetadata('method2Meta', SubClass, 'method2')).toBe(method2Meta)
    expect(getMetadata('method3Meta', SubClass.prototype, 'method3')).toBe(
        method3Meta
    )
    expect(getMetadata('method4Meta', SubClass.prototype, 'method4')).toBe(
        subMethod4Meta
    )

    expect(getOwnMetadata('classMeta', SubClass)).toBeUndefined()

    expect(
        getOwnMetadata('method1Meta', SubClass.prototype, 'method1')
    ).toBeUndefined()

    expect(getOwnMetadata('method2Meta', SubClass, 'method2')).toBeUndefined()

    expect(getOwnMetadata('method3Meta', SubClass.prototype, 'method3')).toBe(
        method3Meta
    )

    expect(getOwnMetadata('method4Meta', SubClass.prototype, 'method4')).toBe(
        subMethod4Meta
    )
})
