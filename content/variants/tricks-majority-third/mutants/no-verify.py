def majorityThird(nums):
    a, b, ca, cb = None, None, 0, 0
    for x in nums:
        if x == a:
            ca += 1
        elif x == b:
            cb += 1
        elif ca == 0:
            a, ca = x, 1
        elif cb == 0:
            b, cb = x, 1
        else:
            ca -= 1
            cb -= 1
    return sorted(c for c in {a, b} if c is not None)
