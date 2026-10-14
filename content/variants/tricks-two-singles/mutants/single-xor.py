def singleNumbers(nums):
    x = 0
    for v in nums:
        x ^= v
    return [0, x] if x >= 0 else [x, 0]
