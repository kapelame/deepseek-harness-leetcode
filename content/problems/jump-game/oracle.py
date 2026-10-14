def canJump(nums):
    ok = [False] * len(nums)
    ok[-1] = True
    for i in range(len(nums) - 2, -1, -1):
        ok[i] = any(ok[j] for j in range(i + 1, min(len(nums), i + nums[i] + 1)))
    return ok[0]
