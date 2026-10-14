def adjust(args, rng, size):
    nums = args[0]
    if size == "large":
        nums = [0 if i % 18 == 17 else x for i, x in enumerate(nums)]
    return [nums]

def valid(args):
    nums = args[0]
    run = 1
    for x in nums:
        run = 1 if x == 0 else run * abs(x)
        if run > 2 ** 31 - 1:
            return False
    return True
