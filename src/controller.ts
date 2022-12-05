/**
 * @file 控制器装饰器定义
 */

import { defineClassDecorator } from 'decorator-helper'
import { defineMetadata, getOwnMetadata } from './metadata'

const META_KEY_CONTROLLER = Symbol()

/**
 * 控制器配置项
 */
export interface ControllerOptions {
    /**
     * 控制器内路由方法的公共前缀
     */
    prefix?: string
    /**
     * 处理请求时是否复用之前的类实例
     */
    keepInstance?: boolean
}

export interface ControllerDecorator {
    (prefix: string): ClassDecorator
    (options: ControllerOptions): ClassDecorator
}

/**
 * 控制器装饰器
 */
export const Controller: ControllerDecorator = defineClassDecorator<
    [string | ControllerOptions]
>((target, prefixOrOptions) => {
    let options: ControllerOptions
    if (typeof prefixOrOptions === 'string') {
        options = {
            prefix: prefixOrOptions,
        }
    } else {
        options = {
            ...prefixOrOptions,
        }
    }

    defineMetadata(META_KEY_CONTROLLER, options, target)
})

/**
 * 获取控制器数据
 * @param target
 * @returns
 */
export function getControllerData(target: Function) {
    const data = getOwnMetadata<ControllerOptions>(META_KEY_CONTROLLER, target)
    return data ?? {}
}
