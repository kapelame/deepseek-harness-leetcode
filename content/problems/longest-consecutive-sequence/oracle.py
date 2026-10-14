def longestConsecutive(nums):
    best = 0
    for x in nums:
        length = 1
        while x + length in nums:
            length += 1
        best = max(best, length)
    return best
