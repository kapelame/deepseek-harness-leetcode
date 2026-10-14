/** Mapping from an authored definition to the suite-builder input used to freeze and re-check its suite. */
import type { SuiteBuildInput } from '../judge/suite-builder.ts'
import { SUITE_SEEDS } from '../judge/suite-builder.ts'
import type { ProblemDefinition } from './catalog.ts'

/**
 * Build the suite-builder input for an authored problem or variant.
 * @param definition - definition with authored seed inputs.
 * @param parent - parent definition for variants.
 * @returns the complete build input.
 */
export function suiteInputOf(definition: ProblemDefinition, parent: ProblemDefinition | undefined): SuiteBuildInput {
  const seed = definition.seedInputs
  if (seed === undefined) throw new Error(`learn: ${definition.id} has no authored seed inputs`)
  return {
    params: definition.params,
    returns: definition.returns,
    ...definition.shape === undefined ? {} : { shape: definition.shape },
    comparator: definition.comparator,
    entry: definition.entry.python,
    reference: definition.reference,
    ...definition.oracle === undefined ? {} : { oracle: definition.oracle },
    generator: seed.generator,
    examples: seed.examples,
    boundary: seed.boundary,
    perCaseMs: definition.perCaseMs,
    smallSeeds: SUITE_SEEDS.small,
    largeSeeds: SUITE_SEEDS.large,
    ...seed.mutants === undefined ? {} : { mutants: seed.mutants },
    ...parent === undefined ? {} : { parent: { reference: parent.reference, entry: parent.entry.python, params: parent.params,
      returns: parent.returns, ...parent.shape === undefined ? {} : { shape: parent.shape } } },
  }
}
