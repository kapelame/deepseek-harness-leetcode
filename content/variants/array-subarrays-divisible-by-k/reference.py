def subarraysDivByK(nums, k):
    counts = [0] * k
    counts[0] = 1
    total = 0
    answer = 0
    for x in nums:
        total = (total + x) % k
        answer += counts[total]
        counts[total] += 1
    return answer
