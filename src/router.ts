import Router, { Middleware, RouterOptions } from '@koa/router'
import { DefaultContext, DefaultState } from 'koa'
import compose from 'koa-compose'
import { getControllerData } from './controller'
import { getRouteData } from './route'
import { getMiddlewareData } from './use'

type AnyClass = { new (): any }

export function createRouter<StateT = DefaultState, ContentT = DefaultContext>(
    controllers: AnyClass[],
    options?: RouterOptions
): Router<StateT, ContentT> {
    const router = new Router<StateT, ContentT>(options)

    controllers.forEach(controller => {
        const subRouter = createSubRouter<StateT, ContentT>(controller)
        if (subRouter) {
            router.use(subRouter.routes())
        }
    })

    return router
}

export function createSubRouter<
    StateT = DefaultState,
    ContentT = DefaultContext
>(controller: AnyClass) {
    if (typeof controller !== 'function') return

    let hasRoute = false

    const router = new Router<StateT, ContentT>()
    const { prefix, keepInstance } = getControllerData(controller)
    if (typeof prefix === 'string') {
        router.prefix(prefix)
    }

    let instance: any
    const getInstance = () => {
        if (!instance || !keepInstance) {
            instance = new controller()
        }
        return instance
    }

    //控制器中间件
    const controllerMiddleware = getMiddlewareData(controller)
    if (typeof controllerMiddleware === 'function') {
        router.use(controllerMiddleware)
    }

    //获取路由方法列表
    Object.entries(
        Object.getOwnPropertyDescriptors(controller.prototype)
    ).forEach(([key, descriptor]) => {
        if (typeof descriptor.value !== 'function') return
        const routeData = getRouteData(controller.prototype, key)
        if (!routeData) return
        if (
            typeof routeData.path !== 'string' &&
            !(routeData.path instanceof RegExp)
        ) {
            return
        }

        //路由中间件
        const routeMiddleware = getMiddlewareData(controller.prototype, key)

        //动作方法
        let action: Middleware<StateT, ContentT> = async (ctx, next) => {
            const result = await descriptor.value.call(getInstance(), ctx)
            if (typeof result !== 'undefined') {
                ctx.body = result
            }
            if (ctx.status === 404) {
                ctx.status = 200
            }
            await next()
        }

        if (typeof routeMiddleware === 'function') {
            action = compose([routeMiddleware, action])
        }

        router.register(
            routeData.path,
            Array.isArray(routeData.methods) && routeData.methods.length > 0
                ? routeData.methods
                : router.methods,
            action
        )
        hasRoute = true
    })

    if (hasRoute) {
        return router
    }
}
