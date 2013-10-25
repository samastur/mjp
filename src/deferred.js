define([
    "./core"
], function (mjp) {
    function createNotifier(type, has_context) {
        var states = {
            done: "resolved",
            fail: "rejected",
            progress: "pending"
        };
        return function () {
            var args = arguments,
                ctx = has_context ? args[0] : this,
                self = this;
            if (this.d_state === "pending") { // Not yet resolved/rejected
                if (has_context) {
                    args = [].slice.call(args, 1);
                }
                if (type !== "pending") { // done or fail
                    this.d_state = states[type];
                }
                // First filter
                mjp(this.filters[type]).each(function (i, func) {
                    args = func.apply(ctx, args);
                });
                mjp(this.callbacks[type]).each(function (i, func) {
                    self.value = func.apply(ctx, args) || self.value;
                });
            }
            return this;
        };
    }

    function createAttacher(type) {
        return function () {
            var funcs = [],
                c = this.callbacks[type];
            // Flatten arguments first into a list of functions
            mjp(arguments).each(function (i, func) {
                funcs = funcs.concat(func); // Handles arrays and functions
            });

            if (this.d_state === type) {
                mjp(funcs).each(function (i, func) {
                    func.apply(this, this.value);
                });
            } else {
                c = c.concat(funcs);
            }
            return this;
        };
    }

    mjp.Deferred = function (beforeStart) {
        this.d_state = "pending";
        this.callbacks = {
            done: [],
            fail: [],
            progress: []
        };
        this.filters = {
            done: [],
            fail: [],
            progress: []
        };
        this.value;

        beforeStart && beforeStart();
        return this;
    };

    mjp.Deferred.prototype.state = function () { return this.d_state; };

    mjp.Deferred.prototype.promise = function (target) {
        var methods = ["then", "done", "fail", "always", "progress", "state"],
            promise = target || {};
        mjp(methods).each(function (i, name) {
            promise[name] = mjp.Deferred.prototype[name];
        });
        return promise;
    };

    mjp.Deferred.prototype.when = function (deferred) {
        if (deferred.promise) {
            return deferred.promise();
        } else if (!(deferred.done && deferred.fail && !deferred.notify)) {
            // Create object that behaves like a resolved promise
            deferred.done = function (func) {
                func.call(deferred, deferred);
                return deferred;
            };
        }
        // This is a promise or promise-like object
        return deferred;
    };

    mjp.Deferred.prototype.then = function (doneFilter, failFilter, progressFilter) {
        var f = this.filters;
        f.done = f.done.concat(doneFilter);
        f.fail = f.fail.concat(failFilter);
        f.progress = f.progress.concat(progressFilter);
        return this;
    };

    // Notifiers
    mjp.Deferred.prototype.resolve = createNotifier("done");
    mjp.Deferred.prototype.resolveWith = createNotifier("done", true);
    mjp.Deferred.prototype.reject = createNotifier("fail");
    mjp.Deferred.prototype.rejectWith = createNotifier("fail", true);
    mjp.Deferred.prototype.notify = createNotifier("progress");
    mjp.Deferred.prototype.notifyWith = createNotifier("progress", true);

    // Attachers
    mjp.Deferred.prototype.done = createAttacher("done");
    mjp.Deferred.prototype.fail = createAttacher("fail");
    mjp.Deferred.prototype.progress = createAttacher("progress");
    mjp.Deferred.prototype.always = function () {
        this.done(arguments);
        this.fail(arguments);
    };

    return mjp;
});
