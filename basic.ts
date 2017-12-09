// BasicTensor abstracts TensorFlow and DeepLearn basicOps. Operations on
// BasicTensors are not traced in backprop and the class is not exposed to the
// public API.
import { flatten, inferShape } from "./deps/deeplearnjs/src/util";
import { BasicOpsDL, BasicTensorDL } from "./dl";
import { BasicOpsTF, BasicTensorTF, binding } from "./tf";
import * as types from "./types";
import { deepCloneArray } from "./util";

let tensorClass: any;
export let backend: string;
export let basicOps: types.BasicOps;
if (binding) {
  tensorClass = BasicTensorTF;
  basicOps = new BasicOpsTF();
  backend = "tf";
} else {
  tensorClass = BasicTensorDL;
  basicOps = new BasicOpsDL();
  backend = "dl";
}

function create(data: types.TypedArray, shape: types.Shape,
    dtype: types.DType): types.BasicTensor {
  const t = tensorClass.fromTypedArray(data, shape, dtype);
  return t;
}

export function convertBasic(x: types.TensorLike,
    dtype: types.DType = "float32"): types.BasicTensor {
  if (typeof x === "number") {
    return create(types.makeTypedArray([x], dtype), [], dtype);
  } else if (types.isTypedArray(x)) {
    return create(x, [x.length], dtype);
  } else if (Array.isArray(x)) {
    if (!(x instanceof Array)) {
      // Unfortunately deeplearnjs gets confused by an out-of-context array.
      // Therefore clone the array.
      x = deepCloneArray(x);
    }
    const shape = inferShape(x);
    const data = flatten(x) as number[];
    return create(types.makeTypedArray(data, dtype), shape, dtype);
  }
  throw new Error("Unreachable");
}
