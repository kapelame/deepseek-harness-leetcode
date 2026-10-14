def subarraysDivByK(nums, k):
    counts = {}
    total = 0
    answer = 0
    for x in nums:
        total = (total + x) % k
        answer += counts.get(total, 0)
        counts[total] = counts.get(total, 0) + 1
    return answer
