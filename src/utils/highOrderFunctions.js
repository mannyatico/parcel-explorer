import ensure from './ensure';

export function prefixedSequence(prefix, start) {
    start = ensure.number(start);

    return compose(sequenceFrom(start), prefixWith(prefix));
}

export function sequenceFrom(start) {
    start = ensure.number(start);

    return function () {
        const next = start;
        start += 1;
        return next;
    }
}

export function prefixWith(prefix) {
    prefix = ensure.string(prefix);

    return function (value) {
        return `${prefix}${value}`;
    }
}

export function compose(...fns) {
    fns = ensure.array(fns);

    if (fns.length < 2) {
        throw new Error("Can't combine less than 2 functions");
    }

    return function (...args) {
        const [first, ...rest] = fns;

        return rest.reduce((result, fn) => fn(result), first(...args));
    }
}
