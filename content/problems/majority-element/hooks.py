def adjust(args, rng, size):
    nums = args[0]
    winner = rng.choice(nums)
    count = len(nums) // 2 + 1
    nums = [winner] * count + nums[:len(nums) - count]
    rng.shuffle(nums)
    return [nums]
