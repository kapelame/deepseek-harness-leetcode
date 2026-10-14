def subarraySum(nums, k):
    counts = {0: 1}
    total = 0
    answer = 0
    for x in nums:
        total += x
        answer += counts.get(total - k, 0)
        counts[total] = counts.get(total, 0) + 1
    return answer
