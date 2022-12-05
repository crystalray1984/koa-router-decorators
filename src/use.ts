/**
 * @file 中间件装饰器定义
 */

import { defineCompatibleDecorator } from 'decorator-helper'
import { Middleware } from 'koa'
import compose from 'koa-compose'
import { defineMetadata, getOwnMetadata, Key } from './metadata'

const META_KEY_MIDDLEWARES = Symbol()

export type UseDecorator = <T extends Middleware>(
    middlewares: T[]
) => ClassDecorator & MethodDecorator

/**
 * 中间件装饰器
 */
export const Use: UseDecorator = defineCompatibleDecorator(
    (decorating, middlewares) => {
        if (decorating.type !== 'class' && decorating.type !== 'method') return
        if (!Array.isArray(middlewares)) {
            return
        }
        middlewares = middlewares.filter(t => typeof t === 'function')
        if (middlewares.length === 0) return

        defineMetadata(
            META_KEY_MIDDLEWARES,
            compose(middlewares),
            decorating.target,
            // @ts-ignore
            decorating.propertyKey
        )
    },
    true
)

/**
 * 读取中间件
 */
export function getMiddlewareData(target: Object, propertyKey?: Key) {
    return getOwnMetadata<Middleware>(META_KEY_MIDDLEWARES, target, propertyKey)
}
