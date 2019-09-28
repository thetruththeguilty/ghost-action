"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var MemoryStorage = /** @class */ (function () {
    function MemoryStorage(maxCount) {
        this.dict = {};
        this.queue = [];
        this.maxCount = maxCount;
    }
    MemoryStorage.prototype.getItem = function (key) { return this.dict[key]; };
    MemoryStorage.prototype.setItem = function (key, value) {
        if (this.queue.length > this.maxCount) {
            var deleteKey = this.queue.shift();
            delete this.dict[deleteKey];
        }
        this.dict[key] = value;
        return value;
    };
    return MemoryStorage;
}());
exports.MemoryStorage = MemoryStorage;
function creatActionGhost(actionHandler) {
    if (!actionHandler.fns) {
        actionHandler.fns = new MemoryStorage(1000); // baken 1000 fns
    }
    var proxy = new Proxy(actionHandler, {
        get: function (actionHandler, prop) {
            if (actionHandler.obj && actionHandler.obj[prop]) {
                return actionHandler.obj[prop];
            }
            var fns = actionHandler.fns || new MemoryStorage(1000);
            actionHandler.fns = fns;
            var temp = fns.getItem(prop);
            if (temp) {
                return temp;
            } // already exist fn
            var fn = function () {
                var args = [];
                for (var _i = 0; _i < arguments.length; _i++) {
                    args[_i] = arguments[_i];
                }
                args.unshift(prop);
                return actionHandler.handleAction.apply(actionHandler, args);
            };
            fns.setItem(prop, fn);
            return fn;
        }
    });
    return proxy;
}
exports.creatActionGhost = creatActionGhost;
exports.actionGhost = creatActionGhost({
    handleAction: function (type, payload, key, opts) {
        return Object.assign({}, { type: type, payload: payload, key: key }, opts);
    }
});
