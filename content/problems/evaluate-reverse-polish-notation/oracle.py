def evalRPN(tokens):
    def divide(a, b):
        quotient = abs(a) // abs(b)
        return quotient if (a >= 0) == (b >= 0) else -quotient

    def evaluate(end):
        token = tokens[end]
        if token not in ("+", "-", "*", "/"):
            return int(token), end - 1
        right, cursor = evaluate(end - 1)
        left, cursor = evaluate(cursor)
        if token == "+":
            return left + right, cursor
        if token == "-":
            return left - right, cursor
        if token == "*":
            return left * right, cursor
        return divide(left, right), cursor

    return evaluate(len(tokens) - 1)[0]
