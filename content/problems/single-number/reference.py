def singleNumber(nums):
    result = 0
    for x in nums:
        result ^= x
    return result
