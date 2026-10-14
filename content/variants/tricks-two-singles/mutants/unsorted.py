def singleNumbers(nums):
    x = 0
    for v in nums:
        x ^= v
    low = x & -x
    a = b = 0
    for v in nums:
        if v & low:
            a ^= v
        else:
            b ^= v
    return [a, b]
