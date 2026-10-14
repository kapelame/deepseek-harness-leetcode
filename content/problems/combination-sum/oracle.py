def combinationSum(candidates, target):
    results = set()
    def build(remain, chosen):
        if remain == 0:
            results.add(tuple(sorted(chosen)))
            return
        for c in candidates:
            if c <= remain:
                build(remain - c, chosen + [c])
    build(target, [])
    return [list(r) for r in results]
