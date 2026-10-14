def productExceptSelf(nums):
    out = []
    for i in range(len(nums)):
        product = 1
        for j, x in enumerate(nums):
            if j != i:
                product *= x
        out.append(product)
    return out
