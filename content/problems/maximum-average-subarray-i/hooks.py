def adjust(args, rng, size):
    nums = args[0]
    upper = len(nums) if size == "small" else min(len(nums), 20000)
    return [nums, rng.randint(1, upper)]
