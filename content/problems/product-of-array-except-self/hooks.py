def valid(args):
    nums = args[0]
    product = 1
    for x in nums:
        product *= x
        if abs(product) > 2 ** 31 - 1:
            return False
    product = 1
    for x in reversed(nums):
        product *= x
        if abs(product) > 2 ** 31 - 1:
            return False
    return True
