import { defineMethodDecorator } from 'decorator-helper'
import { defineMetadata, getOwnMetadata, Key } from './metadata'

const META_KEY_ROUTE = Symbol()

export interface RouteOptions {
    path: string | RegExp
    methods?: string[]
}

export interface RouteDecorator {
    (path: string | RegExp): MethodDecorator
    (options: RouteOptions): MethodDecorator
}

export const Route: RouteDecorator = defineMethodDecorator<
    [string | RegExp | RouteOptions]
>((target, propertyKey, _, arg) => {
    let options: RouteOptions = undefined as unknown as RouteOptions
    if (typeof arg === 'string' || arg instanceof RegExp) {
        options = {
            path: arg,
        }
    } else if (typeof arg === 'object' && arg) {
        options = {
            ...arg,
        }
    }
    if (!options) return
    defineMetadata(META_KEY_ROUTE, options, target, propertyKey)
}, true)

export interface ShortCutRouteDecorator {
    (path: string | RegExp): MethodDecorator
}

function createShortcut(method: string): ShortCutRouteDecorator {
    return (path: string | RegExp) =>
        Route({
            path,
            methods: [method],
        })
}

export const Get = createShortcut('GET')
export const Post = createShortcut('POST')
export const Put = createShortcut('PUT')
export const Delete = createShortcut('DELETE')
export const Head = createShortcut('HEAD')

export function getRouteData(target: Object, propertyKey: Key) {
    return getOwnMetadata<RouteOptions>(META_KEY_ROUTE, target, propertyKey)
}
