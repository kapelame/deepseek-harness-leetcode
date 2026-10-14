import itertools
def permute(nums):
    return [list(p) for p in itertools.permutations(nums)]
