#!/usr/bin/env python3
"""Generate Learn problem directories from the compact authoring sources.

Each module in authoring/hot100/ defines PROBLEMS, a list of dicts written by
hand: original bilingual text, signature, input domains, and a reference and
an independently written brute-force oracle. This script merges verified
LeetCode metadata (authoring/hot100-metadata.json, authoring/plan-cn.json),
computes example outputs by running the reference through the real Python
driver, and writes content/problems/<slug>/. Suites are frozen afterwards by
the Learn content spec (LEARN_FREEZE_SUITES=1), which validates every problem
in the isolated runner.

    python3 authoring/build_content.py [group ...]
"""
import importlib.util
import json
import os
import subprocess
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
AUTHORING = os.path.join(ROOT, "authoring")
CONTENT = os.path.join(ROOT, "content")
DRIVER = os.path.join(ROOT, "runtime", "python_driver.py")

META = json.load(open(os.path.join(AUTHORING, "hot100-metadata.json")))
PLAN_CN = json.load(open(os.path.join(AUTHORING, "plan-cn.json")))["data"]["studyPlanV2Detail"]
ZH_TITLES = {q["titleSlug"]: q["translatedTitle"] for g in PLAN_CN["planSubGroups"] for q in g["questions"]}
VERIFIED_AT = META["verifiedAt"]


def j(value):
    return json.dumps(value, ensure_ascii=False)


def localized(pair):
    zh, en = pair
    return {"zh": zh, "en": en}


def run_reference(spec, cases):
    request = {
        "nonce": "author",
        "code": spec["reference"],
        "entry": spec["entry"],
        "params": [t for _, t in spec["params"]],
        "returns": spec["returns"],
        "shape": spec.get("shape"),
        "cases": [{"id": "c%d" % i, "args": args} for i, args in enumerate(cases)],
        "perCaseMs": 10000,
        "moduleTimeMs": 10000,
        "maxStdoutChars": 4000,
        "maxValueBytes": 4 * 1024 * 1024,
        "recursionLimit": 5000,
    }
    done = subprocess.run([sys.executable, DRIVER], input=json.dumps(request).encode(), capture_output=True, timeout=120)
    values = {}
    for line in done.stdout.decode().splitlines():
        if not line.startswith("author "):
            continue
        event = json.loads(line[len("author "):])
        if event["type"] == "case":
            if not event["ok"]:
                raise SystemExit("%s: reference failed on example %s: %s" % (spec["slug"], event["id"], event["error"]))
            values[event["id"]] = event["value"]
        elif event["type"] in ("compile-error", "module-error", "driver-error"):
            raise SystemExit("%s: reference %s: %s" % (spec["slug"], event["type"], event.get("message")))
    return [values["c%d" % i] for i in range(len(cases))]


def official_examples(spec):
    meta = META["questions"][spec["slug"]]
    width = len(spec["params"])
    examples = []
    for raw in meta["exampleTestcaseList"]:
        lines = [line for line in raw.split("\n") if line.strip() != ""]
        if len(lines) != width:
            raise SystemExit("%s: official example has %d lines, signature has %d parameters" % (spec["slug"], len(lines), width))
        examples.append([json.loads(line) for line in lines])
    return examples


