import Router from '@koa/router'
import Koa, { Middleware } from 'koa'
import { createServer, request, RequestOptions, Server } from 'node:http'
import { AddressInfo } from 'node:net'
import { Controller } from '../src/controller'
import { Post, Route } from '../src/route'
import { createRouter } from '../src/router'
import { Use } from '../src/use'

describe('router', () => {
    function createRouterServer(router: Router) {
        const app = new Koa()
        app.use(router.routes()).use(router.allowedMethods())
        const server = createServer(app.callback())
        return new Promise<{
            server: Server
            address: AddressInfo
        }>((resolve, reject) => {
            server.on('error', reject)
            server.on('listening', () => {
                resolve({
                    address: server.address() as AddressInfo,
                    server,
                })
            })
            server.listen()
        })
    }

    function getResponse(url: string, options: RequestOptions) {
        return new Promise<{
            err?: any
            resp?: string
        }>((resolve, reject) => {
            request(url, options, res => {
                if (res.statusCode !== 200) {
                    resolve({ err: res.statusCode })
                    return
                }

                res.setEncoding('utf-8')
                let resp: string = ''
                res.on('data', (chunk: string) => {
                    resp = `${resp}${chunk}`
                })
                    .on('end', () => {
                        resolve({ resp })
                    })
                    .resume()
            }).end()
        })
    }

    it('createRouter', async () => {
        const middleware1 = jest.fn(((ctx, next) => next()) as Middleware)
        const middleware2 = jest.fn(((ctx, next) => next()) as Middleware)
        const middleware3 = jest.fn(((ctx, next) => next()) as Middleware)
        const counter1 = jest.fn()
        const counter2 = jest.fn()

        class ControllerClass1 {
            constructor() {
                counter1()
            }

            @Route('/getList')
            getList() {
                return 'getListCalled'
            }

            @Post('/postList')
            postList() {
                return 'postListCalled'
            }
        }

        @Controller({
            prefix: '/api',
            keepInstance: true,
        })
        @Use([middleware1])
        class ControllerClass2 {
            constructor() {
                counter2()
            }

            @Route('/getList')
            @Use([middleware2, middleware3])
            getList() {
                return 'getListCalled'
            }

            @Post('/postList')
            @Use([middleware3])
            postList() {}

            @Route({} as any)
            errorList() {}

            _name = ''

            get name() {
                return this._name
            }
        }

        const router = createRouter([
            ControllerClass1,
            ControllerClass2,
            undefined as any,
        ])
        const { server, address } = await createRouterServer(router)
        const baseURL = new URL(`http://127.0.0.1:${address.port}`)

        const resp1 = await getResponse(new URL('/getList', baseURL).href, {})
        expect(resp1).toEqual({ resp: 'getListCalled' })

        const getResp2 = await getResponse(new URL('/postList', baseURL).href, {
            method: 'GET',
        })
        expect(getResp2).toEqual({ err: 405 })

        const postResp2 = await getResponse(
            new URL('/postList', baseURL).href,
            {
                method: 'POST',
            }
        )
        expect(postResp2).toEqual({ resp: 'postListCalled' })

        const resp3 = await getResponse(new URL('/anyList', baseURL).href, {})
        expect(resp3).toEqual({ err: 404 })

        expect(counter1).toBeCalledTimes(2)

        const apiResp1 = await getResponse(
            new URL('/api/getList', baseURL).href,
            {}
        )
        expect(apiResp1).toEqual({ resp: 'getListCalled' })
        expect(counter2).toBeCalledTimes(1)
        expect(middleware1).toBeCalledTimes(1)
        expect(middleware2).toBeCalledTimes(1)
        expect(middleware3).toBeCalledTimes(1)

        const apiResp2 = await getResponse(
            new URL('/api/postList', baseURL).href,
            {
                method: 'POST',
            }
        )
        expect(apiResp2.err).toBeUndefined()
        expect(counter2).toBeCalledTimes(1)
        expect(middleware1).toBeCalledTimes(2)
        expect(middleware2).toBeCalledTimes(1)
        expect(middleware3).toBeCalledTimes(2)

        await new Promise<void>(resolve => {
            server.close(() => resolve())
        })
    })
})
