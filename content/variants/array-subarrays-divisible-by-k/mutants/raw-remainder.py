import math
def subarraysDivByK(nums, k):
    counts = {0: 1}
    total = 0
    answer = 0
    for x in nums:
        total += x
        key = int(math.fmod(total, k))
        answer += counts.get(key, 0)
        counts[key] = counts.get(key, 0) + 1
    return answer