def write_problem(spec):
    slug = spec["slug"]
    meta = META["questions"][slug]
    if meta["isPaidOnly"]:
        raise SystemExit("%s is paid-only" % slug)
    example_args = spec.get("examples") or official_examples(spec)
    expected = run_reference(spec, example_args)
    directory = os.path.join(CONTENT, "problems", slug)
    os.makedirs(directory, exist_ok=True)
    difficulty = meta["difficulty"].lower()
    lines = [
        "id: %s" % j(slug),
        "kind: leetcode",
        "version: 1",
        "suiteVersion: 1",
        "title: %s" % j({"zh": ZH_TITLES[slug], "en": meta["title"]}),
        "difficulty: %s" % difficulty,
        "topics: %s" % j(spec["topics"]),
        "leetcode: %s" % j({"frontendId": int(meta["questionFrontendId"]), "title": meta["title"], "slug": slug, "difficulty": difficulty,
                            "tags": [tag["name"] for tag in meta["topicTags"]], "paidOnly": False, "verifiedAt": VERIFIED_AT}),
        "summary: %s" % j(localized(spec["summary"])),
        "constraints: %s" % j([localized(item) for item in spec["constraints"]]),
        "params: %s" % j([{"name": name, "type": kind} for name, kind in spec["params"]]),
        "returns: %s" % j(spec["returns"]),
    ]
    if spec.get("shape") is not None:
        lines.append("shape: %s" % j(spec["shape"]))
    lines += [
        "comparator: %s" % j(spec.get("comparator", {"kind": "exact"})),
        "entry: %s" % j({"python": spec["entry"], "typescript": spec.get("tsEntry", spec["entry"])}),
        "perCaseMs: %d" % spec.get("perCaseMs", 1000),
    ]
    if spec.get("inputs") is not None:
        lines.append("inputs: %s" % j(spec["inputs"]))
    lines += [
        "hints: %s" % j([localized(item) for item in spec["hints"]]),
        "solution: %s" % j({"explanation": localized(spec["explanation"])}),
        "examples: %s" % j([{"id": "ex-%d" % (i + 1), "args": args, "expected": value} for i, (args, value) in enumerate(zip(example_args, expected))]),
        "boundaryCases: %s" % j([{"args": args} for args in spec["boundary"]]),
    ]
    with open(os.path.join(directory, "problem.yaml"), "w") as handle:
        handle.write("\n".join(lines) + "\n")
    for name in ("reference", "oracle", "hooks", "generator"):
        path = os.path.join(directory, name + ".py")
        if spec.get(name):
            with open(path, "w") as handle:
                handle.write(spec[name].strip("\n") + "\n")
        elif name in ("hooks", "generator") and os.path.exists(path):
            os.remove(path)
    return slug


def register(slug, topics):
    for topic in topics:
        path = os.path.join(CONTENT, "topics", topic + ".yaml")
        if not os.path.exists(path):
            print("warning: topic %s does not exist yet; %s is not listed" % (topic, slug))
            continue
        lines = open(path).read().split("\n")
        for index, line in enumerate(lines):
            if line.startswith("problems: [") and line.endswith("]"):
                items = [item.strip() for item in line[len("problems: ["):-1].split(",") if item.strip()]
                if slug not in items:
                    items.append(slug)
                    lines[index] = "problems: [" + ", ".join(items) + "]"
                break
        else:
            raise SystemExit("%s has no one-line problems list" % path)
        open(path, "w").write("\n".join(lines))


def write_topic(topic):
    path = os.path.join(CONTENT, "topics", topic["id"] + ".yaml")
    problems = list(topic["problems"])
    if os.path.exists(path):
        for line in open(path).read().split("\n"):
            if line.startswith("problems: ["):
                for item in line[len("problems: ["):-1].split(","):
                    if item.strip() and item.strip() not in problems:
                        problems.append(item.strip())
    lesson = topic["lesson"]
    body = {
        "motivation": localized(lesson["motivation"]),
        "strategy": localized(lesson["strategy"]),
        "example": {
            "title": localized(lesson["example"]["title"]),
            "body": localized(lesson["example"]["body"]),
            "traceColumns": lesson["example"]["columns"],
            "trace": [{"state": state, "note": localized(note)} for state, note in lesson["example"]["trace"]],
        },
        "check": [{"id": item["id"], "prompt": localized(item["prompt"]), "options": [localized(o) for o in item["options"]],
                   "answer": item["answer"], "explanation": localized(item["explanation"])} for item in lesson["check"]],
        "practiceProblem": lesson["practice"],
        "reflectionPrompt": localized(lesson["reflection"]),
    }
    lines = [
        "id: %s" % topic["id"],
        "order: %d" % topic["order"],
        "title: %s" % j(localized(topic["title"])),
        "summary: %s" % j(localized(topic["summary"])),
        "prerequisites: [%s]" % ", ".join(topic["prerequisites"]),
        "problems: [%s]" % ", ".join(problems),
        "variants: [%s]" % ", ".join(topic["variants"]),
        "lesson: %s" % j(body),
    ]
    with open(path, "w") as handle:
        handle.write("\n".join(lines) + "\n")
    return topic["id"]


