def adjust(args, rng, size):
    nums, _ = args
    return [nums, rng.randint(1, len(nums))]
