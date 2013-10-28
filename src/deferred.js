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
                self = this, value;
            if (this.d_state === "pending") { // Not yet resolved/rejected
                if (has_context) {
                    args = [].slice.call(args, 1);
                }
                if (states[type] !== "pending") { // done or fail
                    this.d_state = states[type];
                }
                // First filter
                if (this.filters[type].length) {
                    value = [].slice.call(args, 0); // Work on a copy
                    mjp(this.filters[type]).each(function (i, func) {
                        value = func.apply(ctx, typeof value === "object" && value.length !== "undefined" ? value: [value]);
                    });
                    this.value = value;
                } else {
                    this.value = args.length === 1 ? args[0]: args; // Dubious
                }
                // Then call callbacks
                mjp(this.callbacks[type]).each(function (i, func) {
                    func.apply(ctx, args || [self.value]);
                });
            }
            return this;
        };
    }

    function createAttacher(type) {
        var states = {
            done: "resolved",
            fail: "rejected",
            progress: "pending"
        };
        return function () {
            var funcs = [],
                self = this;
            // Flatten arguments first into a list of functions
            mjp(arguments).each(function (i, func) {
                funcs = funcs.concat(func); // Handles arrays and functions
            });

            if (this.d_state === states[type] && type !== "progress") {
                mjp(funcs).each(function (i, func) {
                    func.call(self, self.value);
                });
            } else {
                this.callbacks[type] = this.callbacks[type].concat(funcs);
            }
            return this;
        };
    }

    mjp.Deferred = function (beforeStart) {
        // Handle cases when user forgot to initiate with "new"
        if (!(this instanceof(mjp.Deferred))) {
            return new mjp.Deferred(beforeStart);
        }

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

        beforeStart && beforeStart();
        return this;
    };

    mjp.Deferred.prototype.state = function () { return this.d_state; };

    mjp.Deferred.prototype.promise = function (target) {
        var methods = ["then", "done", "fail", "always", "progress", "state"],
            promise = target || {},
            self = this;
        mjp(methods).each(function (i, name) {
            promise[name] = function () {
                var value = mjp.Deferred.prototype[name].apply(self, arguments);
                return name === "state" ?  value : promise;
            };
        });
        return promise;
    };

    function trackDeferreds(/*deferred1, deferred2...deferredN */) {
        /* Create master deferred that tracks state of multiple deferreds.
           Reject master if any of passed-in rejects (when it does).
           Otherwise resolve master when all the passed in resolve.

           When resolved, it is passed values of all deferreds in the same
           order in which they were added.
         */
        function resolve() {

            no_resolved += 1;
            if (no_resolved === no_defs) {
                mjp(defs).each(function (i, def) { values.push(def.value); });
                deferred.value = values;
                deferred.resolve.apply(deferred, values);
                //deferred.resolve();
            }
        }

        function reject() {
            deferred.reject();
        }

        var deferred = new mjp.Deferred(),
            defs = arguments,
            no_defs = arguments.length,
            no_resolved = 0,
            values = [];
        mjp(arguments).each(function (i, d) {
            d.done(resolve).fail(reject);
        });

        return deferred;
    }

    mjp.when = function (deferred) {
        if (arguments.length > 2) { // Multiple deferreds
            return trackDeferreds.apply(this, arguments);
        } else if (deferred.promise) {
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
        if (doneFilter) { f.done = f.done.concat(doneFilter);}
        if (failFilter) { f.fail = f.fail.concat(failFilter);}
        if (progressFilter) { f.progress = f.progress.concat(progressFilter);}
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
        return this.done.apply(this, arguments)
                   .fail.apply(this, arguments);
    };

    return mjp;
});
