def _div(a, b):
    quotient = abs(a) // abs(b)
    return quotient if (a >= 0) == (b >= 0) else -quotient


def _build(rng, budget):
    if budget <= 1 or rng.random() < 0.25:
        value = rng.randint(-50, 50)
        return [str(value)], value
    left_budget = rng.randint(1, budget - 1)
    left_tokens, left = _build(rng, left_budget)
    right_tokens, right = _build(rng, budget - left_budget)
    operator = rng.choice("+-*/")
    if operator == "/" and right == 0:
        operator = "+"
    if operator == "*" and abs(left * right) > 2 ** 30:
        operator = "-"
    if operator == "+":
        value = left + right
    elif operator == "-":
        value = left - right
    elif operator == "*":
        value = left * right
    else:
        value = _div(left, right)
    if abs(value) > 2 ** 30:
        return [str(left % 97)], left % 97
    return left_tokens + right_tokens + [operator], value


def adjust(args, rng, size):
    budget = max(1, (len(args[0]) + 1) // 2)
    if size == "large":
        tokens = []
        total = 0
        for index in range(budget // 8):
            part, value = _build(rng, 8)
            tokens += part
            if index > 0:
                tokens.append("+")
                total += value
            else:
                total = value
            if abs(total) > 2 ** 30:
                return None
        return [tokens]
    return [_build(rng, budget)[0]]
