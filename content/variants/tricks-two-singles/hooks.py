def adjust(args, rng, size):
    values = args[0]
    a, b, pairs = values[0], values[1], values[2:]
    nums = pairs + pairs + [a, b]
    rng.shuffle(nums)
    return [nums]
