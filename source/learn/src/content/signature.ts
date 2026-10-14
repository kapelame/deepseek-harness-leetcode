/** Runner request fields derived from one problem signature. */
import type { ParamSpec, ProblemShape, ValueType } from '../types.ts'
import type { DriverValueType } from '../runner/types.ts'

/** Signature fields of a problem, variant, or suite-build input. */
export interface SignatureSource {
  readonly params: readonly ParamSpec[]
  readonly returns: ValueType
  readonly shape?: ProblemShape | undefined
}

/**
 * Runner request fields shared by every execution of one signature.
 * @param source - parameters, return encoding, and calling convention.
 * @returns `params`, `returns`, and `shape` for an execution request.
 */
export function executionSignature(source: SignatureSource): {
  params: DriverValueType[]
  returns: DriverValueType
  shape?: ProblemShape
} {
  return {
    params: source.params.map(item => item.type),
    returns: source.returns,
    ...source.shape === undefined ? {} : { shape: source.shape },
  }
}
