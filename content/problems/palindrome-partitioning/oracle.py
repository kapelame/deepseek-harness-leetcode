def partition(s):
    out = []
    n = len(s)
    for mask in range(1 << (n - 1)):
        parts, start = [], 0
        for i in range(n - 1):
            if mask >> i & 1:
                parts.append(s[start:i + 1])
                start = i + 1
        parts.append(s[start:])
        if all(p == p[::-1] for p in parts):
            out.append(parts)
    return out