def write_variant(variant):
    spec = dict(variant, slug=variant["id"])
    examples = variant["examples"]
    expected = run_reference(spec, examples)
    directory = os.path.join(CONTENT, "variants", variant["id"])
    os.makedirs(os.path.join(directory, "mutants"), exist_ok=True)
    lines = [
        "id: %s" % j(variant["id"]),
        "version: 1",
        "suiteVersion: 1",
        "parentProblemId: %s" % j(variant["parent"]),
        "topicId: %s" % j(variant["topic"]),
        "title: %s" % j(localized(variant["title"])),
        "summary: %s" % j(localized(variant["summary"])),
        "statement: %s" % j(localized(variant["statement"])),
        "difficulty: %s" % variant["difficulty"],
        "skills: %s" % j(variant["skills"]),
        "differences: %s" % j([{"category": c, "description": localized(d)} for c, d in variant["differences"]]),
        "transfer: %s" % j(localized(variant["transfer"])),
        "entry: %s" % j({"python": variant["entry"], "typescript": variant.get("tsEntry", variant["entry"])}),
        "params: %s" % j([{"name": name, "type": kind} for name, kind in variant["params"]]),
        "returns: %s" % j(variant["returns"]),
    ]
    if variant.get("shape") is not None:
        lines.append("shape: %s" % j(variant["shape"]))
    lines += [
        "comparator: %s" % j(variant.get("comparator", {"kind": "exact"})),
        "perCaseMs: %d" % variant.get("perCaseMs", 1000),
    ]
    if variant.get("inputs") is not None:
        lines.append("inputs: %s" % j(variant["inputs"]))
    lines += [
        "constraints: %s" % j([localized(item) for item in variant["constraints"]]),
        "examples: %s" % j([{"args": args, "expected": value} for args, value in zip(examples, expected)]),
        "boundaryCases: %s" % j([{"args": args} for args in variant["boundary"]]),
        "hints: %s" % j([localized(item) for item in variant["hints"]]),
    ]
    with open(os.path.join(directory, "variant.yaml"), "w") as handle:
        handle.write("\n".join(lines) + "\n")
    for name in ("reference", "oracle", "hooks", "generator"):
        path = os.path.join(directory, name + ".py")
        if variant.get(name):
            with open(path, "w") as handle:
                handle.write(variant[name].strip("\n") + "\n")
        elif os.path.exists(path):
            os.remove(path)
    for old in os.listdir(os.path.join(directory, "mutants")):
        os.remove(os.path.join(directory, "mutants", old))
    for name, code in variant["mutants"].items():
        with open(os.path.join(directory, "mutants", name + ".py"), "w") as handle:
            handle.write(code.strip("\n") + "\n")
    return variant["id"]


def load_group(name):
    path = os.path.join(AUTHORING, "hot100", name + ".py")
    module_spec = importlib.util.spec_from_file_location("hot100_" + name, path)
    module = importlib.util.module_from_spec(module_spec)
    module_spec.loader.exec_module(module)
    return module


def main(groups):
    names = groups or sorted(name[:-3] for name in os.listdir(os.path.join(AUTHORING, "hot100")) if name.endswith(".py") and not name.startswith("_"))
    for name in names:
        module = load_group(name)
        for topic in getattr(module, "TOPICS", []):
            print("wrote topic", write_topic(topic))
        for variant in getattr(module, "VARIANTS", []):
            print("wrote variant", write_variant(variant))
        for spec in module.PROBLEMS:
            print("wrote", write_problem(spec))
            register(spec["slug"], spec["topics"])


if __name__ == "__main__":
    main(sys.argv[1:])
