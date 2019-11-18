import assert from './assert';
import noOp from './noOp';

const ensure = Object.create({
    number: createEnsure(assert.number, 0),
    boolean: createEnsure(assert.boolean, false),
    string: createEnsure(assert.string, ''),
    object: createEnsure(assert.object, () => ({})),
    function: createEnsure(assert.function, () => (noOp)),
    array: createEnsure(assert.array, () => [])
});

export default ensure;

function createEnsure(booleanCheck, fallbackDefaultValue) {
    return ensureFn;

    function ensureFn(value, defaultValue) {
        return (
            booleanCheck(value)
            ? value
            : ensureFn(
                defaultValue,
                typeof fallbackDefaultValue === 'function'
                ? fallbackDefaultValue()
                : fallbackDefaultValue
            )
        );
    }
}