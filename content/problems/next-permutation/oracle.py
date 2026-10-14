import itertools
def nextPermutation(nums):
    if len(nums) > 7:
        raise ValueError("oracle only handles small inputs")
    ordered = sorted(set(itertools.permutations(nums)))
    current = tuple(nums)
    index = ordered.index(current)
    nums[:] = list(ordered[(index + 1) % len(ordered)])
