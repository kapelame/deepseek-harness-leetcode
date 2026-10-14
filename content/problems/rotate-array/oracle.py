def rotate(nums, k):
    for _ in range(k):
        nums.insert(0, nums.pop())
