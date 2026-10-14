def jump(nums):
    n = len(nums)
    best = [0] + [None] * (n - 1)
    for i in range(n):
        if best[i] is None:
            continue
        for j in range(i + 1, min(n, i + nums[i] + 1)):
            if best[j] is None or best[j] > best[i] + 1:
                best[j] = best[i] + 1
    return best[-1]
