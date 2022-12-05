/**
 * @file 提供元数据的写入与读取支持
 */
import 'reflect-metadata'

/**
 * 键名类型
 */
export type Key = string | symbol

/**
 * 向目标对象写入元数据
 * @param key 元数据键名
 * @param value 数据
 * @param target 目标
 * @param propertyKey 目标键名
 */
export function defineMetadata(
    key: Key,
    value: any,
    target: Object,
    propertyKey?: Key
) {
    const args: any[] = [key, value, target]
    if (typeof propertyKey === 'string' || typeof propertyKey === 'symbol') {
        args.push(propertyKey)
    }
    Reflect.defineMetadata(
        ...(args as Parameters<typeof Reflect.defineMetadata>)
    )
}

/**
 * 从目标对象读取元数据，如果继承链上有数据，也会从继承链读取
 * @param key 元数据键名
 * @param target 目标
 * @param propertyKey 目标键名
 */
export function getMetadata<T>(
    key: Key,
    target: Object,
    propertyKey?: Key
): T | undefined {
    const args: any[] = [key, target]
    if (typeof propertyKey === 'string' || typeof propertyKey === 'symbol') {
        args.push(propertyKey)
    }
    return Reflect.getMetadata(
        ...(args as Parameters<typeof Reflect.getMetadata>)
    )
}

/**
 * 从目标对象读取元数据，**不** 会从继承链读取
 * @param key 元数据键名
 * @param target 目标
 * @param propertyKey 目标键名
 */
export function getOwnMetadata<T>(
    key: Key,
    target: Object,
    propertyKey?: Key
): T | undefined {
    const args: any[] = [key, target]
    if (typeof propertyKey === 'string' || typeof propertyKey === 'symbol') {
        args.push(propertyKey)
    }
    return Reflect.getOwnMetadata(
        ...(args as Parameters<typeof Reflect.getOwnMetadata>)
    )
}
