export class MemoryStorage {

  dict: any = {}
  queue: any[] = []
  maxCount: number

  constructor(maxCount: number) {
    this.maxCount = maxCount
  }

  getItem(key: any) { return this.dict[key] }

  setItem(key: any, value: any) {

    if (this.queue.length > this.maxCount) {
      let deleteKey = this.queue.shift()
      delete this.dict[deleteKey]
    }

    this.dict[key] = value
    return value
  }
}

export interface IActionHandler {
  handleAction: Function
  obj?: any,              // set an origin data
  fns?: MemoryStorage     // function optimise
}

export function creatActionGhost<T extends IActionHandler>(actionHandler: T) {

  if(!actionHandler.fns) {
    actionHandler.fns = new MemoryStorage(1000) // baken 1000 fns
  }

  let proxy = new Proxy(actionHandler, {
    get: function (actionHandler, prop): Function { // prop as type

      if(actionHandler.obj && actionHandler.obj[prop]) {
        return actionHandler.obj[prop] 
      }

      let fns = actionHandler.fns || new MemoryStorage(1000)
      actionHandler.fns = fns

      let temp = fns.getItem(prop)
      if (temp) { return temp } // already exist fn

      let fn = function (...args: [any]) {
        args.push(prop)
        return actionHandler.handleAction.apply(
          actionHandler, args
        )
      }
      fns.setItem(prop, fn)

      return fn
    }
  })

  return proxy as { [i: string]: any, [i: number]: any }
}

export const actionGhost = creatActionGhost({
  handleAction: (type: any, payload: any, key: any, opts: any) => {
    return Object.assign({}, { type , payload, key }, opts)
  }
})
