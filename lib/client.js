window.__ModuleLoader__.load({
	id: "dsh-plugin-learn",
	factory: (require) => {
		var module = { exports: {} };
		var exports = module.exports;
		Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
		let _deepseek_ai_dsh_api_gateway_client = require("@deepseek-ai/dsh-api-gateway/client");
		let react_jsx_runtime = require("react/jsx-runtime");
		let react = require("react");
		let _deepseek_ai_dsh_client_ui_primitives = require("@deepseek-ai/dsh-client-ui-primitives");
		let _deepseek_ai_dsh_client_store = require("@deepseek-ai/dsh-client-store");
		//#region ../../../node_modules/.pnpm/zod@4.4.3/node_modules/zod/v4/core/core.js
		var _a$1;
		function $constructor(name, initializer, params) {
			function init(inst, def) {
				if (!inst._zod) Object.defineProperty(inst, "_zod", {
					value: {
						def,
						constr: _,
						traits: /* @__PURE__ */ new Set()
					},
					enumerable: false
				});
				if (inst._zod.traits.has(name)) return;
				inst._zod.traits.add(name);
				initializer(inst, def);
				const proto = _.prototype;
				const keys = Object.keys(proto);
				for (let i = 0; i < keys.length; i++) {
					const k = keys[i];
					if (!(k in inst)) inst[k] = proto[k].bind(inst);
				}
			}
			const Parent = params?.Parent ?? Object;
			class Definition extends Parent {}
			Object.defineProperty(Definition, "name", { value: name });
			function _(def) {
				var _a;
				const inst = params?.Parent ? new Definition() : this;
				init(inst, def);
				(_a = inst._zod).deferred ?? (_a.deferred = []);
				for (const fn of inst._zod.deferred) fn();
				return inst;
			}
			Object.defineProperty(_, "init", { value: init });
			Object.defineProperty(_, Symbol.hasInstance, { value: (inst) => {
				if (params?.Parent && inst instanceof params.Parent) return true;
				return inst?._zod?.traits?.has(name);
			} });
			Object.defineProperty(_, "name", { value: name });
			return _;
		}
		var $ZodAsyncError = class extends Error {
			constructor() {
				super(`Encountered Promise during synchronous parse. Use .parseAsync() instead.`);
			}
		};
		var $ZodEncodeError = class extends Error {
			constructor(name) {
				super(`Encountered unidirectional transform during encode: ${name}`);
				this.name = "ZodEncodeError";
			}
		};
		(_a$1 = globalThis).__zod_globalConfig ?? (_a$1.__zod_globalConfig = {});
		const globalConfig = globalThis.__zod_globalConfig;
		function config(newConfig) {
			if (newConfig) Object.assign(globalConfig, newConfig);
			return globalConfig;
		}
		//#endregion
		//#region ../../../node_modules/.pnpm/zod@4.4.3/node_modules/zod/v4/core/util.js
		function getEnumValues(entries) {
			const numericValues = Object.values(entries).filter((v) => typeof v === "number");
			return Object.entries(entries).filter(([k, _]) => numericValues.indexOf(+k) === -1).map(([_, v]) => v);
		}
		function jsonStringifyReplacer(_, value) {
			if (typeof value === "bigint") return value.toString();
			return value;
		}
		function cached(getter) {
			return { get value() {
				{
					const value = getter();
					Object.defineProperty(this, "value", { value });
					return value;
				}
				throw new Error("cached value already set");
			} };
		}
		function nullish(input) {
			return input === null || input === void 0;
		}
		function cleanRegex(source) {
			const start = source.startsWith("^") ? 1 : 0;
			const end = source.endsWith("$") ? source.length - 1 : source.length;
			return source.slice(start, end);
		}
		function floatSafeRemainder(val, step) {
			const ratio = val / step;
			const roundedRatio = Math.round(ratio);
			const tolerance = Number.EPSILON * Math.max(Math.abs(ratio), 1);
			if (Math.abs(ratio - roundedRatio) < tolerance) return 0;
			return ratio - roundedRatio;
		}
		const EVALUATING = /* @__PURE__*/ Symbol("evaluating");
		function defineLazy(object, key, getter) {
			let value = void 0;
			Object.defineProperty(object, key, {
				get() {
					if (value === EVALUATING) return;
					if (value === void 0) {
						value = EVALUATING;
						value = getter();
					}
					return value;
				},
				set(v) {
					Object.defineProperty(object, key, { value: v });
				},
				configurable: true
			});
		}
		function assignProp(target, prop, value) {
			Object.defineProperty(target, prop, {
				value,
				writable: true,
				enumerable: true,
				configurable: true
			});
		}
		function mergeDefs(...defs) {
			const mergedDescriptors = {};
			for (const def of defs) Object.assign(mergedDescriptors, Object.getOwnPropertyDescriptors(def));
			return Object.defineProperties({}, mergedDescriptors);
		}
		function esc(str) {
			return JSON.stringify(str);
		}
		function slugify(input) {
			return input.toLowerCase().trim().replace(/[^\w\s-]/g, "").replace(/[\s_-]+/g, "-").replace(/^-+|-+$/g, "");
		}
		const captureStackTrace = "captureStackTrace" in Error ? Error.captureStackTrace : (..._args) => {};
		function isObject(data) {
			return typeof data === "object" && data !== null && !Array.isArray(data);
		}
		const allowsEval = /* @__PURE__*/ cached(() => {
			if (globalConfig.jitless) return false;
			if (typeof navigator !== "undefined" && navigator?.userAgent?.includes("Cloudflare")) return false;
			try {
				new Function("");
				return true;
			} catch (_) {
				return false;
			}
		});
		function isPlainObject(o) {
			if (isObject(o) === false) return false;
			const ctor = o.constructor;
			if (ctor === void 0) return true;
			if (typeof ctor !== "function") return true;
			const prot = ctor.prototype;
			if (isObject(prot) === false) return false;
			if (Object.prototype.hasOwnProperty.call(prot, "isPrototypeOf") === false) return false;
			return true;
		}
		function shallowClone(o) {
			if (isPlainObject(o)) return { ...o };
			if (Array.isArray(o)) return [...o];
			if (o instanceof Map) return new Map(o);
			if (o instanceof Set) return new Set(o);
			return o;
		}
		const propertyKeyTypes = /* @__PURE__*/ new Set([
			"string",
			"number",
			"symbol"
		]);
		function escapeRegex(str) {
			return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
		}
		function clone(inst, def, params) {
			const cl = new inst._zod.constr(def ?? inst._zod.def);
			if (!def || params?.parent) cl._zod.parent = inst;
			return cl;
		}
		function normalizeParams(_params) {
			const params = _params;
			if (!params) return {};
			if (typeof params === "string") return { error: () => params };
			if (params?.message !== void 0) {
				if (params?.error !== void 0) throw new Error("Cannot specify both `message` and `error` params");
				params.error = params.message;
			}
			delete params.message;
			if (typeof params.error === "string") return {
				...params,
				error: () => params.error
			};
			return params;
		}
		function optionalKeys(shape) {
			return Object.keys(shape).filter((k) => {
				return shape[k]._zod.optin === "optional" && shape[k]._zod.optout === "optional";
			});
		}
		const NUMBER_FORMAT_RANGES = {
			safeint: [Number.MIN_SAFE_INTEGER, Number.MAX_SAFE_INTEGER],
			int32: [-2147483648, 2147483647],
			uint32: [0, 4294967295],
			float32: [-34028234663852886e22, 34028234663852886e22],
			float64: [-Number.MAX_VALUE, Number.MAX_VALUE]
		};
		function pick$1(schema, mask) {
			const currDef = schema._zod.def;
			const checks = currDef.checks;
			if (checks && checks.length > 0) throw new Error(".pick() cannot be used on object schemas containing refinements");
			return clone(schema, mergeDefs(schema._zod.def, {
				get shape() {
					const newShape = {};
					for (const key in mask) {
						if (!(key in currDef.shape)) throw new Error(`Unrecognized key: "${key}"`);
						if (!mask[key]) continue;
						newShape[key] = currDef.shape[key];
					}
					assignProp(this, "shape", newShape);
					return newShape;
				},
				checks: []
			}));
		}
		function omit(schema, mask) {
			const currDef = schema._zod.def;
			const checks = currDef.checks;
			if (checks && checks.length > 0) throw new Error(".omit() cannot be used on object schemas containing refinements");
			return clone(schema, mergeDefs(schema._zod.def, {
				get shape() {
					const newShape = { ...schema._zod.def.shape };
					for (const key in mask) {
						if (!(key in currDef.shape)) throw new Error(`Unrecognized key: "${key}"`);
						if (!mask[key]) continue;
						delete newShape[key];
					}
					assignProp(this, "shape", newShape);
					return newShape;
				},
				checks: []
			}));
		}
		function extend(schema, shape) {
			if (!isPlainObject(shape)) throw new Error("Invalid input to extend: expected a plain object");
			const checks = schema._zod.def.checks;
			if (checks && checks.length > 0) {
				const existingShape = schema._zod.def.shape;
				for (const key in shape) if (Object.getOwnPropertyDescriptor(existingShape, key) !== void 0) throw new Error("Cannot overwrite keys on object schemas containing refinements. Use `.safeExtend()` instead.");
			}
			return clone(schema, mergeDefs(schema._zod.def, { get shape() {
				const _shape = {
					...schema._zod.def.shape,
					...shape
				};
				assignProp(this, "shape", _shape);
				return _shape;
			} }));
		}
		function safeExtend(schema, shape) {
			if (!isPlainObject(shape)) throw new Error("Invalid input to safeExtend: expected a plain object");
			return clone(schema, mergeDefs(schema._zod.def, { get shape() {
				const _shape = {
					...schema._zod.def.shape,
					...shape
				};
				assignProp(this, "shape", _shape);
				return _shape;
			} }));
		}
		function merge(a, b) {
			if (a._zod.def.checks?.length) throw new Error(".merge() cannot be used on object schemas containing refinements. Use .safeExtend() instead.");
			return clone(a, mergeDefs(a._zod.def, {
				get shape() {
					const _shape = {
						...a._zod.def.shape,
						...b._zod.def.shape
					};
					assignProp(this, "shape", _shape);
					return _shape;
				},
				get catchall() {
					return b._zod.def.catchall;
				},
				checks: b._zod.def.checks ?? []
			}));
		}
		function partial(Class, schema, mask) {
			const checks = schema._zod.def.checks;
			if (checks && checks.length > 0) throw new Error(".partial() cannot be used on object schemas containing refinements");
			return clone(schema, mergeDefs(schema._zod.def, {
				get shape() {
					const oldShape = schema._zod.def.shape;
					const shape = { ...oldShape };
					if (mask) for (const key in mask) {
						if (!(key in oldShape)) throw new Error(`Unrecognized key: "${key}"`);
						if (!mask[key]) continue;
						shape[key] = Class ? new Class({
							type: "optional",
							innerType: oldShape[key]
						}) : oldShape[key];
					}
					else for (const key in oldShape) shape[key] = Class ? new Class({
						type: "optional",
						innerType: oldShape[key]
					}) : oldShape[key];
					assignProp(this, "shape", shape);
					return shape;
				},
				checks: []
			}));
		}
		function required(Class, schema, mask) {
			return clone(schema, mergeDefs(schema._zod.def, { get shape() {
				const oldShape = schema._zod.def.shape;
				const shape = { ...oldShape };
				if (mask) for (const key in mask) {
					if (!(key in shape)) throw new Error(`Unrecognized key: "${key}"`);
					if (!mask[key]) continue;
					shape[key] = new Class({
						type: "nonoptional",
						innerType: oldShape[key]
					});
				}
				else for (const key in oldShape) shape[key] = new Class({
					type: "nonoptional",
					innerType: oldShape[key]
				});
				assignProp(this, "shape", shape);
				return shape;
			} }));
		}
		function aborted(x, startIndex = 0) {
			if (x.aborted === true) return true;
			for (let i = startIndex; i < x.issues.length; i++) if (x.issues[i]?.continue !== true) return true;
			return false;
		}
		function explicitlyAborted(x, startIndex = 0) {
			if (x.aborted === true) return true;
			for (let i = startIndex; i < x.issues.length; i++) if (x.issues[i]?.continue === false) return true;
			return false;
		}
		function prefixIssues(path, issues) {
			return issues.map((iss) => {
				var _a;
				(_a = iss).path ?? (_a.path = []);
				iss.path.unshift(path);
				return iss;
			});
		}
		function unwrapMessage(message) {
			return typeof message === "string" ? message : message?.message;
		}
		function finalizeIssue(iss, ctx, config) {
			const message = iss.message ? iss.message : unwrapMessage(iss.inst?._zod.def?.error?.(iss)) ?? unwrapMessage(ctx?.error?.(iss)) ?? unwrapMessage(config.customError?.(iss)) ?? unwrapMessage(config.localeError?.(iss)) ?? "Invalid input";
			const { inst: _inst, continue: _continue, input: _input, ...rest } = iss;
			rest.path ?? (rest.path = []);
			rest.message = message;
			if (ctx?.reportInput) rest.input = _input;
			return rest;
		}
		function getLengthableOrigin(input) {
			if (Array.isArray(input)) return "array";
			if (typeof input === "string") return "string";
			return "unknown";
		}
		function issue(...args) {
			const [iss, input, inst] = args;
			if (typeof iss === "string") return {
				message: iss,
				code: "custom",
				input,
				inst
			};
			return { ...iss };
		}
		//#endregion
		//#region ../../../node_modules/.pnpm/zod@4.4.3/node_modules/zod/v4/core/errors.js
		const initializer$1 = (inst, def) => {
			inst.name = "$ZodError";
			Object.defineProperty(inst, "_zod", {
				value: inst._zod,
				enumerable: false
			});
			Object.defineProperty(inst, "issues", {
				value: def,
				enumerable: false
			});
			inst.message = JSON.stringify(def, jsonStringifyReplacer, 2);
			Object.defineProperty(inst, "toString", {
				value: () => inst.message,
				enumerable: false
			});
		};
		const $ZodError = $constructor("$ZodError", initializer$1);
		const $ZodRealError = $constructor("$ZodError", initializer$1, { Parent: Error });
		function flattenError(error, mapper = (issue) => issue.message) {
			const fieldErrors = {};
			const formErrors = [];
			for (const sub of error.issues) if (sub.path.length > 0) {
				fieldErrors[sub.path[0]] = fieldErrors[sub.path[0]] || [];
				fieldErrors[sub.path[0]].push(mapper(sub));
			} else formErrors.push(mapper(sub));
			return {
				formErrors,
				fieldErrors
			};
		}
		function formatError(error, mapper = (issue) => issue.message) {
			const fieldErrors = { _errors: [] };
			const processError = (error, path = []) => {
				for (const issue of error.issues) if (issue.code === "invalid_union" && issue.errors.length) issue.errors.map((issues) => processError({ issues }, [...path, ...issue.path]));
				else if (issue.code === "invalid_key") processError({ issues: issue.issues }, [...path, ...issue.path]);
				else if (issue.code === "invalid_element") processError({ issues: issue.issues }, [...path, ...issue.path]);
				else {
					const fullpath = [...path, ...issue.path];
					if (fullpath.length === 0) fieldErrors._errors.push(mapper(issue));
					else {
						let curr = fieldErrors;
						let i = 0;
						while (i < fullpath.length) {
							const el = fullpath[i];
							if (!(i === fullpath.length - 1)) curr[el] = curr[el] || { _errors: [] };
							else {
								curr[el] = curr[el] || { _errors: [] };
								curr[el]._errors.push(mapper(issue));
							}
							curr = curr[el];
							i++;
						}
					}
				}
			};
			processError(error);
			return fieldErrors;
		}
		//#endregion
		//#region ../../../node_modules/.pnpm/zod@4.4.3/node_modules/zod/v4/core/parse.js
		const _parse = (_Err) => (schema, value, _ctx, _params) => {
			const ctx = _ctx ? {
				..._ctx,
				async: false
			} : { async: false };
			const result = schema._zod.run({
				value,
				issues: []
			}, ctx);
			if (result instanceof Promise) throw new $ZodAsyncError();
			if (result.issues.length) {
				const e = new ((_params?.Err) ?? _Err)(result.issues.map((iss) => finalizeIssue(iss, ctx, config())));
				captureStackTrace(e, _params?.callee);
				throw e;
			}
			return result.value;
		};
		const _parseAsync = (_Err) => async (schema, value, _ctx, params) => {
			const ctx = _ctx ? {
				..._ctx,
				async: true
			} : { async: true };
			let result = schema._zod.run({
				value,
				issues: []
			}, ctx);
			if (result instanceof Promise) result = await result;
			if (result.issues.length) {
				const e = new ((params?.Err) ?? _Err)(result.issues.map((iss) => finalizeIssue(iss, ctx, config())));
				captureStackTrace(e, params?.callee);
				throw e;
			}
			return result.value;
		};
		const _safeParse = (_Err) => (schema, value, _ctx) => {
			const ctx = _ctx ? {
				..._ctx,
				async: false
			} : { async: false };
			const result = schema._zod.run({
				value,
				issues: []
			}, ctx);
			if (result instanceof Promise) throw new $ZodAsyncError();
			return result.issues.length ? {
				success: false,
				error: new (_Err ?? $ZodError)(result.issues.map((iss) => finalizeIssue(iss, ctx, config())))
			} : {
				success: true,
				data: result.value
			};
		};
		const safeParse$1 = /* @__PURE__*/ _safeParse($ZodRealError);
		const _safeParseAsync = (_Err) => async (schema, value, _ctx) => {
			const ctx = _ctx ? {
				..._ctx,
				async: true
			} : { async: true };
			let result = schema._zod.run({
				value,
				issues: []
			}, ctx);
			if (result instanceof Promise) result = await result;
			return result.issues.length ? {
				success: false,
				error: new _Err(result.issues.map((iss) => finalizeIssue(iss, ctx, config())))
			} : {
				success: true,
				data: result.value
			};
		};
		const safeParseAsync$1 = /* @__PURE__*/ _safeParseAsync($ZodRealError);
		const _encode = (_Err) => (schema, value, _ctx) => {
			const ctx = _ctx ? {
				..._ctx,
				direction: "backward"
			} : { direction: "backward" };
			return _parse(_Err)(schema, value, ctx);
		};
		const _decode = (_Err) => (schema, value, _ctx) => {
			return _parse(_Err)(schema, value, _ctx);
		};
		const _encodeAsync = (_Err) => async (schema, value, _ctx) => {
			const ctx = _ctx ? {
				..._ctx,
				direction: "backward"
			} : { direction: "backward" };
			return _parseAsync(_Err)(schema, value, ctx);
		};
		const _decodeAsync = (_Err) => async (schema, value, _ctx) => {
			return _parseAsync(_Err)(schema, value, _ctx);
		};
		const _safeEncode = (_Err) => (schema, value, _ctx) => {
			const ctx = _ctx ? {
				..._ctx,
				direction: "backward"
			} : { direction: "backward" };
			return _safeParse(_Err)(schema, value, ctx);
		};
		const _safeDecode = (_Err) => (schema, value, _ctx) => {
			return _safeParse(_Err)(schema, value, _ctx);
		};
		const _safeEncodeAsync = (_Err) => async (schema, value, _ctx) => {
			const ctx = _ctx ? {
				..._ctx,
				direction: "backward"
			} : { direction: "backward" };
			return _safeParseAsync(_Err)(schema, value, ctx);
		};
		const _safeDecodeAsync = (_Err) => async (schema, value, _ctx) => {
			return _safeParseAsync(_Err)(schema, value, _ctx);
		};
		//#endregion
		//#region ../../../node_modules/.pnpm/zod@4.4.3/node_modules/zod/v4/core/regexes.js
		/**
		* @deprecated CUID v1 is deprecated by its authors due to information leakage
		* (timestamps embedded in the id). Use {@link cuid2} instead.
		* See https://github.com/paralleldrive/cuid.
		*/
		const cuid = /^[cC][0-9a-z]{6,}$/;
		const cuid2 = /^[0-9a-z]+$/;
		const ulid = /^[0-9A-HJKMNP-TV-Za-hjkmnp-tv-z]{26}$/;
		const xid = /^[0-9a-vA-V]{20}$/;
		const ksuid = /^[A-Za-z0-9]{27}$/;
		const nanoid = /^[a-zA-Z0-9_-]{21}$/;
		/** ISO 8601-1 duration regex. Does not support the 8601-2 extensions like negative durations or fractional/negative components. */
		const duration$1 = /^P(?:(\d+W)|(?!.*W)(?=\d|T\d)(\d+Y)?(\d+M)?(\d+D)?(T(?=\d)(\d+H)?(\d+M)?(\d+([.,]\d+)?S)?)?)$/;
		/** A regex for any UUID-like identifier: 8-4-4-4-12 hex pattern */
		const guid = /^([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12})$/;
		/** Returns a regex for validating an RFC 9562/4122 UUID.
		*
		* @param version Optionally specify a version 1-8. If no version is specified, all versions are supported. */
		const uuid = (version) => {
			if (!version) return /^([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-8][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}|00000000-0000-0000-0000-000000000000|ffffffff-ffff-ffff-ffff-ffffffffffff)$/;
			return new RegExp(`^([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-${version}[0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12})$`);
		};
		/** Practical email validation */
		const email = /^(?!\.)(?!.*\.\.)([A-Za-z0-9_'+\-\.]*)[A-Za-z0-9_+-]@([A-Za-z0-9][A-Za-z0-9\-]*\.)+[A-Za-z]{2,}$/;
		const _emoji$1 = `^(\\p{Extended_Pictographic}|\\p{Emoji_Component})+$`;
		function emoji() {
			return new RegExp(_emoji$1, "u");
		}
		const ipv4 = /^(?:(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])\.){3}(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])$/;
		const ipv6 = /^(([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,7}:|([0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,5}(:[0-9a-fA-F]{1,4}){1,2}|([0-9a-fA-F]{1,4}:){1,4}(:[0-9a-fA-F]{1,4}){1,3}|([0-9a-fA-F]{1,4}:){1,3}(:[0-9a-fA-F]{1,4}){1,4}|([0-9a-fA-F]{1,4}:){1,2}(:[0-9a-fA-F]{1,4}){1,5}|[0-9a-fA-F]{1,4}:((:[0-9a-fA-F]{1,4}){1,6})|:((:[0-9a-fA-F]{1,4}){1,7}|:))$/;
		const cidrv4 = /^((25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])\.){3}(25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])\/([0-9]|[1-2][0-9]|3[0-2])$/;
		const cidrv6 = /^(([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}|::|([0-9a-fA-F]{1,4})?::([0-9a-fA-F]{1,4}:?){0,6})\/(12[0-8]|1[01][0-9]|[1-9]?[0-9])$/;
		const base64 = /^$|^(?:[0-9a-zA-Z+/]{4})*(?:(?:[0-9a-zA-Z+/]{2}==)|(?:[0-9a-zA-Z+/]{3}=))?$/;
		const base64url = /^[A-Za-z0-9_-]*$/;
		const httpProtocol = /^https?$/;
		const e164 = /^\+[1-9]\d{6,14}$/;
		const dateSource = `(?:(?:\\d\\d[2468][048]|\\d\\d[13579][26]|\\d\\d0[48]|[02468][048]00|[13579][26]00)-02-29|\\d{4}-(?:(?:0[13578]|1[02])-(?:0[1-9]|[12]\\d|3[01])|(?:0[469]|11)-(?:0[1-9]|[12]\\d|30)|(?:02)-(?:0[1-9]|1\\d|2[0-8])))`;
		const date$1 = /*@__PURE__*/ new RegExp(`^${dateSource}$`);
		function timeSource(args) {
			const hhmm = `(?:[01]\\d|2[0-3]):[0-5]\\d`;
			return typeof args.precision === "number" ? args.precision === -1 ? `${hhmm}` : args.precision === 0 ? `${hhmm}:[0-5]\\d` : `${hhmm}:[0-5]\\d\\.\\d{${args.precision}}` : `${hhmm}(?::[0-5]\\d(?:\\.\\d+)?)?`;
		}
		function time$1(args) {
			return new RegExp(`^${timeSource(args)}$`);
		}
		function datetime$1(args) {
			const time = timeSource({ precision: args.precision });
			const opts = ["Z"];
			if (args.local) opts.push("");
			if (args.offset) opts.push(`([+-](?:[01]\\d|2[0-3]):[0-5]\\d)`);
			const timeRegex = `${time}(?:${opts.join("|")})`;
			return new RegExp(`^${dateSource}T(?:${timeRegex})$`);
		}
		const string$1 = (params) => {
			const regex = params ? `[\\s\\S]{${params?.minimum ?? 0},${params?.maximum ?? ""}}` : `[\\s\\S]*`;
			return new RegExp(`^${regex}$`);
		};
		const integer = /^-?\d+$/;
		const number$1 = /^-?\d+(?:\.\d+)?$/;
		const boolean$1 = /^(?:true|false)$/i;
		const _undefined$2 = /^undefined$/i;
		const lowercase = /^[^A-Z]*$/;
		const uppercase = /^[^a-z]*$/;
		//#endregion
		//#region ../../../node_modules/.pnpm/zod@4.4.3/node_modules/zod/v4/core/checks.js
		const $ZodCheck = /*@__PURE__*/ $constructor("$ZodCheck", (inst, def) => {
			var _a;
			inst._zod ?? (inst._zod = {});
			inst._zod.def = def;
			(_a = inst._zod).onattach ?? (_a.onattach = []);
		});
		const numericOriginMap = {
			number: "number",
			bigint: "bigint",
			object: "date"
		};
		const $ZodCheckLessThan = /*@__PURE__*/ $constructor("$ZodCheckLessThan", (inst, def) => {
			$ZodCheck.init(inst, def);
			const origin = numericOriginMap[typeof def.value];
			inst._zod.onattach.push((inst) => {
				const bag = inst._zod.bag;
				const curr = (def.inclusive ? bag.maximum : bag.exclusiveMaximum) ?? Number.POSITIVE_INFINITY;
				if (def.value < curr) if (def.inclusive) bag.maximum = def.value;
				else bag.exclusiveMaximum = def.value;
			});
			inst._zod.check = (payload) => {
				if (def.inclusive ? payload.value <= def.value : payload.value < def.value) return;
				payload.issues.push({
					origin,
					code: "too_big",
					maximum: typeof def.value === "object" ? def.value.getTime() : def.value,
					input: payload.value,
					inclusive: def.inclusive,
					inst,
					continue: !def.abort
				});
			};
		});
		const $ZodCheckGreaterThan = /*@__PURE__*/ $constructor("$ZodCheckGreaterThan", (inst, def) => {
			$ZodCheck.init(inst, def);
			const origin = numericOriginMap[typeof def.value];
			inst._zod.onattach.push((inst) => {
				const bag = inst._zod.bag;
				const curr = (def.inclusive ? bag.minimum : bag.exclusiveMinimum) ?? Number.NEGATIVE_INFINITY;
				if (def.value > curr) if (def.inclusive) bag.minimum = def.value;
				else bag.exclusiveMinimum = def.value;
			});
			inst._zod.check = (payload) => {
				if (def.inclusive ? payload.value >= def.value : payload.value > def.value) return;
				payload.issues.push({
					origin,
					code: "too_small",
					minimum: typeof def.value === "object" ? def.value.getTime() : def.value,
					input: payload.value,
					inclusive: def.inclusive,
					inst,
					continue: !def.abort
				});
			};
		});
		const $ZodCheckMultipleOf = /*@__PURE__*/ $constructor("$ZodCheckMultipleOf", (inst, def) => {
			$ZodCheck.init(inst, def);
			inst._zod.onattach.push((inst) => {
				var _a;
				(_a = inst._zod.bag).multipleOf ?? (_a.multipleOf = def.value);
			});
			inst._zod.check = (payload) => {
				if (typeof payload.value !== typeof def.value) throw new Error("Cannot mix number and bigint in multiple_of check.");
				if (typeof payload.value === "bigint" ? payload.value % def.value === BigInt(0) : floatSafeRemainder(payload.value, def.value) === 0) return;
				payload.issues.push({
					origin: typeof payload.value,
					code: "not_multiple_of",
					divisor: def.value,
					input: payload.value,
					inst,
					continue: !def.abort
				});
			};
		});
		const $ZodCheckNumberFormat = /*@__PURE__*/ $constructor("$ZodCheckNumberFormat", (inst, def) => {
			$ZodCheck.init(inst, def);
			def.format = def.format || "float64";
			const isInt = def.format?.includes("int");
			const origin = isInt ? "int" : "number";
			const [minimum, maximum] = NUMBER_FORMAT_RANGES[def.format];
			inst._zod.onattach.push((inst) => {
				const bag = inst._zod.bag;
				bag.format = def.format;
				bag.minimum = minimum;
				bag.maximum = maximum;
				if (isInt) bag.pattern = integer;
			});
			inst._zod.check = (payload) => {
				const input = payload.value;
				if (isInt) {
					if (!Number.isInteger(input)) {
						payload.issues.push({
							expected: origin,
							format: def.format,
							code: "invalid_type",
							continue: false,
							input,
							inst
						});
						return;
					}
					if (!Number.isSafeInteger(input)) {
						if (input > 0) payload.issues.push({
							input,
							code: "too_big",
							maximum: Number.MAX_SAFE_INTEGER,
							note: "Integers must be within the safe integer range.",
							inst,
							origin,
							inclusive: true,
							continue: !def.abort
						});
						else payload.issues.push({
							input,
							code: "too_small",
							minimum: Number.MIN_SAFE_INTEGER,
							note: "Integers must be within the safe integer range.",
							inst,
							origin,
							inclusive: true,
							continue: !def.abort
						});
						return;
					}
				}
				if (input < minimum) payload.issues.push({
					origin: "number",
					input,
					code: "too_small",
					minimum,
					inclusive: true,
					inst,
					continue: !def.abort
				});
				if (input > maximum) payload.issues.push({
					origin: "number",
					input,
					code: "too_big",
					maximum,
					inclusive: true,
					inst,
					continue: !def.abort
				});
			};
		});
		const $ZodCheckMaxLength = /*@__PURE__*/ $constructor("$ZodCheckMaxLength", (inst, def) => {
			var _a;
			$ZodCheck.init(inst, def);
			(_a = inst._zod.def).when ?? (_a.when = (payload) => {
				const val = payload.value;
				return !nullish(val) && val.length !== void 0;
			});
			inst._zod.onattach.push((inst) => {
				const curr = inst._zod.bag.maximum ?? Number.POSITIVE_INFINITY;
				if (def.maximum < curr) inst._zod.bag.maximum = def.maximum;
			});
			inst._zod.check = (payload) => {
				const input = payload.value;
				if (input.length <= def.maximum) return;
				const origin = getLengthableOrigin(input);
				payload.issues.push({
					origin,
					code: "too_big",
					maximum: def.maximum,
					inclusive: true,
					input,
					inst,
					continue: !def.abort
				});
			};
		});
		const $ZodCheckMinLength = /*@__PURE__*/ $constructor("$ZodCheckMinLength", (inst, def) => {
			var _a;
			$ZodCheck.init(inst, def);
			(_a = inst._zod.def).when ?? (_a.when = (payload) => {
				const val = payload.value;
				return !nullish(val) && val.length !== void 0;
			});
			inst._zod.onattach.push((inst) => {
				const curr = inst._zod.bag.minimum ?? Number.NEGATIVE_INFINITY;
				if (def.minimum > curr) inst._zod.bag.minimum = def.minimum;
			});
			inst._zod.check = (payload) => {
				const input = payload.value;
				if (input.length >= def.minimum) return;
				const origin = getLengthableOrigin(input);
				payload.issues.push({
					origin,
					code: "too_small",
					minimum: def.minimum,
					inclusive: true,
					input,
					inst,
					continue: !def.abort
				});
			};
		});
		const $ZodCheckLengthEquals = /*@__PURE__*/ $constructor("$ZodCheckLengthEquals", (inst, def) => {
			var _a;
			$ZodCheck.init(inst, def);
			(_a = inst._zod.def).when ?? (_a.when = (payload) => {
				const val = payload.value;
				return !nullish(val) && val.length !== void 0;
			});
			inst._zod.onattach.push((inst) => {
				const bag = inst._zod.bag;
				bag.minimum = def.length;
				bag.maximum = def.length;
				bag.length = def.length;
			});
			inst._zod.check = (payload) => {
				const input = payload.value;
				const length = input.length;
				if (length === def.length) return;
				const origin = getLengthableOrigin(input);
				const tooBig = length > def.length;
				payload.issues.push({
					origin,
					...tooBig ? {
						code: "too_big",
						maximum: def.length
					} : {
						code: "too_small",
						minimum: def.length
					},
					inclusive: true,
					exact: true,
					input: payload.value,
					inst,
					continue: !def.abort
				});
			};
		});
		const $ZodCheckStringFormat = /*@__PURE__*/ $constructor("$ZodCheckStringFormat", (inst, def) => {
			var _a, _b;
			$ZodCheck.init(inst, def);
			inst._zod.onattach.push((inst) => {
				const bag = inst._zod.bag;
				bag.format = def.format;
				if (def.pattern) {
					bag.patterns ?? (bag.patterns = /* @__PURE__ */ new Set());
					bag.patterns.add(def.pattern);
				}
			});
			if (def.pattern) (_a = inst._zod).check ?? (_a.check = (payload) => {
				def.pattern.lastIndex = 0;
				if (def.pattern.test(payload.value)) return;
				payload.issues.push({
					origin: "string",
					code: "invalid_format",
					format: def.format,
					input: payload.value,
					...def.pattern ? { pattern: def.pattern.toString() } : {},
					inst,
					continue: !def.abort
				});
			});
			else (_b = inst._zod).check ?? (_b.check = () => {});
		});
		const $ZodCheckRegex = /*@__PURE__*/ $constructor("$ZodCheckRegex", (inst, def) => {
			$ZodCheckStringFormat.init(inst, def);
			inst._zod.check = (payload) => {
				def.pattern.lastIndex = 0;
				if (def.pattern.test(payload.value)) return;
				payload.issues.push({
					origin: "string",
					code: "invalid_format",
					format: "regex",
					input: payload.value,
					pattern: def.pattern.toString(),
					inst,
					continue: !def.abort
				});
			};
		});
		const $ZodCheckLowerCase = /*@__PURE__*/ $constructor("$ZodCheckLowerCase", (inst, def) => {
			def.pattern ?? (def.pattern = lowercase);
			$ZodCheckStringFormat.init(inst, def);
		});
		const $ZodCheckUpperCase = /*@__PURE__*/ $constructor("$ZodCheckUpperCase", (inst, def) => {
			def.pattern ?? (def.pattern = uppercase);
			$ZodCheckStringFormat.init(inst, def);
		});
		const $ZodCheckIncludes = /*@__PURE__*/ $constructor("$ZodCheckIncludes", (inst, def) => {
			$ZodCheck.init(inst, def);
			const escapedRegex = escapeRegex(def.includes);
			const pattern = new RegExp(typeof def.position === "number" ? `^.{${def.position}}${escapedRegex}` : escapedRegex);
			def.pattern = pattern;
			inst._zod.onattach.push((inst) => {
				const bag = inst._zod.bag;
				bag.patterns ?? (bag.patterns = /* @__PURE__ */ new Set());
				bag.patterns.add(pattern);
			});
			inst._zod.check = (payload) => {
				if (payload.value.includes(def.includes, def.position)) return;
				payload.issues.push({
					origin: "string",
					code: "invalid_format",
					format: "includes",
					includes: def.includes,
					input: payload.value,
					inst,
					continue: !def.abort
				});
			};
		});
		const $ZodCheckStartsWith = /*@__PURE__*/ $constructor("$ZodCheckStartsWith", (inst, def) => {
			$ZodCheck.init(inst, def);
			const pattern = new RegExp(`^${escapeRegex(def.prefix)}.*`);
			def.pattern ?? (def.pattern = pattern);
			inst._zod.onattach.push((inst) => {
				const bag = inst._zod.bag;
				bag.patterns ?? (bag.patterns = /* @__PURE__ */ new Set());
				bag.patterns.add(pattern);
			});
			inst._zod.check = (payload) => {
				if (payload.value.startsWith(def.prefix)) return;
				payload.issues.push({
					origin: "string",
					code: "invalid_format",
					format: "starts_with",
					prefix: def.prefix,
					input: payload.value,
					inst,
					continue: !def.abort
				});
			};
		});
		const $ZodCheckEndsWith = /*@__PURE__*/ $constructor("$ZodCheckEndsWith", (inst, def) => {
			$ZodCheck.init(inst, def);
			const pattern = new RegExp(`.*${escapeRegex(def.suffix)}$`);
			def.pattern ?? (def.pattern = pattern);
			inst._zod.onattach.push((inst) => {
				const bag = inst._zod.bag;
				bag.patterns ?? (bag.patterns = /* @__PURE__ */ new Set());
				bag.patterns.add(pattern);
			});
			inst._zod.check = (payload) => {
				if (payload.value.endsWith(def.suffix)) return;
				payload.issues.push({
					origin: "string",
					code: "invalid_format",
					format: "ends_with",
					suffix: def.suffix,
					input: payload.value,
					inst,
					continue: !def.abort
				});
			};
		});
		const $ZodCheckOverwrite = /*@__PURE__*/ $constructor("$ZodCheckOverwrite", (inst, def) => {
			$ZodCheck.init(inst, def);
			inst._zod.check = (payload) => {
				payload.value = def.tx(payload.value);
			};
		});
		//#endregion
		//#region ../../../node_modules/.pnpm/zod@4.4.3/node_modules/zod/v4/core/doc.js
		var Doc = class {
			constructor(args = []) {
				this.content = [];
				this.indent = 0;
				if (this) this.args = args;
			}
			indented(fn) {
				this.indent += 1;
				fn(this);
				this.indent -= 1;
			}
			write(arg) {
				if (typeof arg === "function") {
					arg(this, { execution: "sync" });
					arg(this, { execution: "async" });
					return;
				}
				const lines = arg.split("\n").filter((x) => x);
				const minIndent = Math.min(...lines.map((x) => x.length - x.trimStart().length));
				const dedented = lines.map((x) => x.slice(minIndent)).map((x) => " ".repeat(this.indent * 2) + x);
				for (const line of dedented) this.content.push(line);
			}
			compile() {
				const F = Function;
				const args = this?.args;
				const lines = [...(this?.content ?? [``]).map((x) => `  ${x}`)];
				return new F(...args, lines.join("\n"));
			}
		};
		//#endregion
		//#region ../../../node_modules/.pnpm/zod@4.4.3/node_modules/zod/v4/core/versions.js
		const version = {
			major: 4,
			minor: 4,
			patch: 3
		};
		//#endregion
		//#region ../../../node_modules/.pnpm/zod@4.4.3/node_modules/zod/v4/core/schemas.js
		const $ZodType = /*@__PURE__*/ $constructor("$ZodType", (inst, def) => {
			var _a;
			inst ?? (inst = {});
			inst._zod.def = def;
			inst._zod.bag = inst._zod.bag || {};
			inst._zod.version = version;
			const checks = [...inst._zod.def.checks ?? []];
			if (inst._zod.traits.has("$ZodCheck")) checks.unshift(inst);
			for (const ch of checks) for (const fn of ch._zod.onattach) fn(inst);
			if (checks.length === 0) {
				(_a = inst._zod).deferred ?? (_a.deferred = []);
				inst._zod.deferred?.push(() => {
					inst._zod.run = inst._zod.parse;
				});
			} else {
				const runChecks = (payload, checks, ctx) => {
					let isAborted = aborted(payload);
					let asyncResult;
					for (const ch of checks) {
						if (ch._zod.def.when) {
							if (explicitlyAborted(payload)) continue;
							if (!ch._zod.def.when(payload)) continue;
						} else if (isAborted) continue;
						const currLen = payload.issues.length;
						const _ = ch._zod.check(payload);
						if (_ instanceof Promise && ctx?.async === false) throw new $ZodAsyncError();
						if (asyncResult || _ instanceof Promise) asyncResult = (asyncResult ?? Promise.resolve()).then(async () => {
							await _;
							if (payload.issues.length === currLen) return;
							if (!isAborted) isAborted = aborted(payload, currLen);
						});
						else {
							if (payload.issues.length === currLen) continue;
							if (!isAborted) isAborted = aborted(payload, currLen);
						}
					}
					if (asyncResult) return asyncResult.then(() => {
						return payload;
					});
					return payload;
				};
				const handleCanaryResult = (canary, payload, ctx) => {
					if (aborted(canary)) {
						canary.aborted = true;
						return canary;
					}
					const checkResult = runChecks(payload, checks, ctx);
					if (checkResult instanceof Promise) {
						if (ctx.async === false) throw new $ZodAsyncError();
						return checkResult.then((checkResult) => inst._zod.parse(checkResult, ctx));
					}
					return inst._zod.parse(checkResult, ctx);
				};
				inst._zod.run = (payload, ctx) => {
					if (ctx.skipChecks) return inst._zod.parse(payload, ctx);
					if (ctx.direction === "backward") {
						const canary = inst._zod.parse({
							value: payload.value,
							issues: []
						}, {
							...ctx,
							skipChecks: true
						});
						if (canary instanceof Promise) return canary.then((canary) => {
							return handleCanaryResult(canary, payload, ctx);
						});
						return handleCanaryResult(canary, payload, ctx);
					}
					const result = inst._zod.parse(payload, ctx);
					if (result instanceof Promise) {
						if (ctx.async === false) throw new $ZodAsyncError();
						return result.then((result) => runChecks(result, checks, ctx));
					}
					return runChecks(result, checks, ctx);
				};
			}
			defineLazy(inst, "~standard", () => ({
				validate: (value) => {
					try {
						const r = safeParse$1(inst, value);
						return r.success ? { value: r.data } : { issues: r.error?.issues };
					} catch (_) {
						return safeParseAsync$1(inst, value).then((r) => r.success ? { value: r.data } : { issues: r.error?.issues });
					}
				},
				vendor: "zod",
				version: 1
			}));
		});
		const $ZodString = /*@__PURE__*/ $constructor("$ZodString", (inst, def) => {
			$ZodType.init(inst, def);
			inst._zod.pattern = [...inst?._zod.bag?.patterns ?? []].pop() ?? string$1(inst._zod.bag);
			inst._zod.parse = (payload, _) => {
				if (def.coerce) try {
					payload.value = String(payload.value);
				} catch (_) {}
				if (typeof payload.value === "string") return payload;
				payload.issues.push({
					expected: "string",
					code: "invalid_type",
					input: payload.value,
					inst
				});
				return payload;
			};
		});
		const $ZodStringFormat = /*@__PURE__*/ $constructor("$ZodStringFormat", (inst, def) => {
			$ZodCheckStringFormat.init(inst, def);
			$ZodString.init(inst, def);
		});
		const $ZodGUID = /*@__PURE__*/ $constructor("$ZodGUID", (inst, def) => {
			def.pattern ?? (def.pattern = guid);
			$ZodStringFormat.init(inst, def);
		});
		const $ZodUUID = /*@__PURE__*/ $constructor("$ZodUUID", (inst, def) => {
			if (def.version) {
				const v = {
					v1: 1,
					v2: 2,
					v3: 3,
					v4: 4,
					v5: 5,
					v6: 6,
					v7: 7,
					v8: 8
				}[def.version];
				if (v === void 0) throw new Error(`Invalid UUID version: "${def.version}"`);
				def.pattern ?? (def.pattern = uuid(v));
			} else def.pattern ?? (def.pattern = uuid());
			$ZodStringFormat.init(inst, def);
		});
		const $ZodEmail = /*@__PURE__*/ $constructor("$ZodEmail", (inst, def) => {
			def.pattern ?? (def.pattern = email);
			$ZodStringFormat.init(inst, def);
		});
		const $ZodURL = /*@__PURE__*/ $constructor("$ZodURL", (inst, def) => {
			$ZodStringFormat.init(inst, def);
			inst._zod.check = (payload) => {
				try {
					const trimmed = payload.value.trim();
					if (!def.normalize && def.protocol?.source === httpProtocol.source) {
						if (!/^https?:\/\//i.test(trimmed)) {
							payload.issues.push({
								code: "invalid_format",
								format: "url",
								note: "Invalid URL format",
								input: payload.value,
								inst,
								continue: !def.abort
							});
							return;
						}
					}
					const url = new URL(trimmed);
					if (def.hostname) {
						def.hostname.lastIndex = 0;
						if (!def.hostname.test(url.hostname)) payload.issues.push({
							code: "invalid_format",
							format: "url",
							note: "Invalid hostname",
							pattern: def.hostname.source,
							input: payload.value,
							inst,
							continue: !def.abort
						});
					}
					if (def.protocol) {
						def.protocol.lastIndex = 0;
						if (!def.protocol.test(url.protocol.endsWith(":") ? url.protocol.slice(0, -1) : url.protocol)) payload.issues.push({
							code: "invalid_format",
							format: "url",
							note: "Invalid protocol",
							pattern: def.protocol.source,
							input: payload.value,
							inst,
							continue: !def.abort
						});
					}
					if (def.normalize) payload.value = url.href;
					else payload.value = trimmed;
					return;
				} catch (_) {
					payload.issues.push({
						code: "invalid_format",
						format: "url",
						input: payload.value,
						inst,
						continue: !def.abort
					});
				}
			};
		});
		const $ZodEmoji = /*@__PURE__*/ $constructor("$ZodEmoji", (inst, def) => {
			def.pattern ?? (def.pattern = emoji());
			$ZodStringFormat.init(inst, def);
		});
		const $ZodNanoID = /*@__PURE__*/ $constructor("$ZodNanoID", (inst, def) => {
			def.pattern ?? (def.pattern = nanoid);
			$ZodStringFormat.init(inst, def);
		});
		/**
		* @deprecated CUID v1 is deprecated by its authors due to information leakage
		* (timestamps embedded in the id). Use {@link $ZodCUID2} instead.
		* See https://github.com/paralleldrive/cuid.
		*/
		const $ZodCUID = /*@__PURE__*/ $constructor("$ZodCUID", (inst, def) => {
			def.pattern ?? (def.pattern = cuid);
			$ZodStringFormat.init(inst, def);
		});
		const $ZodCUID2 = /*@__PURE__*/ $constructor("$ZodCUID2", (inst, def) => {
			def.pattern ?? (def.pattern = cuid2);
			$ZodStringFormat.init(inst, def);
		});
		const $ZodULID = /*@__PURE__*/ $constructor("$ZodULID", (inst, def) => {
			def.pattern ?? (def.pattern = ulid);
			$ZodStringFormat.init(inst, def);
		});
		const $ZodXID = /*@__PURE__*/ $constructor("$ZodXID", (inst, def) => {
			def.pattern ?? (def.pattern = xid);
			$ZodStringFormat.init(inst, def);
		});
		const $ZodKSUID = /*@__PURE__*/ $constructor("$ZodKSUID", (inst, def) => {
			def.pattern ?? (def.pattern = ksuid);
			$ZodStringFormat.init(inst, def);
		});
		const $ZodISODateTime = /*@__PURE__*/ $constructor("$ZodISODateTime", (inst, def) => {
			def.pattern ?? (def.pattern = datetime$1(def));
			$ZodStringFormat.init(inst, def);
		});
		const $ZodISODate = /*@__PURE__*/ $constructor("$ZodISODate", (inst, def) => {
			def.pattern ?? (def.pattern = date$1);
			$ZodStringFormat.init(inst, def);
		});
		const $ZodISOTime = /*@__PURE__*/ $constructor("$ZodISOTime", (inst, def) => {
			def.pattern ?? (def.pattern = time$1(def));
			$ZodStringFormat.init(inst, def);
		});
		const $ZodISODuration = /*@__PURE__*/ $constructor("$ZodISODuration", (inst, def) => {
			def.pattern ?? (def.pattern = duration$1);
			$ZodStringFormat.init(inst, def);
		});
		const $ZodIPv4 = /*@__PURE__*/ $constructor("$ZodIPv4", (inst, def) => {
			def.pattern ?? (def.pattern = ipv4);
			$ZodStringFormat.init(inst, def);
			inst._zod.bag.format = `ipv4`;
		});
		const $ZodIPv6 = /*@__PURE__*/ $constructor("$ZodIPv6", (inst, def) => {
			def.pattern ?? (def.pattern = ipv6);
			$ZodStringFormat.init(inst, def);
			inst._zod.bag.format = `ipv6`;
			inst._zod.check = (payload) => {
				try {
					new URL(`http://[${payload.value}]`);
				} catch {
					payload.issues.push({
						code: "invalid_format",
						format: "ipv6",
						input: payload.value,
						inst,
						continue: !def.abort
					});
				}
			};
		});
		const $ZodCIDRv4 = /*@__PURE__*/ $constructor("$ZodCIDRv4", (inst, def) => {
			def.pattern ?? (def.pattern = cidrv4);
			$ZodStringFormat.init(inst, def);
		});
		const $ZodCIDRv6 = /*@__PURE__*/ $constructor("$ZodCIDRv6", (inst, def) => {
			def.pattern ?? (def.pattern = cidrv6);
			$ZodStringFormat.init(inst, def);
			inst._zod.check = (payload) => {
				const parts = payload.value.split("/");
				try {
					if (parts.length !== 2) throw new Error();
					const [address, prefix] = parts;
					if (!prefix) throw new Error();
					const prefixNum = Number(prefix);
					if (`${prefixNum}` !== prefix) throw new Error();
					if (prefixNum < 0 || prefixNum > 128) throw new Error();
					new URL(`http://[${address}]`);
				} catch {
					payload.issues.push({
						code: "invalid_format",
						format: "cidrv6",
						input: payload.value,
						inst,
						continue: !def.abort
					});
				}
			};
		});
		function isValidBase64(data) {
			if (data === "") return true;
			if (/\s/.test(data)) return false;
			if (data.length % 4 !== 0) return false;
			try {
				atob(data);
				return true;
			} catch {
				return false;
			}
		}
		const $ZodBase64 = /*@__PURE__*/ $constructor("$ZodBase64", (inst, def) => {
			def.pattern ?? (def.pattern = base64);
			$ZodStringFormat.init(inst, def);
			inst._zod.bag.contentEncoding = "base64";
			inst._zod.check = (payload) => {
				if (isValidBase64(payload.value)) return;
				payload.issues.push({
					code: "invalid_format",
					format: "base64",
					input: payload.value,
					inst,
					continue: !def.abort
				});
			};
		});
		function isValidBase64URL(data) {
			if (!base64url.test(data)) return false;
			const base64 = data.replace(/[-_]/g, (c) => c === "-" ? "+" : "/");
			return isValidBase64(base64.padEnd(Math.ceil(base64.length / 4) * 4, "="));
		}
		const $ZodBase64URL = /*@__PURE__*/ $constructor("$ZodBase64URL", (inst, def) => {
			def.pattern ?? (def.pattern = base64url);
			$ZodStringFormat.init(inst, def);
			inst._zod.bag.contentEncoding = "base64url";
			inst._zod.check = (payload) => {
				if (isValidBase64URL(payload.value)) return;
				payload.issues.push({
					code: "invalid_format",
					format: "base64url",
					input: payload.value,
					inst,
					continue: !def.abort
				});
			};
		});
		const $ZodE164 = /*@__PURE__*/ $constructor("$ZodE164", (inst, def) => {
			def.pattern ?? (def.pattern = e164);
			$ZodStringFormat.init(inst, def);
		});
		function isValidJWT(token, algorithm = null) {
			try {
				const tokensParts = token.split(".");
				if (tokensParts.length !== 3) return false;
				const [header] = tokensParts;
				if (!header) return false;
				const parsedHeader = JSON.parse(atob(header));
				if ("typ" in parsedHeader && parsedHeader?.typ !== "JWT") return false;
				if (!parsedHeader.alg) return false;
				if (algorithm && (!("alg" in parsedHeader) || parsedHeader.alg !== algorithm)) return false;
				return true;
			} catch {
				return false;
			}
		}
		const $ZodJWT = /*@__PURE__*/ $constructor("$ZodJWT", (inst, def) => {
			$ZodStringFormat.init(inst, def);
			inst._zod.check = (payload) => {
				if (isValidJWT(payload.value, def.alg)) return;
				payload.issues.push({
					code: "invalid_format",
					format: "jwt",
					input: payload.value,
					inst,
					continue: !def.abort
				});
			};
		});
		const $ZodNumber = /*@__PURE__*/ $constructor("$ZodNumber", (inst, def) => {
			$ZodType.init(inst, def);
			inst._zod.pattern = inst._zod.bag.pattern ?? number$1;
			inst._zod.parse = (payload, _ctx) => {
				if (def.coerce) try {
					payload.value = Number(payload.value);
				} catch (_) {}
				const input = payload.value;
				if (typeof input === "number" && !Number.isNaN(input) && Number.isFinite(input)) return payload;
				const received = typeof input === "number" ? Number.isNaN(input) ? "NaN" : !Number.isFinite(input) ? "Infinity" : void 0 : void 0;
				payload.issues.push({
					expected: "number",
					code: "invalid_type",
					input,
					inst,
					...received ? { received } : {}
				});
				return payload;
			};
		});
		const $ZodNumberFormat = /*@__PURE__*/ $constructor("$ZodNumberFormat", (inst, def) => {
			$ZodCheckNumberFormat.init(inst, def);
			$ZodNumber.init(inst, def);
		});
		const $ZodBoolean = /*@__PURE__*/ $constructor("$ZodBoolean", (inst, def) => {
			$ZodType.init(inst, def);
			inst._zod.pattern = boolean$1;
			inst._zod.parse = (payload, _ctx) => {
				if (def.coerce) try {
					payload.value = Boolean(payload.value);
				} catch (_) {}
				const input = payload.value;
				if (typeof input === "boolean") return payload;
				payload.issues.push({
					expected: "boolean",
					code: "invalid_type",
					input,
					inst
				});
				return payload;
			};
		});
		const $ZodUndefined = /*@__PURE__*/ $constructor("$ZodUndefined", (inst, def) => {
			$ZodType.init(inst, def);
			inst._zod.pattern = _undefined$2;
			inst._zod.values = new Set([void 0]);
			inst._zod.parse = (payload, _ctx) => {
				const input = payload.value;
				if (typeof input === "undefined") return payload;
				payload.issues.push({
					expected: "undefined",
					code: "invalid_type",
					input,
					inst
				});
				return payload;
			};
		});
		const $ZodUnknown = /*@__PURE__*/ $constructor("$ZodUnknown", (inst, def) => {
			$ZodType.init(inst, def);
			inst._zod.parse = (payload) => payload;
		});
		const $ZodNever = /*@__PURE__*/ $constructor("$ZodNever", (inst, def) => {
			$ZodType.init(inst, def);
			inst._zod.parse = (payload, _ctx) => {
				payload.issues.push({
					expected: "never",
					code: "invalid_type",
					input: payload.value,
					inst
				});
				return payload;
			};
		});
		const $ZodVoid = /*@__PURE__*/ $constructor("$ZodVoid", (inst, def) => {
			$ZodType.init(inst, def);
			inst._zod.parse = (payload, _ctx) => {
				const input = payload.value;
				if (typeof input === "undefined") return payload;
				payload.issues.push({
					expected: "void",
					code: "invalid_type",
					input,
					inst
				});
				return payload;
			};
		});
		function handleArrayResult(result, final, index) {
			if (result.issues.length) final.issues.push(...prefixIssues(index, result.issues));
			final.value[index] = result.value;
		}
		const $ZodArray = /*@__PURE__*/ $constructor("$ZodArray", (inst, def) => {
			$ZodType.init(inst, def);
			inst._zod.parse = (payload, ctx) => {
				const input = payload.value;
				if (!Array.isArray(input)) {
					payload.issues.push({
						expected: "array",
						code: "invalid_type",
						input,
						inst
					});
					return payload;
				}
				payload.value = Array(input.length);
				const proms = [];
				for (let i = 0; i < input.length; i++) {
					const item = input[i];
					const result = def.element._zod.run({
						value: item,
						issues: []
					}, ctx);
					if (result instanceof Promise) proms.push(result.then((result) => handleArrayResult(result, payload, i)));
					else handleArrayResult(result, payload, i);
				}
				if (proms.length) return Promise.all(proms).then(() => payload);
				return payload;
			};
		});
		function handlePropertyResult(result, final, key, input, isOptionalIn, isOptionalOut) {
			const isPresent = key in input;
			if (result.issues.length) {
				if (isOptionalIn && isOptionalOut && !isPresent) return;
				final.issues.push(...prefixIssues(key, result.issues));
			}
			if (!isPresent && !isOptionalIn) {
				if (!result.issues.length) final.issues.push({
					code: "invalid_type",
					expected: "nonoptional",
					input: void 0,
					path: [key]
				});
				return;
			}
			if (result.value === void 0) {
				if (isPresent) final.value[key] = void 0;
			} else final.value[key] = result.value;
		}
		function normalizeDef(def) {
			const keys = Object.keys(def.shape);
			for (const k of keys) if (!def.shape?.[k]?._zod?.traits?.has("$ZodType")) throw new Error(`Invalid element at key "${k}": expected a Zod schema`);
			const okeys = optionalKeys(def.shape);
			return {
				...def,
				keys,
				keySet: new Set(keys),
				numKeys: keys.length,
				optionalKeys: new Set(okeys)
			};
		}
		function handleCatchall(proms, input, payload, ctx, def, inst) {
			const unrecognized = [];
			const keySet = def.keySet;
			const _catchall = def.catchall._zod;
			const t = _catchall.def.type;
			const isOptionalIn = _catchall.optin === "optional";
			const isOptionalOut = _catchall.optout === "optional";
			for (const key in input) {
				if (key === "__proto__") continue;
				if (keySet.has(key)) continue;
				if (t === "never") {
					unrecognized.push(key);
					continue;
				}
				const r = _catchall.run({
					value: input[key],
					issues: []
				}, ctx);
				if (r instanceof Promise) proms.push(r.then((r) => handlePropertyResult(r, payload, key, input, isOptionalIn, isOptionalOut)));
				else handlePropertyResult(r, payload, key, input, isOptionalIn, isOptionalOut);
			}
			if (unrecognized.length) payload.issues.push({
				code: "unrecognized_keys",
				keys: unrecognized,
				input,
				inst
			});
			if (!proms.length) return payload;
			return Promise.all(proms).then(() => {
				return payload;
			});
		}
		const $ZodObject = /*@__PURE__*/ $constructor("$ZodObject", (inst, def) => {
			$ZodType.init(inst, def);
			if (!Object.getOwnPropertyDescriptor(def, "shape")?.get) {
				const sh = def.shape;
				Object.defineProperty(def, "shape", { get: () => {
					const newSh = { ...sh };
					Object.defineProperty(def, "shape", { value: newSh });
					return newSh;
				} });
			}
			const _normalized = cached(() => normalizeDef(def));
			defineLazy(inst._zod, "propValues", () => {
				const shape = def.shape;
				const propValues = {};
				for (const key in shape) {
					const field = shape[key]._zod;
					if (field.values) {
						propValues[key] ?? (propValues[key] = /* @__PURE__ */ new Set());
						for (const v of field.values) propValues[key].add(v);
					}
				}
				return propValues;
			});
			const isObject$1 = isObject;
			const catchall = def.catchall;
			let value;
			inst._zod.parse = (payload, ctx) => {
				value ?? (value = _normalized.value);
				const input = payload.value;
				if (!isObject$1(input)) {
					payload.issues.push({
						expected: "object",
						code: "invalid_type",
						input,
						inst
					});
					return payload;
				}
				payload.value = {};
				const proms = [];
				const shape = value.shape;
				for (const key of value.keys) {
					const el = shape[key];
					const isOptionalIn = el._zod.optin === "optional";
					const isOptionalOut = el._zod.optout === "optional";
					const r = el._zod.run({
						value: input[key],
						issues: []
					}, ctx);
					if (r instanceof Promise) proms.push(r.then((r) => handlePropertyResult(r, payload, key, input, isOptionalIn, isOptionalOut)));
					else handlePropertyResult(r, payload, key, input, isOptionalIn, isOptionalOut);
				}
				if (!catchall) return proms.length ? Promise.all(proms).then(() => payload) : payload;
				return handleCatchall(proms, input, payload, ctx, _normalized.value, inst);
			};
		});
		const $ZodObjectJIT = /*@__PURE__*/ $constructor("$ZodObjectJIT", (inst, def) => {
			$ZodObject.init(inst, def);
			const superParse = inst._zod.parse;
			const _normalized = cached(() => normalizeDef(def));
			const generateFastpass = (shape) => {
				const doc = new Doc([
					"shape",
					"payload",
					"ctx"
				]);
				const normalized = _normalized.value;
				const parseStr = (key) => {
					const k = esc(key);
					return `shape[${k}]._zod.run({ value: input[${k}], issues: [] }, ctx)`;
				};
				doc.write(`const input = payload.value;`);
				const ids = Object.create(null);
				let counter = 0;
				for (const key of normalized.keys) ids[key] = `key_${counter++}`;
				doc.write(`const newResult = {};`);
				for (const key of normalized.keys) {
					const id = ids[key];
					const k = esc(key);
					const schema = shape[key];
					const isOptionalIn = schema?._zod?.optin === "optional";
					const isOptionalOut = schema?._zod?.optout === "optional";
					doc.write(`const ${id} = ${parseStr(key)};`);
					if (isOptionalIn && isOptionalOut) doc.write(`
        if (${id}.issues.length) {
          if (${k} in input) {
            payload.issues = payload.issues.concat(${id}.issues.map(iss => ({
              ...iss,
              path: iss.path ? [${k}, ...iss.path] : [${k}]
            })));
          }
        }
        
        if (${id}.value === undefined) {
          if (${k} in input) {
            newResult[${k}] = undefined;
          }
        } else {
          newResult[${k}] = ${id}.value;
        }
        
      `);
					else if (!isOptionalIn) doc.write(`
        const ${id}_present = ${k} in input;
        if (${id}.issues.length) {
          payload.issues = payload.issues.concat(${id}.issues.map(iss => ({
            ...iss,
            path: iss.path ? [${k}, ...iss.path] : [${k}]
          })));
        }
        if (!${id}_present && !${id}.issues.length) {
          payload.issues.push({
            code: "invalid_type",
            expected: "nonoptional",
            input: undefined,
            path: [${k}]
          });
        }

        if (${id}_present) {
          if (${id}.value === undefined) {
            newResult[${k}] = undefined;
          } else {
            newResult[${k}] = ${id}.value;
          }
        }

      `);
					else doc.write(`
        if (${id}.issues.length) {
          payload.issues = payload.issues.concat(${id}.issues.map(iss => ({
            ...iss,
            path: iss.path ? [${k}, ...iss.path] : [${k}]
          })));
        }
        
        if (${id}.value === undefined) {
          if (${k} in input) {
            newResult[${k}] = undefined;
          }
        } else {
          newResult[${k}] = ${id}.value;
        }
        
      `);
				}
				doc.write(`payload.value = newResult;`);
				doc.write(`return payload;`);
				const fn = doc.compile();
				return (payload, ctx) => fn(shape, payload, ctx);
			};
			let fastpass;
			const isObject$2 = isObject;
			const jit = !globalConfig.jitless;
			const fastEnabled = jit && allowsEval.value;
			const catchall = def.catchall;
			let value;
			inst._zod.parse = (payload, ctx) => {
				value ?? (value = _normalized.value);
				const input = payload.value;
				if (!isObject$2(input)) {
					payload.issues.push({
						expected: "object",
						code: "invalid_type",
						input,
						inst
					});
					return payload;
				}
				if (jit && fastEnabled && ctx?.async === false && ctx.jitless !== true) {
					if (!fastpass) fastpass = generateFastpass(def.shape);
					payload = fastpass(payload, ctx);
					if (!catchall) return payload;
					return handleCatchall([], input, payload, ctx, value, inst);
				}
				return superParse(payload, ctx);
			};
		});
		function handleUnionResults(results, final, inst, ctx) {
			for (const result of results) if (result.issues.length === 0) {
				final.value = result.value;
				return final;
			}
			const nonaborted = results.filter((r) => !aborted(r));
			if (nonaborted.length === 1) {
				final.value = nonaborted[0].value;
				return nonaborted[0];
			}
			final.issues.push({
				code: "invalid_union",
				input: final.value,
				inst,
				errors: results.map((result) => result.issues.map((iss) => finalizeIssue(iss, ctx, config())))
			});
			return final;
		}
		const $ZodUnion = /*@__PURE__*/ $constructor("$ZodUnion", (inst, def) => {
			$ZodType.init(inst, def);
			defineLazy(inst._zod, "optin", () => def.options.some((o) => o._zod.optin === "optional") ? "optional" : void 0);
			defineLazy(inst._zod, "optout", () => def.options.some((o) => o._zod.optout === "optional") ? "optional" : void 0);
			defineLazy(inst._zod, "values", () => {
				if (def.options.every((o) => o._zod.values)) return new Set(def.options.flatMap((option) => Array.from(option._zod.values)));
			});
			defineLazy(inst._zod, "pattern", () => {
				if (def.options.every((o) => o._zod.pattern)) {
					const patterns = def.options.map((o) => o._zod.pattern);
					return new RegExp(`^(${patterns.map((p) => cleanRegex(p.source)).join("|")})$`);
				}
			});
			const first = def.options.length === 1 ? def.options[0]._zod.run : null;
			inst._zod.parse = (payload, ctx) => {
				if (first) return first(payload, ctx);
				let async = false;
				const results = [];
				for (const option of def.options) {
					const result = option._zod.run({
						value: payload.value,
						issues: []
					}, ctx);
					if (result instanceof Promise) {
						results.push(result);
						async = true;
					} else {
						if (result.issues.length === 0) return result;
						results.push(result);
					}
				}
				if (!async) return handleUnionResults(results, payload, inst, ctx);
				return Promise.all(results).then((results) => {
					return handleUnionResults(results, payload, inst, ctx);
				});
			};
		});
		const $ZodIntersection = /*@__PURE__*/ $constructor("$ZodIntersection", (inst, def) => {
			$ZodType.init(inst, def);
			inst._zod.parse = (payload, ctx) => {
				const input = payload.value;
				const left = def.left._zod.run({
					value: input,
					issues: []
				}, ctx);
				const right = def.right._zod.run({
					value: input,
					issues: []
				}, ctx);
				if (left instanceof Promise || right instanceof Promise) return Promise.all([left, right]).then(([left, right]) => {
					return handleIntersectionResults(payload, left, right);
				});
				return handleIntersectionResults(payload, left, right);
			};
		});
		function mergeValues(a, b) {
			if (a === b) return {
				valid: true,
				data: a
			};
			if (a instanceof Date && b instanceof Date && +a === +b) return {
				valid: true,
				data: a
			};
			if (isPlainObject(a) && isPlainObject(b)) {
				const bKeys = Object.keys(b);
				const sharedKeys = Object.keys(a).filter((key) => bKeys.indexOf(key) !== -1);
				const newObj = {
					...a,
					...b
				};
				for (const key of sharedKeys) {
					const sharedValue = mergeValues(a[key], b[key]);
					if (!sharedValue.valid) return {
						valid: false,
						mergeErrorPath: [key, ...sharedValue.mergeErrorPath]
					};
					newObj[key] = sharedValue.data;
				}
				return {
					valid: true,
					data: newObj
				};
			}
			if (Array.isArray(a) && Array.isArray(b)) {
				if (a.length !== b.length) return {
					valid: false,
					mergeErrorPath: []
				};
				const newArray = [];
				for (let index = 0; index < a.length; index++) {
					const itemA = a[index];
					const itemB = b[index];
					const sharedValue = mergeValues(itemA, itemB);
					if (!sharedValue.valid) return {
						valid: false,
						mergeErrorPath: [index, ...sharedValue.mergeErrorPath]
					};
					newArray.push(sharedValue.data);
				}
				return {
					valid: true,
					data: newArray
				};
			}
			return {
				valid: false,
				mergeErrorPath: []
			};
		}
		function handleIntersectionResults(result, left, right) {
			const unrecKeys = /* @__PURE__ */ new Map();
			let unrecIssue;
			for (const iss of left.issues) if (iss.code === "unrecognized_keys") {
				unrecIssue ?? (unrecIssue = iss);
				for (const k of iss.keys) {
					if (!unrecKeys.has(k)) unrecKeys.set(k, {});
					unrecKeys.get(k).l = true;
				}
			} else result.issues.push(iss);
			for (const iss of right.issues) if (iss.code === "unrecognized_keys") for (const k of iss.keys) {
				if (!unrecKeys.has(k)) unrecKeys.set(k, {});
				unrecKeys.get(k).r = true;
			}
			else result.issues.push(iss);
			const bothKeys = [...unrecKeys].filter(([, f]) => f.l && f.r).map(([k]) => k);
			if (bothKeys.length && unrecIssue) result.issues.push({
				...unrecIssue,
				keys: bothKeys
			});
			if (aborted(result)) return result;
			const merged = mergeValues(left.value, right.value);
			if (!merged.valid) throw new Error(`Unmergable intersection. Error path: ${JSON.stringify(merged.mergeErrorPath)}`);
			result.value = merged.data;
			return result;
		}
		const $ZodRecord = /*@__PURE__*/ $constructor("$ZodRecord", (inst, def) => {
			$ZodType.init(inst, def);
			inst._zod.parse = (payload, ctx) => {
				const input = payload.value;
				if (!isPlainObject(input)) {
					payload.issues.push({
						expected: "record",
						code: "invalid_type",
						input,
						inst
					});
					return payload;
				}
				const proms = [];
				const values = def.keyType._zod.values;
				if (values) {
					payload.value = {};
					const recordKeys = /* @__PURE__ */ new Set();
					for (const key of values) if (typeof key === "string" || typeof key === "number" || typeof key === "symbol") {
						recordKeys.add(typeof key === "number" ? key.toString() : key);
						const keyResult = def.keyType._zod.run({
							value: key,
							issues: []
						}, ctx);
						if (keyResult instanceof Promise) throw new Error("Async schemas not supported in object keys currently");
						if (keyResult.issues.length) {
							payload.issues.push({
								code: "invalid_key",
								origin: "record",
								issues: keyResult.issues.map((iss) => finalizeIssue(iss, ctx, config())),
								input: key,
								path: [key],
								inst
							});
							continue;
						}
						const outKey = keyResult.value;
						const result = def.valueType._zod.run({
							value: input[key],
							issues: []
						}, ctx);
						if (result instanceof Promise) proms.push(result.then((result) => {
							if (result.issues.length) payload.issues.push(...prefixIssues(key, result.issues));
							payload.value[outKey] = result.value;
						}));
						else {
							if (result.issues.length) payload.issues.push(...prefixIssues(key, result.issues));
							payload.value[outKey] = result.value;
						}
					}
					let unrecognized;
					for (const key in input) if (!recordKeys.has(key)) {
						unrecognized = unrecognized ?? [];
						unrecognized.push(key);
					}
					if (unrecognized && unrecognized.length > 0) payload.issues.push({
						code: "unrecognized_keys",
						input,
						inst,
						keys: unrecognized
					});
				} else {
					payload.value = {};
					for (const key of Reflect.ownKeys(input)) {
						if (key === "__proto__") continue;
						if (!Object.prototype.propertyIsEnumerable.call(input, key)) continue;
						let keyResult = def.keyType._zod.run({
							value: key,
							issues: []
						}, ctx);
						if (keyResult instanceof Promise) throw new Error("Async schemas not supported in object keys currently");
						if (typeof key === "string" && number$1.test(key) && keyResult.issues.length) {
							const retryResult = def.keyType._zod.run({
								value: Number(key),
								issues: []
							}, ctx);
							if (retryResult instanceof Promise) throw new Error("Async schemas not supported in object keys currently");
							if (retryResult.issues.length === 0) keyResult = retryResult;
						}
						if (keyResult.issues.length) {
							if (def.mode === "loose") payload.value[key] = input[key];
							else payload.issues.push({
								code: "invalid_key",
								origin: "record",
								issues: keyResult.issues.map((iss) => finalizeIssue(iss, ctx, config())),
								input: key,
								path: [key],
								inst
							});
							continue;
						}
						const result = def.valueType._zod.run({
							value: input[key],
							issues: []
						}, ctx);
						if (result instanceof Promise) proms.push(result.then((result) => {
							if (result.issues.length) payload.issues.push(...prefixIssues(key, result.issues));
							payload.value[keyResult.value] = result.value;
						}));
						else {
							if (result.issues.length) payload.issues.push(...prefixIssues(key, result.issues));
							payload.value[keyResult.value] = result.value;
						}
					}
				}
				if (proms.length) return Promise.all(proms).then(() => payload);
				return payload;
			};
		});
		const $ZodEnum = /*@__PURE__*/ $constructor("$ZodEnum", (inst, def) => {
			$ZodType.init(inst, def);
			const values = getEnumValues(def.entries);
			const valuesSet = new Set(values);
			inst._zod.values = valuesSet;
			inst._zod.pattern = new RegExp(`^(${values.filter((k) => propertyKeyTypes.has(typeof k)).map((o) => typeof o === "string" ? escapeRegex(o) : o.toString()).join("|")})$`);
			inst._zod.parse = (payload, _ctx) => {
				const input = payload.value;
				if (valuesSet.has(input)) return payload;
				payload.issues.push({
					code: "invalid_value",
					values,
					input,
					inst
				});
				return payload;
			};
		});
		const $ZodLiteral = /*@__PURE__*/ $constructor("$ZodLiteral", (inst, def) => {
			$ZodType.init(inst, def);
			if (def.values.length === 0) throw new Error("Cannot create literal schema with no valid values");
			const values = new Set(def.values);
			inst._zod.values = values;
			inst._zod.pattern = new RegExp(`^(${def.values.map((o) => typeof o === "string" ? escapeRegex(o) : o ? escapeRegex(o.toString()) : String(o)).join("|")})$`);
			inst._zod.parse = (payload, _ctx) => {
				const input = payload.value;
				if (values.has(input)) return payload;
				payload.issues.push({
					code: "invalid_value",
					values: def.values,
					input,
					inst
				});
				return payload;
			};
		});
		const $ZodTransform = /*@__PURE__*/ $constructor("$ZodTransform", (inst, def) => {
			$ZodType.init(inst, def);
			inst._zod.optin = "optional";
			inst._zod.parse = (payload, ctx) => {
				if (ctx.direction === "backward") throw new $ZodEncodeError(inst.constructor.name);
				const _out = def.transform(payload.value, payload);
				if (ctx.async) return (_out instanceof Promise ? _out : Promise.resolve(_out)).then((output) => {
					payload.value = output;
					payload.fallback = true;
					return payload;
				});
				if (_out instanceof Promise) throw new $ZodAsyncError();
				payload.value = _out;
				payload.fallback = true;
				return payload;
			};
		});
		function handleOptionalResult(result, input) {
			if (input === void 0 && (result.issues.length || result.fallback)) return {
				issues: [],
				value: void 0
			};
			return result;
		}
		const $ZodOptional = /*@__PURE__*/ $constructor("$ZodOptional", (inst, def) => {
			$ZodType.init(inst, def);
			inst._zod.optin = "optional";
			inst._zod.optout = "optional";
			defineLazy(inst._zod, "values", () => {
				return def.innerType._zod.values ? new Set([...def.innerType._zod.values, void 0]) : void 0;
			});
			defineLazy(inst._zod, "pattern", () => {
				const pattern = def.innerType._zod.pattern;
				return pattern ? new RegExp(`^(${cleanRegex(pattern.source)})?$`) : void 0;
			});
			inst._zod.parse = (payload, ctx) => {
				if (def.innerType._zod.optin === "optional") {
					const input = payload.value;
					const result = def.innerType._zod.run(payload, ctx);
					if (result instanceof Promise) return result.then((r) => handleOptionalResult(r, input));
					return handleOptionalResult(result, input);
				}
				if (payload.value === void 0) return payload;
				return def.innerType._zod.run(payload, ctx);
			};
		});
		const $ZodExactOptional = /*@__PURE__*/ $constructor("$ZodExactOptional", (inst, def) => {
			$ZodOptional.init(inst, def);
			defineLazy(inst._zod, "values", () => def.innerType._zod.values);
			defineLazy(inst._zod, "pattern", () => def.innerType._zod.pattern);
			inst._zod.parse = (payload, ctx) => {
				return def.innerType._zod.run(payload, ctx);
			};
		});
		const $ZodNullable = /*@__PURE__*/ $constructor("$ZodNullable", (inst, def) => {
			$ZodType.init(inst, def);
			defineLazy(inst._zod, "optin", () => def.innerType._zod.optin);
			defineLazy(inst._zod, "optout", () => def.innerType._zod.optout);
			defineLazy(inst._zod, "pattern", () => {
				const pattern = def.innerType._zod.pattern;
				return pattern ? new RegExp(`^(${cleanRegex(pattern.source)}|null)$`) : void 0;
			});
			defineLazy(inst._zod, "values", () => {
				return def.innerType._zod.values ? new Set([...def.innerType._zod.values, null]) : void 0;
			});
			inst._zod.parse = (payload, ctx) => {
				if (payload.value === null) return payload;
				return def.innerType._zod.run(payload, ctx);
			};
		});
		const $ZodDefault = /*@__PURE__*/ $constructor("$ZodDefault", (inst, def) => {
			$ZodType.init(inst, def);
			inst._zod.optin = "optional";
			defineLazy(inst._zod, "values", () => def.innerType._zod.values);
			inst._zod.parse = (payload, ctx) => {
				if (ctx.direction === "backward") return def.innerType._zod.run(payload, ctx);
				if (payload.value === void 0) {
					payload.value = def.defaultValue;
					/**
					* $ZodDefault returns the default value immediately in forward direction.
					* It doesn't pass the default value into the validator ("prefault"). There's no reason to pass the default value through validation. The validity of the default is enforced by TypeScript statically. Otherwise, it's the responsibility of the user to ensure the default is valid. In the case of pipes with divergent in/out types, you can specify the default on the `in` schema of your ZodPipe to set a "prefault" for the pipe.   */
					return payload;
				}
				const result = def.innerType._zod.run(payload, ctx);
				if (result instanceof Promise) return result.then((result) => handleDefaultResult(result, def));
				return handleDefaultResult(result, def);
			};
		});
		function handleDefaultResult(payload, def) {
			if (payload.value === void 0) payload.value = def.defaultValue;
			return payload;
		}
		const $ZodPrefault = /*@__PURE__*/ $constructor("$ZodPrefault", (inst, def) => {
			$ZodType.init(inst, def);
			inst._zod.optin = "optional";
			defineLazy(inst._zod, "values", () => def.innerType._zod.values);
			inst._zod.parse = (payload, ctx) => {
				if (ctx.direction === "backward") return def.innerType._zod.run(payload, ctx);
				if (payload.value === void 0) payload.value = def.defaultValue;
				return def.innerType._zod.run(payload, ctx);
			};
		});
		const $ZodNonOptional = /*@__PURE__*/ $constructor("$ZodNonOptional", (inst, def) => {
			$ZodType.init(inst, def);
			defineLazy(inst._zod, "values", () => {
				const v = def.innerType._zod.values;
				return v ? new Set([...v].filter((x) => x !== void 0)) : void 0;
			});
			inst._zod.parse = (payload, ctx) => {
				const result = def.innerType._zod.run(payload, ctx);
				if (result instanceof Promise) return result.then((result) => handleNonOptionalResult(result, inst));
				return handleNonOptionalResult(result, inst);
			};
		});
		function handleNonOptionalResult(payload, inst) {
			if (!payload.issues.length && payload.value === void 0) payload.issues.push({
				code: "invalid_type",
				expected: "nonoptional",
				input: payload.value,
				inst
			});
			return payload;
		}
		const $ZodCatch = /*@__PURE__*/ $constructor("$ZodCatch", (inst, def) => {
			$ZodType.init(inst, def);
			inst._zod.optin = "optional";
			defineLazy(inst._zod, "optout", () => def.innerType._zod.optout);
			defineLazy(inst._zod, "values", () => def.innerType._zod.values);
			inst._zod.parse = (payload, ctx) => {
				if (ctx.direction === "backward") return def.innerType._zod.run(payload, ctx);
				const result = def.innerType._zod.run(payload, ctx);
				if (result instanceof Promise) return result.then((result) => {
					payload.value = result.value;
					if (result.issues.length) {
						payload.value = def.catchValue({
							...payload,
							error: { issues: result.issues.map((iss) => finalizeIssue(iss, ctx, config())) },
							input: payload.value
						});
						payload.issues = [];
						payload.fallback = true;
					}
					return payload;
				});
				payload.value = result.value;
				if (result.issues.length) {
					payload.value = def.catchValue({
						...payload,
						error: { issues: result.issues.map((iss) => finalizeIssue(iss, ctx, config())) },
						input: payload.value
					});
					payload.issues = [];
					payload.fallback = true;
				}
				return payload;
			};
		});
		const $ZodPipe = /*@__PURE__*/ $constructor("$ZodPipe", (inst, def) => {
			$ZodType.init(inst, def);
			defineLazy(inst._zod, "values", () => def.in._zod.values);
			defineLazy(inst._zod, "optin", () => def.in._zod.optin);
			defineLazy(inst._zod, "optout", () => def.out._zod.optout);
			defineLazy(inst._zod, "propValues", () => def.in._zod.propValues);
			inst._zod.parse = (payload, ctx) => {
				if (ctx.direction === "backward") {
					const right = def.out._zod.run(payload, ctx);
					if (right instanceof Promise) return right.then((right) => handlePipeResult(right, def.in, ctx));
					return handlePipeResult(right, def.in, ctx);
				}
				const left = def.in._zod.run(payload, ctx);
				if (left instanceof Promise) return left.then((left) => handlePipeResult(left, def.out, ctx));
				return handlePipeResult(left, def.out, ctx);
			};
		});
		function handlePipeResult(left, next, ctx) {
			if (left.issues.length) {
				left.aborted = true;
				return left;
			}
			return next._zod.run({
				value: left.value,
				issues: left.issues,
				fallback: left.fallback
			}, ctx);
		}
		const $ZodReadonly = /*@__PURE__*/ $constructor("$ZodReadonly", (inst, def) => {
			$ZodType.init(inst, def);
			defineLazy(inst._zod, "propValues", () => def.innerType._zod.propValues);
			defineLazy(inst._zod, "values", () => def.innerType._zod.values);
			defineLazy(inst._zod, "optin", () => def.innerType?._zod?.optin);
			defineLazy(inst._zod, "optout", () => def.innerType?._zod?.optout);
			inst._zod.parse = (payload, ctx) => {
				if (ctx.direction === "backward") return def.innerType._zod.run(payload, ctx);
				const result = def.innerType._zod.run(payload, ctx);
				if (result instanceof Promise) return result.then(handleReadonlyResult);
				return handleReadonlyResult(result);
			};
		});
		function handleReadonlyResult(payload) {
			payload.value = Object.freeze(payload.value);
			return payload;
		}
		const $ZodLazy = /*@__PURE__*/ $constructor("$ZodLazy", (inst, def) => {
			$ZodType.init(inst, def);
			defineLazy(inst._zod, "innerType", () => {
				const d = def;
				if (!d._cachedInner) d._cachedInner = def.getter();
				return d._cachedInner;
			});
			defineLazy(inst._zod, "pattern", () => inst._zod.innerType?._zod?.pattern);
			defineLazy(inst._zod, "propValues", () => inst._zod.innerType?._zod?.propValues);
			defineLazy(inst._zod, "optin", () => inst._zod.innerType?._zod?.optin ?? void 0);
			defineLazy(inst._zod, "optout", () => inst._zod.innerType?._zod?.optout ?? void 0);
			inst._zod.parse = (payload, ctx) => {
				return inst._zod.innerType._zod.run(payload, ctx);
			};
		});
		const $ZodCustom = /*@__PURE__*/ $constructor("$ZodCustom", (inst, def) => {
			$ZodCheck.init(inst, def);
			$ZodType.init(inst, def);
			inst._zod.parse = (payload, _) => {
				return payload;
			};
			inst._zod.check = (payload) => {
				const input = payload.value;
				const r = def.fn(input);
				if (r instanceof Promise) return r.then((r) => handleRefineResult(r, payload, input, inst));
				handleRefineResult(r, payload, input, inst);
			};
		});
		function handleRefineResult(result, payload, input, inst) {
			if (!result) {
				const _iss = {
					code: "custom",
					input,
					inst,
					path: [...inst._zod.def.path ?? []],
					continue: !inst._zod.def.abort
				};
				if (inst._zod.def.params) _iss.params = inst._zod.def.params;
				payload.issues.push(issue(_iss));
			}
		}
		//#endregion
		//#region ../../../node_modules/.pnpm/zod@4.4.3/node_modules/zod/v4/core/registries.js
		var _a;
		var $ZodRegistry = class {
			constructor() {
				this._map = /* @__PURE__ */ new WeakMap();
				this._idmap = /* @__PURE__ */ new Map();
			}
			add(schema, ..._meta) {
				const meta = _meta[0];
				this._map.set(schema, meta);
				if (meta && typeof meta === "object" && "id" in meta) this._idmap.set(meta.id, schema);
				return this;
			}
			clear() {
				this._map = /* @__PURE__ */ new WeakMap();
				this._idmap = /* @__PURE__ */ new Map();
				return this;
			}
			remove(schema) {
				const meta = this._map.get(schema);
				if (meta && typeof meta === "object" && "id" in meta) this._idmap.delete(meta.id);
				this._map.delete(schema);
				return this;
			}
			get(schema) {
				const p = schema._zod.parent;
				if (p) {
					const pm = { ...this.get(p) ?? {} };
					delete pm.id;
					const f = {
						...pm,
						...this._map.get(schema)
					};
					return Object.keys(f).length ? f : void 0;
				}
				return this._map.get(schema);
			}
			has(schema) {
				return this._map.has(schema);
			}
		};
		function registry() {
			return new $ZodRegistry();
		}
		(_a = globalThis).__zod_globalRegistry ?? (_a.__zod_globalRegistry = registry());
		const globalRegistry = globalThis.__zod_globalRegistry;
		//#endregion
		//#region ../../../node_modules/.pnpm/zod@4.4.3/node_modules/zod/v4/core/api.js
		// @__NO_SIDE_EFFECTS__
		function _string(Class, params) {
			return new Class({
				type: "string",
				...normalizeParams(params)
			});
		}
		// @__NO_SIDE_EFFECTS__
		function _email(Class, params) {
			return new Class({
				type: "string",
				format: "email",
				check: "string_format",
				abort: false,
				...normalizeParams(params)
			});
		}
		// @__NO_SIDE_EFFECTS__
		function _guid(Class, params) {
			return new Class({
				type: "string",
				format: "guid",
				check: "string_format",
				abort: false,
				...normalizeParams(params)
			});
		}
		// @__NO_SIDE_EFFECTS__
		function _uuid(Class, params) {
			return new Class({
				type: "string",
				format: "uuid",
				check: "string_format",
				abort: false,
				...normalizeParams(params)
			});
		}
		// @__NO_SIDE_EFFECTS__
		function _uuidv4(Class, params) {
			return new Class({
				type: "string",
				format: "uuid",
				check: "string_format",
				abort: false,
				version: "v4",
				...normalizeParams(params)
			});
		}
		// @__NO_SIDE_EFFECTS__
		function _uuidv6(Class, params) {
			return new Class({
				type: "string",
				format: "uuid",
				check: "string_format",
				abort: false,
				version: "v6",
				...normalizeParams(params)
			});
		}
		// @__NO_SIDE_EFFECTS__
		function _uuidv7(Class, params) {
			return new Class({
				type: "string",
				format: "uuid",
				check: "string_format",
				abort: false,
				version: "v7",
				...normalizeParams(params)
			});
		}
		// @__NO_SIDE_EFFECTS__
		function _url(Class, params) {
			return new Class({
				type: "string",
				format: "url",
				check: "string_format",
				abort: false,
				...normalizeParams(params)
			});
		}
		// @__NO_SIDE_EFFECTS__
		function _emoji(Class, params) {
			return new Class({
				type: "string",
				format: "emoji",
				check: "string_format",
				abort: false,
				...normalizeParams(params)
			});
		}
		// @__NO_SIDE_EFFECTS__
		function _nanoid(Class, params) {
			return new Class({
				type: "string",
				format: "nanoid",
				check: "string_format",
				abort: false,
				...normalizeParams(params)
			});
		}
		/**
		* @deprecated CUID v1 is deprecated by its authors due to information leakage
		* (timestamps embedded in the id). Use {@link _cuid2} instead.
		* See https://github.com/paralleldrive/cuid.
		*/
		// @__NO_SIDE_EFFECTS__
		function _cuid(Class, params) {
			return new Class({
				type: "string",
				format: "cuid",
				check: "string_format",
				abort: false,
				...normalizeParams(params)
			});
		}
		// @__NO_SIDE_EFFECTS__
		function _cuid2(Class, params) {
			return new Class({
				type: "string",
				format: "cuid2",
				check: "string_format",
				abort: false,
				...normalizeParams(params)
			});
		}
		// @__NO_SIDE_EFFECTS__
		function _ulid(Class, params) {
			return new Class({
				type: "string",
				format: "ulid",
				check: "string_format",
				abort: false,
				...normalizeParams(params)
			});
		}
		// @__NO_SIDE_EFFECTS__
		function _xid(Class, params) {
			return new Class({
				type: "string",
				format: "xid",
				check: "string_format",
				abort: false,
				...normalizeParams(params)
			});
		}
		// @__NO_SIDE_EFFECTS__
		function _ksuid(Class, params) {
			return new Class({
				type: "string",
				format: "ksuid",
				check: "string_format",
				abort: false,
				...normalizeParams(params)
			});
		}
		// @__NO_SIDE_EFFECTS__
		function _ipv4(Class, params) {
			return new Class({
				type: "string",
				format: "ipv4",
				check: "string_format",
				abort: false,
				...normalizeParams(params)
			});
		}
		// @__NO_SIDE_EFFECTS__
		function _ipv6(Class, params) {
			return new Class({
				type: "string",
				format: "ipv6",
				check: "string_format",
				abort: false,
				...normalizeParams(params)
			});
		}
		// @__NO_SIDE_EFFECTS__
		function _cidrv4(Class, params) {
			return new Class({
				type: "string",
				format: "cidrv4",
				check: "string_format",
				abort: false,
				...normalizeParams(params)
			});
		}
		// @__NO_SIDE_EFFECTS__
		function _cidrv6(Class, params) {
			return new Class({
				type: "string",
				format: "cidrv6",
				check: "string_format",
				abort: false,
				...normalizeParams(params)
			});
		}
		// @__NO_SIDE_EFFECTS__
		function _base64(Class, params) {
			return new Class({
				type: "string",
				format: "base64",
				check: "string_format",
				abort: false,
				...normalizeParams(params)
			});
		}
		// @__NO_SIDE_EFFECTS__
		function _base64url(Class, params) {
			return new Class({
				type: "string",
				format: "base64url",
				check: "string_format",
				abort: false,
				...normalizeParams(params)
			});
		}
		// @__NO_SIDE_EFFECTS__
		function _e164(Class, params) {
			return new Class({
				type: "string",
				format: "e164",
				check: "string_format",
				abort: false,
				...normalizeParams(params)
			});
		}
		// @__NO_SIDE_EFFECTS__
		function _jwt(Class, params) {
			return new Class({
				type: "string",
				format: "jwt",
				check: "string_format",
				abort: false,
				...normalizeParams(params)
			});
		}
		// @__NO_SIDE_EFFECTS__
		function _isoDateTime(Class, params) {
			return new Class({
				type: "string",
				format: "datetime",
				check: "string_format",
				offset: false,
				local: false,
				precision: null,
				...normalizeParams(params)
			});
		}
		// @__NO_SIDE_EFFECTS__
		function _isoDate(Class, params) {
			return new Class({
				type: "string",
				format: "date",
				check: "string_format",
				...normalizeParams(params)
			});
		}
		// @__NO_SIDE_EFFECTS__
		function _isoTime(Class, params) {
			return new Class({
				type: "string",
				format: "time",
				check: "string_format",
				precision: null,
				...normalizeParams(params)
			});
		}
		// @__NO_SIDE_EFFECTS__
		function _isoDuration(Class, params) {
			return new Class({
				type: "string",
				format: "duration",
				check: "string_format",
				...normalizeParams(params)
			});
		}
		// @__NO_SIDE_EFFECTS__
		function _number(Class, params) {
			return new Class({
				type: "number",
				checks: [],
				...normalizeParams(params)
			});
		}
		// @__NO_SIDE_EFFECTS__
		function _int(Class, params) {
			return new Class({
				type: "number",
				check: "number_format",
				abort: false,
				format: "safeint",
				...normalizeParams(params)
			});
		}
		// @__NO_SIDE_EFFECTS__
		function _boolean(Class, params) {
			return new Class({
				type: "boolean",
				...normalizeParams(params)
			});
		}
		// @__NO_SIDE_EFFECTS__
		function _undefined$1(Class, params) {
			return new Class({
				type: "undefined",
				...normalizeParams(params)
			});
		}
		// @__NO_SIDE_EFFECTS__
		function _unknown(Class) {
			return new Class({ type: "unknown" });
		}
		// @__NO_SIDE_EFFECTS__
		function _never(Class, params) {
			return new Class({
				type: "never",
				...normalizeParams(params)
			});
		}
		// @__NO_SIDE_EFFECTS__
		function _void$1(Class, params) {
			return new Class({
				type: "void",
				...normalizeParams(params)
			});
		}
		// @__NO_SIDE_EFFECTS__
		function _lt(value, params) {
			return new $ZodCheckLessThan({
				check: "less_than",
				...normalizeParams(params),
				value,
				inclusive: false
			});
		}
		// @__NO_SIDE_EFFECTS__
		function _lte(value, params) {
			return new $ZodCheckLessThan({
				check: "less_than",
				...normalizeParams(params),
				value,
				inclusive: true
			});
		}
		// @__NO_SIDE_EFFECTS__
		function _gt(value, params) {
			return new $ZodCheckGreaterThan({
				check: "greater_than",
				...normalizeParams(params),
				value,
				inclusive: false
			});
		}
		// @__NO_SIDE_EFFECTS__
		function _gte(value, params) {
			return new $ZodCheckGreaterThan({
				check: "greater_than",
				...normalizeParams(params),
				value,
				inclusive: true
			});
		}
		// @__NO_SIDE_EFFECTS__
		function _multipleOf(value, params) {
			return new $ZodCheckMultipleOf({
				check: "multiple_of",
				...normalizeParams(params),
				value
			});
		}
		// @__NO_SIDE_EFFECTS__
		function _maxLength(maximum, params) {
			return new $ZodCheckMaxLength({
				check: "max_length",
				...normalizeParams(params),
				maximum
			});
		}
		// @__NO_SIDE_EFFECTS__
		function _minLength(minimum, params) {
			return new $ZodCheckMinLength({
				check: "min_length",
				...normalizeParams(params),
				minimum
			});
		}
		// @__NO_SIDE_EFFECTS__
		function _length(length, params) {
			return new $ZodCheckLengthEquals({
				check: "length_equals",
				...normalizeParams(params),
				length
			});
		}
		// @__NO_SIDE_EFFECTS__
		function _regex(pattern, params) {
			return new $ZodCheckRegex({
				check: "string_format",
				format: "regex",
				...normalizeParams(params),
				pattern
			});
		}
		// @__NO_SIDE_EFFECTS__
		function _lowercase(params) {
			return new $ZodCheckLowerCase({
				check: "string_format",
				format: "lowercase",
				...normalizeParams(params)
			});
		}
		// @__NO_SIDE_EFFECTS__
		function _uppercase(params) {
			return new $ZodCheckUpperCase({
				check: "string_format",
				format: "uppercase",
				...normalizeParams(params)
			});
		}
		// @__NO_SIDE_EFFECTS__
		function _includes(includes, params) {
			return new $ZodCheckIncludes({
				check: "string_format",
				format: "includes",
				...normalizeParams(params),
				includes
			});
		}
		// @__NO_SIDE_EFFECTS__
		function _startsWith(prefix, params) {
			return new $ZodCheckStartsWith({
				check: "string_format",
				format: "starts_with",
				...normalizeParams(params),
				prefix
			});
		}
		// @__NO_SIDE_EFFECTS__
		function _endsWith(suffix, params) {
			return new $ZodCheckEndsWith({
				check: "string_format",
				format: "ends_with",
				...normalizeParams(params),
				suffix
			});
		}
		// @__NO_SIDE_EFFECTS__
		function _overwrite(tx) {
			return new $ZodCheckOverwrite({
				check: "overwrite",
				tx
			});
		}
		// @__NO_SIDE_EFFECTS__
		function _normalize(form) {
			return /* @__PURE__ */ _overwrite((input) => input.normalize(form));
		}
		// @__NO_SIDE_EFFECTS__
		function _trim() {
			return /* @__PURE__ */ _overwrite((input) => input.trim());
		}
		// @__NO_SIDE_EFFECTS__
		function _toLowerCase() {
			return /* @__PURE__ */ _overwrite((input) => input.toLowerCase());
		}
		// @__NO_SIDE_EFFECTS__
		function _toUpperCase() {
			return /* @__PURE__ */ _overwrite((input) => input.toUpperCase());
		}
		// @__NO_SIDE_EFFECTS__
		function _slugify() {
			return /* @__PURE__ */ _overwrite((input) => slugify(input));
		}
		// @__NO_SIDE_EFFECTS__
		function _array(Class, element, params) {
			return new Class({
				type: "array",
				element,
				...normalizeParams(params)
			});
		}
		// @__NO_SIDE_EFFECTS__
		function _refine(Class, fn, _params) {
			return new Class({
				type: "custom",
				check: "custom",
				fn,
				...normalizeParams(_params)
			});
		}
		// @__NO_SIDE_EFFECTS__
		function _superRefine(fn, params) {
			const ch = /* @__PURE__ */ _check((payload) => {
				payload.addIssue = (issue$2) => {
					if (typeof issue$2 === "string") payload.issues.push(issue(issue$2, payload.value, ch._zod.def));
					else {
						const _issue = issue$2;
						if (_issue.fatal) _issue.continue = false;
						_issue.code ?? (_issue.code = "custom");
						_issue.input ?? (_issue.input = payload.value);
						_issue.inst ?? (_issue.inst = ch);
						_issue.continue ?? (_issue.continue = !ch._zod.def.abort);
						payload.issues.push(issue(_issue));
					}
				};
				return fn(payload.value, payload);
			}, params);
			return ch;
		}
		// @__NO_SIDE_EFFECTS__
		function _check(fn, params) {
			const ch = new $ZodCheck({
				check: "custom",
				...normalizeParams(params)
			});
			ch._zod.check = fn;
			return ch;
		}
		//#endregion
		//#region ../../../node_modules/.pnpm/zod@4.4.3/node_modules/zod/v4/core/to-json-schema.js
		function initializeContext(params) {
			let target = params?.target ?? "draft-2020-12";
			if (target === "draft-4") target = "draft-04";
			if (target === "draft-7") target = "draft-07";
			return {
				processors: params.processors ?? {},
				metadataRegistry: params?.metadata ?? globalRegistry,
				target,
				unrepresentable: params?.unrepresentable ?? "throw",
				override: params?.override ?? (() => {}),
				io: params?.io ?? "output",
				counter: 0,
				seen: /* @__PURE__ */ new Map(),
				cycles: params?.cycles ?? "ref",
				reused: params?.reused ?? "inline",
				external: params?.external ?? void 0
			};
		}
		function process(schema, ctx, _params = {
			path: [],
			schemaPath: []
		}) {
			var _a;
			const def = schema._zod.def;
			const seen = ctx.seen.get(schema);
			if (seen) {
				seen.count++;
				if (_params.schemaPath.includes(schema)) seen.cycle = _params.path;
				return seen.schema;
			}
			const result = {
				schema: {},
				count: 1,
				cycle: void 0,
				path: _params.path
			};
			ctx.seen.set(schema, result);
			const overrideSchema = schema._zod.toJSONSchema?.();
			if (overrideSchema) result.schema = overrideSchema;
			else {
				const params = {
					..._params,
					schemaPath: [..._params.schemaPath, schema],
					path: _params.path
				};
				if (schema._zod.processJSONSchema) schema._zod.processJSONSchema(ctx, result.schema, params);
				else {
					const _json = result.schema;
					const processor = ctx.processors[def.type];
					if (!processor) throw new Error(`[toJSONSchema]: Non-representable type encountered: ${def.type}`);
					processor(schema, ctx, _json, params);
				}
				const parent = schema._zod.parent;
				if (parent) {
					if (!result.ref) result.ref = parent;
					process(parent, ctx, params);
					ctx.seen.get(parent).isParent = true;
				}
			}
			const meta = ctx.metadataRegistry.get(schema);
			if (meta) Object.assign(result.schema, meta);
			if (ctx.io === "input" && isTransforming(schema)) {
				delete result.schema.examples;
				delete result.schema.default;
			}
			if (ctx.io === "input" && "_prefault" in result.schema) (_a = result.schema).default ?? (_a.default = result.schema._prefault);
			delete result.schema._prefault;
			return ctx.seen.get(schema).schema;
		}
		function extractDefs(ctx, schema) {
			const root = ctx.seen.get(schema);
			if (!root) throw new Error("Unprocessed schema. This is a bug in Zod.");
			const idToSchema = /* @__PURE__ */ new Map();
			for (const entry of ctx.seen.entries()) {
				const id = ctx.metadataRegistry.get(entry[0])?.id;
				if (id) {
					const existing = idToSchema.get(id);
					if (existing && existing !== entry[0]) throw new Error(`Duplicate schema id "${id}" detected during JSON Schema conversion. Two different schemas cannot share the same id when converted together.`);
					idToSchema.set(id, entry[0]);
				}
			}
			const makeURI = (entry) => {
				const defsSegment = ctx.target === "draft-2020-12" ? "$defs" : "definitions";
				if (ctx.external) {
					const externalId = ctx.external.registry.get(entry[0])?.id;
					const uriGenerator = ctx.external.uri ?? ((id) => id);
					if (externalId) return { ref: uriGenerator(externalId) };
					const id = entry[1].defId ?? entry[1].schema.id ?? `schema${ctx.counter++}`;
					entry[1].defId = id;
					return {
						defId: id,
						ref: `${uriGenerator("__shared")}#/${defsSegment}/${id}`
					};
				}
				if (entry[1] === root) return { ref: "#" };
				const defUriPrefix = `#/${defsSegment}/`;
				const defId = entry[1].schema.id ?? `__schema${ctx.counter++}`;
				return {
					defId,
					ref: defUriPrefix + defId
				};
			};
			const extractToDef = (entry) => {
				if (entry[1].schema.$ref) return;
				const seen = entry[1];
				const { ref, defId } = makeURI(entry);
				seen.def = { ...seen.schema };
				if (defId) seen.defId = defId;
				const schema = seen.schema;
				for (const key in schema) delete schema[key];
				schema.$ref = ref;
			};
			if (ctx.cycles === "throw") for (const entry of ctx.seen.entries()) {
				const seen = entry[1];
				if (seen.cycle) throw new Error(`Cycle detected: #/${seen.cycle?.join("/")}/<root>

Set the \`cycles\` parameter to \`"ref"\` to resolve cyclical schemas with defs.`);
			}
			for (const entry of ctx.seen.entries()) {
				const seen = entry[1];
				if (schema === entry[0]) {
					extractToDef(entry);
					continue;
				}
				if (ctx.external) {
					const ext = ctx.external.registry.get(entry[0])?.id;
					if (schema !== entry[0] && ext) {
						extractToDef(entry);
						continue;
					}
				}
				if (ctx.metadataRegistry.get(entry[0])?.id) {
					extractToDef(entry);
					continue;
				}
				if (seen.cycle) {
					extractToDef(entry);
					continue;
				}
				if (seen.count > 1) {
					if (ctx.reused === "ref") {
						extractToDef(entry);
						continue;
					}
				}
			}
		}
		function finalize(ctx, schema) {
			const root = ctx.seen.get(schema);
			if (!root) throw new Error("Unprocessed schema. This is a bug in Zod.");
			const flattenRef = (zodSchema) => {
				const seen = ctx.seen.get(zodSchema);
				if (seen.ref === null) return;
				const schema = seen.def ?? seen.schema;
				const _cached = { ...schema };
				const ref = seen.ref;
				seen.ref = null;
				if (ref) {
					flattenRef(ref);
					const refSeen = ctx.seen.get(ref);
					const refSchema = refSeen.schema;
					if (refSchema.$ref && (ctx.target === "draft-07" || ctx.target === "draft-04" || ctx.target === "openapi-3.0")) {
						schema.allOf = schema.allOf ?? [];
						schema.allOf.push(refSchema);
					} else Object.assign(schema, refSchema);
					Object.assign(schema, _cached);
					if (zodSchema._zod.parent === ref) for (const key in schema) {
						if (key === "$ref" || key === "allOf") continue;
						if (!(key in _cached)) delete schema[key];
					}
					if (refSchema.$ref && refSeen.def) for (const key in schema) {
						if (key === "$ref" || key === "allOf") continue;
						if (key in refSeen.def && JSON.stringify(schema[key]) === JSON.stringify(refSeen.def[key])) delete schema[key];
					}
				}
				const parent = zodSchema._zod.parent;
				if (parent && parent !== ref) {
					flattenRef(parent);
					const parentSeen = ctx.seen.get(parent);
					if (parentSeen?.schema.$ref) {
						schema.$ref = parentSeen.schema.$ref;
						if (parentSeen.def) for (const key in schema) {
							if (key === "$ref" || key === "allOf") continue;
							if (key in parentSeen.def && JSON.stringify(schema[key]) === JSON.stringify(parentSeen.def[key])) delete schema[key];
						}
					}
				}
				ctx.override({
					zodSchema,
					jsonSchema: schema,
					path: seen.path ?? []
				});
			};
			for (const entry of [...ctx.seen.entries()].reverse()) flattenRef(entry[0]);
			const result = {};
			if (ctx.target === "draft-2020-12") result.$schema = "https://json-schema.org/draft/2020-12/schema";
			else if (ctx.target === "draft-07") result.$schema = "http://json-schema.org/draft-07/schema#";
			else if (ctx.target === "draft-04") result.$schema = "http://json-schema.org/draft-04/schema#";
			else if (ctx.target === "openapi-3.0") {}
			if (ctx.external?.uri) {
				const id = ctx.external.registry.get(schema)?.id;
				if (!id) throw new Error("Schema is missing an `id` property");
				result.$id = ctx.external.uri(id);
			}
			Object.assign(result, root.def ?? root.schema);
			const rootMetaId = ctx.metadataRegistry.get(schema)?.id;
			if (rootMetaId !== void 0 && result.id === rootMetaId) delete result.id;
			const defs = ctx.external?.defs ?? {};
			for (const entry of ctx.seen.entries()) {
				const seen = entry[1];
				if (seen.def && seen.defId) {
					if (seen.def.id === seen.defId) delete seen.def.id;
					defs[seen.defId] = seen.def;
				}
			}
			if (ctx.external) {} else if (Object.keys(defs).length > 0) if (ctx.target === "draft-2020-12") result.$defs = defs;
			else result.definitions = defs;
			try {
				const finalized = JSON.parse(JSON.stringify(result));
				Object.defineProperty(finalized, "~standard", {
					value: {
						...schema["~standard"],
						jsonSchema: {
							input: createStandardJSONSchemaMethod(schema, "input", ctx.processors),
							output: createStandardJSONSchemaMethod(schema, "output", ctx.processors)
						}
					},
					enumerable: false,
					writable: false
				});
				return finalized;
			} catch (_err) {
				throw new Error("Error converting schema to JSON.");
			}
		}
		function isTransforming(_schema, _ctx) {
			const ctx = _ctx ?? { seen: /* @__PURE__ */ new Set() };
			if (ctx.seen.has(_schema)) return false;
			ctx.seen.add(_schema);
			const def = _schema._zod.def;
			if (def.type === "transform") return true;
			if (def.type === "array") return isTransforming(def.element, ctx);
			if (def.type === "set") return isTransforming(def.valueType, ctx);
			if (def.type === "lazy") return isTransforming(def.getter(), ctx);
			if (def.type === "promise" || def.type === "optional" || def.type === "nonoptional" || def.type === "nullable" || def.type === "readonly" || def.type === "default" || def.type === "prefault") return isTransforming(def.innerType, ctx);
			if (def.type === "intersection") return isTransforming(def.left, ctx) || isTransforming(def.right, ctx);
			if (def.type === "record" || def.type === "map") return isTransforming(def.keyType, ctx) || isTransforming(def.valueType, ctx);
			if (def.type === "pipe") {
				if (_schema._zod.traits.has("$ZodCodec")) return true;
				return isTransforming(def.in, ctx) || isTransforming(def.out, ctx);
			}
			if (def.type === "object") {
				for (const key in def.shape) if (isTransforming(def.shape[key], ctx)) return true;
				return false;
			}
			if (def.type === "union") {
				for (const option of def.options) if (isTransforming(option, ctx)) return true;
				return false;
			}
			if (def.type === "tuple") {
				for (const item of def.items) if (isTransforming(item, ctx)) return true;
				if (def.rest && isTransforming(def.rest, ctx)) return true;
				return false;
			}
			return false;
		}
		/**
		* Creates a toJSONSchema method for a schema instance.
		* This encapsulates the logic of initializing context, processing, extracting defs, and finalizing.
		*/
		const createToJSONSchemaMethod = (schema, processors = {}) => (params) => {
			const ctx = initializeContext({
				...params,
				processors
			});
			process(schema, ctx);
			extractDefs(ctx, schema);
			return finalize(ctx, schema);
		};
		const createStandardJSONSchemaMethod = (schema, io, processors = {}) => (params) => {
			const { libraryOptions, target } = params ?? {};
			const ctx = initializeContext({
				...libraryOptions ?? {},
				target,
				io,
				processors
			});
			process(schema, ctx);
			extractDefs(ctx, schema);
			return finalize(ctx, schema);
		};
		//#endregion
		//#region ../../../node_modules/.pnpm/zod@4.4.3/node_modules/zod/v4/core/json-schema-processors.js
		const formatMap = {
			guid: "uuid",
			url: "uri",
			datetime: "date-time",
			json_string: "json-string",
			regex: ""
		};
		const stringProcessor = (schema, ctx, _json, _params) => {
			const json = _json;
			json.type = "string";
			const { minimum, maximum, format, patterns, contentEncoding } = schema._zod.bag;
			if (typeof minimum === "number") json.minLength = minimum;
			if (typeof maximum === "number") json.maxLength = maximum;
			if (format) {
				json.format = formatMap[format] ?? format;
				if (json.format === "") delete json.format;
				if (format === "time") delete json.format;
			}
			if (contentEncoding) json.contentEncoding = contentEncoding;
			if (patterns && patterns.size > 0) {
				const regexes = [...patterns];
				if (regexes.length === 1) json.pattern = regexes[0].source;
				else if (regexes.length > 1) json.allOf = [...regexes.map((regex) => ({
					...ctx.target === "draft-07" || ctx.target === "draft-04" || ctx.target === "openapi-3.0" ? { type: "string" } : {},
					pattern: regex.source
				}))];
			}
		};
		const numberProcessor = (schema, ctx, _json, _params) => {
			const json = _json;
			const { minimum, maximum, format, multipleOf, exclusiveMaximum, exclusiveMinimum } = schema._zod.bag;
			if (typeof format === "string" && format.includes("int")) json.type = "integer";
			else json.type = "number";
			const exMin = typeof exclusiveMinimum === "number" && exclusiveMinimum >= (minimum ?? Number.NEGATIVE_INFINITY);
			const exMax = typeof exclusiveMaximum === "number" && exclusiveMaximum <= (maximum ?? Number.POSITIVE_INFINITY);
			const legacy = ctx.target === "draft-04" || ctx.target === "openapi-3.0";
			if (exMin) if (legacy) {
				json.minimum = exclusiveMinimum;
				json.exclusiveMinimum = true;
			} else json.exclusiveMinimum = exclusiveMinimum;
			else if (typeof minimum === "number") json.minimum = minimum;
			if (exMax) if (legacy) {
				json.maximum = exclusiveMaximum;
				json.exclusiveMaximum = true;
			} else json.exclusiveMaximum = exclusiveMaximum;
			else if (typeof maximum === "number") json.maximum = maximum;
			if (typeof multipleOf === "number") json.multipleOf = multipleOf;
		};
		const booleanProcessor = (_schema, _ctx, json, _params) => {
			json.type = "boolean";
		};
		const undefinedProcessor = (_schema, ctx, _json, _params) => {
			if (ctx.unrepresentable === "throw") throw new Error("Undefined cannot be represented in JSON Schema");
		};
		const voidProcessor = (_schema, ctx, _json, _params) => {
			if (ctx.unrepresentable === "throw") throw new Error("Void cannot be represented in JSON Schema");
		};
		const neverProcessor = (_schema, _ctx, json, _params) => {
			json.not = {};
		};
		const enumProcessor = (schema, _ctx, json, _params) => {
			const def = schema._zod.def;
			const values = getEnumValues(def.entries);
			if (values.every((v) => typeof v === "number")) json.type = "number";
			if (values.every((v) => typeof v === "string")) json.type = "string";
			json.enum = values;
		};
		const literalProcessor = (schema, ctx, json, _params) => {
			const def = schema._zod.def;
			const vals = [];
			for (const val of def.values) if (val === void 0) {
				if (ctx.unrepresentable === "throw") throw new Error("Literal `undefined` cannot be represented in JSON Schema");
			} else if (typeof val === "bigint") if (ctx.unrepresentable === "throw") throw new Error("BigInt literals cannot be represented in JSON Schema");
			else vals.push(Number(val));
			else vals.push(val);
			if (vals.length === 0) {} else if (vals.length === 1) {
				const val = vals[0];
				json.type = val === null ? "null" : typeof val;
				if (ctx.target === "draft-04" || ctx.target === "openapi-3.0") json.enum = [val];
				else json.const = val;
			} else {
				if (vals.every((v) => typeof v === "number")) json.type = "number";
				if (vals.every((v) => typeof v === "string")) json.type = "string";
				if (vals.every((v) => typeof v === "boolean")) json.type = "boolean";
				if (vals.every((v) => v === null)) json.type = "null";
				json.enum = vals;
			}
		};
		const customProcessor = (_schema, ctx, _json, _params) => {
			if (ctx.unrepresentable === "throw") throw new Error("Custom types cannot be represented in JSON Schema");
		};
		const transformProcessor = (_schema, ctx, _json, _params) => {
			if (ctx.unrepresentable === "throw") throw new Error("Transforms cannot be represented in JSON Schema");
		};
		const arrayProcessor = (schema, ctx, _json, params) => {
			const json = _json;
			const def = schema._zod.def;
			const { minimum, maximum } = schema._zod.bag;
			if (typeof minimum === "number") json.minItems = minimum;
			if (typeof maximum === "number") json.maxItems = maximum;
			json.type = "array";
			json.items = process(def.element, ctx, {
				...params,
				path: [...params.path, "items"]
			});
		};
		const objectProcessor = (schema, ctx, _json, params) => {
			const json = _json;
			const def = schema._zod.def;
			json.type = "object";
			json.properties = {};
			const shape = def.shape;
			for (const key in shape) json.properties[key] = process(shape[key], ctx, {
				...params,
				path: [
					...params.path,
					"properties",
					key
				]
			});
			const allKeys = new Set(Object.keys(shape));
			const requiredKeys = new Set([...allKeys].filter((key) => {
				const v = def.shape[key]._zod;
				if (ctx.io === "input") return v.optin === void 0;
				else return v.optout === void 0;
			}));
			if (requiredKeys.size > 0) json.required = Array.from(requiredKeys);
			if (def.catchall?._zod.def.type === "never") json.additionalProperties = false;
			else if (!def.catchall) {
				if (ctx.io === "output") json.additionalProperties = false;
			} else if (def.catchall) json.additionalProperties = process(def.catchall, ctx, {
				...params,
				path: [...params.path, "additionalProperties"]
			});
		};
		const unionProcessor = (schema, ctx, json, params) => {
			const def = schema._zod.def;
			const isExclusive = def.inclusive === false;
			const options = def.options.map((x, i) => process(x, ctx, {
				...params,
				path: [
					...params.path,
					isExclusive ? "oneOf" : "anyOf",
					i
				]
			}));
			if (isExclusive) json.oneOf = options;
			else json.anyOf = options;
		};
		const intersectionProcessor = (schema, ctx, json, params) => {
			const def = schema._zod.def;
			const a = process(def.left, ctx, {
				...params,
				path: [
					...params.path,
					"allOf",
					0
				]
			});
			const b = process(def.right, ctx, {
				...params,
				path: [
					...params.path,
					"allOf",
					1
				]
			});
			const isSimpleIntersection = (val) => "allOf" in val && Object.keys(val).length === 1;
			json.allOf = [...isSimpleIntersection(a) ? a.allOf : [a], ...isSimpleIntersection(b) ? b.allOf : [b]];
		};
		const recordProcessor = (schema, ctx, _json, params) => {
			const json = _json;
			const def = schema._zod.def;
			json.type = "object";
			const keyType = def.keyType;
			const patterns = keyType._zod.bag?.patterns;
			if (def.mode === "loose" && patterns && patterns.size > 0) {
				const valueSchema = process(def.valueType, ctx, {
					...params,
					path: [
						...params.path,
						"patternProperties",
						"*"
					]
				});
				json.patternProperties = {};
				for (const pattern of patterns) json.patternProperties[pattern.source] = valueSchema;
			} else {
				if (ctx.target === "draft-07" || ctx.target === "draft-2020-12") json.propertyNames = process(def.keyType, ctx, {
					...params,
					path: [...params.path, "propertyNames"]
				});
				json.additionalProperties = process(def.valueType, ctx, {
					...params,
					path: [...params.path, "additionalProperties"]
				});
			}
			const keyValues = keyType._zod.values;
			if (keyValues) {
				const validKeyValues = [...keyValues].filter((v) => typeof v === "string" || typeof v === "number");
				if (validKeyValues.length > 0) json.required = validKeyValues;
			}
		};
		const nullableProcessor = (schema, ctx, json, params) => {
			const def = schema._zod.def;
			const inner = process(def.innerType, ctx, params);
			const seen = ctx.seen.get(schema);
			if (ctx.target === "openapi-3.0") {
				seen.ref = def.innerType;
				json.nullable = true;
			} else json.anyOf = [inner, { type: "null" }];
		};
		const nonoptionalProcessor = (schema, ctx, _json, params) => {
			const def = schema._zod.def;
			process(def.innerType, ctx, params);
			const seen = ctx.seen.get(schema);
			seen.ref = def.innerType;
		};
		const defaultProcessor = (schema, ctx, json, params) => {
			const def = schema._zod.def;
			process(def.innerType, ctx, params);
			const seen = ctx.seen.get(schema);
			seen.ref = def.innerType;
			json.default = JSON.parse(JSON.stringify(def.defaultValue));
		};
		const prefaultProcessor = (schema, ctx, json, params) => {
			const def = schema._zod.def;
			process(def.innerType, ctx, params);
			const seen = ctx.seen.get(schema);
			seen.ref = def.innerType;
			if (ctx.io === "input") json._prefault = JSON.parse(JSON.stringify(def.defaultValue));
		};
		const catchProcessor = (schema, ctx, json, params) => {
			const def = schema._zod.def;
			process(def.innerType, ctx, params);
			const seen = ctx.seen.get(schema);
			seen.ref = def.innerType;
			let catchValue;
			try {
				catchValue = def.catchValue(void 0);
			} catch {
				throw new Error("Dynamic catch values are not supported in JSON Schema");
			}
			json.default = catchValue;
		};
		const pipeProcessor = (schema, ctx, _json, params) => {
			const def = schema._zod.def;
			const inIsTransform = def.in._zod.traits.has("$ZodTransform");
			const innerType = ctx.io === "input" ? inIsTransform ? def.out : def.in : def.out;
			process(innerType, ctx, params);
			const seen = ctx.seen.get(schema);
			seen.ref = innerType;
		};
		const readonlyProcessor = (schema, ctx, json, params) => {
			const def = schema._zod.def;
			process(def.innerType, ctx, params);
			const seen = ctx.seen.get(schema);
			seen.ref = def.innerType;
			json.readOnly = true;
		};
		const optionalProcessor = (schema, ctx, _json, params) => {
			const def = schema._zod.def;
			process(def.innerType, ctx, params);
			const seen = ctx.seen.get(schema);
			seen.ref = def.innerType;
		};
		const lazyProcessor = (schema, ctx, _json, params) => {
			const innerType = schema._zod.innerType;
			process(innerType, ctx, params);
			const seen = ctx.seen.get(schema);
			seen.ref = innerType;
		};
		//#endregion
		//#region ../../../node_modules/.pnpm/zod@4.4.3/node_modules/zod/v4/classic/iso.js
		const ZodISODateTime = /*@__PURE__*/ $constructor("ZodISODateTime", (inst, def) => {
			$ZodISODateTime.init(inst, def);
			ZodStringFormat.init(inst, def);
		});
		function datetime(params) {
			return /* @__PURE__ */ _isoDateTime(ZodISODateTime, params);
		}
		const ZodISODate = /*@__PURE__*/ $constructor("ZodISODate", (inst, def) => {
			$ZodISODate.init(inst, def);
			ZodStringFormat.init(inst, def);
		});
		function date(params) {
			return /* @__PURE__ */ _isoDate(ZodISODate, params);
		}
		const ZodISOTime = /*@__PURE__*/ $constructor("ZodISOTime", (inst, def) => {
			$ZodISOTime.init(inst, def);
			ZodStringFormat.init(inst, def);
		});
		function time(params) {
			return /* @__PURE__ */ _isoTime(ZodISOTime, params);
		}
		const ZodISODuration = /*@__PURE__*/ $constructor("ZodISODuration", (inst, def) => {
			$ZodISODuration.init(inst, def);
			ZodStringFormat.init(inst, def);
		});
		function duration(params) {
			return /* @__PURE__ */ _isoDuration(ZodISODuration, params);
		}
		//#endregion
		//#region ../../../node_modules/.pnpm/zod@4.4.3/node_modules/zod/v4/classic/errors.js
		const initializer = (inst, issues) => {
			$ZodError.init(inst, issues);
			inst.name = "ZodError";
			Object.defineProperties(inst, {
				format: { value: (mapper) => formatError(inst, mapper) },
				flatten: { value: (mapper) => flattenError(inst, mapper) },
				addIssue: { value: (issue) => {
					inst.issues.push(issue);
					inst.message = JSON.stringify(inst.issues, jsonStringifyReplacer, 2);
				} },
				addIssues: { value: (issues) => {
					inst.issues.push(...issues);
					inst.message = JSON.stringify(inst.issues, jsonStringifyReplacer, 2);
				} },
				isEmpty: { get() {
					return inst.issues.length === 0;
				} }
			});
		};
		const ZodRealError = /*@__PURE__*/ $constructor("ZodError", initializer, { Parent: Error });
		//#endregion
		//#region ../../../node_modules/.pnpm/zod@4.4.3/node_modules/zod/v4/classic/parse.js
		const parse = /* @__PURE__ */ _parse(ZodRealError);
		const parseAsync = /* @__PURE__ */ _parseAsync(ZodRealError);
		const safeParse = /* @__PURE__ */ _safeParse(ZodRealError);
		const safeParseAsync = /* @__PURE__ */ _safeParseAsync(ZodRealError);
		const encode = /* @__PURE__ */ _encode(ZodRealError);
		const decode = /* @__PURE__ */ _decode(ZodRealError);
		const encodeAsync = /* @__PURE__ */ _encodeAsync(ZodRealError);
		const decodeAsync = /* @__PURE__ */ _decodeAsync(ZodRealError);
		const safeEncode = /* @__PURE__ */ _safeEncode(ZodRealError);
		const safeDecode = /* @__PURE__ */ _safeDecode(ZodRealError);
		const safeEncodeAsync = /* @__PURE__ */ _safeEncodeAsync(ZodRealError);
		const safeDecodeAsync = /* @__PURE__ */ _safeDecodeAsync(ZodRealError);
		//#endregion
		//#region ../../../node_modules/.pnpm/zod@4.4.3/node_modules/zod/v4/classic/schemas.js
		const _installedGroups = /* @__PURE__ */ new WeakMap();
		function _installLazyMethods(inst, group, methods) {
			const proto = Object.getPrototypeOf(inst);
			let installed = _installedGroups.get(proto);
			if (!installed) {
				installed = /* @__PURE__ */ new Set();
				_installedGroups.set(proto, installed);
			}
			if (installed.has(group)) return;
			installed.add(group);
			for (const key in methods) {
				const fn = methods[key];
				Object.defineProperty(proto, key, {
					configurable: true,
					enumerable: false,
					get() {
						const bound = fn.bind(this);
						Object.defineProperty(this, key, {
							configurable: true,
							writable: true,
							enumerable: true,
							value: bound
						});
						return bound;
					},
					set(v) {
						Object.defineProperty(this, key, {
							configurable: true,
							writable: true,
							enumerable: true,
							value: v
						});
					}
				});
			}
		}
		const ZodType = /*@__PURE__*/ $constructor("ZodType", (inst, def) => {
			$ZodType.init(inst, def);
			Object.assign(inst["~standard"], { jsonSchema: {
				input: createStandardJSONSchemaMethod(inst, "input"),
				output: createStandardJSONSchemaMethod(inst, "output")
			} });
			inst.toJSONSchema = createToJSONSchemaMethod(inst, {});
			inst.def = def;
			inst.type = def.type;
			Object.defineProperty(inst, "_def", { value: def });
			inst.parse = (data, params) => parse(inst, data, params, { callee: inst.parse });
			inst.safeParse = (data, params) => safeParse(inst, data, params);
			inst.parseAsync = async (data, params) => parseAsync(inst, data, params, { callee: inst.parseAsync });
			inst.safeParseAsync = async (data, params) => safeParseAsync(inst, data, params);
			inst.spa = inst.safeParseAsync;
			inst.encode = (data, params) => encode(inst, data, params);
			inst.decode = (data, params) => decode(inst, data, params);
			inst.encodeAsync = async (data, params) => encodeAsync(inst, data, params);
			inst.decodeAsync = async (data, params) => decodeAsync(inst, data, params);
			inst.safeEncode = (data, params) => safeEncode(inst, data, params);
			inst.safeDecode = (data, params) => safeDecode(inst, data, params);
			inst.safeEncodeAsync = async (data, params) => safeEncodeAsync(inst, data, params);
			inst.safeDecodeAsync = async (data, params) => safeDecodeAsync(inst, data, params);
			_installLazyMethods(inst, "ZodType", {
				check(...chks) {
					const def = this.def;
					return this.clone(mergeDefs(def, { checks: [...def.checks ?? [], ...chks.map((ch) => typeof ch === "function" ? { _zod: {
						check: ch,
						def: { check: "custom" },
						onattach: []
					} } : ch)] }), { parent: true });
				},
				with(...chks) {
					return this.check(...chks);
				},
				clone(def, params) {
					return clone(this, def, params);
				},
				brand() {
					return this;
				},
				register(reg, meta) {
					reg.add(this, meta);
					return this;
				},
				refine(check, params) {
					return this.check(refine(check, params));
				},
				superRefine(refinement, params) {
					return this.check(superRefine(refinement, params));
				},
				overwrite(fn) {
					return this.check(/* @__PURE__ */ _overwrite(fn));
				},
				optional() {
					return optional(this);
				},
				exactOptional() {
					return exactOptional(this);
				},
				nullable() {
					return nullable(this);
				},
				nullish() {
					return optional(nullable(this));
				},
				nonoptional(params) {
					return nonoptional(this, params);
				},
				array() {
					return array(this);
				},
				or(arg) {
					return union([this, arg]);
				},
				and(arg) {
					return intersection(this, arg);
				},
				transform(tx) {
					return pipe(this, transform(tx));
				},
				default(d) {
					return _default(this, d);
				},
				prefault(d) {
					return prefault(this, d);
				},
				catch(params) {
					return _catch(this, params);
				},
				pipe(target) {
					return pipe(this, target);
				},
				readonly() {
					return readonly(this);
				},
				describe(description) {
					const cl = this.clone();
					globalRegistry.add(cl, { description });
					return cl;
				},
				meta(...args) {
					if (args.length === 0) return globalRegistry.get(this);
					const cl = this.clone();
					globalRegistry.add(cl, args[0]);
					return cl;
				},
				isOptional() {
					return this.safeParse(void 0).success;
				},
				isNullable() {
					return this.safeParse(null).success;
				},
				apply(fn) {
					return fn(this);
				}
			});
			Object.defineProperty(inst, "description", {
				get() {
					return globalRegistry.get(inst)?.description;
				},
				configurable: true
			});
			return inst;
		});
		/** @internal */
		const _ZodString = /*@__PURE__*/ $constructor("_ZodString", (inst, def) => {
			$ZodString.init(inst, def);
			ZodType.init(inst, def);
			inst._zod.processJSONSchema = (ctx, json, params) => stringProcessor(inst, ctx, json, params);
			const bag = inst._zod.bag;
			inst.format = bag.format ?? null;
			inst.minLength = bag.minimum ?? null;
			inst.maxLength = bag.maximum ?? null;
			_installLazyMethods(inst, "_ZodString", {
				regex(...args) {
					return this.check(/* @__PURE__ */ _regex(...args));
				},
				includes(...args) {
					return this.check(/* @__PURE__ */ _includes(...args));
				},
				startsWith(...args) {
					return this.check(/* @__PURE__ */ _startsWith(...args));
				},
				endsWith(...args) {
					return this.check(/* @__PURE__ */ _endsWith(...args));
				},
				min(...args) {
					return this.check(/* @__PURE__ */ _minLength(...args));
				},
				max(...args) {
					return this.check(/* @__PURE__ */ _maxLength(...args));
				},
				length(...args) {
					return this.check(/* @__PURE__ */ _length(...args));
				},
				nonempty(...args) {
					return this.check(/* @__PURE__ */ _minLength(1, ...args));
				},
				lowercase(params) {
					return this.check(/* @__PURE__ */ _lowercase(params));
				},
				uppercase(params) {
					return this.check(/* @__PURE__ */ _uppercase(params));
				},
				trim() {
					return this.check(/* @__PURE__ */ _trim());
				},
				normalize(...args) {
					return this.check(/* @__PURE__ */ _normalize(...args));
				},
				toLowerCase() {
					return this.check(/* @__PURE__ */ _toLowerCase());
				},
				toUpperCase() {
					return this.check(/* @__PURE__ */ _toUpperCase());
				},
				slugify() {
					return this.check(/* @__PURE__ */ _slugify());
				}
			});
		});
		const ZodString = /*@__PURE__*/ $constructor("ZodString", (inst, def) => {
			$ZodString.init(inst, def);
			_ZodString.init(inst, def);
			inst.email = (params) => inst.check(/* @__PURE__ */ _email(ZodEmail, params));
			inst.url = (params) => inst.check(/* @__PURE__ */ _url(ZodURL, params));
			inst.jwt = (params) => inst.check(/* @__PURE__ */ _jwt(ZodJWT, params));
			inst.emoji = (params) => inst.check(/* @__PURE__ */ _emoji(ZodEmoji, params));
			inst.guid = (params) => inst.check(/* @__PURE__ */ _guid(ZodGUID, params));
			inst.uuid = (params) => inst.check(/* @__PURE__ */ _uuid(ZodUUID, params));
			inst.uuidv4 = (params) => inst.check(/* @__PURE__ */ _uuidv4(ZodUUID, params));
			inst.uuidv6 = (params) => inst.check(/* @__PURE__ */ _uuidv6(ZodUUID, params));
			inst.uuidv7 = (params) => inst.check(/* @__PURE__ */ _uuidv7(ZodUUID, params));
			inst.nanoid = (params) => inst.check(/* @__PURE__ */ _nanoid(ZodNanoID, params));
			inst.guid = (params) => inst.check(/* @__PURE__ */ _guid(ZodGUID, params));
			inst.cuid = (params) => inst.check(/* @__PURE__ */ _cuid(ZodCUID, params));
			inst.cuid2 = (params) => inst.check(/* @__PURE__ */ _cuid2(ZodCUID2, params));
			inst.ulid = (params) => inst.check(/* @__PURE__ */ _ulid(ZodULID, params));
			inst.base64 = (params) => inst.check(/* @__PURE__ */ _base64(ZodBase64, params));
			inst.base64url = (params) => inst.check(/* @__PURE__ */ _base64url(ZodBase64URL, params));
			inst.xid = (params) => inst.check(/* @__PURE__ */ _xid(ZodXID, params));
			inst.ksuid = (params) => inst.check(/* @__PURE__ */ _ksuid(ZodKSUID, params));
			inst.ipv4 = (params) => inst.check(/* @__PURE__ */ _ipv4(ZodIPv4, params));
			inst.ipv6 = (params) => inst.check(/* @__PURE__ */ _ipv6(ZodIPv6, params));
			inst.cidrv4 = (params) => inst.check(/* @__PURE__ */ _cidrv4(ZodCIDRv4, params));
			inst.cidrv6 = (params) => inst.check(/* @__PURE__ */ _cidrv6(ZodCIDRv6, params));
			inst.e164 = (params) => inst.check(/* @__PURE__ */ _e164(ZodE164, params));
			inst.datetime = (params) => inst.check(datetime(params));
			inst.date = (params) => inst.check(date(params));
			inst.time = (params) => inst.check(time(params));
			inst.duration = (params) => inst.check(duration(params));
		});
		function string(params) {
			return /* @__PURE__ */ _string(ZodString, params);
		}
		const ZodStringFormat = /*@__PURE__*/ $constructor("ZodStringFormat", (inst, def) => {
			$ZodStringFormat.init(inst, def);
			_ZodString.init(inst, def);
		});
		const ZodEmail = /*@__PURE__*/ $constructor("ZodEmail", (inst, def) => {
			$ZodEmail.init(inst, def);
			ZodStringFormat.init(inst, def);
		});
		const ZodGUID = /*@__PURE__*/ $constructor("ZodGUID", (inst, def) => {
			$ZodGUID.init(inst, def);
			ZodStringFormat.init(inst, def);
		});
		const ZodUUID = /*@__PURE__*/ $constructor("ZodUUID", (inst, def) => {
			$ZodUUID.init(inst, def);
			ZodStringFormat.init(inst, def);
		});
		const ZodURL = /*@__PURE__*/ $constructor("ZodURL", (inst, def) => {
			$ZodURL.init(inst, def);
			ZodStringFormat.init(inst, def);
		});
		const ZodEmoji = /*@__PURE__*/ $constructor("ZodEmoji", (inst, def) => {
			$ZodEmoji.init(inst, def);
			ZodStringFormat.init(inst, def);
		});
		const ZodNanoID = /*@__PURE__*/ $constructor("ZodNanoID", (inst, def) => {
			$ZodNanoID.init(inst, def);
			ZodStringFormat.init(inst, def);
		});
		/**
		* @deprecated CUID v1 is deprecated by its authors due to information leakage
		* (timestamps embedded in the id). Use {@link ZodCUID2} instead.
		* See https://github.com/paralleldrive/cuid.
		*/
		const ZodCUID = /*@__PURE__*/ $constructor("ZodCUID", (inst, def) => {
			$ZodCUID.init(inst, def);
			ZodStringFormat.init(inst, def);
		});
		const ZodCUID2 = /*@__PURE__*/ $constructor("ZodCUID2", (inst, def) => {
			$ZodCUID2.init(inst, def);
			ZodStringFormat.init(inst, def);
		});
		const ZodULID = /*@__PURE__*/ $constructor("ZodULID", (inst, def) => {
			$ZodULID.init(inst, def);
			ZodStringFormat.init(inst, def);
		});
		const ZodXID = /*@__PURE__*/ $constructor("ZodXID", (inst, def) => {
			$ZodXID.init(inst, def);
			ZodStringFormat.init(inst, def);
		});
		const ZodKSUID = /*@__PURE__*/ $constructor("ZodKSUID", (inst, def) => {
			$ZodKSUID.init(inst, def);
			ZodStringFormat.init(inst, def);
		});
		const ZodIPv4 = /*@__PURE__*/ $constructor("ZodIPv4", (inst, def) => {
			$ZodIPv4.init(inst, def);
			ZodStringFormat.init(inst, def);
		});
		const ZodIPv6 = /*@__PURE__*/ $constructor("ZodIPv6", (inst, def) => {
			$ZodIPv6.init(inst, def);
			ZodStringFormat.init(inst, def);
		});
		const ZodCIDRv4 = /*@__PURE__*/ $constructor("ZodCIDRv4", (inst, def) => {
			$ZodCIDRv4.init(inst, def);
			ZodStringFormat.init(inst, def);
		});
		const ZodCIDRv6 = /*@__PURE__*/ $constructor("ZodCIDRv6", (inst, def) => {
			$ZodCIDRv6.init(inst, def);
			ZodStringFormat.init(inst, def);
		});
		const ZodBase64 = /*@__PURE__*/ $constructor("ZodBase64", (inst, def) => {
			$ZodBase64.init(inst, def);
			ZodStringFormat.init(inst, def);
		});
		const ZodBase64URL = /*@__PURE__*/ $constructor("ZodBase64URL", (inst, def) => {
			$ZodBase64URL.init(inst, def);
			ZodStringFormat.init(inst, def);
		});
		const ZodE164 = /*@__PURE__*/ $constructor("ZodE164", (inst, def) => {
			$ZodE164.init(inst, def);
			ZodStringFormat.init(inst, def);
		});
		const ZodJWT = /*@__PURE__*/ $constructor("ZodJWT", (inst, def) => {
			$ZodJWT.init(inst, def);
			ZodStringFormat.init(inst, def);
		});
		const ZodNumber = /*@__PURE__*/ $constructor("ZodNumber", (inst, def) => {
			$ZodNumber.init(inst, def);
			ZodType.init(inst, def);
			inst._zod.processJSONSchema = (ctx, json, params) => numberProcessor(inst, ctx, json, params);
			_installLazyMethods(inst, "ZodNumber", {
				gt(value, params) {
					return this.check(/* @__PURE__ */ _gt(value, params));
				},
				gte(value, params) {
					return this.check(/* @__PURE__ */ _gte(value, params));
				},
				min(value, params) {
					return this.check(/* @__PURE__ */ _gte(value, params));
				},
				lt(value, params) {
					return this.check(/* @__PURE__ */ _lt(value, params));
				},
				lte(value, params) {
					return this.check(/* @__PURE__ */ _lte(value, params));
				},
				max(value, params) {
					return this.check(/* @__PURE__ */ _lte(value, params));
				},
				int(params) {
					return this.check(int(params));
				},
				safe(params) {
					return this.check(int(params));
				},
				positive(params) {
					return this.check(/* @__PURE__ */ _gt(0, params));
				},
				nonnegative(params) {
					return this.check(/* @__PURE__ */ _gte(0, params));
				},
				negative(params) {
					return this.check(/* @__PURE__ */ _lt(0, params));
				},
				nonpositive(params) {
					return this.check(/* @__PURE__ */ _lte(0, params));
				},
				multipleOf(value, params) {
					return this.check(/* @__PURE__ */ _multipleOf(value, params));
				},
				step(value, params) {
					return this.check(/* @__PURE__ */ _multipleOf(value, params));
				},
				finite() {
					return this;
				}
			});
			const bag = inst._zod.bag;
			inst.minValue = Math.max(bag.minimum ?? Number.NEGATIVE_INFINITY, bag.exclusiveMinimum ?? Number.NEGATIVE_INFINITY) ?? null;
			inst.maxValue = Math.min(bag.maximum ?? Number.POSITIVE_INFINITY, bag.exclusiveMaximum ?? Number.POSITIVE_INFINITY) ?? null;
			inst.isInt = (bag.format ?? "").includes("int") || Number.isSafeInteger(bag.multipleOf ?? .5);
			inst.isFinite = true;
			inst.format = bag.format ?? null;
		});
		function number(params) {
			return /* @__PURE__ */ _number(ZodNumber, params);
		}
		const ZodNumberFormat = /*@__PURE__*/ $constructor("ZodNumberFormat", (inst, def) => {
			$ZodNumberFormat.init(inst, def);
			ZodNumber.init(inst, def);
		});
		function int(params) {
			return /* @__PURE__ */ _int(ZodNumberFormat, params);
		}
		const ZodBoolean = /*@__PURE__*/ $constructor("ZodBoolean", (inst, def) => {
			$ZodBoolean.init(inst, def);
			ZodType.init(inst, def);
			inst._zod.processJSONSchema = (ctx, json, params) => booleanProcessor(inst, ctx, json, params);
		});
		function boolean(params) {
			return /* @__PURE__ */ _boolean(ZodBoolean, params);
		}
		const ZodUndefined = /*@__PURE__*/ $constructor("ZodUndefined", (inst, def) => {
			$ZodUndefined.init(inst, def);
			ZodType.init(inst, def);
			inst._zod.processJSONSchema = (ctx, json, params) => undefinedProcessor(inst, ctx, json, params);
		});
		function _undefined(params) {
			return /* @__PURE__ */ _undefined$1(ZodUndefined, params);
		}
		const ZodUnknown = /*@__PURE__*/ $constructor("ZodUnknown", (inst, def) => {
			$ZodUnknown.init(inst, def);
			ZodType.init(inst, def);
			inst._zod.processJSONSchema = (ctx, json, params) => void 0;
		});
		function unknown() {
			return /* @__PURE__ */ _unknown(ZodUnknown);
		}
		const ZodNever = /*@__PURE__*/ $constructor("ZodNever", (inst, def) => {
			$ZodNever.init(inst, def);
			ZodType.init(inst, def);
			inst._zod.processJSONSchema = (ctx, json, params) => neverProcessor(inst, ctx, json, params);
		});
		function never(params) {
			return /* @__PURE__ */ _never(ZodNever, params);
		}
		const ZodVoid = /*@__PURE__*/ $constructor("ZodVoid", (inst, def) => {
			$ZodVoid.init(inst, def);
			ZodType.init(inst, def);
			inst._zod.processJSONSchema = (ctx, json, params) => voidProcessor(inst, ctx, json, params);
		});
		function _void(params) {
			return /* @__PURE__ */ _void$1(ZodVoid, params);
		}
		const ZodArray = /*@__PURE__*/ $constructor("ZodArray", (inst, def) => {
			$ZodArray.init(inst, def);
			ZodType.init(inst, def);
			inst._zod.processJSONSchema = (ctx, json, params) => arrayProcessor(inst, ctx, json, params);
			inst.element = def.element;
			_installLazyMethods(inst, "ZodArray", {
				min(n, params) {
					return this.check(/* @__PURE__ */ _minLength(n, params));
				},
				nonempty(params) {
					return this.check(/* @__PURE__ */ _minLength(1, params));
				},
				max(n, params) {
					return this.check(/* @__PURE__ */ _maxLength(n, params));
				},
				length(n, params) {
					return this.check(/* @__PURE__ */ _length(n, params));
				},
				unwrap() {
					return this.element;
				}
			});
		});
		function array(element, params) {
			return /* @__PURE__ */ _array(ZodArray, element, params);
		}
		const ZodObject = /*@__PURE__*/ $constructor("ZodObject", (inst, def) => {
			$ZodObjectJIT.init(inst, def);
			ZodType.init(inst, def);
			inst._zod.processJSONSchema = (ctx, json, params) => objectProcessor(inst, ctx, json, params);
			defineLazy(inst, "shape", () => {
				return def.shape;
			});
			_installLazyMethods(inst, "ZodObject", {
				keyof() {
					return _enum(Object.keys(this._zod.def.shape));
				},
				catchall(catchall) {
					return this.clone({
						...this._zod.def,
						catchall
					});
				},
				passthrough() {
					return this.clone({
						...this._zod.def,
						catchall: unknown()
					});
				},
				loose() {
					return this.clone({
						...this._zod.def,
						catchall: unknown()
					});
				},
				strict() {
					return this.clone({
						...this._zod.def,
						catchall: never()
					});
				},
				strip() {
					return this.clone({
						...this._zod.def,
						catchall: void 0
					});
				},
				extend(incoming) {
					return extend(this, incoming);
				},
				safeExtend(incoming) {
					return safeExtend(this, incoming);
				},
				merge(other) {
					return merge(this, other);
				},
				pick(mask) {
					return pick$1(this, mask);
				},
				omit(mask) {
					return omit(this, mask);
				},
				partial(...args) {
					return partial(ZodOptional, this, args[0]);
				},
				required(...args) {
					return required(ZodNonOptional, this, args[0]);
				}
			});
		});
		function object(shape, params) {
			return new ZodObject({
				type: "object",
				shape: shape ?? {},
				...normalizeParams(params)
			});
		}
		const ZodUnion = /*@__PURE__*/ $constructor("ZodUnion", (inst, def) => {
			$ZodUnion.init(inst, def);
			ZodType.init(inst, def);
			inst._zod.processJSONSchema = (ctx, json, params) => unionProcessor(inst, ctx, json, params);
			inst.options = def.options;
		});
		function union(options, params) {
			return new ZodUnion({
				type: "union",
				options,
				...normalizeParams(params)
			});
		}
		const ZodIntersection = /*@__PURE__*/ $constructor("ZodIntersection", (inst, def) => {
			$ZodIntersection.init(inst, def);
			ZodType.init(inst, def);
			inst._zod.processJSONSchema = (ctx, json, params) => intersectionProcessor(inst, ctx, json, params);
		});
		function intersection(left, right) {
			return new ZodIntersection({
				type: "intersection",
				left,
				right
			});
		}
		const ZodRecord = /*@__PURE__*/ $constructor("ZodRecord", (inst, def) => {
			$ZodRecord.init(inst, def);
			ZodType.init(inst, def);
			inst._zod.processJSONSchema = (ctx, json, params) => recordProcessor(inst, ctx, json, params);
			inst.keyType = def.keyType;
			inst.valueType = def.valueType;
		});
		function record(keyType, valueType, params) {
			if (!valueType || !valueType._zod) return new ZodRecord({
				type: "record",
				keyType: string(),
				valueType: keyType,
				...normalizeParams(valueType)
			});
			return new ZodRecord({
				type: "record",
				keyType,
				valueType,
				...normalizeParams(params)
			});
		}
		const ZodEnum = /*@__PURE__*/ $constructor("ZodEnum", (inst, def) => {
			$ZodEnum.init(inst, def);
			ZodType.init(inst, def);
			inst._zod.processJSONSchema = (ctx, json, params) => enumProcessor(inst, ctx, json, params);
			inst.enum = def.entries;
			inst.options = Object.values(def.entries);
			const keys = new Set(Object.keys(def.entries));
			inst.extract = (values, params) => {
				const newEntries = {};
				for (const value of values) if (keys.has(value)) newEntries[value] = def.entries[value];
				else throw new Error(`Key ${value} not found in enum`);
				return new ZodEnum({
					...def,
					checks: [],
					...normalizeParams(params),
					entries: newEntries
				});
			};
			inst.exclude = (values, params) => {
				const newEntries = { ...def.entries };
				for (const value of values) if (keys.has(value)) delete newEntries[value];
				else throw new Error(`Key ${value} not found in enum`);
				return new ZodEnum({
					...def,
					checks: [],
					...normalizeParams(params),
					entries: newEntries
				});
			};
		});
		function _enum(values, params) {
			return new ZodEnum({
				type: "enum",
				entries: Array.isArray(values) ? Object.fromEntries(values.map((v) => [v, v])) : values,
				...normalizeParams(params)
			});
		}
		const ZodLiteral = /*@__PURE__*/ $constructor("ZodLiteral", (inst, def) => {
			$ZodLiteral.init(inst, def);
			ZodType.init(inst, def);
			inst._zod.processJSONSchema = (ctx, json, params) => literalProcessor(inst, ctx, json, params);
			inst.values = new Set(def.values);
			Object.defineProperty(inst, "value", { get() {
				if (def.values.length > 1) throw new Error("This schema contains multiple valid literal values. Use `.values` instead.");
				return def.values[0];
			} });
		});
		function literal(value, params) {
			return new ZodLiteral({
				type: "literal",
				values: Array.isArray(value) ? value : [value],
				...normalizeParams(params)
			});
		}
		const ZodTransform = /*@__PURE__*/ $constructor("ZodTransform", (inst, def) => {
			$ZodTransform.init(inst, def);
			ZodType.init(inst, def);
			inst._zod.processJSONSchema = (ctx, json, params) => transformProcessor(inst, ctx, json, params);
			inst._zod.parse = (payload, _ctx) => {
				if (_ctx.direction === "backward") throw new $ZodEncodeError(inst.constructor.name);
				payload.addIssue = (issue$1) => {
					if (typeof issue$1 === "string") payload.issues.push(issue(issue$1, payload.value, def));
					else {
						const _issue = issue$1;
						if (_issue.fatal) _issue.continue = false;
						_issue.code ?? (_issue.code = "custom");
						_issue.input ?? (_issue.input = payload.value);
						_issue.inst ?? (_issue.inst = inst);
						payload.issues.push(issue(_issue));
					}
				};
				const output = def.transform(payload.value, payload);
				if (output instanceof Promise) return output.then((output) => {
					payload.value = output;
					payload.fallback = true;
					return payload;
				});
				payload.value = output;
				payload.fallback = true;
				return payload;
			};
		});
		function transform(fn) {
			return new ZodTransform({
				type: "transform",
				transform: fn
			});
		}
		const ZodOptional = /*@__PURE__*/ $constructor("ZodOptional", (inst, def) => {
			$ZodOptional.init(inst, def);
			ZodType.init(inst, def);
			inst._zod.processJSONSchema = (ctx, json, params) => optionalProcessor(inst, ctx, json, params);
			inst.unwrap = () => inst._zod.def.innerType;
		});
		function optional(innerType) {
			return new ZodOptional({
				type: "optional",
				innerType
			});
		}
		const ZodExactOptional = /*@__PURE__*/ $constructor("ZodExactOptional", (inst, def) => {
			$ZodExactOptional.init(inst, def);
			ZodType.init(inst, def);
			inst._zod.processJSONSchema = (ctx, json, params) => optionalProcessor(inst, ctx, json, params);
			inst.unwrap = () => inst._zod.def.innerType;
		});
		function exactOptional(innerType) {
			return new ZodExactOptional({
				type: "optional",
				innerType
			});
		}
		const ZodNullable = /*@__PURE__*/ $constructor("ZodNullable", (inst, def) => {
			$ZodNullable.init(inst, def);
			ZodType.init(inst, def);
			inst._zod.processJSONSchema = (ctx, json, params) => nullableProcessor(inst, ctx, json, params);
			inst.unwrap = () => inst._zod.def.innerType;
		});
		function nullable(innerType) {
			return new ZodNullable({
				type: "nullable",
				innerType
			});
		}
		const ZodDefault = /*@__PURE__*/ $constructor("ZodDefault", (inst, def) => {
			$ZodDefault.init(inst, def);
			ZodType.init(inst, def);
			inst._zod.processJSONSchema = (ctx, json, params) => defaultProcessor(inst, ctx, json, params);
			inst.unwrap = () => inst._zod.def.innerType;
			inst.removeDefault = inst.unwrap;
		});
		function _default(innerType, defaultValue) {
			return new ZodDefault({
				type: "default",
				innerType,
				get defaultValue() {
					return typeof defaultValue === "function" ? defaultValue() : shallowClone(defaultValue);
				}
			});
		}
		const ZodPrefault = /*@__PURE__*/ $constructor("ZodPrefault", (inst, def) => {
			$ZodPrefault.init(inst, def);
			ZodType.init(inst, def);
			inst._zod.processJSONSchema = (ctx, json, params) => prefaultProcessor(inst, ctx, json, params);
			inst.unwrap = () => inst._zod.def.innerType;
		});
		function prefault(innerType, defaultValue) {
			return new ZodPrefault({
				type: "prefault",
				innerType,
				get defaultValue() {
					return typeof defaultValue === "function" ? defaultValue() : shallowClone(defaultValue);
				}
			});
		}
		const ZodNonOptional = /*@__PURE__*/ $constructor("ZodNonOptional", (inst, def) => {
			$ZodNonOptional.init(inst, def);
			ZodType.init(inst, def);
			inst._zod.processJSONSchema = (ctx, json, params) => nonoptionalProcessor(inst, ctx, json, params);
			inst.unwrap = () => inst._zod.def.innerType;
		});
		function nonoptional(innerType, params) {
			return new ZodNonOptional({
				type: "nonoptional",
				innerType,
				...normalizeParams(params)
			});
		}
		const ZodCatch = /*@__PURE__*/ $constructor("ZodCatch", (inst, def) => {
			$ZodCatch.init(inst, def);
			ZodType.init(inst, def);
			inst._zod.processJSONSchema = (ctx, json, params) => catchProcessor(inst, ctx, json, params);
			inst.unwrap = () => inst._zod.def.innerType;
			inst.removeCatch = inst.unwrap;
		});
		function _catch(innerType, catchValue) {
			return new ZodCatch({
				type: "catch",
				innerType,
				catchValue: typeof catchValue === "function" ? catchValue : () => catchValue
			});
		}
		const ZodPipe = /*@__PURE__*/ $constructor("ZodPipe", (inst, def) => {
			$ZodPipe.init(inst, def);
			ZodType.init(inst, def);
			inst._zod.processJSONSchema = (ctx, json, params) => pipeProcessor(inst, ctx, json, params);
			inst.in = def.in;
			inst.out = def.out;
		});
		function pipe(in_, out) {
			return new ZodPipe({
				type: "pipe",
				in: in_,
				out
			});
		}
		const ZodReadonly = /*@__PURE__*/ $constructor("ZodReadonly", (inst, def) => {
			$ZodReadonly.init(inst, def);
			ZodType.init(inst, def);
			inst._zod.processJSONSchema = (ctx, json, params) => readonlyProcessor(inst, ctx, json, params);
			inst.unwrap = () => inst._zod.def.innerType;
		});
		function readonly(innerType) {
			return new ZodReadonly({
				type: "readonly",
				innerType
			});
		}
		const ZodLazy = /*@__PURE__*/ $constructor("ZodLazy", (inst, def) => {
			$ZodLazy.init(inst, def);
			ZodType.init(inst, def);
			inst._zod.processJSONSchema = (ctx, json, params) => lazyProcessor(inst, ctx, json, params);
			inst.unwrap = () => inst._zod.def.getter();
		});
		function lazy(getter) {
			return new ZodLazy({
				type: "lazy",
				getter
			});
		}
		const ZodCustom = /*@__PURE__*/ $constructor("ZodCustom", (inst, def) => {
			$ZodCustom.init(inst, def);
			ZodType.init(inst, def);
			inst._zod.processJSONSchema = (ctx, json, params) => customProcessor(inst, ctx, json, params);
		});
		function refine(fn, _params = {}) {
			return /* @__PURE__ */ _refine(ZodCustom, fn, _params);
		}
		function superRefine(fn, params) {
			return /* @__PURE__ */ _superRefine(fn, params);
		}
		//#endregion
		//#region ../api-learn/lib/typert.remote-client.js
		let JsonValueRemoteCodec$schema$value;
		const JsonValueRemoteCodec$schema = () => JsonValueRemoteCodec$schema$value ??= union([
			literal(null),
			string(),
			number(),
			literal(false),
			literal(true),
			array(lazy(() => JsonValueRemoteCodec$schema())),
			record(string(), lazy(() => JsonValueRemoteCodec$schema()))
		]);
		let JsonValueRemoteCodec$schema2$value;
		const JsonValueRemoteCodec$schema2 = () => JsonValueRemoteCodec$schema2$value ??= union([
			literal(null),
			string(),
			number(),
			literal(false),
			literal(true),
			array(lazy(() => JsonValueRemoteCodec$schema2())),
			record(string(), lazy(() => JsonValueRemoteCodec$schema2()))
		]);
		let JsonValueRemoteCodec$schema3$value;
		const JsonValueRemoteCodec$schema3 = () => JsonValueRemoteCodec$schema3$value ??= union([
			literal(null),
			string(),
			number(),
			literal(false),
			literal(true),
			array(lazy(() => JsonValueRemoteCodec$schema3())),
			record(string(), lazy(() => JsonValueRemoteCodec$schema3()))
		]);
		let JsonValueRemoteCodec$schema4$value;
		const JsonValueRemoteCodec$schema4 = () => JsonValueRemoteCodec$schema4$value ??= union([
			literal(null),
			string(),
			number(),
			literal(false),
			literal(true),
			array(lazy(() => JsonValueRemoteCodec$schema4())),
			record(string(), lazy(() => JsonValueRemoteCodec$schema4()))
		]);
		let JsonValueRemoteCodec$schema5$value;
		const JsonValueRemoteCodec$schema5 = () => JsonValueRemoteCodec$schema5$value ??= union([
			literal(null),
			string(),
			number(),
			literal(false),
			literal(true),
			array(lazy(() => JsonValueRemoteCodec$schema5())),
			record(string(), lazy(() => JsonValueRemoteCodec$schema5()))
		]);
		let JsonValueRemoteCodec$schema6$value;
		const JsonValueRemoteCodec$schema6 = () => JsonValueRemoteCodec$schema6$value ??= union([
			literal(null),
			string(),
			number(),
			literal(false),
			literal(true),
			array(lazy(() => JsonValueRemoteCodec$schema6())),
			record(string(), lazy(() => JsonValueRemoteCodec$schema6()))
		]);
		let _deepseek_ai_dsh_experimental_api_learn_learn_completeReview_parameter_0$schema$value;
		const _deepseek_ai_dsh_experimental_api_learn_learn_completeReview_parameter_0$schema = () => _deepseek_ai_dsh_experimental_api_learn_learn_completeReview_parameter_0$schema$value ??= intersection(string(), unknown());
		let _deepseek_ai_dsh_experimental_api_learn_learn_completeReview_parameter_1$schema$value;
		const _deepseek_ai_dsh_experimental_api_learn_learn_completeReview_parameter_1$schema = () => _deepseek_ai_dsh_experimental_api_learn_learn_completeReview_parameter_1$schema$value ??= intersection(string(), unknown());
		let _deepseek_ai_dsh_experimental_api_learn_learn_completeReview_parameter_2$schema$value;
		const _deepseek_ai_dsh_experimental_api_learn_learn_completeReview_parameter_2$schema = () => _deepseek_ai_dsh_experimental_api_learn_learn_completeReview_parameter_2$schema$value ??= union([
			literal(null),
			literal("easy"),
			literal("hard"),
			literal("again"),
			literal("good")
		]);
		let _deepseek_ai_dsh_experimental_api_learn_learn_completeReview_result$schema$value;
		const _deepseek_ai_dsh_experimental_api_learn_learn_completeReview_result$schema = () => _deepseek_ai_dsh_experimental_api_learn_learn_completeReview_result$schema$value ??= object({
			"itemId": intersection(string(), unknown()).readonly(),
			"duplicate": boolean().readonly(),
			"previousDueDate": string().readonly(),
			"nextDueDate": string().readonly(),
			"intervalDays": number().readonly(),
			"step": number().readonly(),
			"reason": object({
				"zh": string().readonly(),
				"en": string().readonly()
			}).readonly(),
			"reveal": object({
				"parentProblemId": intersection(string(), unknown()).readonly(),
				"parentTitle": object({
					"zh": string().readonly(),
					"en": string().readonly()
				}).readonly(),
				"differences": array(object({
					"category": union([
						literal("output"),
						literal("constraints"),
						literal("input-structure"),
						literal("reasoning")
					]).readonly(),
					"description": object({
						"zh": string().readonly(),
						"en": string().readonly()
					}).readonly()
				})).readonly(),
				"transfer": object({
					"zh": string().readonly(),
					"en": string().readonly()
				}).readonly()
			}).readonly().optional()
		});
		let _deepseek_ai_dsh_experimental_api_learn_learn_emailJobs_result$schema$value;
		const _deepseek_ai_dsh_experimental_api_learn_learn_emailJobs_result$schema = () => _deepseek_ai_dsh_experimental_api_learn_learn_emailJobs_result$schema$value ??= array(object({
			"id": intersection(string(), unknown()).readonly(),
			"kind": union([
				literal("digest"),
				literal("verification"),
				literal("test")
			]).readonly(),
			"status": union([
				literal("cancelled"),
				literal("failed"),
				literal("skipped"),
				literal("queued"),
				literal("sending"),
				literal("sent"),
				literal("captured")
			]).readonly(),
			"attempts": number().readonly(),
			"idempotencyKey": string().readonly(),
			"lastError": string().readonly().optional(),
			"reason": string().readonly().optional(),
			"createdAt": string().readonly(),
			"updatedAt": string().readonly(),
			"previewSubject": string().readonly().optional()
		}));
		let _deepseek_ai_dsh_experimental_api_learn_learn_emailPreferences_parameter_0$schema$value;
		const _deepseek_ai_dsh_experimental_api_learn_learn_emailPreferences_parameter_0$schema = () => _deepseek_ai_dsh_experimental_api_learn_learn_emailPreferences_parameter_0$schema$value ??= object({
			"optIn": boolean().optional(),
			"paused": boolean().optional(),
			"deliveryHour": number().optional()
		});
		let _deepseek_ai_dsh_experimental_api_learn_learn_emailPreferences_result$schema$value;
		const _deepseek_ai_dsh_experimental_api_learn_learn_emailPreferences_result$schema = () => _deepseek_ai_dsh_experimental_api_learn_learn_emailPreferences_result$schema$value ??= object({
			"address": string().readonly().optional(),
			"verified": boolean().readonly(),
			"verificationPending": boolean().readonly(),
			"optIn": boolean().readonly(),
			"paused": boolean().readonly(),
			"deliveryHour": number().readonly(),
			"transport": union([literal("capture"), literal("smtp")]).readonly(),
			"liveSending": boolean().readonly(),
			"verifyUrlAvailable": boolean().readonly()
		});
		let _deepseek_ai_dsh_experimental_api_learn_learn_emailPreview_parameter_0$schema$value;
		const _deepseek_ai_dsh_experimental_api_learn_learn_emailPreview_parameter_0$schema = () => _deepseek_ai_dsh_experimental_api_learn_learn_emailPreview_parameter_0$schema$value ??= intersection(string(), unknown());
		let _deepseek_ai_dsh_experimental_api_learn_learn_emailPreview_result$schema$value;
		const _deepseek_ai_dsh_experimental_api_learn_learn_emailPreview_result$schema = () => _deepseek_ai_dsh_experimental_api_learn_learn_emailPreview_result$schema$value ??= object({
			"jobId": intersection(string(), unknown()).readonly(),
			"to": string().readonly(),
			"subject": string().readonly(),
			"text": string().readonly(),
			"html": string().readonly(),
			"transport": union([literal("capture"), literal("smtp")]).readonly(),
			"status": union([
				literal("cancelled"),
				literal("failed"),
				literal("skipped"),
				literal("queued"),
				literal("sending"),
				literal("sent"),
				literal("captured")
			]).readonly()
		});
		let _deepseek_ai_dsh_experimental_api_learn_learn_emailSettings_result$schema$value;
		const _deepseek_ai_dsh_experimental_api_learn_learn_emailSettings_result$schema = () => _deepseek_ai_dsh_experimental_api_learn_learn_emailSettings_result$schema$value ??= object({
			"address": string().readonly().optional(),
			"verified": boolean().readonly(),
			"verificationPending": boolean().readonly(),
			"optIn": boolean().readonly(),
			"paused": boolean().readonly(),
			"deliveryHour": number().readonly(),
			"transport": union([literal("capture"), literal("smtp")]).readonly(),
			"liveSending": boolean().readonly(),
			"verifyUrlAvailable": boolean().readonly()
		});
		let _deepseek_ai_dsh_experimental_api_learn_learn_exportData_result$schema$value;
		const _deepseek_ai_dsh_experimental_api_learn_learn_exportData_result$schema = () => _deepseek_ai_dsh_experimental_api_learn_learn_exportData_result$schema$value ??= object({
			"format": literal("dsh-learn-export").readonly(),
			"version": literal(1).readonly(),
			"exportedAt": string().readonly(),
			"learnerId": intersection(string(), unknown()).readonly(),
			"tables": record(string(), array(record(string(), union([
				literal(null),
				string(),
				number(),
				literal(false),
				literal(true),
				array(lazy(() => JsonValueRemoteCodec$schema6())),
				record(string(), lazy(() => JsonValueRemoteCodec$schema6()))
			])).readonly())).readonly().readonly()
		});
		let _deepseek_ai_dsh_experimental_api_learn_learn_generateVariant_parameter_0$schema$value;
		const _deepseek_ai_dsh_experimental_api_learn_learn_generateVariant_parameter_0$schema = () => _deepseek_ai_dsh_experimental_api_learn_learn_generateVariant_parameter_0$schema$value ??= intersection(string(), unknown());
		let _deepseek_ai_dsh_experimental_api_learn_learn_generateVariant_result$schema$value;
		const _deepseek_ai_dsh_experimental_api_learn_learn_generateVariant_result$schema = () => _deepseek_ai_dsh_experimental_api_learn_learn_generateVariant_result$schema$value ??= object({
			"status": union([
				literal("failed"),
				literal("validated"),
				literal("skipped")
			]).readonly(),
			"variant": object({
				"id": intersection(string(), unknown()).readonly(),
				"parentProblemId": intersection(string(), unknown()).readonly(),
				"topicId": intersection(string(), unknown()).readonly(),
				"status": union([literal("validated"), literal("quarantined")]).readonly(),
				"origin": object({
					"source": union([
						literal("imported"),
						literal("authored"),
						literal("generated")
					]).readonly(),
					"author": string().readonly(),
					"createdAt": string().readonly(),
					"seed": union([_undefined(), number()]).readonly().optional(),
					"sessionId": union([_undefined(), string()]).readonly().optional()
				}).readonly(),
				"validation": object({
					"ok": boolean().readonly(),
					"checks": array(object({
						"name": string().readonly(),
						"ok": boolean().readonly(),
						"detail": string().readonly()
					})).readonly()
				}).readonly(),
				"title": object({
					"zh": string().readonly(),
					"en": string().readonly()
				}).readonly(),
				"createdAt": string().readonly()
			}).readonly().optional(),
			"quarantined": array(object({
				"id": intersection(string(), unknown()).readonly(),
				"parentProblemId": intersection(string(), unknown()).readonly(),
				"topicId": intersection(string(), unknown()).readonly(),
				"status": union([literal("validated"), literal("quarantined")]).readonly(),
				"origin": object({
					"source": union([
						literal("imported"),
						literal("authored"),
						literal("generated")
					]).readonly(),
					"author": string().readonly(),
					"createdAt": string().readonly(),
					"seed": union([_undefined(), number()]).readonly().optional(),
					"sessionId": union([_undefined(), string()]).readonly().optional()
				}).readonly(),
				"validation": object({
					"ok": boolean().readonly(),
					"checks": array(object({
						"name": string().readonly(),
						"ok": boolean().readonly(),
						"detail": string().readonly()
					})).readonly()
				}).readonly(),
				"title": object({
					"zh": string().readonly(),
					"en": string().readonly()
				}).readonly(),
				"createdAt": string().readonly()
			})).readonly(),
			"message": string().readonly()
		});
		let _deepseek_ai_dsh_experimental_api_learn_learn_hint_parameter_0$schema$value;
		const _deepseek_ai_dsh_experimental_api_learn_learn_hint_parameter_0$schema = () => _deepseek_ai_dsh_experimental_api_learn_learn_hint_parameter_0$schema$value ??= intersection(string(), unknown());
		let _deepseek_ai_dsh_experimental_api_learn_learn_hint_parameter_1$schema$value;
		const _deepseek_ai_dsh_experimental_api_learn_learn_hint_parameter_1$schema = () => _deepseek_ai_dsh_experimental_api_learn_learn_hint_parameter_1$schema$value ??= union([
			literal(1),
			literal(2),
			literal(3),
			literal(4)
		]);
		let _deepseek_ai_dsh_experimental_api_learn_learn_hint_parameter_2$schema$value;
		const _deepseek_ai_dsh_experimental_api_learn_learn_hint_parameter_2$schema = () => _deepseek_ai_dsh_experimental_api_learn_learn_hint_parameter_2$schema$value ??= boolean();
		let _deepseek_ai_dsh_experimental_api_learn_learn_hint_result$schema$value;
		const _deepseek_ai_dsh_experimental_api_learn_learn_hint_result$schema = () => _deepseek_ai_dsh_experimental_api_learn_learn_hint_result$schema$value ??= object({
			"level": union([
				literal(1),
				literal(2),
				literal(3),
				literal(4)
			]).readonly(),
			"source": union([literal("authored"), literal("tutor")]).readonly(),
			"content": string().readonly(),
			"createdAt": string().readonly()
		});
		let _deepseek_ai_dsh_experimental_api_learn_learn_importProblem_parameter_0$schema$value;
		const _deepseek_ai_dsh_experimental_api_learn_learn_importProblem_parameter_0$schema = () => _deepseek_ai_dsh_experimental_api_learn_learn_importProblem_parameter_0$schema$value ??= string();
		let _deepseek_ai_dsh_experimental_api_learn_learn_importProblem_result$schema$value;
		const _deepseek_ai_dsh_experimental_api_learn_learn_importProblem_result$schema = () => _deepseek_ai_dsh_experimental_api_learn_learn_importProblem_result$schema$value ??= object({
			"id": intersection(string(), unknown()).readonly(),
			"parentProblemId": intersection(string(), unknown()).readonly(),
			"topicId": intersection(string(), unknown()).readonly(),
			"status": union([literal("validated"), literal("quarantined")]).readonly(),
			"origin": object({
				"source": union([
					literal("imported"),
					literal("authored"),
					literal("generated")
				]).readonly(),
				"author": string().readonly(),
				"createdAt": string().readonly(),
				"seed": union([_undefined(), number()]).readonly().optional(),
				"sessionId": union([_undefined(), string()]).readonly().optional()
			}).readonly(),
			"validation": object({
				"ok": boolean().readonly(),
				"checks": array(object({
					"name": string().readonly(),
					"ok": boolean().readonly(),
					"detail": string().readonly()
				})).readonly()
			}).readonly(),
			"title": object({
				"zh": string().readonly(),
				"en": string().readonly()
			}).readonly(),
			"createdAt": string().readonly()
		});
		let _deepseek_ai_dsh_experimental_api_learn_learn_lesson_parameter_0$schema$value;
		const _deepseek_ai_dsh_experimental_api_learn_learn_lesson_parameter_0$schema = () => _deepseek_ai_dsh_experimental_api_learn_learn_lesson_parameter_0$schema$value ??= intersection(string(), unknown());
		let _deepseek_ai_dsh_experimental_api_learn_learn_lesson_parameter_1$schema$value;
		const _deepseek_ai_dsh_experimental_api_learn_learn_lesson_parameter_1$schema = () => _deepseek_ai_dsh_experimental_api_learn_learn_lesson_parameter_1$schema$value ??= union([
			literal("complete"),
			literal("motivation"),
			literal("strategy"),
			literal("example"),
			literal("check"),
			literal("problem"),
			literal("reflection")
		]);
		let _deepseek_ai_dsh_experimental_api_learn_learn_lesson_parameter_2$schema$value;
		const _deepseek_ai_dsh_experimental_api_learn_learn_lesson_parameter_2$schema = () => _deepseek_ai_dsh_experimental_api_learn_learn_lesson_parameter_2$schema$value ??= record(string(), number()).readonly();
		let _deepseek_ai_dsh_experimental_api_learn_learn_lesson_result$schema$value;
		const _deepseek_ai_dsh_experimental_api_learn_learn_lesson_result$schema = () => _deepseek_ai_dsh_experimental_api_learn_learn_lesson_result$schema$value ??= object({
			"progress": object({
				"topicId": intersection(string(), unknown()).readonly(),
				"stage": union([
					literal("complete"),
					literal("motivation"),
					literal("strategy"),
					literal("example"),
					literal("check"),
					literal("problem"),
					literal("reflection")
				]).readonly(),
				"checkAnswers": record(string(), number()).readonly().readonly(),
				"skipped": boolean().readonly(),
				"reflection": string().readonly().optional(),
				"reflectionFeedback": string().readonly().optional(),
				"completedAt": string().readonly().optional()
			}),
			"correct": record(string(), boolean())
		});
		let _deepseek_ai_dsh_experimental_api_learn_learn_moveReview_parameter_0$schema$value;
		const _deepseek_ai_dsh_experimental_api_learn_learn_moveReview_parameter_0$schema = () => _deepseek_ai_dsh_experimental_api_learn_learn_moveReview_parameter_0$schema$value ??= intersection(string(), unknown());
		let _deepseek_ai_dsh_experimental_api_learn_learn_moveReview_parameter_1$schema$value;
		const _deepseek_ai_dsh_experimental_api_learn_learn_moveReview_parameter_1$schema = () => _deepseek_ai_dsh_experimental_api_learn_learn_moveReview_parameter_1$schema$value ??= union([object({ "days": number().readonly() }), object({ "date": string().readonly() })]);
		let _deepseek_ai_dsh_experimental_api_learn_learn_moveReview_parameter_2$schema$value;
		const _deepseek_ai_dsh_experimental_api_learn_learn_moveReview_parameter_2$schema = () => _deepseek_ai_dsh_experimental_api_learn_learn_moveReview_parameter_2$schema$value ??= string();
		let _deepseek_ai_dsh_experimental_api_learn_learn_moveReview_result$schema$value;
		const _deepseek_ai_dsh_experimental_api_learn_learn_moveReview_result$schema = () => _deepseek_ai_dsh_experimental_api_learn_learn_moveReview_result$schema$value ??= object({
			"dueDate": string(),
			"duplicate": boolean()
		});
		let _deepseek_ai_dsh_experimental_api_learn_learn_overview_result$schema$value;
		const _deepseek_ai_dsh_experimental_api_learn_learn_overview_result$schema = () => _deepseek_ai_dsh_experimental_api_learn_learn_overview_result$schema$value ??= object({
			"learnerId": intersection(string(), unknown()).readonly(),
			"settings": object({
				"locale": union([literal("zh"), literal("en")]).readonly(),
				"timezone": string().readonly(),
				"experience": union([
					literal("new"),
					literal("some"),
					literal("experienced")
				]).readonly(),
				"preferredLanguage": union([literal("python"), literal("typescript")]).readonly(),
				"dailyGoalMinutes": number().readonly(),
				"reviewDailyLimit": number().readonly(),
				"reviewLadderDays": array(number()).readonly()
			}).readonly(),
			"topics": array(object({
				"id": intersection(string(), unknown()).readonly(),
				"order": number().readonly(),
				"title": object({
					"zh": string().readonly(),
					"en": string().readonly()
				}).readonly(),
				"summary": object({
					"zh": string().readonly(),
					"en": string().readonly()
				}).readonly(),
				"prerequisites": array(intersection(string(), unknown())).readonly(),
				"problems": array(intersection(string(), unknown())).readonly(),
				"lesson": object({
					"motivation": object({
						"zh": string().readonly(),
						"en": string().readonly()
					}).readonly(),
					"strategy": object({
						"zh": string().readonly(),
						"en": string().readonly()
					}).readonly(),
					"example": object({
						"title": object({
							"zh": string().readonly(),
							"en": string().readonly()
						}).readonly(),
						"body": object({
							"zh": string().readonly(),
							"en": string().readonly()
						}).readonly(),
						"traceColumns": array(string()).readonly(),
						"trace": array(object({
							"state": record(string(), string()).readonly().readonly(),
							"note": object({
								"zh": string().readonly(),
								"en": string().readonly()
							}).readonly()
						})).readonly()
					}).readonly(),
					"check": array(object({
						"id": string().readonly(),
						"prompt": object({
							"zh": string().readonly(),
							"en": string().readonly()
						}).readonly(),
						"options": array(object({
							"zh": string().readonly(),
							"en": string().readonly()
						})).readonly(),
						"answer": number().readonly(),
						"explanation": object({
							"zh": string().readonly(),
							"en": string().readonly()
						}).readonly()
					})).readonly(),
					"practiceProblem": intersection(string(), unknown()).readonly(),
					"reflectionPrompt": object({
						"zh": string().readonly(),
						"en": string().readonly()
					}).readonly()
				}).readonly()
			})).readonly(),
			"lessons": array(object({
				"topicId": intersection(string(), unknown()).readonly(),
				"stage": union([
					literal("complete"),
					literal("motivation"),
					literal("strategy"),
					literal("example"),
					literal("check"),
					literal("problem"),
					literal("reflection")
				]).readonly(),
				"checkAnswers": record(string(), number()).readonly().readonly(),
				"skipped": boolean().readonly(),
				"reflection": string().readonly().optional(),
				"reflectionFeedback": string().readonly().optional(),
				"completedAt": string().readonly().optional()
			})).readonly(),
			"mastery": array(object({
				"topicId": intersection(string(), unknown()).readonly(),
				"score": number().readonly(),
				"level": union([
					literal("not-started"),
					literal("learning"),
					literal("practicing"),
					literal("proficient"),
					literal("mastered")
				]).readonly(),
				"independentSolves": number().readonly(),
				"assistedSolves": number().readonly(),
				"studiedSolutions": number().readonly(),
				"failedAttempts": number().readonly(),
				"reviewsPassed": number().readonly(),
				"reviewsFailed": number().readonly()
			})).readonly(),
			"problems": array(object({
				"id": intersection(string(), unknown()).readonly(),
				"kind": union([
					literal("leetcode"),
					literal("original"),
					literal("variant"),
					literal("imported")
				]).readonly(),
				"title": object({
					"zh": string().readonly(),
					"en": string().readonly()
				}).readonly(),
				"difficulty": union([
					literal("easy"),
					literal("medium"),
					literal("hard")
				]).readonly(),
				"topics": array(intersection(string(), unknown())).readonly(),
				"leetcode": object({
					"frontendId": number().readonly(),
					"url": string().readonly(),
					"tags": array(string()).readonly()
				}).readonly().optional(),
				"status": union([
					literal("new"),
					literal("attempted"),
					literal("solved-with-help"),
					literal("solved")
				]).readonly()
			})).readonly(),
			"runner": object({
				"backend": string().readonly(),
				"available": boolean().readonly(),
				"languages": array(object({
					"language": union([literal("python"), literal("typescript")]).readonly(),
					"available": boolean().readonly(),
					"image": string().readonly(),
					"reason": string().readonly().optional()
				})).readonly(),
				"reason": string().readonly().optional(),
				"checkedAt": string().readonly()
			}).readonly(),
			"tutor": object({
				"configured": boolean().readonly(),
				"provider": string().readonly().optional(),
				"model": string().readonly().optional(),
				"lastFailure": string().readonly().optional()
			}).readonly(),
			"languages": array(object({
				"language": union([literal("python"), literal("typescript")]).readonly(),
				"label": string().readonly(),
				"supported": boolean().readonly()
			})).readonly()
		});
		let _deepseek_ai_dsh_experimental_api_learn_learn_prepareRunner_parameter_0$schema$value;
		const _deepseek_ai_dsh_experimental_api_learn_learn_prepareRunner_parameter_0$schema = () => _deepseek_ai_dsh_experimental_api_learn_learn_prepareRunner_parameter_0$schema$value ??= union([literal("python"), literal("typescript")]);
		let _deepseek_ai_dsh_experimental_api_learn_learn_prepareRunner_result$schema$value;
		const _deepseek_ai_dsh_experimental_api_learn_learn_prepareRunner_result$schema = () => _deepseek_ai_dsh_experimental_api_learn_learn_prepareRunner_result$schema$value ??= object({
			"backend": string().readonly(),
			"available": boolean().readonly(),
			"languages": array(object({
				"language": union([literal("python"), literal("typescript")]).readonly(),
				"available": boolean().readonly(),
				"image": string().readonly(),
				"reason": string().readonly().optional()
			})).readonly(),
			"reason": string().readonly().optional(),
			"checkedAt": string().readonly()
		});
		let _deepseek_ai_dsh_experimental_api_learn_learn_progress_result$schema$value;
		const _deepseek_ai_dsh_experimental_api_learn_learn_progress_result$schema = () => _deepseek_ai_dsh_experimental_api_learn_learn_progress_result$schema$value ??= object({
			"mastery": array(object({
				"topicId": intersection(string(), unknown()).readonly(),
				"score": number().readonly(),
				"level": union([
					literal("not-started"),
					literal("learning"),
					literal("practicing"),
					literal("proficient"),
					literal("mastered")
				]).readonly(),
				"independentSolves": number().readonly(),
				"assistedSolves": number().readonly(),
				"studiedSolutions": number().readonly(),
				"failedAttempts": number().readonly(),
				"reviewsPassed": number().readonly(),
				"reviewsFailed": number().readonly()
			})).readonly(),
			"mistakes": array(object({
				"tag": string().readonly(),
				"count": number().readonly(),
				"lastSeen": string().readonly(),
				"topics": array(intersection(string(), unknown())).readonly()
			})).readonly(),
			"history": array(object({
				"kind": union([
					literal("completed"),
					literal("created"),
					literal("snoozed"),
					literal("rescheduled")
				]).readonly(),
				"itemId": intersection(string(), unknown()).readonly(),
				"topicId": intersection(string(), unknown()).readonly(),
				"reason": object({
					"zh": string().readonly(),
					"en": string().readonly()
				}).readonly(),
				"dueDate": string().readonly(),
				"createdAt": string().readonly()
			})).readonly(),
			"attempts": array(object({
				"id": intersection(string(), unknown()).readonly(),
				"problemId": intersection(string(), unknown()).readonly(),
				"problemVersion": number().readonly(),
				"suiteVersion": number().readonly(),
				"language": union([literal("python"), literal("typescript")]).readonly(),
				"kind": union([literal("run"), literal("submit")]).readonly(),
				"context": union([
					literal("review"),
					literal("lesson"),
					literal("practice")
				]).readonly(),
				"code": string().readonly(),
				"support": union([
					literal("independent"),
					literal("with-hints"),
					literal("studied-solution")
				]).readonly(),
				"hintsUsed": number().readonly(),
				"status": union([literal("judging"), literal("done")]).readonly(),
				"verdict": object({
					"kind": union([
						literal("cancelled"),
						literal("passed-local-tests"),
						literal("wrong-answer"),
						literal("compile-error"),
						literal("runtime-error"),
						literal("time-limit-exceeded"),
						literal("memory-limit-exceeded"),
						literal("output-limit-exceeded"),
						literal("evaluation-unavailable")
					]).readonly(),
					"passed": number().readonly(),
					"total": number().readonly(),
					"suite": union([
						literal("examples"),
						literal("custom"),
						literal("full")
					]).readonly(),
					"suiteVersion": number().readonly(),
					"language": union([literal("python"), literal("typescript")]).readonly(),
					"runner": string().readonly(),
					"failing": object({
						"caseId": string().readonly(),
						"visibility": union([
							literal("example"),
							literal("custom"),
							literal("hidden")
						]).readonly(),
						"args": array(union([
							literal(null),
							string(),
							number(),
							literal(false),
							literal(true),
							array(lazy(() => JsonValueRemoteCodec$schema5())),
							record(string(), lazy(() => JsonValueRemoteCodec$schema5()))
						])).readonly(),
						"expected": union([
							literal(null),
							string(),
							number(),
							literal(false),
							literal(true),
							array(lazy(() => JsonValueRemoteCodec$schema5())),
							record(string(), lazy(() => JsonValueRemoteCodec$schema5()))
						]).readonly().optional(),
						"actual": union([
							literal(null),
							string(),
							number(),
							literal(false),
							literal(true),
							array(lazy(() => JsonValueRemoteCodec$schema5())),
							record(string(), lazy(() => JsonValueRemoteCodec$schema5()))
						]).readonly().optional(),
						"error": string().readonly().optional(),
						"line": number().readonly().optional(),
						"stdout": string().readonly().optional()
					}).readonly().optional(),
					"cases": array(object({
						"caseId": string().readonly(),
						"args": array(union([
							literal(null),
							string(),
							number(),
							literal(false),
							literal(true),
							array(lazy(() => JsonValueRemoteCodec$schema5())),
							record(string(), lazy(() => JsonValueRemoteCodec$schema5()))
						])).readonly(),
						"expected": union([
							literal(null),
							string(),
							number(),
							literal(false),
							literal(true),
							array(lazy(() => JsonValueRemoteCodec$schema5())),
							record(string(), lazy(() => JsonValueRemoteCodec$schema5()))
						]).readonly().optional(),
						"actual": union([
							literal(null),
							string(),
							number(),
							literal(false),
							literal(true),
							array(lazy(() => JsonValueRemoteCodec$schema5())),
							record(string(), lazy(() => JsonValueRemoteCodec$schema5()))
						]).readonly().optional(),
						"passed": boolean().readonly(),
						"error": string().readonly().optional(),
						"line": number().readonly().optional(),
						"stdout": string().readonly(),
						"timeMs": number().readonly().optional()
					})).readonly().optional(),
					"measuredMs": number().readonly().optional(),
					"message": string().readonly().optional(),
					"coverageNote": object({
						"zh": string().readonly(),
						"en": string().readonly()
					}).readonly(),
					"createdAt": string().readonly()
				}).readonly().optional(),
				"assessment": object({
					"source": union([literal("agent"), literal("unavailable")]).readonly(),
					"summary": string().readonly(),
					"reasoning": string().readonly().optional(),
					"likelyComplexity": object({
						"time": string().readonly(),
						"space": string().readonly(),
						"basis": literal("estimated").readonly()
					}).readonly().optional(),
					"codeQuality": string().readonly().optional(),
					"misconceptions": array(string()).readonly(),
					"mistakeTags": array(string()).readonly(),
					"nextStep": string().readonly().optional(),
					"reflectionQuestion": string().readonly().optional(),
					"sessionId": string().readonly().optional(),
					"failure": string().readonly().optional()
				}).readonly().optional(),
				"judgeMode": union([literal("agent"), literal("deterministic-fallback")]).readonly().optional(),
				"createdAt": string().readonly()
			})).readonly()
		});
		let _deepseek_ai_dsh_experimental_api_learn_learn_reflect_parameter_0$schema$value;
		const _deepseek_ai_dsh_experimental_api_learn_learn_reflect_parameter_0$schema = () => _deepseek_ai_dsh_experimental_api_learn_learn_reflect_parameter_0$schema$value ??= intersection(string(), unknown());
		let _deepseek_ai_dsh_experimental_api_learn_learn_reflect_parameter_1$schema$value;
		const _deepseek_ai_dsh_experimental_api_learn_learn_reflect_parameter_1$schema = () => _deepseek_ai_dsh_experimental_api_learn_learn_reflect_parameter_1$schema$value ??= string();
		let _deepseek_ai_dsh_experimental_api_learn_learn_reflect_result$schema$value;
		const _deepseek_ai_dsh_experimental_api_learn_learn_reflect_result$schema = () => _deepseek_ai_dsh_experimental_api_learn_learn_reflect_result$schema$value ??= object({
			"topicId": intersection(string(), unknown()).readonly(),
			"stage": union([
				literal("complete"),
				literal("motivation"),
				literal("strategy"),
				literal("example"),
				literal("check"),
				literal("problem"),
				literal("reflection")
			]).readonly(),
			"checkAnswers": record(string(), number()).readonly().readonly(),
			"skipped": boolean().readonly(),
			"reflection": string().readonly().optional(),
			"reflectionFeedback": string().readonly().optional(),
			"completedAt": string().readonly().optional()
		});
		let _deepseek_ai_dsh_experimental_api_learn_learn_resetData_parameter_0$schema$value;
		const _deepseek_ai_dsh_experimental_api_learn_learn_resetData_parameter_0$schema = () => _deepseek_ai_dsh_experimental_api_learn_learn_resetData_parameter_0$schema$value ??= string();
		let _deepseek_ai_dsh_experimental_api_learn_learn_resetData_result$schema$value;
		const _deepseek_ai_dsh_experimental_api_learn_learn_resetData_result$schema = () => _deepseek_ai_dsh_experimental_api_learn_learn_resetData_result$schema$value ??= _void();
		let _deepseek_ai_dsh_experimental_api_learn_learn_reviewQueue_result$schema$value;
		const _deepseek_ai_dsh_experimental_api_learn_learn_reviewQueue_result$schema = () => _deepseek_ai_dsh_experimental_api_learn_learn_reviewQueue_result$schema$value ??= object({
			"today": string().readonly(),
			"timezone": string().readonly(),
			"dailyLimit": number().readonly(),
			"completedToday": number().readonly(),
			"due": array(object({
				"itemId": intersection(string(), unknown()).readonly(),
				"topicId": intersection(string(), unknown()).readonly(),
				"parentProblemId": intersection(string(), unknown()).readonly(),
				"dueDate": string().readonly(),
				"overdueDays": number().readonly(),
				"intervalDays": number().readonly(),
				"step": number().readonly(),
				"variantId": intersection(string(), unknown()).readonly().optional(),
				"variantOrigin": union([
					literal("imported"),
					literal("authored"),
					literal("generated")
				]).readonly().optional(),
				"estimatedMinutes": number().readonly(),
				"lastReason": object({
					"zh": string().readonly(),
					"en": string().readonly()
				}).readonly().optional()
			})).readonly(),
			"upcoming": array(object({
				"itemId": intersection(string(), unknown()).readonly(),
				"topicId": intersection(string(), unknown()).readonly(),
				"parentProblemId": intersection(string(), unknown()).readonly(),
				"dueDate": string().readonly(),
				"overdueDays": number().readonly(),
				"intervalDays": number().readonly(),
				"step": number().readonly(),
				"variantId": intersection(string(), unknown()).readonly().optional(),
				"variantOrigin": union([
					literal("imported"),
					literal("authored"),
					literal("generated")
				]).readonly().optional(),
				"estimatedMinutes": number().readonly(),
				"lastReason": object({
					"zh": string().readonly(),
					"en": string().readonly()
				}).readonly().optional()
			})).readonly(),
			"deferred": number().readonly()
		});
		let _deepseek_ai_dsh_experimental_api_learn_learn_run_parameter_0$schema$value;
		const _deepseek_ai_dsh_experimental_api_learn_learn_run_parameter_0$schema = () => _deepseek_ai_dsh_experimental_api_learn_learn_run_parameter_0$schema$value ??= intersection(string(), unknown());
		let _deepseek_ai_dsh_experimental_api_learn_learn_run_parameter_1$schema$value;
		const _deepseek_ai_dsh_experimental_api_learn_learn_run_parameter_1$schema = () => _deepseek_ai_dsh_experimental_api_learn_learn_run_parameter_1$schema$value ??= union([literal("python"), literal("typescript")]);
		let _deepseek_ai_dsh_experimental_api_learn_learn_run_parameter_2$schema$value;
		const _deepseek_ai_dsh_experimental_api_learn_learn_run_parameter_2$schema = () => _deepseek_ai_dsh_experimental_api_learn_learn_run_parameter_2$schema$value ??= string();
		let _deepseek_ai_dsh_experimental_api_learn_learn_run_parameter_3$schema$value;
		const _deepseek_ai_dsh_experimental_api_learn_learn_run_parameter_3$schema = () => _deepseek_ai_dsh_experimental_api_learn_learn_run_parameter_3$schema$value ??= array(array(union([
			literal(null),
			string(),
			number(),
			literal(false),
			literal(true),
			array(lazy(() => JsonValueRemoteCodec$schema2())),
			record(string(), lazy(() => JsonValueRemoteCodec$schema2()))
		])));
		let _deepseek_ai_dsh_experimental_api_learn_learn_run_result$schema$value;
		const _deepseek_ai_dsh_experimental_api_learn_learn_run_result$schema = () => _deepseek_ai_dsh_experimental_api_learn_learn_run_result$schema$value ??= object({
			"id": intersection(string(), unknown()).readonly(),
			"problemId": intersection(string(), unknown()).readonly(),
			"problemVersion": number().readonly(),
			"suiteVersion": number().readonly(),
			"language": union([literal("python"), literal("typescript")]).readonly(),
			"kind": union([literal("run"), literal("submit")]).readonly(),
			"context": union([
				literal("review"),
				literal("lesson"),
				literal("practice")
			]).readonly(),
			"code": string().readonly(),
			"support": union([
				literal("independent"),
				literal("with-hints"),
				literal("studied-solution")
			]).readonly(),
			"hintsUsed": number().readonly(),
			"status": union([literal("judging"), literal("done")]).readonly(),
			"verdict": object({
				"kind": union([
					literal("cancelled"),
					literal("passed-local-tests"),
					literal("wrong-answer"),
					literal("compile-error"),
					literal("runtime-error"),
					literal("time-limit-exceeded"),
					literal("memory-limit-exceeded"),
					literal("output-limit-exceeded"),
					literal("evaluation-unavailable")
				]).readonly(),
				"passed": number().readonly(),
				"total": number().readonly(),
				"suite": union([
					literal("examples"),
					literal("custom"),
					literal("full")
				]).readonly(),
				"suiteVersion": number().readonly(),
				"language": union([literal("python"), literal("typescript")]).readonly(),
				"runner": string().readonly(),
				"failing": object({
					"caseId": string().readonly(),
					"visibility": union([
						literal("example"),
						literal("custom"),
						literal("hidden")
					]).readonly(),
					"args": array(union([
						literal(null),
						string(),
						number(),
						literal(false),
						literal(true),
						array(lazy(() => JsonValueRemoteCodec$schema3())),
						record(string(), lazy(() => JsonValueRemoteCodec$schema3()))
					])).readonly(),
					"expected": union([
						literal(null),
						string(),
						number(),
						literal(false),
						literal(true),
						array(lazy(() => JsonValueRemoteCodec$schema3())),
						record(string(), lazy(() => JsonValueRemoteCodec$schema3()))
					]).readonly().optional(),
					"actual": union([
						literal(null),
						string(),
						number(),
						literal(false),
						literal(true),
						array(lazy(() => JsonValueRemoteCodec$schema3())),
						record(string(), lazy(() => JsonValueRemoteCodec$schema3()))
					]).readonly().optional(),
					"error": string().readonly().optional(),
					"line": number().readonly().optional(),
					"stdout": string().readonly().optional()
				}).readonly().optional(),
				"cases": array(object({
					"caseId": string().readonly(),
					"args": array(union([
						literal(null),
						string(),
						number(),
						literal(false),
						literal(true),
						array(lazy(() => JsonValueRemoteCodec$schema3())),
						record(string(), lazy(() => JsonValueRemoteCodec$schema3()))
					])).readonly(),
					"expected": union([
						literal(null),
						string(),
						number(),
						literal(false),
						literal(true),
						array(lazy(() => JsonValueRemoteCodec$schema3())),
						record(string(), lazy(() => JsonValueRemoteCodec$schema3()))
					]).readonly().optional(),
					"actual": union([
						literal(null),
						string(),
						number(),
						literal(false),
						literal(true),
						array(lazy(() => JsonValueRemoteCodec$schema3())),
						record(string(), lazy(() => JsonValueRemoteCodec$schema3()))
					]).readonly().optional(),
					"passed": boolean().readonly(),
					"error": string().readonly().optional(),
					"line": number().readonly().optional(),
					"stdout": string().readonly(),
					"timeMs": number().readonly().optional()
				})).readonly().optional(),
				"measuredMs": number().readonly().optional(),
				"message": string().readonly().optional(),
				"coverageNote": object({
					"zh": string().readonly(),
					"en": string().readonly()
				}).readonly(),
				"createdAt": string().readonly()
			}).readonly().optional(),
			"assessment": object({
				"source": union([literal("agent"), literal("unavailable")]).readonly(),
				"summary": string().readonly(),
				"reasoning": string().readonly().optional(),
				"likelyComplexity": object({
					"time": string().readonly(),
					"space": string().readonly(),
					"basis": literal("estimated").readonly()
				}).readonly().optional(),
				"codeQuality": string().readonly().optional(),
				"misconceptions": array(string()).readonly(),
				"mistakeTags": array(string()).readonly(),
				"nextStep": string().readonly().optional(),
				"reflectionQuestion": string().readonly().optional(),
				"sessionId": string().readonly().optional(),
				"failure": string().readonly().optional()
			}).readonly().optional(),
			"judgeMode": union([literal("agent"), literal("deterministic-fallback")]).readonly().optional(),
			"createdAt": string().readonly()
		});
		let _deepseek_ai_dsh_experimental_api_learn_learn_runnerStatus_parameter_0$schema$value;
		const _deepseek_ai_dsh_experimental_api_learn_learn_runnerStatus_parameter_0$schema = () => _deepseek_ai_dsh_experimental_api_learn_learn_runnerStatus_parameter_0$schema$value ??= boolean();
		let _deepseek_ai_dsh_experimental_api_learn_learn_runnerStatus_result$schema$value;
		const _deepseek_ai_dsh_experimental_api_learn_learn_runnerStatus_result$schema = () => _deepseek_ai_dsh_experimental_api_learn_learn_runnerStatus_result$schema$value ??= object({
			"backend": string().readonly(),
			"available": boolean().readonly(),
			"languages": array(object({
				"language": union([literal("python"), literal("typescript")]).readonly(),
				"available": boolean().readonly(),
				"image": string().readonly(),
				"reason": string().readonly().optional()
			})).readonly(),
			"reason": string().readonly().optional(),
			"checkedAt": string().readonly()
		});
		let _deepseek_ai_dsh_experimental_api_learn_learn_runReminders_result$schema$value;
		const _deepseek_ai_dsh_experimental_api_learn_learn_runReminders_result$schema = () => _deepseek_ai_dsh_experimental_api_learn_learn_runReminders_result$schema$value ??= _void();
		let _deepseek_ai_dsh_experimental_api_learn_learn_saveDraft_parameter_0$schema$value;
		const _deepseek_ai_dsh_experimental_api_learn_learn_saveDraft_parameter_0$schema = () => _deepseek_ai_dsh_experimental_api_learn_learn_saveDraft_parameter_0$schema$value ??= intersection(string(), unknown());
		let _deepseek_ai_dsh_experimental_api_learn_learn_saveDraft_parameter_1$schema$value;
		const _deepseek_ai_dsh_experimental_api_learn_learn_saveDraft_parameter_1$schema = () => _deepseek_ai_dsh_experimental_api_learn_learn_saveDraft_parameter_1$schema$value ??= union([literal("python"), literal("typescript")]);
		let _deepseek_ai_dsh_experimental_api_learn_learn_saveDraft_parameter_2$schema$value;
		const _deepseek_ai_dsh_experimental_api_learn_learn_saveDraft_parameter_2$schema = () => _deepseek_ai_dsh_experimental_api_learn_learn_saveDraft_parameter_2$schema$value ??= string();
		let _deepseek_ai_dsh_experimental_api_learn_learn_saveDraft_result$schema$value;
		const _deepseek_ai_dsh_experimental_api_learn_learn_saveDraft_result$schema = () => _deepseek_ai_dsh_experimental_api_learn_learn_saveDraft_result$schema$value ??= string();
		let _deepseek_ai_dsh_experimental_api_learn_learn_saveNote_parameter_0$schema$value;
		const _deepseek_ai_dsh_experimental_api_learn_learn_saveNote_parameter_0$schema = () => _deepseek_ai_dsh_experimental_api_learn_learn_saveNote_parameter_0$schema$value ??= intersection(string(), unknown());
		let _deepseek_ai_dsh_experimental_api_learn_learn_saveNote_parameter_1$schema$value;
		const _deepseek_ai_dsh_experimental_api_learn_learn_saveNote_parameter_1$schema = () => _deepseek_ai_dsh_experimental_api_learn_learn_saveNote_parameter_1$schema$value ??= string();
		let _deepseek_ai_dsh_experimental_api_learn_learn_saveNote_result$schema$value;
		const _deepseek_ai_dsh_experimental_api_learn_learn_saveNote_result$schema = () => _deepseek_ai_dsh_experimental_api_learn_learn_saveNote_result$schema$value ??= string();
		let _deepseek_ai_dsh_experimental_api_learn_learn_setEmailAddress_parameter_0$schema$value;
		const _deepseek_ai_dsh_experimental_api_learn_learn_setEmailAddress_parameter_0$schema = () => _deepseek_ai_dsh_experimental_api_learn_learn_setEmailAddress_parameter_0$schema$value ??= string();
		let _deepseek_ai_dsh_experimental_api_learn_learn_setEmailAddress_result$schema$value;
		const _deepseek_ai_dsh_experimental_api_learn_learn_setEmailAddress_result$schema = () => _deepseek_ai_dsh_experimental_api_learn_learn_setEmailAddress_result$schema$value ??= object({
			"address": string().readonly().optional(),
			"verified": boolean().readonly(),
			"verificationPending": boolean().readonly(),
			"optIn": boolean().readonly(),
			"paused": boolean().readonly(),
			"deliveryHour": number().readonly(),
			"transport": union([literal("capture"), literal("smtp")]).readonly(),
			"liveSending": boolean().readonly(),
			"verifyUrlAvailable": boolean().readonly()
		});
		let _deepseek_ai_dsh_experimental_api_learn_learn_skipLesson_parameter_0$schema$value;
		const _deepseek_ai_dsh_experimental_api_learn_learn_skipLesson_parameter_0$schema = () => _deepseek_ai_dsh_experimental_api_learn_learn_skipLesson_parameter_0$schema$value ??= intersection(string(), unknown());
		let _deepseek_ai_dsh_experimental_api_learn_learn_skipLesson_parameter_1$schema$value;
		const _deepseek_ai_dsh_experimental_api_learn_learn_skipLesson_parameter_1$schema = () => _deepseek_ai_dsh_experimental_api_learn_learn_skipLesson_parameter_1$schema$value ??= record(string(), number()).readonly();
		let _deepseek_ai_dsh_experimental_api_learn_learn_skipLesson_result$schema$value;
		const _deepseek_ai_dsh_experimental_api_learn_learn_skipLesson_result$schema = () => _deepseek_ai_dsh_experimental_api_learn_learn_skipLesson_result$schema$value ??= object({
			"progress": object({
				"topicId": intersection(string(), unknown()).readonly(),
				"stage": union([
					literal("complete"),
					literal("motivation"),
					literal("strategy"),
					literal("example"),
					literal("check"),
					literal("problem"),
					literal("reflection")
				]).readonly(),
				"checkAnswers": record(string(), number()).readonly().readonly(),
				"skipped": boolean().readonly(),
				"reflection": string().readonly().optional(),
				"reflectionFeedback": string().readonly().optional(),
				"completedAt": string().readonly().optional()
			}).optional(),
			"correct": record(string(), boolean())
		});
		let _deepseek_ai_dsh_experimental_api_learn_learn_submit_parameter_0$schema$value;
		const _deepseek_ai_dsh_experimental_api_learn_learn_submit_parameter_0$schema = () => _deepseek_ai_dsh_experimental_api_learn_learn_submit_parameter_0$schema$value ??= intersection(string(), unknown());
		let _deepseek_ai_dsh_experimental_api_learn_learn_submit_parameter_1$schema$value;
		const _deepseek_ai_dsh_experimental_api_learn_learn_submit_parameter_1$schema = () => _deepseek_ai_dsh_experimental_api_learn_learn_submit_parameter_1$schema$value ??= union([literal("python"), literal("typescript")]);
		let _deepseek_ai_dsh_experimental_api_learn_learn_submit_parameter_2$schema$value;
		const _deepseek_ai_dsh_experimental_api_learn_learn_submit_parameter_2$schema = () => _deepseek_ai_dsh_experimental_api_learn_learn_submit_parameter_2$schema$value ??= string();
		let _deepseek_ai_dsh_experimental_api_learn_learn_submit_parameter_3$schema$value;
		const _deepseek_ai_dsh_experimental_api_learn_learn_submit_parameter_3$schema = () => _deepseek_ai_dsh_experimental_api_learn_learn_submit_parameter_3$schema$value ??= union([
			literal("review"),
			literal("lesson"),
			literal("practice")
		]);
		let _deepseek_ai_dsh_experimental_api_learn_learn_submit_parameter_4$schema$value;
		const _deepseek_ai_dsh_experimental_api_learn_learn_submit_parameter_4$schema = () => _deepseek_ai_dsh_experimental_api_learn_learn_submit_parameter_4$schema$value ??= union([literal(null), intersection(string(), unknown())]);
		let _deepseek_ai_dsh_experimental_api_learn_learn_submit_result$schema$value;
		const _deepseek_ai_dsh_experimental_api_learn_learn_submit_result$schema = () => _deepseek_ai_dsh_experimental_api_learn_learn_submit_result$schema$value ??= object({
			"id": intersection(string(), unknown()).readonly(),
			"problemId": intersection(string(), unknown()).readonly(),
			"problemVersion": number().readonly(),
			"suiteVersion": number().readonly(),
			"language": union([literal("python"), literal("typescript")]).readonly(),
			"kind": union([literal("run"), literal("submit")]).readonly(),
			"context": union([
				literal("review"),
				literal("lesson"),
				literal("practice")
			]).readonly(),
			"code": string().readonly(),
			"support": union([
				literal("independent"),
				literal("with-hints"),
				literal("studied-solution")
			]).readonly(),
			"hintsUsed": number().readonly(),
			"status": union([literal("judging"), literal("done")]).readonly(),
			"verdict": object({
				"kind": union([
					literal("cancelled"),
					literal("passed-local-tests"),
					literal("wrong-answer"),
					literal("compile-error"),
					literal("runtime-error"),
					literal("time-limit-exceeded"),
					literal("memory-limit-exceeded"),
					literal("output-limit-exceeded"),
					literal("evaluation-unavailable")
				]).readonly(),
				"passed": number().readonly(),
				"total": number().readonly(),
				"suite": union([
					literal("examples"),
					literal("custom"),
					literal("full")
				]).readonly(),
				"suiteVersion": number().readonly(),
				"language": union([literal("python"), literal("typescript")]).readonly(),
				"runner": string().readonly(),
				"failing": object({
					"caseId": string().readonly(),
					"visibility": union([
						literal("example"),
						literal("custom"),
						literal("hidden")
					]).readonly(),
					"args": array(union([
						literal(null),
						string(),
						number(),
						literal(false),
						literal(true),
						array(lazy(() => JsonValueRemoteCodec$schema4())),
						record(string(), lazy(() => JsonValueRemoteCodec$schema4()))
					])).readonly(),
					"expected": union([
						literal(null),
						string(),
						number(),
						literal(false),
						literal(true),
						array(lazy(() => JsonValueRemoteCodec$schema4())),
						record(string(), lazy(() => JsonValueRemoteCodec$schema4()))
					]).readonly().optional(),
					"actual": union([
						literal(null),
						string(),
						number(),
						literal(false),
						literal(true),
						array(lazy(() => JsonValueRemoteCodec$schema4())),
						record(string(), lazy(() => JsonValueRemoteCodec$schema4()))
					]).readonly().optional(),
					"error": string().readonly().optional(),
					"line": number().readonly().optional(),
					"stdout": string().readonly().optional()
				}).readonly().optional(),
				"cases": array(object({
					"caseId": string().readonly(),
					"args": array(union([
						literal(null),
						string(),
						number(),
						literal(false),
						literal(true),
						array(lazy(() => JsonValueRemoteCodec$schema4())),
						record(string(), lazy(() => JsonValueRemoteCodec$schema4()))
					])).readonly(),
					"expected": union([
						literal(null),
						string(),
						number(),
						literal(false),
						literal(true),
						array(lazy(() => JsonValueRemoteCodec$schema4())),
						record(string(), lazy(() => JsonValueRemoteCodec$schema4()))
					]).readonly().optional(),
					"actual": union([
						literal(null),
						string(),
						number(),
						literal(false),
						literal(true),
						array(lazy(() => JsonValueRemoteCodec$schema4())),
						record(string(), lazy(() => JsonValueRemoteCodec$schema4()))
					]).readonly().optional(),
					"passed": boolean().readonly(),
					"error": string().readonly().optional(),
					"line": number().readonly().optional(),
					"stdout": string().readonly(),
					"timeMs": number().readonly().optional()
				})).readonly().optional(),
				"measuredMs": number().readonly().optional(),
				"message": string().readonly().optional(),
				"coverageNote": object({
					"zh": string().readonly(),
					"en": string().readonly()
				}).readonly(),
				"createdAt": string().readonly()
			}).readonly().optional(),
			"assessment": object({
				"source": union([literal("agent"), literal("unavailable")]).readonly(),
				"summary": string().readonly(),
				"reasoning": string().readonly().optional(),
				"likelyComplexity": object({
					"time": string().readonly(),
					"space": string().readonly(),
					"basis": literal("estimated").readonly()
				}).readonly().optional(),
				"codeQuality": string().readonly().optional(),
				"misconceptions": array(string()).readonly(),
				"mistakeTags": array(string()).readonly(),
				"nextStep": string().readonly().optional(),
				"reflectionQuestion": string().readonly().optional(),
				"sessionId": string().readonly().optional(),
				"failure": string().readonly().optional()
			}).readonly().optional(),
			"judgeMode": union([literal("agent"), literal("deterministic-fallback")]).readonly().optional(),
			"createdAt": string().readonly()
		});
		let _deepseek_ai_dsh_experimental_api_learn_learn_testEmail_result$schema$value;
		const _deepseek_ai_dsh_experimental_api_learn_learn_testEmail_result$schema = () => _deepseek_ai_dsh_experimental_api_learn_learn_testEmail_result$schema$value ??= object({
			"id": intersection(string(), unknown()).readonly(),
			"kind": union([
				literal("digest"),
				literal("verification"),
				literal("test")
			]).readonly(),
			"status": union([
				literal("cancelled"),
				literal("failed"),
				literal("skipped"),
				literal("queued"),
				literal("sending"),
				literal("sent"),
				literal("captured")
			]).readonly(),
			"attempts": number().readonly(),
			"idempotencyKey": string().readonly(),
			"lastError": string().readonly().optional(),
			"reason": string().readonly().optional(),
			"createdAt": string().readonly(),
			"updatedAt": string().readonly(),
			"previewSubject": string().readonly().optional()
		});
		let _deepseek_ai_dsh_experimental_api_learn_learn_today_result$schema$value;
		const _deepseek_ai_dsh_experimental_api_learn_learn_today_result$schema = () => _deepseek_ai_dsh_experimental_api_learn_learn_today_result$schema$value ??= object({
			"today": string().readonly(),
			"nextLesson": object({
				"topicId": intersection(string(), unknown()).readonly(),
				"stage": union([
					literal("complete"),
					literal("motivation"),
					literal("strategy"),
					literal("example"),
					literal("check"),
					literal("problem"),
					literal("reflection")
				]).readonly()
			}).readonly().optional(),
			"nextProblem": intersection(string(), unknown()).readonly().optional(),
			"reviewsDue": number().readonly(),
			"reviewsCompletedToday": number().readonly(),
			"dailyLimit": number().readonly(),
			"dailyGoalMinutes": number().readonly(),
			"minutesToday": number().readonly(),
			"recent": array(object({
				"kind": union([
					literal("attempt"),
					literal("review"),
					literal("lesson")
				]).readonly(),
				"title": object({
					"zh": string().readonly(),
					"en": string().readonly()
				}).readonly(),
				"detail": string().readonly(),
				"at": string().readonly(),
				"problemId": intersection(string(), unknown()).readonly().optional(),
				"topicId": intersection(string(), unknown()).readonly().optional()
			})).readonly()
		});
		let _deepseek_ai_dsh_experimental_api_learn_learn_tutorCancel_parameter_0$schema$value;
		const _deepseek_ai_dsh_experimental_api_learn_learn_tutorCancel_parameter_0$schema = () => _deepseek_ai_dsh_experimental_api_learn_learn_tutorCancel_parameter_0$schema$value ??= intersection(string(), unknown());
		let _deepseek_ai_dsh_experimental_api_learn_learn_tutorCancel_result$schema$value;
		const _deepseek_ai_dsh_experimental_api_learn_learn_tutorCancel_result$schema = () => _deepseek_ai_dsh_experimental_api_learn_learn_tutorCancel_result$schema$value ??= _void();
		let _deepseek_ai_dsh_experimental_api_learn_learn_tutorFollow_parameter_0$schema$value;
		const _deepseek_ai_dsh_experimental_api_learn_learn_tutorFollow_parameter_0$schema = () => _deepseek_ai_dsh_experimental_api_learn_learn_tutorFollow_parameter_0$schema$value ??= intersection(string(), unknown());
		let _deepseek_ai_dsh_experimental_api_learn_learn_tutorFollow_result$schema$value;
		const _deepseek_ai_dsh_experimental_api_learn_learn_tutorFollow_result$schema = () => _deepseek_ai_dsh_experimental_api_learn_learn_tutorFollow_result$schema$value ??= union([
			object({
				"type": literal("snapshot").readonly(),
				"messages": array(object({
					"id": string().readonly(),
					"role": union([literal("tutor"), literal("learner")]).readonly(),
					"content": string().readonly(),
					"status": union([
						literal("failed"),
						literal("complete"),
						literal("streaming"),
						literal("interrupted")
					]).readonly(),
					"error": string().readonly().optional(),
					"createdAt": string().readonly()
				})).readonly()
			}),
			object({
				"type": literal("progress").readonly(),
				"messageId": string().readonly(),
				"text": string().readonly()
			}),
			object({
				"type": literal("settled").readonly(),
				"message": object({
					"id": string().readonly(),
					"role": union([literal("tutor"), literal("learner")]).readonly(),
					"content": string().readonly(),
					"status": union([
						literal("failed"),
						literal("complete"),
						literal("streaming"),
						literal("interrupted")
					]).readonly(),
					"error": string().readonly().optional(),
					"createdAt": string().readonly()
				}).readonly()
			})
		]);
		let _deepseek_ai_dsh_experimental_api_learn_learn_tutorSend_parameter_0$schema$value;
		const _deepseek_ai_dsh_experimental_api_learn_learn_tutorSend_parameter_0$schema = () => _deepseek_ai_dsh_experimental_api_learn_learn_tutorSend_parameter_0$schema$value ??= union([literal(null), intersection(string(), unknown())]);
		let _deepseek_ai_dsh_experimental_api_learn_learn_tutorSend_parameter_1$schema$value;
		const _deepseek_ai_dsh_experimental_api_learn_learn_tutorSend_parameter_1$schema = () => _deepseek_ai_dsh_experimental_api_learn_learn_tutorSend_parameter_1$schema$value ??= union([literal(null), intersection(string(), unknown())]);
		let _deepseek_ai_dsh_experimental_api_learn_learn_tutorSend_parameter_2$schema$value;
		const _deepseek_ai_dsh_experimental_api_learn_learn_tutorSend_parameter_2$schema = () => _deepseek_ai_dsh_experimental_api_learn_learn_tutorSend_parameter_2$schema$value ??= string();
		let _deepseek_ai_dsh_experimental_api_learn_learn_tutorSend_result$schema$value;
		const _deepseek_ai_dsh_experimental_api_learn_learn_tutorSend_result$schema = () => _deepseek_ai_dsh_experimental_api_learn_learn_tutorSend_result$schema$value ??= object({
			"threadId": intersection(string(), unknown()),
			"messageId": string()
		});
		let _deepseek_ai_dsh_experimental_api_learn_learn_updateSettings_parameter_0$schema$value;
		const _deepseek_ai_dsh_experimental_api_learn_learn_updateSettings_parameter_0$schema = () => _deepseek_ai_dsh_experimental_api_learn_learn_updateSettings_parameter_0$schema$value ??= object({
			"locale": union([literal("zh"), literal("en")]).readonly().optional(),
			"timezone": string().readonly().optional(),
			"experience": union([
				literal("new"),
				literal("some"),
				literal("experienced")
			]).readonly().optional(),
			"preferredLanguage": union([literal("python"), literal("typescript")]).readonly().optional(),
			"dailyGoalMinutes": number().readonly().optional(),
			"reviewDailyLimit": number().readonly().optional(),
			"reviewLadderDays": array(number()).readonly().optional()
		});
		let _deepseek_ai_dsh_experimental_api_learn_learn_updateSettings_result$schema$value;
		const _deepseek_ai_dsh_experimental_api_learn_learn_updateSettings_result$schema = () => _deepseek_ai_dsh_experimental_api_learn_learn_updateSettings_result$schema$value ??= object({
			"locale": union([literal("zh"), literal("en")]).readonly(),
			"timezone": string().readonly(),
			"experience": union([
				literal("new"),
				literal("some"),
				literal("experienced")
			]).readonly(),
			"preferredLanguage": union([literal("python"), literal("typescript")]).readonly(),
			"dailyGoalMinutes": number().readonly(),
			"reviewDailyLimit": number().readonly(),
			"reviewLadderDays": array(number()).readonly()
		});
		let _deepseek_ai_dsh_experimental_api_learn_learn_variants_result$schema$value;
		const _deepseek_ai_dsh_experimental_api_learn_learn_variants_result$schema = () => _deepseek_ai_dsh_experimental_api_learn_learn_variants_result$schema$value ??= array(object({
			"id": intersection(string(), unknown()).readonly(),
			"parentProblemId": intersection(string(), unknown()).readonly(),
			"topicId": intersection(string(), unknown()).readonly(),
			"status": union([literal("validated"), literal("quarantined")]).readonly(),
			"origin": object({
				"source": union([
					literal("imported"),
					literal("authored"),
					literal("generated")
				]).readonly(),
				"author": string().readonly(),
				"createdAt": string().readonly(),
				"seed": union([_undefined(), number()]).readonly().optional(),
				"sessionId": union([_undefined(), string()]).readonly().optional()
			}).readonly(),
			"validation": object({
				"ok": boolean().readonly(),
				"checks": array(object({
					"name": string().readonly(),
					"ok": boolean().readonly(),
					"detail": string().readonly()
				})).readonly()
			}).readonly(),
			"title": object({
				"zh": string().readonly(),
				"en": string().readonly()
			}).readonly(),
			"createdAt": string().readonly()
		}));
		let _deepseek_ai_dsh_experimental_api_learn_learn_verifyEmail_parameter_0$schema$value;
		const _deepseek_ai_dsh_experimental_api_learn_learn_verifyEmail_parameter_0$schema = () => _deepseek_ai_dsh_experimental_api_learn_learn_verifyEmail_parameter_0$schema$value ??= string();
		let _deepseek_ai_dsh_experimental_api_learn_learn_verifyEmail_result$schema$value;
		const _deepseek_ai_dsh_experimental_api_learn_learn_verifyEmail_result$schema = () => _deepseek_ai_dsh_experimental_api_learn_learn_verifyEmail_result$schema$value ??= object({
			"address": string().readonly().optional(),
			"verified": boolean().readonly(),
			"verificationPending": boolean().readonly(),
			"optIn": boolean().readonly(),
			"paused": boolean().readonly(),
			"deliveryHour": number().readonly(),
			"transport": union([literal("capture"), literal("smtp")]).readonly(),
			"liveSending": boolean().readonly(),
			"verifyUrlAvailable": boolean().readonly()
		});
		let _deepseek_ai_dsh_experimental_api_learn_learn_workspace_parameter_0$schema$value;
		const _deepseek_ai_dsh_experimental_api_learn_learn_workspace_parameter_0$schema = () => _deepseek_ai_dsh_experimental_api_learn_learn_workspace_parameter_0$schema$value ??= intersection(string(), unknown());
		let _deepseek_ai_dsh_experimental_api_learn_learn_workspace_result$schema$value;
		const _deepseek_ai_dsh_experimental_api_learn_learn_workspace_result$schema = () => _deepseek_ai_dsh_experimental_api_learn_learn_workspace_result$schema$value ??= object({
			"problem": object({
				"id": intersection(string(), unknown()).readonly(),
				"kind": union([
					literal("leetcode"),
					literal("original"),
					literal("variant"),
					literal("imported")
				]).readonly(),
				"version": number().readonly(),
				"suiteVersion": number().readonly(),
				"title": object({
					"zh": string().readonly(),
					"en": string().readonly()
				}).readonly(),
				"difficulty": union([
					literal("easy"),
					literal("medium"),
					literal("hard")
				]).readonly(),
				"topics": array(intersection(string(), unknown())).readonly(),
				"leetcode": object({
					"frontendId": number().readonly(),
					"title": string().readonly(),
					"slug": string().readonly(),
					"difficulty": union([
						literal("easy"),
						literal("medium"),
						literal("hard")
					]).readonly(),
					"tags": array(string()).readonly(),
					"url": string().readonly(),
					"paidOnly": boolean().readonly(),
					"verifiedAt": string().readonly()
				}).readonly().optional(),
				"summary": object({
					"zh": string().readonly(),
					"en": string().readonly()
				}).readonly(),
				"statement": object({
					"zh": string().readonly(),
					"en": string().readonly()
				}).readonly().optional(),
				"constraints": array(object({
					"zh": string().readonly(),
					"en": string().readonly()
				})).readonly(),
				"params": array(object({
					"name": string().readonly(),
					"type": union([
						literal("string"),
						literal("int"),
						literal("float"),
						literal("bool"),
						literal("int[]"),
						literal("float[]"),
						literal("bool[]"),
						literal("string[]"),
						literal("int[][]"),
						literal("string[][]"),
						literal("tree"),
						literal("linked-list")
					]).readonly()
				})).readonly(),
				"returns": union([
					literal("string"),
					literal("int"),
					literal("float"),
					literal("bool"),
					literal("int[]"),
					literal("float[]"),
					literal("bool[]"),
					literal("string[]"),
					literal("int[][]"),
					literal("string[][]"),
					literal("tree"),
					literal("linked-list")
				]).readonly(),
				"comparator": union([
					object({ "kind": literal("exact").readonly() }),
					object({ "kind": literal("unordered").readonly() }),
					object({ "kind": literal("unordered-nested").readonly() }),
					object({
						"kind": literal("float").readonly(),
						"tolerance": number().readonly()
					}),
					object({
						"kind": literal("validator").readonly(),
						"name": union([literal("pair-indices-sum"), literal("pair-indices-sum-one-based")]).readonly()
					})
				]).readonly(),
				"entry": object({
					"python": string().readonly(),
					"typescript": string().readonly()
				}).readonly(),
				"starter": object({
					"python": string(),
					"typescript": string()
				}).readonly(),
				"examples": array(object({
					"id": string().readonly(),
					"args": array(union([
						literal(null),
						string(),
						number(),
						literal(false),
						literal(true),
						array(lazy(() => JsonValueRemoteCodec$schema())),
						record(string(), lazy(() => JsonValueRemoteCodec$schema()))
					])).readonly(),
					"expected": union([
						literal(null),
						string(),
						number(),
						literal(false),
						literal(true),
						array(lazy(() => JsonValueRemoteCodec$schema())),
						record(string(), lazy(() => JsonValueRemoteCodec$schema()))
					]).readonly(),
					"explanation": object({
						"zh": string().readonly(),
						"en": string().readonly()
					}).readonly().optional()
				})).readonly(),
				"hiddenCaseCount": number().readonly(),
				"origin": object({
					"source": union([
						literal("imported"),
						literal("authored"),
						literal("generated")
					]).readonly(),
					"author": string().readonly(),
					"createdAt": string().readonly(),
					"seed": union([_undefined(), number()]).readonly().optional(),
					"sessionId": union([_undefined(), string()]).readonly().optional()
				}).readonly(),
				"variant": union([object({ "parentHidden": literal(true).readonly() }), object({
					"parentProblemId": intersection(string(), unknown()).readonly(),
					"parentTitle": object({
						"zh": string().readonly(),
						"en": string().readonly()
					}).readonly(),
					"differences": array(object({
						"category": union([
							literal("output"),
							literal("constraints"),
							literal("input-structure"),
							literal("reasoning")
						]).readonly(),
						"description": object({
							"zh": string().readonly(),
							"en": string().readonly()
						}).readonly()
					})).readonly(),
					"transfer": object({
						"zh": string().readonly(),
						"en": string().readonly()
					}).readonly()
				})]).readonly().optional()
			}).readonly(),
			"drafts": object({
				"python": object({
					"code": string().readonly(),
					"updatedAt": string().readonly()
				}).optional(),
				"typescript": object({
					"code": string().readonly(),
					"updatedAt": string().readonly()
				}).optional()
			}).readonly(),
			"note": string().readonly(),
			"attempts": array(object({
				"id": intersection(string(), unknown()).readonly(),
				"problemId": intersection(string(), unknown()).readonly(),
				"problemVersion": number().readonly(),
				"suiteVersion": number().readonly(),
				"language": union([literal("python"), literal("typescript")]).readonly(),
				"kind": union([literal("run"), literal("submit")]).readonly(),
				"context": union([
					literal("review"),
					literal("lesson"),
					literal("practice")
				]).readonly(),
				"code": string().readonly(),
				"support": union([
					literal("independent"),
					literal("with-hints"),
					literal("studied-solution")
				]).readonly(),
				"hintsUsed": number().readonly(),
				"status": union([literal("judging"), literal("done")]).readonly(),
				"verdict": object({
					"kind": union([
						literal("cancelled"),
						literal("passed-local-tests"),
						literal("wrong-answer"),
						literal("compile-error"),
						literal("runtime-error"),
						literal("time-limit-exceeded"),
						literal("memory-limit-exceeded"),
						literal("output-limit-exceeded"),
						literal("evaluation-unavailable")
					]).readonly(),
					"passed": number().readonly(),
					"total": number().readonly(),
					"suite": union([
						literal("examples"),
						literal("custom"),
						literal("full")
					]).readonly(),
					"suiteVersion": number().readonly(),
					"language": union([literal("python"), literal("typescript")]).readonly(),
					"runner": string().readonly(),
					"failing": object({
						"caseId": string().readonly(),
						"visibility": union([
							literal("example"),
							literal("custom"),
							literal("hidden")
						]).readonly(),
						"args": array(union([
							literal(null),
							string(),
							number(),
							literal(false),
							literal(true),
							array(lazy(() => JsonValueRemoteCodec$schema())),
							record(string(), lazy(() => JsonValueRemoteCodec$schema()))
						])).readonly(),
						"expected": union([
							literal(null),
							string(),
							number(),
							literal(false),
							literal(true),
							array(lazy(() => JsonValueRemoteCodec$schema())),
							record(string(), lazy(() => JsonValueRemoteCodec$schema()))
						]).readonly().optional(),
						"actual": union([
							literal(null),
							string(),
							number(),
							literal(false),
							literal(true),
							array(lazy(() => JsonValueRemoteCodec$schema())),
							record(string(), lazy(() => JsonValueRemoteCodec$schema()))
						]).readonly().optional(),
						"error": string().readonly().optional(),
						"line": number().readonly().optional(),
						"stdout": string().readonly().optional()
					}).readonly().optional(),
					"cases": array(object({
						"caseId": string().readonly(),
						"args": array(union([
							literal(null),
							string(),
							number(),
							literal(false),
							literal(true),
							array(lazy(() => JsonValueRemoteCodec$schema())),
							record(string(), lazy(() => JsonValueRemoteCodec$schema()))
						])).readonly(),
						"expected": union([
							literal(null),
							string(),
							number(),
							literal(false),
							literal(true),
							array(lazy(() => JsonValueRemoteCodec$schema())),
							record(string(), lazy(() => JsonValueRemoteCodec$schema()))
						]).readonly().optional(),
						"actual": union([
							literal(null),
							string(),
							number(),
							literal(false),
							literal(true),
							array(lazy(() => JsonValueRemoteCodec$schema())),
							record(string(), lazy(() => JsonValueRemoteCodec$schema()))
						]).readonly().optional(),
						"passed": boolean().readonly(),
						"error": string().readonly().optional(),
						"line": number().readonly().optional(),
						"stdout": string().readonly(),
						"timeMs": number().readonly().optional()
					})).readonly().optional(),
					"measuredMs": number().readonly().optional(),
					"message": string().readonly().optional(),
					"coverageNote": object({
						"zh": string().readonly(),
						"en": string().readonly()
					}).readonly(),
					"createdAt": string().readonly()
				}).readonly().optional(),
				"assessment": object({
					"source": union([literal("agent"), literal("unavailable")]).readonly(),
					"summary": string().readonly(),
					"reasoning": string().readonly().optional(),
					"likelyComplexity": object({
						"time": string().readonly(),
						"space": string().readonly(),
						"basis": literal("estimated").readonly()
					}).readonly().optional(),
					"codeQuality": string().readonly().optional(),
					"misconceptions": array(string()).readonly(),
					"mistakeTags": array(string()).readonly(),
					"nextStep": string().readonly().optional(),
					"reflectionQuestion": string().readonly().optional(),
					"sessionId": string().readonly().optional(),
					"failure": string().readonly().optional()
				}).readonly().optional(),
				"judgeMode": union([literal("agent"), literal("deterministic-fallback")]).readonly().optional(),
				"createdAt": string().readonly()
			})).readonly(),
			"hints": array(object({
				"level": union([
					literal(1),
					literal(2),
					literal(3),
					literal(4)
				]).readonly(),
				"source": union([literal("authored"), literal("tutor")]).readonly(),
				"content": string().readonly(),
				"createdAt": string().readonly()
			})).readonly(),
			"tutor": object({
				"threadId": intersection(string(), unknown()).readonly(),
				"messages": array(object({
					"id": string().readonly(),
					"role": union([literal("tutor"), literal("learner")]).readonly(),
					"content": string().readonly(),
					"status": union([
						literal("failed"),
						literal("complete"),
						literal("streaming"),
						literal("interrupted")
					]).readonly(),
					"error": string().readonly().optional(),
					"createdAt": string().readonly()
				})).readonly()
			}).readonly(),
			"status": union([
				literal("new"),
				literal("attempted"),
				literal("solved-with-help"),
				literal("solved")
			]).readonly(),
			"reviewItemId": intersection(string(), unknown()).readonly().optional()
		});
		const TYPERT_REMOTE = {
			package: "dsh-plugin-learn",
			descriptors: [
				{
					id: "dsh-plugin-learn#learn/completeReview",
					service: "learnController",
					namespace: "learn",
					method: "completeReview",
					invocation: { kind: "direct" },
					parameters: [
						{
							name: "itemId",
							wire: "itemId",
							source: "json",
							codec: {
								mode: "strict",
								typeSymbol: "dsh-plugin-learn/service/types#ReviewItemId",
								create: _deepseek_ai_dsh_experimental_api_learn_learn_completeReview_parameter_0$schema
							}
						},
						{
							name: "attemptId",
							wire: "attemptId",
							source: "json",
							codec: {
								mode: "strict",
								typeSymbol: "dsh-plugin-learn/service/types#AttemptId",
								create: _deepseek_ai_dsh_experimental_api_learn_learn_completeReview_parameter_1$schema
							}
						},
						{
							name: "recall",
							wire: "recall",
							source: "json",
							codec: {
								mode: "strict",
								typeSymbol: "dsh-plugin-learn#learn/completeReview:recall",
								create: _deepseek_ai_dsh_experimental_api_learn_learn_completeReview_parameter_2$schema
							}
						}
					],
					result: {
						mode: "strict",
						typeSymbol: "dsh-plugin-learn/service/types#ReviewCompletion",
						create: _deepseek_ai_dsh_experimental_api_learn_learn_completeReview_result$schema
					},
					sourceLocation: {
						"file": "packages/experimental/api-learn/src/index.ts",
						"line": 255,
						"column": 3
					}
				},
				{
					id: "dsh-plugin-learn#learn/emailJobs",
					service: "learnController",
					namespace: "learn",
					method: "emailJobs",
					invocation: { kind: "direct" },
					parameters: [],
					result: {
						mode: "strict",
						typeSymbol: "dsh-plugin-learn#learn/emailJobs:result",
						create: _deepseek_ai_dsh_experimental_api_learn_learn_emailJobs_result$schema
					},
					sourceLocation: {
						"file": "packages/experimental/api-learn/src/index.ts",
						"line": 381,
						"column": 3
					}
				},
				{
					id: "dsh-plugin-learn#learn/emailPreferences",
					service: "learnController",
					namespace: "learn",
					method: "emailPreferences",
					invocation: { kind: "direct" },
					parameters: [{
						name: "patch",
						wire: "patch",
						source: "json",
						codec: {
							mode: "strict",
							typeSymbol: "dsh-plugin-learn#learn/emailPreferences:patch",
							create: _deepseek_ai_dsh_experimental_api_learn_learn_emailPreferences_parameter_0$schema
						}
					}],
					result: {
						mode: "strict",
						typeSymbol: "dsh-plugin-learn/service/types#EmailSettingsView",
						create: _deepseek_ai_dsh_experimental_api_learn_learn_emailPreferences_result$schema
					},
					sourceLocation: {
						"file": "packages/experimental/api-learn/src/index.ts",
						"line": 365,
						"column": 3
					}
				},
				{
					id: "dsh-plugin-learn#learn/emailPreview",
					service: "learnController",
					namespace: "learn",
					method: "emailPreview",
					invocation: { kind: "direct" },
					parameters: [{
						name: "jobId",
						wire: "jobId",
						source: "json",
						codec: {
							mode: "strict",
							typeSymbol: "dsh-plugin-learn/service/types#EmailJobId",
							create: _deepseek_ai_dsh_experimental_api_learn_learn_emailPreview_parameter_0$schema
						}
					}],
					result: {
						mode: "strict",
						typeSymbol: "dsh-plugin-learn/service/types#EmailPreview",
						create: _deepseek_ai_dsh_experimental_api_learn_learn_emailPreview_result$schema
					},
					sourceLocation: {
						"file": "packages/experimental/api-learn/src/index.ts",
						"line": 389,
						"column": 3
					}
				},
				{
					id: "dsh-plugin-learn#learn/emailSettings",
					service: "learnController",
					namespace: "learn",
					method: "emailSettings",
					invocation: { kind: "direct" },
					parameters: [],
					result: {
						mode: "strict",
						typeSymbol: "dsh-plugin-learn/service/types#EmailSettingsView",
						create: _deepseek_ai_dsh_experimental_api_learn_learn_emailSettings_result$schema
					},
					sourceLocation: {
						"file": "packages/experimental/api-learn/src/index.ts",
						"line": 341,
						"column": 3
					}
				},
				{
					id: "dsh-plugin-learn#learn/exportData",
					service: "learnController",
					namespace: "learn",
					method: "exportData",
					invocation: { kind: "direct" },
					parameters: [],
					result: {
						mode: "strict",
						typeSymbol: "dsh-plugin-learn/service/types#LearnExport",
						create: _deepseek_ai_dsh_experimental_api_learn_learn_exportData_result$schema
					},
					sourceLocation: {
						"file": "packages/experimental/api-learn/src/index.ts",
						"line": 403,
						"column": 3
					}
				},
				{
					id: "dsh-plugin-learn#learn/generateVariant",
					service: "learnController",
					namespace: "learn",
					method: "generateVariant",
					invocation: { kind: "direct" },
					parameters: [{
						name: "parentId",
						wire: "parentId",
						source: "json",
						codec: {
							mode: "strict",
							typeSymbol: "dsh-plugin-learn/service/types#ProblemId",
							create: _deepseek_ai_dsh_experimental_api_learn_learn_generateVariant_parameter_0$schema
						}
					}],
					cancellation: { parameter: "signal" },
					result: {
						mode: "strict",
						typeSymbol: "dsh-plugin-learn/types#VariantGenerationView",
						create: _deepseek_ai_dsh_experimental_api_learn_learn_generateVariant_result$schema
					},
					sourceLocation: {
						"file": "packages/experimental/api-learn/src/index.ts",
						"line": 278,
						"column": 3
					}
				},
				{
					id: "dsh-plugin-learn#learn/hint",
					service: "learnController",
					namespace: "learn",
					method: "hint",
					invocation: { kind: "direct" },
					parameters: [
						{
							name: "problemId",
							wire: "problemId",
							source: "json",
							codec: {
								mode: "strict",
								typeSymbol: "dsh-plugin-learn/service/types#ProblemId",
								create: _deepseek_ai_dsh_experimental_api_learn_learn_hint_parameter_0$schema
							}
						},
						{
							name: "level",
							wire: "level",
							source: "json",
							codec: {
								mode: "strict",
								typeSymbol: "dsh-plugin-learn/service/types#HintLevel",
								create: _deepseek_ai_dsh_experimental_api_learn_learn_hint_parameter_1$schema
							}
						},
						{
							name: "confirmReveal",
							wire: "confirmReveal",
							source: "json",
							codec: {
								mode: "strict",
								typeSymbol: "dsh-plugin-learn#learn/hint:confirmReveal",
								create: _deepseek_ai_dsh_experimental_api_learn_learn_hint_parameter_2$schema
							}
						}
					],
					cancellation: { parameter: "signal" },
					result: {
						mode: "strict",
						typeSymbol: "dsh-plugin-learn/service/types#HintView",
						create: _deepseek_ai_dsh_experimental_api_learn_learn_hint_result$schema
					},
					sourceLocation: {
						"file": "packages/experimental/api-learn/src/index.ts",
						"line": 201,
						"column": 3
					}
				},
				{
					id: "dsh-plugin-learn#learn/importProblem",
					service: "learnController",
					namespace: "learn",
					method: "importProblem",
					invocation: { kind: "direct" },
					parameters: [{
						name: "specJson",
						wire: "specJson",
						source: "json",
						codec: {
							mode: "strict",
							typeSymbol: "dsh-plugin-learn#learn/importProblem:specJson",
							create: _deepseek_ai_dsh_experimental_api_learn_learn_importProblem_parameter_0$schema
						}
					}],
					cancellation: { parameter: "signal" },
					result: {
						mode: "strict",
						typeSymbol: "dsh-plugin-learn/service/types#VariantRecord",
						create: _deepseek_ai_dsh_experimental_api_learn_learn_importProblem_result$schema
					},
					sourceLocation: {
						"file": "packages/experimental/api-learn/src/index.ts",
						"line": 296,
						"column": 3
					}
				},
				{
					id: "dsh-plugin-learn#learn/lesson",
					service: "learnController",
					namespace: "learn",
					method: "lesson",
					invocation: { kind: "direct" },
					parameters: [
						{
							name: "topicId",
							wire: "topicId",
							source: "json",
							codec: {
								mode: "strict",
								typeSymbol: "dsh-plugin-learn/service/types#TopicId",
								create: _deepseek_ai_dsh_experimental_api_learn_learn_lesson_parameter_0$schema
							}
						},
						{
							name: "stage",
							wire: "stage",
							source: "json",
							codec: {
								mode: "strict",
								typeSymbol: "dsh-plugin-learn/service/types#LessonStage",
								create: _deepseek_ai_dsh_experimental_api_learn_learn_lesson_parameter_1$schema
							}
						},
						{
							name: "answers",
							wire: "answers",
							source: "json",
							codec: {
								mode: "strict",
								typeSymbol: "dsh-plugin-learn#learn/lesson:answers",
								create: _deepseek_ai_dsh_experimental_api_learn_learn_lesson_parameter_2$schema
							}
						}
					],
					result: {
						mode: "strict",
						typeSymbol: "dsh-plugin-learn#learn/lesson:result",
						create: _deepseek_ai_dsh_experimental_api_learn_learn_lesson_result$schema
					},
					sourceLocation: {
						"file": "packages/experimental/api-learn/src/index.ts",
						"line": 103,
						"column": 3
					}
				},
				{
					id: "dsh-plugin-learn#learn/moveReview",
					service: "learnController",
					namespace: "learn",
					method: "moveReview",
					invocation: { kind: "direct" },
					parameters: [
						{
							name: "itemId",
							wire: "itemId",
							source: "json",
							codec: {
								mode: "strict",
								typeSymbol: "dsh-plugin-learn/service/types#ReviewItemId",
								create: _deepseek_ai_dsh_experimental_api_learn_learn_moveReview_parameter_0$schema
							}
						},
						{
							name: "target",
							wire: "target",
							source: "json",
							codec: {
								mode: "strict",
								typeSymbol: "dsh-plugin-learn/types#ReviewMoveTarget",
								create: _deepseek_ai_dsh_experimental_api_learn_learn_moveReview_parameter_1$schema
							}
						},
						{
							name: "requestKey",
							wire: "requestKey",
							source: "json",
							codec: {
								mode: "strict",
								typeSymbol: "dsh-plugin-learn#learn/moveReview:requestKey",
								create: _deepseek_ai_dsh_experimental_api_learn_learn_moveReview_parameter_2$schema
							}
						}
					],
					result: {
						mode: "strict",
						typeSymbol: "dsh-plugin-learn#learn/moveReview:result",
						create: _deepseek_ai_dsh_experimental_api_learn_learn_moveReview_result$schema
					},
					sourceLocation: {
						"file": "packages/experimental/api-learn/src/index.ts",
						"line": 267,
						"column": 3
					}
				},
				{
					id: "dsh-plugin-learn#learn/overview",
					service: "learnController",
					namespace: "learn",
					method: "overview",
					invocation: { kind: "direct" },
					parameters: [],
					result: {
						mode: "strict",
						typeSymbol: "dsh-plugin-learn/service/types#LearnOverview",
						create: _deepseek_ai_dsh_experimental_api_learn_learn_overview_result$schema
					},
					sourceLocation: {
						"file": "packages/experimental/api-learn/src/index.ts",
						"line": 77,
						"column": 3
					}
				},
				{
					id: "dsh-plugin-learn#learn/prepareRunner",
					service: "learnController",
					namespace: "learn",
					method: "prepareRunner",
					invocation: { kind: "direct" },
					parameters: [{
						name: "language",
						wire: "language",
						source: "json",
						codec: {
							mode: "strict",
							typeSymbol: "dsh-plugin-learn/service/types#CodeLanguage",
							create: _deepseek_ai_dsh_experimental_api_learn_learn_prepareRunner_parameter_0$schema
						}
					}],
					cancellation: { parameter: "signal" },
					result: {
						mode: "strict",
						typeSymbol: "dsh-plugin-learn/service/types#RunnerStatus",
						create: _deepseek_ai_dsh_experimental_api_learn_learn_prepareRunner_result$schema
					},
					sourceLocation: {
						"file": "packages/experimental/api-learn/src/index.ts",
						"line": 332,
						"column": 3
					}
				},
				{
					id: "dsh-plugin-learn#learn/progress",
					service: "learnController",
					namespace: "learn",
					method: "progress",
					invocation: { kind: "direct" },
					parameters: [],
					result: {
						mode: "strict",
						typeSymbol: "dsh-plugin-learn/service/types#ProgressView",
						create: _deepseek_ai_dsh_experimental_api_learn_learn_progress_result$schema
					},
					sourceLocation: {
						"file": "packages/experimental/api-learn/src/index.ts",
						"line": 315,
						"column": 3
					}
				},
				{
					id: "dsh-plugin-learn#learn/reflect",
					service: "learnController",
					namespace: "learn",
					method: "reflect",
					invocation: { kind: "direct" },
					parameters: [{
						name: "topicId",
						wire: "topicId",
						source: "json",
						codec: {
							mode: "strict",
							typeSymbol: "dsh-plugin-learn/service/types#TopicId",
							create: _deepseek_ai_dsh_experimental_api_learn_learn_reflect_parameter_0$schema
						}
					}, {
						name: "text",
						wire: "text",
						source: "json",
						codec: {
							mode: "strict",
							typeSymbol: "dsh-plugin-learn#learn/reflect:text",
							create: _deepseek_ai_dsh_experimental_api_learn_learn_reflect_parameter_1$schema
						}
					}],
					cancellation: { parameter: "signal" },
					result: {
						mode: "strict",
						typeSymbol: "dsh-plugin-learn/service/types#LessonProgress",
						create: _deepseek_ai_dsh_experimental_api_learn_learn_reflect_result$schema
					},
					sourceLocation: {
						"file": "packages/experimental/api-learn/src/index.ts",
						"line": 127,
						"column": 3
					}
				},
				{
					id: "dsh-plugin-learn#learn/resetData",
					service: "learnController",
					namespace: "learn",
					method: "resetData",
					invocation: { kind: "direct" },
					parameters: [{
						name: "confirmation",
						wire: "confirmation",
						source: "json",
						codec: {
							mode: "strict",
							typeSymbol: "dsh-plugin-learn#learn/resetData:confirmation",
							create: _deepseek_ai_dsh_experimental_api_learn_learn_resetData_parameter_0$schema
						}
					}],
					result: {
						mode: "strict",
						typeSymbol: "dsh-plugin-learn#learn/resetData:result",
						create: _deepseek_ai_dsh_experimental_api_learn_learn_resetData_result$schema
					},
					sourceLocation: {
						"file": "packages/experimental/api-learn/src/index.ts",
						"line": 410,
						"column": 3
					}
				},
				{
					id: "dsh-plugin-learn#learn/reviewQueue",
					service: "learnController",
					namespace: "learn",
					method: "reviewQueue",
					invocation: { kind: "direct" },
					parameters: [],
					result: {
						mode: "strict",
						typeSymbol: "dsh-plugin-learn/service/types#ReviewQueue",
						create: _deepseek_ai_dsh_experimental_api_learn_learn_reviewQueue_result$schema
					},
					sourceLocation: {
						"file": "packages/experimental/api-learn/src/index.ts",
						"line": 245,
						"column": 3
					}
				},
				{
					id: "dsh-plugin-learn#learn/run",
					service: "learnController",
					namespace: "learn",
					method: "run",
					invocation: { kind: "direct" },
					parameters: [
						{
							name: "problemId",
							wire: "problemId",
							source: "json",
							codec: {
								mode: "strict",
								typeSymbol: "dsh-plugin-learn/service/types#ProblemId",
								create: _deepseek_ai_dsh_experimental_api_learn_learn_run_parameter_0$schema
							}
						},
						{
							name: "language",
							wire: "language",
							source: "json",
							codec: {
								mode: "strict",
								typeSymbol: "dsh-plugin-learn/service/types#CodeLanguage",
								create: _deepseek_ai_dsh_experimental_api_learn_learn_run_parameter_1$schema
							}
						},
						{
							name: "code",
							wire: "code",
							source: "json",
							codec: {
								mode: "strict",
								typeSymbol: "dsh-plugin-learn#learn/run:code",
								create: _deepseek_ai_dsh_experimental_api_learn_learn_run_parameter_2$schema
							}
						},
						{
							name: "customInputs",
							wire: "customInputs",
							source: "json",
							codec: {
								mode: "strict",
								typeSymbol: "dsh-plugin-learn#learn/run:customInputs",
								create: _deepseek_ai_dsh_experimental_api_learn_learn_run_parameter_3$schema
							}
						}
					],
					cancellation: { parameter: "signal" },
					result: {
						mode: "strict",
						typeSymbol: "dsh-plugin-learn/service/types#AttemptView",
						create: _deepseek_ai_dsh_experimental_api_learn_learn_run_result$schema
					},
					sourceLocation: {
						"file": "packages/experimental/api-learn/src/index.ts",
						"line": 170,
						"column": 3
					}
				},
				{
					id: "dsh-plugin-learn#learn/runnerStatus",
					service: "learnController",
					namespace: "learn",
					method: "runnerStatus",
					invocation: { kind: "direct" },
					parameters: [{
						name: "refresh",
						wire: "refresh",
						source: "json",
						codec: {
							mode: "strict",
							typeSymbol: "dsh-plugin-learn#learn/runnerStatus:refresh",
							create: _deepseek_ai_dsh_experimental_api_learn_learn_runnerStatus_parameter_0$schema
						}
					}],
					result: {
						mode: "strict",
						typeSymbol: "dsh-plugin-learn/service/types#RunnerStatus",
						create: _deepseek_ai_dsh_experimental_api_learn_learn_runnerStatus_result$schema
					},
					sourceLocation: {
						"file": "packages/experimental/api-learn/src/index.ts",
						"line": 323,
						"column": 3
					}
				},
				{
					id: "dsh-plugin-learn#learn/runReminders",
					service: "learnController",
					namespace: "learn",
					method: "runReminders",
					invocation: { kind: "direct" },
					parameters: [],
					result: {
						mode: "strict",
						typeSymbol: "dsh-plugin-learn#learn/runReminders:result",
						create: _deepseek_ai_dsh_experimental_api_learn_learn_runReminders_result$schema
					},
					sourceLocation: {
						"file": "packages/experimental/api-learn/src/index.ts",
						"line": 396,
						"column": 3
					}
				},
				{
					id: "dsh-plugin-learn#learn/saveDraft",
					service: "learnController",
					namespace: "learn",
					method: "saveDraft",
					invocation: { kind: "direct" },
					parameters: [
						{
							name: "problemId",
							wire: "problemId",
							source: "json",
							codec: {
								mode: "strict",
								typeSymbol: "dsh-plugin-learn/service/types#ProblemId",
								create: _deepseek_ai_dsh_experimental_api_learn_learn_saveDraft_parameter_0$schema
							}
						},
						{
							name: "language",
							wire: "language",
							source: "json",
							codec: {
								mode: "strict",
								typeSymbol: "dsh-plugin-learn/service/types#CodeLanguage",
								create: _deepseek_ai_dsh_experimental_api_learn_learn_saveDraft_parameter_1$schema
							}
						},
						{
							name: "code",
							wire: "code",
							source: "json",
							codec: {
								mode: "strict",
								typeSymbol: "dsh-plugin-learn#learn/saveDraft:code",
								create: _deepseek_ai_dsh_experimental_api_learn_learn_saveDraft_parameter_2$schema
							}
						}
					],
					result: {
						mode: "strict",
						typeSymbol: "dsh-plugin-learn#learn/saveDraft:result",
						create: _deepseek_ai_dsh_experimental_api_learn_learn_saveDraft_result$schema
					},
					sourceLocation: {
						"file": "packages/experimental/api-learn/src/index.ts",
						"line": 147,
						"column": 3
					}
				},
				{
					id: "dsh-plugin-learn#learn/saveNote",
					service: "learnController",
					namespace: "learn",
					method: "saveNote",
					invocation: { kind: "direct" },
					parameters: [{
						name: "problemId",
						wire: "problemId",
						source: "json",
						codec: {
							mode: "strict",
							typeSymbol: "dsh-plugin-learn/service/types#ProblemId",
							create: _deepseek_ai_dsh_experimental_api_learn_learn_saveNote_parameter_0$schema
						}
					}, {
						name: "body",
						wire: "body",
						source: "json",
						codec: {
							mode: "strict",
							typeSymbol: "dsh-plugin-learn#learn/saveNote:body",
							create: _deepseek_ai_dsh_experimental_api_learn_learn_saveNote_parameter_1$schema
						}
					}],
					result: {
						mode: "strict",
						typeSymbol: "dsh-plugin-learn#learn/saveNote:result",
						create: _deepseek_ai_dsh_experimental_api_learn_learn_saveNote_result$schema
					},
					sourceLocation: {
						"file": "packages/experimental/api-learn/src/index.ts",
						"line": 158,
						"column": 3
					}
				},
				{
					id: "dsh-plugin-learn#learn/setEmailAddress",
					service: "learnController",
					namespace: "learn",
					method: "setEmailAddress",
					invocation: { kind: "direct" },
					parameters: [{
						name: "address",
						wire: "address",
						source: "json",
						codec: {
							mode: "strict",
							typeSymbol: "dsh-plugin-learn#learn/setEmailAddress:address",
							create: _deepseek_ai_dsh_experimental_api_learn_learn_setEmailAddress_parameter_0$schema
						}
					}],
					result: {
						mode: "strict",
						typeSymbol: "dsh-plugin-learn/service/types#EmailSettingsView",
						create: _deepseek_ai_dsh_experimental_api_learn_learn_setEmailAddress_result$schema
					},
					sourceLocation: {
						"file": "packages/experimental/api-learn/src/index.ts",
						"line": 349,
						"column": 3
					}
				},
				{
					id: "dsh-plugin-learn#learn/skipLesson",
					service: "learnController",
					namespace: "learn",
					method: "skipLesson",
					invocation: { kind: "direct" },
					parameters: [{
						name: "topicId",
						wire: "topicId",
						source: "json",
						codec: {
							mode: "strict",
							typeSymbol: "dsh-plugin-learn/service/types#TopicId",
							create: _deepseek_ai_dsh_experimental_api_learn_learn_skipLesson_parameter_0$schema
						}
					}, {
						name: "answers",
						wire: "answers",
						source: "json",
						codec: {
							mode: "strict",
							typeSymbol: "dsh-plugin-learn#learn/skipLesson:answers",
							create: _deepseek_ai_dsh_experimental_api_learn_learn_skipLesson_parameter_1$schema
						}
					}],
					result: {
						mode: "strict",
						typeSymbol: "dsh-plugin-learn#learn/skipLesson:result",
						create: _deepseek_ai_dsh_experimental_api_learn_learn_skipLesson_result$schema
					},
					sourceLocation: {
						"file": "packages/experimental/api-learn/src/index.ts",
						"line": 115,
						"column": 3
					}
				},
				{
					id: "dsh-plugin-learn#learn/submit",
					service: "learnController",
					namespace: "learn",
					method: "submit",
					invocation: { kind: "direct" },
					parameters: [
						{
							name: "problemId",
							wire: "problemId",
							source: "json",
							codec: {
								mode: "strict",
								typeSymbol: "dsh-plugin-learn/service/types#ProblemId",
								create: _deepseek_ai_dsh_experimental_api_learn_learn_submit_parameter_0$schema
							}
						},
						{
							name: "language",
							wire: "language",
							source: "json",
							codec: {
								mode: "strict",
								typeSymbol: "dsh-plugin-learn/service/types#CodeLanguage",
								create: _deepseek_ai_dsh_experimental_api_learn_learn_submit_parameter_1$schema
							}
						},
						{
							name: "code",
							wire: "code",
							source: "json",
							codec: {
								mode: "strict",
								typeSymbol: "dsh-plugin-learn#learn/submit:code",
								create: _deepseek_ai_dsh_experimental_api_learn_learn_submit_parameter_2$schema
							}
						},
						{
							name: "context",
							wire: "context",
							source: "json",
							codec: {
								mode: "strict",
								typeSymbol: "dsh-plugin-learn#learn/submit:context",
								create: _deepseek_ai_dsh_experimental_api_learn_learn_submit_parameter_3$schema
							}
						},
						{
							name: "reviewItemId",
							wire: "reviewItemId",
							source: "json",
							codec: {
								mode: "strict",
								typeSymbol: "dsh-plugin-learn#learn/submit:reviewItemId",
								create: _deepseek_ai_dsh_experimental_api_learn_learn_submit_parameter_4$schema
							}
						}
					],
					cancellation: { parameter: "signal" },
					result: {
						mode: "strict",
						typeSymbol: "dsh-plugin-learn/service/types#AttemptView",
						create: _deepseek_ai_dsh_experimental_api_learn_learn_submit_result$schema
					},
					sourceLocation: {
						"file": "packages/experimental/api-learn/src/index.ts",
						"line": 186,
						"column": 3
					}
				},
				{
					id: "dsh-plugin-learn#learn/testEmail",
					service: "learnController",
					namespace: "learn",
					method: "testEmail",
					invocation: { kind: "direct" },
					parameters: [],
					result: {
						mode: "strict",
						typeSymbol: "dsh-plugin-learn/service/types#EmailJobView",
						create: _deepseek_ai_dsh_experimental_api_learn_learn_testEmail_result$schema
					},
					sourceLocation: {
						"file": "packages/experimental/api-learn/src/index.ts",
						"line": 374,
						"column": 3
					}
				},
				{
					id: "dsh-plugin-learn#learn/today",
					service: "learnController",
					namespace: "learn",
					method: "today",
					invocation: { kind: "direct" },
					parameters: [],
					result: {
						mode: "strict",
						typeSymbol: "dsh-plugin-learn/service/types#TodayView",
						create: _deepseek_ai_dsh_experimental_api_learn_learn_today_result$schema
					},
					sourceLocation: {
						"file": "packages/experimental/api-learn/src/index.ts",
						"line": 84,
						"column": 3
					}
				},
				{
					id: "dsh-plugin-learn#learn/tutorCancel",
					service: "learnController",
					namespace: "learn",
					method: "tutorCancel",
					invocation: { kind: "direct" },
					parameters: [{
						name: "threadId",
						wire: "threadId",
						source: "json",
						codec: {
							mode: "strict",
							typeSymbol: "dsh-plugin-learn/service/types#TutorThreadId",
							create: _deepseek_ai_dsh_experimental_api_learn_learn_tutorCancel_parameter_0$schema
						}
					}],
					result: {
						mode: "strict",
						typeSymbol: "dsh-plugin-learn#learn/tutorCancel:result",
						create: _deepseek_ai_dsh_experimental_api_learn_learn_tutorCancel_result$schema
					},
					sourceLocation: {
						"file": "packages/experimental/api-learn/src/index.ts",
						"line": 223,
						"column": 3
					}
				},
				{
					id: "dsh-plugin-learn#learn/tutorFollow",
					service: "learnController",
					namespace: "learn",
					method: "tutorFollow",
					mode: "stream",
					invocation: { kind: "direct" },
					parameters: [{
						name: "threadId",
						wire: "threadId",
						source: "json",
						codec: {
							mode: "strict",
							typeSymbol: "dsh-plugin-learn/service/types#TutorThreadId",
							create: _deepseek_ai_dsh_experimental_api_learn_learn_tutorFollow_parameter_0$schema
						}
					}],
					cancellation: { parameter: "signal" },
					result: {
						mode: "strict",
						typeSymbol: "dsh-plugin-learn/service/types#TutorStreamFrame",
						create: _deepseek_ai_dsh_experimental_api_learn_learn_tutorFollow_result$schema
					},
					sourceLocation: {
						"file": "packages/experimental/api-learn/src/index.ts",
						"line": 232,
						"column": 10
					}
				},
				{
					id: "dsh-plugin-learn#learn/tutorSend",
					service: "learnController",
					namespace: "learn",
					method: "tutorSend",
					invocation: { kind: "direct" },
					parameters: [
						{
							name: "problemId",
							wire: "problemId",
							source: "json",
							codec: {
								mode: "strict",
								typeSymbol: "dsh-plugin-learn#learn/tutorSend:problemId",
								create: _deepseek_ai_dsh_experimental_api_learn_learn_tutorSend_parameter_0$schema
							}
						},
						{
							name: "topicId",
							wire: "topicId",
							source: "json",
							codec: {
								mode: "strict",
								typeSymbol: "dsh-plugin-learn#learn/tutorSend:topicId",
								create: _deepseek_ai_dsh_experimental_api_learn_learn_tutorSend_parameter_1$schema
							}
						},
						{
							name: "text",
							wire: "text",
							source: "json",
							codec: {
								mode: "strict",
								typeSymbol: "dsh-plugin-learn#learn/tutorSend:text",
								create: _deepseek_ai_dsh_experimental_api_learn_learn_tutorSend_parameter_2$schema
							}
						}
					],
					result: {
						mode: "strict",
						typeSymbol: "dsh-plugin-learn#learn/tutorSend:result",
						create: _deepseek_ai_dsh_experimental_api_learn_learn_tutorSend_result$schema
					},
					sourceLocation: {
						"file": "packages/experimental/api-learn/src/index.ts",
						"line": 213,
						"column": 3
					}
				},
				{
					id: "dsh-plugin-learn#learn/updateSettings",
					service: "learnController",
					namespace: "learn",
					method: "updateSettings",
					invocation: { kind: "direct" },
					parameters: [{
						name: "patch",
						wire: "patch",
						source: "json",
						codec: {
							mode: "strict",
							typeSymbol: "dsh-plugin-learn#learn/updateSettings:patch",
							create: _deepseek_ai_dsh_experimental_api_learn_learn_updateSettings_parameter_0$schema
						}
					}],
					result: {
						mode: "strict",
						typeSymbol: "dsh-plugin-learn/service/types#LearnerSettings",
						create: _deepseek_ai_dsh_experimental_api_learn_learn_updateSettings_result$schema
					},
					sourceLocation: {
						"file": "packages/experimental/api-learn/src/index.ts",
						"line": 92,
						"column": 3
					}
				},
				{
					id: "dsh-plugin-learn#learn/variants",
					service: "learnController",
					namespace: "learn",
					method: "variants",
					invocation: { kind: "direct" },
					parameters: [],
					result: {
						mode: "strict",
						typeSymbol: "dsh-plugin-learn#learn/variants:result",
						create: _deepseek_ai_dsh_experimental_api_learn_learn_variants_result$schema
					},
					sourceLocation: {
						"file": "packages/experimental/api-learn/src/index.ts",
						"line": 287,
						"column": 3
					}
				},
				{
					id: "dsh-plugin-learn#learn/verifyEmail",
					service: "learnController",
					namespace: "learn",
					method: "verifyEmail",
					invocation: { kind: "direct" },
					parameters: [{
						name: "code",
						wire: "code",
						source: "json",
						codec: {
							mode: "strict",
							typeSymbol: "dsh-plugin-learn#learn/verifyEmail:code",
							create: _deepseek_ai_dsh_experimental_api_learn_learn_verifyEmail_parameter_0$schema
						}
					}],
					result: {
						mode: "strict",
						typeSymbol: "dsh-plugin-learn/service/types#EmailSettingsView",
						create: _deepseek_ai_dsh_experimental_api_learn_learn_verifyEmail_result$schema
					},
					sourceLocation: {
						"file": "packages/experimental/api-learn/src/index.ts",
						"line": 357,
						"column": 3
					}
				},
				{
					id: "dsh-plugin-learn#learn/workspace",
					service: "learnController",
					namespace: "learn",
					method: "workspace",
					invocation: { kind: "direct" },
					parameters: [{
						name: "problemId",
						wire: "problemId",
						source: "json",
						codec: {
							mode: "strict",
							typeSymbol: "dsh-plugin-learn/service/types#ProblemId",
							create: _deepseek_ai_dsh_experimental_api_learn_learn_workspace_parameter_0$schema
						}
					}],
					result: {
						mode: "strict",
						typeSymbol: "dsh-plugin-learn/service/types#WorkspaceState",
						create: _deepseek_ai_dsh_experimental_api_learn_learn_workspace_result$schema
					},
					sourceLocation: {
						"file": "packages/experimental/api-learn/src/index.ts",
						"line": 137,
						"column": 3
					}
				}
			]
		};
		//#endregion
		//#region lib/types/client/api.js
		/** Error carrying the Remote failure message for display. */
		var LearnApiError = class extends Error {
			code;
			constructor(message, code) {
				super(message);
				this.code = code;
				this.name = "LearnApiError";
			}
		};
		async function unwrap(pending) {
			const result = await pending;
			if (result.ok) return result.value;
			const error = result.error;
			throw new LearnApiError(error.message ?? "Request failed", error.code);
		}
		/**
		* Bind the Learn actions to a mounted Remote namespace.
		* @param ctx - Client context with `remote.learn`.
		* @returns the action set.
		*/
		function createLearnApi(ctx) {
			const learn = ctx.remote.learn;
			return {
				overview: () => unwrap(learn.overview()),
				today: () => unwrap(learn.today()),
				updateSettings: (patch) => unwrap(learn.updateSettings(patch)),
				lesson: (topicId, stage, answers) => unwrap(learn.lesson(topicId, stage, answers)),
				skipLesson: (topicId, answers) => unwrap(learn.skipLesson(topicId, answers)),
				reflect: (topicId, text, signal) => unwrap(learn.reflect(topicId, text, signal)),
				workspace: (problemId) => unwrap(learn.workspace(problemId)),
				saveDraft: (problemId, language, code) => unwrap(learn.saveDraft(problemId, language, code)),
				saveNote: (problemId, body) => unwrap(learn.saveNote(problemId, body)),
				run: (problemId, language, code, inputs, signal) => unwrap(learn.run(problemId, language, code, inputs, signal)),
				submit: (problemId, language, code, context, item, signal) => unwrap(learn.submit(problemId, language, code, context, item, signal)),
				hint: (problemId, level, confirm, signal) => unwrap(learn.hint(problemId, level, confirm, signal)),
				tutorSend: (problemId, topicId, text) => unwrap(learn.tutorSend(problemId, topicId, text)),
				tutorCancel: (threadId) => unwrap(learn.tutorCancel(threadId)),
				tutorFollow: async (threadId, onFrame, signal) => {
					const stream = ctx.remote.$stream({
						name: "Learn tutor",
						open: (streamSignal) => learn.tutorFollow(threadId, streamSignal),
						ended: () => new _deepseek_ai_dsh_api_gateway_client.RemoteStreamCarrierError("Learn tutor stream ended"),
						carrierFailed: () => {}
					});
					const stop = () => {
						stream.dispose();
					};
					signal.addEventListener("abort", stop, { once: true });
					try {
						for await (const item of stream) {
							onFrame(item.value);
							item.accept();
						}
					} catch (error) {
						if (!signal.aborted) throw error;
					} finally {
						signal.removeEventListener("abort", stop);
						await stream.dispose();
					}
				},
				reviewQueue: () => unwrap(learn.reviewQueue()),
				completeReview: (itemId, attemptId, recall) => unwrap(learn.completeReview(itemId, attemptId, recall)),
				moveReview: (itemId, target, key) => unwrap(learn.moveReview(itemId, target, key)),
				generateVariant: (parentId, signal) => unwrap(learn.generateVariant(parentId, signal)),
				variants: () => unwrap(learn.variants()),
				importProblem: (spec, signal) => unwrap(learn.importProblem(spec, signal)),
				progress: () => unwrap(learn.progress()),
				runnerStatus: (refresh) => unwrap(learn.runnerStatus(refresh)),
				prepareRunner: (language, signal) => unwrap(learn.prepareRunner(language, signal)),
				emailSettings: () => unwrap(learn.emailSettings()),
				setEmailAddress: (address) => unwrap(learn.setEmailAddress(address)),
				verifyEmail: (code) => unwrap(learn.verifyEmail(code)),
				emailPreferences: (patch) => unwrap(learn.emailPreferences(patch)),
				testEmail: () => unwrap(learn.testEmail()),
				emailJobs: () => unwrap(learn.emailJobs()),
				emailPreview: (jobId) => unwrap(learn.emailPreview(jobId)),
				runReminders: () => unwrap(learn.runReminders()),
				exportData: () => unwrap(learn.exportData()),
				resetData: (confirmation) => unwrap(learn.resetData(confirmation))
			};
		}
		//#endregion
		//#region lib/types/client/LearnIcon.js
		/**
		* Render a graduation-cap outline at the requested size.
		* @param props - sidebar icon share.
		* @returns decorative icon.
		*/
		function LearnIcon({ size }) {
			return (0, react_jsx_runtime.jsxs)("svg", {
				width: size,
				height: size,
				viewBox: "0 0 24 24",
				fill: "none",
				stroke: "currentColor",
				strokeWidth: "1.6",
				strokeLinecap: "round",
				strokeLinejoin: "round",
				"aria-hidden": "true",
				children: [
					(0, react_jsx_runtime.jsx)("path", { d: "M2.5 9.5 12 5l9.5 4.5L12 14 2.5 9.5Z" }),
					(0, react_jsx_runtime.jsx)("path", { d: "M6.5 11.5v4c0 1.4 2.5 3 5.5 3s5.5-1.6 5.5-3v-4" }),
					(0, react_jsx_runtime.jsx)("path", { d: "M21.5 9.5v5" })
				]
			});
		}
		//#endregion
		//#region \0dsh-css:/Users/kape/dsh/dsh-rc2/packages/experimental/client-ui-learn/src/client/Learn.module.css.mjs
		const css = ".EhdLvG_page{background:var(--dsw-alias-bg-base);height:100%;min-height:0;color:var(--dsw-alias-label-primary);font:var(--dsw-font-s-14);flex-direction:column;display:flex}.EhdLvG_header{border-bottom:.5px solid var(--dsw-alias-border-l2);flex-wrap:wrap;align-items:center;gap:16px;padding:12px 20px;display:flex}.EhdLvG_title{font:var(--dsw-font-m-18);margin:0;font-weight:600}.EhdLvG_body{flex:1;min-height:0;padding:16px 20px 32px;overflow:auto}.EhdLvG_banner{background:var(--dsw-alias-bg-layer-2);color:var(--dsw-alias-label-secondary);border-radius:8px;align-items:center;gap:12px;margin:8px 20px 0;padding:8px 12px;display:flex}.EhdLvG_banner[data-tone=warn]{border:1px solid var(--dsw-alias-state-warn-primary)}.EhdLvG_grid{grid-template-columns:repeat(auto-fill,minmax(280px,1fr));align-items:start;gap:16px;display:grid}.EhdLvG_card{background:var(--dsw-alias-bg-layer-1);border:.5px solid var(--dsw-alias-border-l2);border-radius:10px;flex-direction:column;gap:8px;min-width:0;padding:14px 16px;display:flex}.EhdLvG_card[data-span=wide]{grid-column:1/-1}.EhdLvG_card[data-tone=success]{border:1px solid var(--dsw-alias-state-success-primary)}.EhdLvG_card h3,.EhdLvG_card h4{font:var(--dsw-font-s-14);margin:0;font-weight:600}.EhdLvG_cardTitle{font:var(--dsw-font-base-16);margin:0;font-weight:600}.EhdLvG_stack{flex-direction:column;gap:10px;min-width:0;display:flex}.EhdLvG_stack h2,.EhdLvG_stack h3,.EhdLvG_stack h4{margin:4px 0 0}.EhdLvG_row{flex-wrap:wrap;align-items:center;gap:8px;min-width:0;display:flex}.EhdLvG_spacer{flex:1}.EhdLvG_inline{align-items:center;gap:6px;display:inline-flex}.EhdLvG_muted{color:var(--dsw-alias-label-tertiary)}.EhdLvG_note{color:var(--dsw-alias-label-secondary);margin:0}.EhdLvG_success{color:var(--dsw-alias-state-success-primary);margin:0}.EhdLvG_errorText{color:var(--dsw-alias-state-error-primary);white-space:pre-wrap;font-family:var(--dsw-font-markdown-code-font-family,monospace);margin:0;font-size:12px;line-height:18px}.EhdLvG_errorBox{border:1px solid var(--dsw-alias-state-error-primary);color:var(--dsw-alias-state-error-primary);border-radius:8px;align-items:center;gap:12px;padding:8px 12px;display:flex}.EhdLvG_linkButton{color:var(--dsw-alias-link);cursor:pointer;background:0 0;border:0;padding:0;font-weight:500}.EhdLvG_link{color:var(--dsw-alias-link);font-weight:500;text-decoration:none}.EhdLvG_link:hover,.EhdLvG_link:focus-visible,.EhdLvG_linkButton:hover,.EhdLvG_linkButton:focus-visible{text-underline-offset:3px;text-decoration:underline dotted}.EhdLvG_problemLink{font:inherit;color:var(--dsw-alias-label-primary);text-align:left;cursor:pointer;background:0 0;border:0;padding:0}.EhdLvG_problemLink:hover{color:var(--dsw-alias-link)}.EhdLvG_difficulty{font-size:12px;font-weight:500;line-height:18px}.EhdLvG_difficulty[data-difficulty=easy]{color:var(--dsw-alias-state-success-primary)}.EhdLvG_difficulty[data-difficulty=medium]{color:var(--dsw-alias-state-warn-primary)}.EhdLvG_difficulty[data-difficulty=hard]{color:var(--dsw-alias-state-error-primary)}.EhdLvG_verdict{font:var(--dsw-font-base-16);font-weight:600}.EhdLvG_verdict[data-verdict=pass]{color:var(--dsw-alias-state-success-primary)}.EhdLvG_verdict[data-verdict=fail]{color:var(--dsw-alias-state-error-primary)}.EhdLvG_verdict[data-verdict=neutral]{color:var(--dsw-alias-label-secondary)}.EhdLvG_status[data-status=solved]{color:var(--dsw-alias-state-success-primary)}.EhdLvG_status[data-status=solved-with-help]{color:var(--dsw-alias-state-warn-primary)}.EhdLvG_status[data-status=attempted]{color:var(--dsw-alias-label-secondary)}.EhdLvG_status[data-status=new]{color:var(--dsw-alias-label-tertiary)}.EhdLvG_level{corner-shape:round;background:var(--dsw-alias-bg-layer-2);color:var(--dsw-alias-label-secondary);white-space:nowrap;border-radius:999px;padding:1px 8px;font-size:12px;line-height:18px}.EhdLvG_level[data-level=mastered],.EhdLvG_level[data-level=proficient]{color:var(--dsw-alias-state-success-primary)}.EhdLvG_level[data-level=practicing]{color:var(--dsw-alias-state-warn-primary)}.EhdLvG_meter{corner-shape:round;background:var(--dsw-alias-border-l2);border-radius:999px;flex:1;width:100%;min-width:80px;height:6px;overflow:hidden}.EhdLvG_meterFill{background:var(--dsw-alias-state-success-primary);height:100%}.EhdLvG_list{flex-direction:column;margin:0;padding:0;list-style:none;display:flex}.EhdLvG_listRow{border-bottom:.5px solid var(--dsw-alias-border-l1);flex-wrap:wrap;align-items:center;gap:8px;padding:6px 0;display:flex}.EhdLvG_stackRow{border-bottom:.5px solid var(--dsw-alias-border-l1);flex-direction:column;gap:2px;padding:6px 0;display:flex}.EhdLvG_roadmap{grid-template-columns:repeat(auto-fill,minmax(320px,1fr));gap:12px;margin:0;padding:0;list-style:none;display:grid}.EhdLvG_topicCard[data-locked=true]{opacity:.6}.EhdLvG_topicCard p{color:var(--dsw-alias-label-secondary);margin:0}.EhdLvG_topicOrder{corner-shape:round;background:var(--dsw-alias-bg-layer-3);border-radius:50%;place-items:center;width:22px;height:22px;font-size:12px;display:inline-grid}.EhdLvG_lesson{flex-direction:column;gap:14px;max-width:920px;display:flex}.EhdLvG_stages{flex-wrap:wrap;gap:4px;display:flex}.EhdLvG_stage{border:.5px solid var(--dsw-alias-border-l2);background:var(--dsw-alias-bg-layer-1);color:var(--dsw-alias-label-secondary);corner-shape:round;font:inherit;cursor:pointer;border-radius:999px;padding:4px 12px}.EhdLvG_stage[data-done=true]{color:var(--dsw-alias-state-success-primary)}.EhdLvG_stage[aria-current=step]{background:var(--dsw-alias-button-primary-fill);color:var(--dsw-alias-label-primary-inverted)}.EhdLvG_stage:disabled{cursor:not-allowed;opacity:.5}.EhdLvG_lessonBody{min-height:200px}.EhdLvG_choice{cursor:pointer;align-items:flex-start;gap:8px;padding:4px 0;display:flex}.EhdLvG_tableWrap{overflow-x:auto}.EhdLvG_table{border-collapse:collapse;width:100%}.EhdLvG_table caption{text-align:left;color:var(--dsw-alias-label-tertiary);padding-bottom:6px}.EhdLvG_table th,.EhdLvG_table td{text-align:left;border-bottom:.5px solid var(--dsw-alias-border-l1);vertical-align:top;padding:8px 10px}.EhdLvG_table th{color:var(--dsw-alias-label-tertiary);font-weight:500}.EhdLvG_clickRow{cursor:pointer}.EhdLvG_clickRow:hover{background:var(--dsw-alias-interactive-bg-hover)}.EhdLvG_filters{flex-wrap:wrap;align-items:center;gap:8px;display:flex}.EhdLvG_search{flex:1;min-width:220px;max-width:360px}.EhdLvG_select{font:inherit;color:var(--dsw-alias-label-primary);background:var(--dsw-alias-bg-layer-1);border:.5px solid var(--dsw-alias-border-l2);border-radius:6px;padding:4px 8px}.EhdLvG_form{grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:10px;display:grid}.EhdLvG_form label{color:var(--dsw-alias-label-secondary);flex-direction:column;gap:4px;display:flex}.EhdLvG_textarea,.EhdLvG_notes,.EhdLvG_codeArea{font:inherit;color:var(--dsw-alias-label-primary);background:var(--dsw-alias-bg-layer-1);border:.5px solid var(--dsw-alias-border-l2);resize:vertical;box-sizing:border-box;border-radius:8px;width:100%;padding:8px 10px}.EhdLvG_codeArea,.EhdLvG_mono{font-family:var(--dsw-font-markdown-code-font-family,monospace);font-size:12px;line-height:18px}.EhdLvG_notes{height:100%;min-height:240px}.EhdLvG_markdown{min-width:0}.EhdLvG_prewrap{white-space:pre-wrap;margin:0}.EhdLvG_workspace{flex-direction:column;gap:10px;height:calc(100vh - 140px);min-height:520px;display:flex}.EhdLvG_workspaceBar{flex-wrap:wrap;align-items:center;gap:10px;display:flex}.EhdLvG_problemTitle{font:var(--dsw-font-base-16);margin:0;font-weight:600}.EhdLvG_split{grid-template-columns:var(--learn-split,42%) 6px 1fr;flex:1;gap:0;min-height:0;display:grid}.EhdLvG_leftPane,.EhdLvG_rightPane{background:var(--dsw-alias-bg-layer-1);border:.5px solid var(--dsw-alias-border-l2);border-radius:10px;flex-direction:column;min-width:0;min-height:0;display:flex;overflow:hidden}.EhdLvG_rightPane{overflow:auto}.EhdLvG_divider{cursor:col-resize;border-radius:3px;margin:0 1px}.EhdLvG_divider:hover,.EhdLvG_divider:focus-visible{background:var(--dsw-alias-interactive-bg-hover);outline:none}.EhdLvG_paneTabs{border-bottom:.5px solid var(--dsw-alias-border-l1);gap:2px;padding:6px 8px;display:flex;overflow-x:auto}.EhdLvG_paneTab{font:inherit;color:var(--dsw-alias-label-secondary);cursor:pointer;background:0 0;border:0;border-radius:6px;padding:4px 10px}.EhdLvG_paneTab[aria-selected=true]{color:var(--dsw-alias-label-primary);background:var(--dsw-alias-interactive-bg-active);font-weight:500}.EhdLvG_paneBody{flex:1;min-height:0;padding:12px 14px;overflow:auto}.EhdLvG_example{border-left:2px solid var(--dsw-alias-border-l3);background:var(--dsw-alias-bg-layer-2);border-radius:4px;flex-direction:column;gap:2px;padding:8px 10px;display:flex}.EhdLvG_editorBar{border-bottom:.5px solid var(--dsw-alias-border-l1);align-items:center;gap:8px;padding:6px 10px;display:flex}.EhdLvG_editor{height:46%;min-height:260px;max-height:60vh;font-family:var(--dsw-font-markdown-code-font-family,monospace);border-bottom:.5px solid var(--dsw-alias-border-l1);grid-template-columns:auto 1fr;font-size:13px;line-height:20px;display:grid}.EhdLvG_gutter{text-align:right;color:var(--dsw-alias-label-tertiary);user-select:none;background:var(--dsw-alias-bg-layer-2);padding:8px 8px 8px 12px;overflow:hidden}.EhdLvG_editorArea{min-width:0;position:relative}.EhdLvG_editorLayer,.EhdLvG_editorInput{font:inherit;line-height:inherit;tab-size:4;white-space:pre;box-sizing:border-box;border:0;margin:0;padding:8px 12px;position:absolute;inset:0;overflow:auto}.EhdLvG_editorLayer{pointer-events:none;color:var(--dsw-alias-label-primary);overflow:hidden}.EhdLvG_editorInput{color:#0000;caret-color:var(--dsw-alias-label-primary);resize:none;background:0 0;outline:none}.EhdLvG_editorInput::selection{background:var(--dsw-alias-bg-document-selection)}.EhdLvG_custom{padding:6px 10px}.EhdLvG_actions{align-items:center;gap:8px;padding:8px 10px;display:flex}.EhdLvG_result{flex-direction:column;gap:8px;padding:10px 12px 16px;display:flex}.EhdLvG_case{background:var(--dsw-alias-bg-layer-2);border-radius:6px;flex-direction:column;gap:2px;padding:8px 10px;display:flex}.EhdLvG_case[data-pass=false]{border-left:2px solid var(--dsw-alias-state-error-primary)}.EhdLvG_case[data-pass=true]{border-left:2px solid var(--dsw-alias-state-success-primary)}.EhdLvG_checks{margin:0;padding-left:16px;font-size:12px}.EhdLvG_checks li[data-ok=false]{color:var(--dsw-alias-state-error-primary)}.EhdLvG_tutor{flex-direction:column;gap:8px;height:100%;min-height:300px;display:flex}.EhdLvG_tutorLog{flex-direction:column;flex:1;gap:10px;display:flex;overflow:auto}.EhdLvG_message{background:var(--dsw-alias-bg-layer-2);border-radius:8px;padding:8px 10px}.EhdLvG_message[data-role=learner]{background:var(--dsw-alias-interactive-bg-active);align-self:flex-end;max-width:85%}.EhdLvG_messageAuthor{color:var(--dsw-alias-label-tertiary);font-size:12px}.EhdLvG_tutorInput{align-items:flex-end;gap:8px;display:flex}.EhdLvG_editorBar .EhdLvG_select{max-width:260px}.EhdLvG_masteryRow{grid-template-columns:minmax(140px,220px) 1fr auto;align-items:center;gap:10px;padding:4px 0;display:grid}.EhdLvG_masteryRow>:last-child{grid-column:1/-1;font-size:12px}.EhdLvG_masteryName{text-overflow:ellipsis;white-space:nowrap;overflow:hidden}.EhdLvG_previewFrame{border:.5px solid var(--dsw-alias-border-l2);background:#fff;border-radius:8px;width:100%;min-width:min(560px,70vw);height:60vh}.EhdLvG_paneTab:focus-visible,.EhdLvG_stage:focus-visible,.EhdLvG_problemLink:focus-visible,.EhdLvG_select:focus-visible,.EhdLvG_textarea:focus-visible,.EhdLvG_notes:focus-visible{outline:2px solid var(--dsw-alias-link);outline-offset:1px}@media (width<=860px){.EhdLvG_split{grid-template-rows:auto auto;grid-template-columns:1fr}.EhdLvG_divider{display:none}.EhdLvG_workspace{height:auto}.EhdLvG_leftPane{max-height:50vh}.EhdLvG_body{padding:12px}}";
		const tagId = "dsh-plugin-learn/Learn.module.css";
		if (typeof document !== "undefined" && document.querySelector("style[data-plugin-css=" + JSON.stringify(tagId) + "]") === null) {
			const tag = document.createElement("style");
			tag.dataset.plugin = "dsh-plugin-learn";
			tag.dataset.pluginCss = tagId;
			tag.textContent = css;
			document.head.appendChild(tag);
		}
		var Learn_module_css_default = {
			"actions": "EhdLvG_actions",
			"banner": "EhdLvG_banner",
			"body": "EhdLvG_body",
			"card": "EhdLvG_card",
			"cardTitle": "EhdLvG_cardTitle",
			"case": "EhdLvG_case",
			"checks": "EhdLvG_checks",
			"choice": "EhdLvG_choice",
			"clickRow": "EhdLvG_clickRow",
			"codeArea": "EhdLvG_codeArea",
			"custom": "EhdLvG_custom",
			"difficulty": "EhdLvG_difficulty",
			"divider": "EhdLvG_divider",
			"editor": "EhdLvG_editor",
			"editorArea": "EhdLvG_editorArea",
			"editorBar": "EhdLvG_editorBar",
			"editorInput": "EhdLvG_editorInput",
			"editorLayer": "EhdLvG_editorLayer",
			"errorBox": "EhdLvG_errorBox",
			"errorText": "EhdLvG_errorText",
			"example": "EhdLvG_example",
			"filters": "EhdLvG_filters",
			"form": "EhdLvG_form",
			"grid": "EhdLvG_grid",
			"gutter": "EhdLvG_gutter",
			"header": "EhdLvG_header",
			"inline": "EhdLvG_inline",
			"leftPane": "EhdLvG_leftPane",
			"lesson": "EhdLvG_lesson",
			"lessonBody": "EhdLvG_lessonBody",
			"level": "EhdLvG_level",
			"link": "EhdLvG_link",
			"linkButton": "EhdLvG_linkButton",
			"list": "EhdLvG_list",
			"listRow": "EhdLvG_listRow",
			"markdown": "EhdLvG_markdown",
			"masteryName": "EhdLvG_masteryName",
			"masteryRow": "EhdLvG_masteryRow",
			"message": "EhdLvG_message",
			"messageAuthor": "EhdLvG_messageAuthor",
			"meter": "EhdLvG_meter",
			"meterFill": "EhdLvG_meterFill",
			"mono": "EhdLvG_mono",
			"muted": "EhdLvG_muted",
			"note": "EhdLvG_note",
			"notes": "EhdLvG_notes",
			"page": "EhdLvG_page",
			"paneBody": "EhdLvG_paneBody",
			"paneTab": "EhdLvG_paneTab",
			"paneTabs": "EhdLvG_paneTabs",
			"previewFrame": "EhdLvG_previewFrame",
			"prewrap": "EhdLvG_prewrap",
			"problemLink": "EhdLvG_problemLink",
			"problemTitle": "EhdLvG_problemTitle",
			"result": "EhdLvG_result",
			"rightPane": "EhdLvG_rightPane",
			"roadmap": "EhdLvG_roadmap",
			"row": "EhdLvG_row",
			"search": "EhdLvG_search",
			"select": "EhdLvG_select",
			"spacer": "EhdLvG_spacer",
			"split": "EhdLvG_split",
			"stack": "EhdLvG_stack",
			"stackRow": "EhdLvG_stackRow",
			"stage": "EhdLvG_stage",
			"stages": "EhdLvG_stages",
			"status": "EhdLvG_status",
			"success": "EhdLvG_success",
			"table": "EhdLvG_table",
			"tableWrap": "EhdLvG_tableWrap",
			"textarea": "EhdLvG_textarea",
			"title": "EhdLvG_title",
			"topicCard": "EhdLvG_topicCard",
			"topicOrder": "EhdLvG_topicOrder",
			"tutor": "EhdLvG_tutor",
			"tutorInput": "EhdLvG_tutorInput",
			"tutorLog": "EhdLvG_tutorLog",
			"verdict": "EhdLvG_verdict",
			"workspace": "EhdLvG_workspace",
			"workspaceBar": "EhdLvG_workspaceBar"
		};
		//#endregion
		//#region lib/types/client/shared.js
		/** Shared Learn page context, data loading, and small presentational pieces. */
		/** React context carrying {@link LearnEnv}. */
		const LearnEnvContext = (0, react.createContext)(null);
		/**
		* Read the Learn environment.
		* @returns the current environment.
		*/
		function useLearn() {
			const env = (0, react.useContext)(LearnEnvContext);
			if (env === null) throw new Error("Learn components must render inside LearnPage");
			return env;
		}
		/**
		* Pick the learner's locale from a localized text.
		* @param text - localized text.
		* @param locale - learner locale.
		* @returns the string.
		*/
		function pick(text, locale) {
			return text[locale];
		}
		/**
		* Load data on mount and when `key` changes; stale responses are ignored.
		* @param load - loader.
		* @param key - reload key.
		* @returns state with reload.
		*/
		function useAsync(load, key) {
			const [data, setData] = (0, react.useState)(void 0);
			const [error, setError] = (0, react.useState)(void 0);
			const [loading, setLoading] = (0, react.useState)(true);
			const [nonce, setNonce] = (0, react.useState)(0);
			const loader = (0, react.useRef)(load);
			loader.current = load;
			(0, react.useEffect)(() => {
				let live = true;
				setLoading(true);
				loader.current().then((value) => {
					if (!live) return;
					setData(value);
					setError(void 0);
					setLoading(false);
				}, (failure) => {
					if (!live) return;
					setError(failure instanceof Error ? failure.message : String(failure));
					setLoading(false);
				});
				return () => {
					live = false;
				};
			}, [key, nonce]);
			return {
				data,
				error,
				loading,
				reload: (0, react.useCallback)(() => {
					setNonce((value) => value + 1);
				}, []),
				setData
			};
		}
		/**
		* Message text of a rejection.
		* @param error - rejection.
		* @returns displayable text.
		*/
		function messageOf(error) {
			return error instanceof Error ? error.message : String(error);
		}
		/**
		* Loading, error, or content.
		* @param props - async state and content renderer.
		* @returns the matching view.
		*/
		function Loaded({ state, t, children }) {
			if (state.error !== void 0 && state.data === void 0) return (0, react_jsx_runtime.jsxs)("div", {
				className: Learn_module_css_default.errorBox,
				role: "alert",
				children: [(0, react_jsx_runtime.jsx)("span", { children: t("failed", { message: state.error }) }), (0, react_jsx_runtime.jsx)("button", {
					type: "button",
					className: Learn_module_css_default.linkButton,
					onClick: state.reload,
					children: t("retry")
				})]
			});
			if (state.data === void 0) return (0, react_jsx_runtime.jsx)("div", {
				className: Learn_module_css_default.muted,
				"aria-busy": "true",
				children: t("loading")
			});
			return (0, react_jsx_runtime.jsx)(react_jsx_runtime.Fragment, { children: children(state.data) });
		}
		/**
		* Markdown with localized code chrome.
		* @param props - markdown text and streaming flag.
		* @returns rendered markdown.
		*/
		function Markdown({ text, streaming = false }) {
			const { t } = useLearn();
			return (0, react_jsx_runtime.jsx)("div", {
				className: Learn_module_css_default.markdown,
				children: (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.MarkdownText, {
					text,
					streaming,
					labels: {
						code: {
							copyLabel: t("copy"),
							copiedLabel: t("copied")
						},
						footnotes: t("footnotes")
					}
				})
			});
		}
		/**
		* Difficulty pill in LeetCode colors.
		* @param props - difficulty.
		* @returns the pill.
		*/
		function DifficultyBadge({ difficulty }) {
			const { t } = useLearn();
			return (0, react_jsx_runtime.jsx)("span", {
				className: Learn_module_css_default.difficulty,
				"data-difficulty": difficulty,
				children: t(`difficulty.${difficulty}`)
			});
		}
		/**
		* Verdict heading colored by outcome.
		* @param props - verdict kind.
		* @returns the label.
		*/
		function VerdictLabel({ kind }) {
			const { t } = useLearn();
			return (0, react_jsx_runtime.jsx)("span", {
				className: Learn_module_css_default.verdict,
				"data-verdict": kind === "passed-local-tests" ? "pass" : kind === "evaluation-unavailable" || kind === "cancelled" ? "neutral" : "fail",
				children: t(`verdict.${kind}`)
			});
		}
		/**
		* Neutral tag.
		* @param props - content and tone.
		* @returns the tag.
		*/
		function Chip({ children, tone = "neutral" }) {
			return (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Tag, {
				tone,
				children
			});
		}
		/**
		* Compact JSON for case values.
		* @param value - value.
		* @returns one-line JSON, truncated.
		*/
		function compact(value) {
			const text = value === void 0 ? "undefined" : JSON.stringify(value);
			return text.length > 400 ? `${text.slice(0, 400)}…` : text;
		}
		/**
		* Local time of an ISO instant.
		* @param iso - instant.
		* @param locale - learner locale.
		* @returns short date and time.
		*/
		function when(iso, locale) {
			return new Date(iso).toLocaleString(locale === "zh" ? "zh-CN" : "en-US", {
				month: "short",
				day: "numeric",
				hour: "2-digit",
				minute: "2-digit"
			});
		}
		//#endregion
		//#region lib/types/client/TodayTab.js
		/** Today: next lesson, due reviews, daily goal, suggested problem, and recent activity. */
		/**
		* Render the Today dashboard.
		* @returns the dashboard.
		*/
		function TodayTab() {
			const { api, t, locale, overview, navigate } = useLearn();
			const state = useAsync(() => api.today(), "today");
			const activityDetail = (detail) => {
				const [kind, outcome] = detail.split(":");
				const verdict = [
					"passed-local-tests",
					"wrong-answer",
					"compile-error",
					"runtime-error",
					"time-limit-exceeded",
					"memory-limit-exceeded",
					"output-limit-exceeded",
					"evaluation-unavailable",
					"cancelled"
				].find((item) => item === outcome);
				return `${kind === "run" ? t("ws.run") : t("ws.submit")} · ${verdict === void 0 ? outcome ?? "" : t(`verdict.${verdict}`)}`;
			};
			return (0, react_jsx_runtime.jsx)(Loaded, {
				state,
				t,
				children: (today) => {
					const topic = overview.topics.find((item) => item.id === today.nextLesson?.topicId);
					const problem = overview.problems.find((item) => item.id === today.nextProblem);
					return (0, react_jsx_runtime.jsxs)("div", {
						className: Learn_module_css_default.grid,
						children: [
							(0, react_jsx_runtime.jsxs)("section", {
								className: Learn_module_css_default.card,
								children: [(0, react_jsx_runtime.jsx)("h3", { children: t("today.nextLesson") }), topic === void 0 || today.nextLesson === void 0 ? (0, react_jsx_runtime.jsx)("p", {
									className: Learn_module_css_default.muted,
									children: t("today.allLessons")
								}) : (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [
									(0, react_jsx_runtime.jsx)("p", {
										className: Learn_module_css_default.cardTitle,
										children: pick(topic.title, locale)
									}),
									(0, react_jsx_runtime.jsx)("p", {
										className: Learn_module_css_default.muted,
										children: t(`stage.${today.nextLesson.stage}`)
									}),
									(0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Button, {
										variant: "primary",
										onClick: () => {
											navigate({
												tab: "learn",
												topicId: topic.id
											});
										},
										children: today.nextLesson.stage === "motivation" ? t("today.start") : t("today.continue")
									})
								] })]
							}),
							(0, react_jsx_runtime.jsxs)("section", {
								className: Learn_module_css_default.card,
								children: [
									(0, react_jsx_runtime.jsx)("h3", { children: t("today.reviews") }),
									(0, react_jsx_runtime.jsx)("p", {
										className: Learn_module_css_default.cardTitle,
										children: t("today.reviewsValue", {
											due: today.reviewsDue,
											done: today.reviewsCompletedToday,
											limit: today.dailyLimit
										})
									}),
									today.reviewsDue > 0 ? (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Button, {
										variant: "primary",
										onClick: () => {
											navigate({ tab: "review" });
										},
										children: t("today.reviewNow")
									}) : (0, react_jsx_runtime.jsx)("p", {
										className: Learn_module_css_default.muted,
										children: t("today.noReviews")
									})
								]
							}),
							(0, react_jsx_runtime.jsxs)("section", {
								className: Learn_module_css_default.card,
								children: [
									(0, react_jsx_runtime.jsx)("h3", { children: t("today.goal") }),
									(0, react_jsx_runtime.jsx)("div", {
										className: Learn_module_css_default.meter,
										role: "progressbar",
										"aria-valuemin": 0,
										"aria-valuemax": today.dailyGoalMinutes,
										"aria-valuenow": Math.min(today.minutesToday, today.dailyGoalMinutes),
										children: (0, react_jsx_runtime.jsx)("div", {
											className: Learn_module_css_default.meterFill,
											style: { width: `${String(Math.min(100, Math.round(today.minutesToday / today.dailyGoalMinutes * 100)))}%` }
										})
									}),
									(0, react_jsx_runtime.jsx)("p", {
										className: Learn_module_css_default.muted,
										children: t("today.goalValue", {
											minutes: today.minutesToday,
											goal: today.dailyGoalMinutes
										})
									})
								]
							}),
							problem !== void 0 && (0, react_jsx_runtime.jsxs)("section", {
								className: Learn_module_css_default.card,
								children: [
									(0, react_jsx_runtime.jsx)("h3", { children: t("today.nextProblem") }),
									(0, react_jsx_runtime.jsxs)("button", {
										type: "button",
										className: Learn_module_css_default.problemLink,
										onClick: () => {
											navigate({
												tab: "practice",
												problemId: problem.id,
												mode: "practice"
											});
										},
										children: [problem.leetcode !== void 0 && `${String(problem.leetcode.frontendId)}. `, pick(problem.title, locale)]
									}),
									(0, react_jsx_runtime.jsx)(DifficultyBadge, { difficulty: problem.difficulty })
								]
							}),
							(0, react_jsx_runtime.jsxs)("section", {
								className: Learn_module_css_default.card,
								"data-span": "wide",
								children: [(0, react_jsx_runtime.jsx)("h3", { children: t("today.recent") }), today.recent.length === 0 ? (0, react_jsx_runtime.jsx)("p", {
									className: Learn_module_css_default.muted,
									children: t("today.empty")
								}) : (0, react_jsx_runtime.jsx)("ul", {
									className: Learn_module_css_default.list,
									children: today.recent.map((item, index) => (0, react_jsx_runtime.jsxs)("li", {
										className: Learn_module_css_default.listRow,
										children: [
											(0, react_jsx_runtime.jsx)("span", { children: pick(item.title, locale) }),
											(0, react_jsx_runtime.jsx)("span", {
												className: Learn_module_css_default.muted,
												children: activityDetail(item.detail)
											}),
											(0, react_jsx_runtime.jsx)("span", { className: Learn_module_css_default.spacer }),
											(0, react_jsx_runtime.jsx)("span", {
												className: Learn_module_css_default.muted,
												children: when(item.at, locale)
											})
										]
									}, index))
								})]
							})
						]
					});
				}
			});
		}
		//#endregion
		//#region lib/types/client/TutorPane.js
		/** Tutor conversation with live guarded streaming and visible failures. */
		/**
		* Render and follow one tutor thread.
		* @param props - thread and subject.
		* @returns the conversation.
		*/
		function TutorPane({ threadId: initialThread, problemId, topicId, initial }) {
			const { api, t } = useLearn();
			const [threadId, setThreadId] = (0, react.useState)(initialThread);
			const [messages, setMessages] = (0, react.useState)(initial);
			const [progress, setProgress] = (0, react.useState)({});
			const [draft, setDraft] = (0, react.useState)("");
			const [error, setError] = (0, react.useState)();
			const end = (0, react.useRef)(null);
			(0, react.useEffect)(() => {
				if (threadId === void 0) return;
				const abort = new AbortController();
				api.tutorFollow(threadId, (frame) => {
					if (frame.type === "snapshot") setMessages(frame.messages);
					if (frame.type === "progress") setProgress((current) => ({
						...current,
						[frame.messageId]: frame.text
					}));
					if (frame.type === "settled") {
						setMessages((current) => current.map((item) => item.id === frame.message.id ? frame.message : item));
						setProgress((current) => {
							const { [frame.message.id]: _done, ...rest } = current;
							return rest;
						});
					}
				}, abort.signal).catch((failure) => {
					setError(messageOf(failure));
				});
				return () => {
					abort.abort();
				};
			}, [api, threadId]);
			(0, react.useEffect)(() => {
				end.current?.scrollIntoView({ block: "nearest" });
			}, [messages, progress]);
			const streaming = messages.some((item) => item.status === "streaming");
			const send = () => {
				const text = draft.trim();
				if (text === "") return;
				setError(void 0);
				api.tutorSend(problemId ?? null, topicId ?? null, text).then((sent) => {
					setDraft("");
					setThreadId(sent.threadId);
				}, (failure) => {
					setError(messageOf(failure));
				});
			};
			return (0, react_jsx_runtime.jsxs)("div", {
				className: Learn_module_css_default.tutor,
				children: [
					(0, react_jsx_runtime.jsxs)("div", {
						className: Learn_module_css_default.tutorLog,
						"aria-live": "polite",
						children: [
							messages.length === 0 && (0, react_jsx_runtime.jsx)("p", {
								className: Learn_module_css_default.muted,
								children: t("tutor.empty")
							}),
							messages.map((message) => (0, react_jsx_runtime.jsxs)("div", {
								className: Learn_module_css_default.message,
								"data-role": message.role,
								children: [
									(0, react_jsx_runtime.jsx)("div", {
										className: Learn_module_css_default.messageAuthor,
										children: message.role === "learner" ? t("tutor.you") : t("tutor.name")
									}),
									message.role === "learner" ? (0, react_jsx_runtime.jsx)("p", {
										className: Learn_module_css_default.prewrap,
										children: message.content
									}) : (0, react_jsx_runtime.jsx)(Markdown, {
										text: progress[message.id] ?? message.content,
										streaming: message.status === "streaming"
									}),
									message.status === "streaming" && progress[message.id] === void 0 && (0, react_jsx_runtime.jsx)("span", {
										className: Learn_module_css_default.muted,
										children: "…"
									}),
									message.status === "failed" && (0, react_jsx_runtime.jsx)("p", {
										className: Learn_module_css_default.errorText,
										children: t("tutor.failed", { error: message.error ?? "" })
									}),
									message.status === "interrupted" && (0, react_jsx_runtime.jsx)("p", {
										className: Learn_module_css_default.muted,
										children: t("tutor.interrupted")
									})
								]
							}, message.id)),
							(0, react_jsx_runtime.jsx)("div", { ref: end })
						]
					}),
					error !== void 0 && (0, react_jsx_runtime.jsx)("div", {
						className: Learn_module_css_default.errorBox,
						role: "alert",
						children: t("failed", { message: error })
					}),
					(0, react_jsx_runtime.jsxs)("div", {
						className: Learn_module_css_default.tutorInput,
						children: [(0, react_jsx_runtime.jsx)("textarea", {
							className: Learn_module_css_default.textarea,
							rows: 2,
							value: draft,
							placeholder: t("tutor.placeholder"),
							"aria-label": t("tutor.placeholder"),
							onChange: (event) => {
								setDraft(event.target.value);
							},
							onKeyDown: (event) => {
								if (event.key === "Enter" && !event.shiftKey && !event.nativeEvent.isComposing) {
									event.preventDefault();
									send();
								}
							}
						}), streaming && threadId !== void 0 ? (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Button, {
							variant: "outline",
							onClick: () => {
								api.tutorCancel(threadId);
							},
							children: t("tutor.stop")
						}) : (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Button, {
							variant: "primary",
							disabled: draft.trim() === "",
							onClick: send,
							children: t("tutor.send")
						})]
					})
				]
			});
		}
		//#endregion
		//#region lib/types/client/CodeEditor.js
		/**
		* Code editor built from a native textarea over the shared Shiki highlighter.
		* The textarea keeps native selection, IME, undo, and accessibility; the
		* highlighted layer underneath is decorative.
		*/
		const INDENT = "    ";
		/**
		* Render the editor.
		* @param props - code, language, and callbacks.
		* @returns the editor.
		*/
		function CodeEditor({ value, language, label, onChange, onRun, onSubmit }) {
			const highlight = (0, _deepseek_ai_dsh_client_ui_primitives.useCodeHighlighter)(language === "python" ? "py" : "ts");
			const area = (0, react.useRef)(null);
			const layer = (0, react.useRef)(null);
			const gutter = (0, react.useRef)(null);
			const lines = value.split("\n");
			const highlighted = highlight(value);
			const replace = (start, end, text, caret) => {
				onChange(value.slice(0, start) + text + value.slice(end));
				requestAnimationFrame(() => {
					area.current?.setSelectionRange(caret, caret);
				});
			};
			const onKeyDown = (event) => {
				const { selectionStart: start, selectionEnd: end } = event.currentTarget;
				if ((event.metaKey || event.ctrlKey) && event.key === "Enter") {
					event.preventDefault();
					if (event.shiftKey) onSubmit?.();
					else onRun?.();
					return;
				}
				if (event.key === "Tab" && !event.altKey) {
					event.preventDefault();
					const lineStart = value.lastIndexOf("\n", start - 1) + 1;
					if (event.shiftKey) {
						const removable = value.slice(lineStart, lineStart + 4).match(/^ {1,4}/)?.[0].length ?? 0;
						if (removable > 0) replace(lineStart, lineStart + removable, "", Math.max(lineStart, start - removable));
						return;
					}
					replace(start, end, INDENT, start + 4);
					return;
				}
				if (event.key === "Enter" && !event.shiftKey && start === end) {
					event.preventDefault();
					const lineStart = value.lastIndexOf("\n", start - 1) + 1;
					const current = value.slice(lineStart, start);
					const insert = `\n${/^\s*/.exec(current)?.[0] ?? ""}${(language === "python" ? /:\s*$/.test(current) : /[{([]\s*$/.test(current)) ? INDENT : ""}`;
					replace(start, end, insert, start + insert.length);
				}
			};
			const sync = () => {
				const textarea = area.current;
				if (textarea === null) return;
				if (layer.current !== null) {
					layer.current.scrollTop = textarea.scrollTop;
					layer.current.scrollLeft = textarea.scrollLeft;
				}
				if (gutter.current !== null) gutter.current.scrollTop = textarea.scrollTop;
			};
			return (0, react_jsx_runtime.jsxs)("div", {
				className: Learn_module_css_default.editor,
				children: [(0, react_jsx_runtime.jsx)("div", {
					ref: gutter,
					className: Learn_module_css_default.gutter,
					"aria-hidden": "true",
					children: lines.map((_line, index) => (0, react_jsx_runtime.jsx)("div", { children: index + 1 }, index))
				}), (0, react_jsx_runtime.jsxs)("div", {
					className: Learn_module_css_default.editorArea,
					children: [(0, react_jsx_runtime.jsx)("pre", {
						ref: layer,
						className: Learn_module_css_default.editorLayer,
						"aria-hidden": "true",
						children: highlighted === void 0 ? `${value}\n` : highlighted.map((spans, row) => (0, react_jsx_runtime.jsx)("div", { children: spans.length === 0 ? "​" : spans.map((span, column) => (0, react_jsx_runtime.jsx)("span", {
							style: span.style,
							children: span.text
						}, column)) }, row))
					}), (0, react_jsx_runtime.jsx)("textarea", {
						ref: area,
						className: Learn_module_css_default.editorInput,
						value,
						"aria-label": label,
						spellCheck: false,
						autoCapitalize: "off",
						autoCorrect: "off",
						wrap: "off",
						onChange: (event) => {
							onChange(event.target.value);
						},
						onKeyDown,
						onScroll: sync
					})]
				})]
			});
		}
		//#endregion
		//#region lib/types/client/Workspace.js
		/** Practice workspace: statement, tutor, hints, notes, history, editor, and results. */
		function readRatio() {
			try {
				const stored = Number(window.localStorage.getItem("dsh.learn.split"));
				return Number.isFinite(stored) && stored >= .25 && stored <= .75 ? stored : .42;
			} catch {
				return .42;
			}
		}
		function writeRatio(ratio) {
			try {
				window.localStorage.setItem("dsh.learn.split", String(ratio));
			} catch {}
		}
		/**
		* Load and render one exercise.
		* @param props - problem and context.
		* @returns the workspace.
		*/
		function Workspace(props) {
			const { api, t } = useLearn();
			const state = useAsync(() => api.workspace(props.problemId), props.problemId);
			return (0, react_jsx_runtime.jsx)(Loaded, {
				state,
				t,
				children: (data) => (0, react_jsx_runtime.jsx)(WorkspaceView, {
					...props,
					initial: data,
					reload: state.reload
				})
			});
		}
		function WorkspaceView({ initial, context, reviewItemId, onBack, reload }) {
			const { api, t, locale, overview, refreshOverview } = useLearn();
			const problem = initial.problem;
			const [pane, setPane] = (0, react.useState)("description");
			const [language, setLanguage] = (0, react.useState)(() => initial.drafts[overview.settings.preferredLanguage] !== void 0 || initial.drafts.python === void 0 ? overview.settings.preferredLanguage : "python");
			const [code, setCode] = (0, react.useState)(() => initial.drafts[language]?.code ?? problem.starter[language]);
			const [saveState, setSaveState] = (0, react.useState)({ kind: "idle" });
			const [custom, setCustom] = (0, react.useState)("");
			const [busy, setBusy] = (0, react.useState)();
			const [elapsed, setElapsed] = (0, react.useState)(0);
			const [result, setResult] = (0, react.useState)(initial.attempts[0]);
			const [error, setError] = (0, react.useState)();
			const [ratio, setRatio] = (0, react.useState)(readRatio);
			const [attempts, setAttempts] = (0, react.useState)(initial.attempts);
			const container = (0, react.useRef)(null);
			const pending = (0, react.useRef)(void 0);
			(0, react.useEffect)(() => {
				if (busy === void 0) return;
				const timer = setInterval(() => {
					setElapsed(Math.round((Date.now() - busy.started) / 1e3));
				}, 500);
				return () => {
					clearInterval(timer);
				};
			}, [busy]);
			const persist = (0, react.useCallback)((next, lang) => {
				if (pending.current !== void 0) clearTimeout(pending.current);
				setSaveState({ kind: "saving" });
				pending.current = setTimeout(() => {
					api.saveDraft(problem.id, lang, next).then((at) => {
						setSaveState({
							kind: "saved",
							at
						});
					}, () => {
						setSaveState({ kind: "failed" });
					});
				}, 700);
			}, [api, problem.id]);
			(0, react.useEffect)(() => () => {
				if (pending.current !== void 0) clearTimeout(pending.current);
			}, []);
			const onCode = (next) => {
				setCode(next);
				persist(next, language);
			};
			const switchLanguage = (next) => {
				setLanguage(next);
				setCode(initial.drafts[next]?.code ?? problem.starter[next]);
			};
			const parseCustom = () => {
				const lines = custom.split("\n").map((line) => line.trim()).filter((line) => line !== "");
				const parsed = [];
				for (const [index, line] of lines.entries()) try {
					const value = JSON.parse(line);
					if (!Array.isArray(value)) return t("ws.customInvalid", { line: index + 1 });
					parsed.push(value);
				} catch {
					return t("ws.customInvalid", { line: index + 1 });
				}
				return parsed;
			};
			const execute = (kind) => {
				if (busy !== void 0) return;
				const inputs = kind === "run" ? parseCustom() : [];
				if (typeof inputs === "string") {
					setError(inputs);
					return;
				}
				const abort = new AbortController();
				setBusy({
					kind,
					started: Date.now(),
					abort
				});
				setElapsed(0);
				setError(void 0);
				(kind === "run" ? api.run(problem.id, language, code, inputs, abort.signal) : api.submit(problem.id, language, code, context, reviewItemId ?? null, abort.signal)).then((attempt) => {
					setResult(attempt);
					setAttempts((list) => [attempt, ...list]);
					if (kind === "submit") refreshOverview();
				}, (failure) => {
					if (!abort.signal.aborted) setError(messageOf(failure));
				}).finally(() => {
					setBusy(void 0);
				});
			};
			const onDivider = (event) => {
				const box = container.current?.getBoundingClientRect();
				if (box === void 0) return;
				const target = event.currentTarget;
				target.setPointerCapture(event.pointerId);
				const move = (moveEvent) => {
					setRatio(Math.min(.75, Math.max(.25, (moveEvent.clientX - box.left) / box.width)));
				};
				const up = () => {
					target.removeEventListener("pointermove", move);
					target.removeEventListener("pointerup", up);
					setRatio((value) => {
						writeRatio(value);
						return value;
					});
				};
				target.addEventListener("pointermove", move);
				target.addEventListener("pointerup", up);
			};
			const onDividerKey = (event) => {
				if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
				event.preventDefault();
				setRatio((value) => {
					const next = Math.min(.75, Math.max(.25, value + (event.key === "ArrowLeft" ? -.05 : .05)));
					writeRatio(next);
					return next;
				});
			};
			return (0, react_jsx_runtime.jsxs)("div", {
				className: Learn_module_css_default.workspace,
				children: [(0, react_jsx_runtime.jsxs)("div", {
					className: Learn_module_css_default.workspaceBar,
					children: [
						(0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Button, {
							variant: "ghost",
							size: "sm",
							onClick: onBack,
							children: t("ws.back")
						}),
						(0, react_jsx_runtime.jsxs)("h2", {
							className: Learn_module_css_default.problemTitle,
							children: [problem.leetcode !== void 0 && (0, react_jsx_runtime.jsxs)("span", {
								className: Learn_module_css_default.muted,
								children: [problem.leetcode.frontendId, ". "]
							}), pick(problem.title, locale)]
						}),
						(0, react_jsx_runtime.jsx)(DifficultyBadge, { difficulty: problem.difficulty }),
						(0, react_jsx_runtime.jsx)(Chip, {
							tone: "outline",
							children: t(`kind.${problem.kind}`)
						}),
						(0, react_jsx_runtime.jsx)("span", { className: Learn_module_css_default.spacer }),
						(0, react_jsx_runtime.jsx)("span", {
							className: Learn_module_css_default.muted,
							"aria-live": "polite",
							children: saveState.kind === "saving" ? t("ws.saving") : saveState.kind === "saved" && saveState.at !== void 0 ? t("ws.saved", { time: when(saveState.at, locale) }) : saveState.kind === "failed" ? t("ws.saveFailed") : ""
						})
					]
				}), (0, react_jsx_runtime.jsxs)("div", {
					ref: container,
					className: Learn_module_css_default.split,
					style: { "--learn-split": `${String(Math.round(ratio * 100))}%` },
					children: [
						(0, react_jsx_runtime.jsxs)("section", {
							className: Learn_module_css_default.leftPane,
							children: [(0, react_jsx_runtime.jsx)("div", {
								className: Learn_module_css_default.paneTabs,
								role: "tablist",
								children: [
									"description",
									"tutor",
									"hints",
									"notes",
									"history"
								].map((item) => (0, react_jsx_runtime.jsx)("button", {
									type: "button",
									role: "tab",
									"aria-selected": pane === item,
									className: Learn_module_css_default.paneTab,
									onClick: () => {
										setPane(item);
									},
									children: t(`ws.${item}`)
								}, item))
							}), (0, react_jsx_runtime.jsxs)("div", {
								className: Learn_module_css_default.paneBody,
								children: [
									pane === "description" && (0, react_jsx_runtime.jsx)(Description, { state: initial }),
									pane === "tutor" && (0, react_jsx_runtime.jsx)(TutorPane, {
										threadId: initial.tutor.threadId,
										problemId: problem.id,
										initial: initial.tutor.messages
									}),
									pane === "hints" && (0, react_jsx_runtime.jsx)(Hints, {
										problemId: problem.id,
										initial: initial.hints
									}),
									pane === "notes" && (0, react_jsx_runtime.jsx)(Notes, {
										problemId: problem.id,
										initial: initial.note
									}),
									pane === "history" && (0, react_jsx_runtime.jsx)(History, {
										attempts,
										onRestore: (attempt) => {
											setLanguage(attempt.language);
											onCode(attempt.code);
										}
									})
								]
							})]
						}),
						(0, react_jsx_runtime.jsx)("div", {
							className: Learn_module_css_default.divider,
							role: "separator",
							"aria-orientation": "vertical",
							"aria-valuenow": Math.round(ratio * 100),
							"aria-valuemin": 25,
							"aria-valuemax": 75,
							tabIndex: 0,
							onPointerDown: onDivider,
							onKeyDown: onDividerKey
						}),
						(0, react_jsx_runtime.jsxs)("section", {
							className: Learn_module_css_default.rightPane,
							children: [
								(0, react_jsx_runtime.jsxs)("div", {
									className: Learn_module_css_default.editorBar,
									children: [
										(0, react_jsx_runtime.jsxs)("label", {
											className: Learn_module_css_default.inline,
											children: [(0, react_jsx_runtime.jsx)("span", {
												className: Learn_module_css_default.muted,
												children: t("ws.language")
											}), (0, react_jsx_runtime.jsx)("select", {
												className: Learn_module_css_default.select,
												value: language,
												onChange: (event) => {
													switchLanguage(event.target.value);
												},
												children: overview.languages.filter((item) => item.supported).map((item) => (0, react_jsx_runtime.jsx)("option", {
													value: item.language,
													children: item.label
												}, item.language))
											})]
										}),
										(0, react_jsx_runtime.jsx)("span", { className: Learn_module_css_default.spacer }),
										(0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Button, {
											variant: "ghost",
											size: "sm",
											onClick: () => {
												if (window.confirm(t("ws.resetConfirm"))) onCode(problem.starter[language]);
											},
											children: t("ws.reset")
										})
									]
								}),
								(0, react_jsx_runtime.jsx)(CodeEditor, {
									value: code,
									language,
									label: t("ws.code"),
									onChange: onCode,
									onRun: () => {
										execute("run");
									},
									onSubmit: () => {
										execute("submit");
									}
								}),
								(0, react_jsx_runtime.jsxs)("details", {
									className: Learn_module_css_default.custom,
									children: [(0, react_jsx_runtime.jsx)("summary", { children: t("ws.custom") }), (0, react_jsx_runtime.jsx)("textarea", {
										className: Learn_module_css_default.textarea,
										rows: 3,
										value: custom,
										placeholder: t("ws.customHelp"),
										onChange: (event) => {
											setCustom(event.target.value);
										}
									})]
								}),
								(0, react_jsx_runtime.jsxs)("div", {
									className: Learn_module_css_default.actions,
									children: [
										busy !== void 0 && (0, react_jsx_runtime.jsx)("span", {
											className: Learn_module_css_default.muted,
											"aria-live": "polite",
											children: busy.kind === "run" ? t("ws.running") : t("ws.judging", { seconds: elapsed })
										}),
										(0, react_jsx_runtime.jsx)("span", { className: Learn_module_css_default.spacer }),
										busy !== void 0 && (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Button, {
											variant: "ghost",
											onClick: () => {
												busy.abort.abort();
											},
											children: t("ws.cancel")
										}),
										(0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Button, {
											variant: "outline",
											disabled: busy !== void 0,
											onClick: () => {
												execute("run");
											},
											children: t("ws.run")
										}),
										(0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Button, {
											variant: "primary",
											disabled: busy !== void 0,
											onClick: () => {
												execute("submit");
											},
											children: t("ws.submit")
										})
									]
								}),
								error !== void 0 && (0, react_jsx_runtime.jsx)("div", {
									className: Learn_module_css_default.errorBox,
									role: "alert",
									children: t("failed", { message: error })
								}),
								(0, react_jsx_runtime.jsx)(Result, { attempt: result }),
								context === "review" && reviewItemId !== void 0 && result?.kind === "submit" && result.context === "review" && (0, react_jsx_runtime.jsx)(ReviewCompletionCard, {
									itemId: reviewItemId,
									attempt: result,
									onDone: () => {
										reload();
										refreshOverview();
									}
								})
							]
						})
					]
				})]
			});
		}
		function Description({ state }) {
			const { t, locale } = useLearn();
			const problem = state.problem;
			return (0, react_jsx_runtime.jsxs)("div", {
				className: Learn_module_css_default.stack,
				children: [
					(0, react_jsx_runtime.jsxs)("div", {
						className: Learn_module_css_default.row,
						children: [problem.topics.map((topic) => (0, react_jsx_runtime.jsx)(Chip, { children: topic }, topic)), problem.leetcode?.tags.map((tag) => (0, react_jsx_runtime.jsx)(Chip, {
							tone: "outline",
							children: tag
						}, tag))]
					}),
					problem.leetcode !== void 0 && (0, react_jsx_runtime.jsxs)("p", {
						className: Learn_module_css_default.note,
						children: [
							t("ws.summaryNote"),
							" ",
							(0, react_jsx_runtime.jsx)("a", {
								className: Learn_module_css_default.link,
								href: problem.leetcode.url,
								target: "_blank",
								rel: "noreferrer",
								children: t("ws.officialLink")
							}),
							" · ",
							t("ws.verified", { date: problem.leetcode.verifiedAt })
						]
					}),
					problem.variant !== void 0 && "parentHidden" in problem.variant && (0, react_jsx_runtime.jsx)("p", {
						className: Learn_module_css_default.note,
						children: t("ws.variantHidden")
					}),
					(0, react_jsx_runtime.jsx)(Markdown, { text: pick(problem.statement ?? problem.summary, locale) }),
					problem.variant !== void 0 && !("parentHidden" in problem.variant) && (0, react_jsx_runtime.jsxs)("div", {
						className: Learn_module_css_default.card,
						children: [
							(0, react_jsx_runtime.jsx)("strong", { children: t("ws.parent", { title: pick(problem.variant.parentTitle, locale) }) }),
							(0, react_jsx_runtime.jsx)("h4", { children: t("ws.differences") }),
							(0, react_jsx_runtime.jsx)("ul", { children: problem.variant.differences.map((item, index) => (0, react_jsx_runtime.jsx)("li", { children: pick(item.description, locale) }, index)) }),
							(0, react_jsx_runtime.jsx)("h4", { children: t("ws.transfer") }),
							(0, react_jsx_runtime.jsx)("p", { children: pick(problem.variant.transfer, locale) })
						]
					}),
					(0, react_jsx_runtime.jsx)("h4", { children: t("ws.examples") }),
					problem.examples.map((example) => (0, react_jsx_runtime.jsxs)("div", {
						className: Learn_module_css_default.example,
						children: [
							(0, react_jsx_runtime.jsx)("div", {
								className: Learn_module_css_default.muted,
								children: t("ws.example", { id: example.id })
							}),
							(0, react_jsx_runtime.jsxs)("code", {
								className: Learn_module_css_default.mono,
								children: [
									t("ws.input"),
									": ",
									problem.params.map((param, index) => `${param.name} = ${compact(example.args[index])}`).join(", ")
								]
							}),
							(0, react_jsx_runtime.jsxs)("code", {
								className: Learn_module_css_default.mono,
								children: [
									t("ws.output"),
									": ",
									compact(example.expected)
								]
							}),
							example.explanation !== void 0 && (0, react_jsx_runtime.jsx)("span", { children: pick(example.explanation, locale) })
						]
					}, example.id)),
					(0, react_jsx_runtime.jsx)("h4", { children: t("ws.constraints") }),
					(0, react_jsx_runtime.jsx)("ul", { children: problem.constraints.map((item, index) => (0, react_jsx_runtime.jsx)("li", { children: pick(item, locale) }, index)) }),
					(0, react_jsx_runtime.jsx)("p", {
						className: Learn_module_css_default.muted,
						children: t("ws.hiddenCases", { count: problem.hiddenCaseCount })
					}),
					(0, react_jsx_runtime.jsx)("p", {
						className: Learn_module_css_default.muted,
						children: t(`ws.origin.${problem.origin.source}`)
					})
				]
			});
		}
		function Hints({ problemId, initial }) {
			const { api, t, refreshOverview } = useLearn();
			const [hints, setHints] = (0, react.useState)(initial);
			const [loading, setLoading] = (0, react.useState)(false);
			const [confirming, setConfirming] = (0, react.useState)(false);
			const [error, setError] = (0, react.useState)();
			const highest = Math.max(0, ...hints.map((hint) => hint.level));
			const next = Math.min(4, highest + 1);
			const request = (level, confirm) => {
				setLoading(true);
				setError(void 0);
				api.hint(problemId, level, confirm, AbortSignal.timeout(18e4)).then((hint) => {
					setHints((list) => [...list, hint]);
					refreshOverview();
				}, (failure) => {
					setError(messageOf(failure));
				}).finally(() => {
					setLoading(false);
				});
			};
			return (0, react_jsx_runtime.jsxs)("div", {
				className: Learn_module_css_default.stack,
				children: [
					hints.length === 0 && (0, react_jsx_runtime.jsx)("p", {
						className: Learn_module_css_default.muted,
						children: t("hint.none")
					}),
					hints.map((hint, index) => (0, react_jsx_runtime.jsxs)("div", {
						className: Learn_module_css_default.card,
						children: [(0, react_jsx_runtime.jsxs)("div", {
							className: Learn_module_css_default.row,
							children: [(0, react_jsx_runtime.jsx)("strong", { children: t(`hint.level${hint.level}`) }), (0, react_jsx_runtime.jsx)(Chip, { children: t(`hint.source.${hint.source}`) })]
						}), (0, react_jsx_runtime.jsx)(Markdown, { text: hint.content })]
					}, index)),
					loading && (0, react_jsx_runtime.jsx)("p", {
						className: Learn_module_css_default.muted,
						"aria-live": "polite",
						children: t("hint.loading")
					}),
					error !== void 0 && (0, react_jsx_runtime.jsx)("div", {
						className: Learn_module_css_default.errorBox,
						role: "alert",
						children: t("failed", { message: error })
					}),
					highest < 4 && (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Button, {
						variant: "outline",
						disabled: loading,
						onClick: () => {
							if (next === 4) setConfirming(true);
							else request(next, false);
						},
						children: t("hint.request", { level: t(`hint.level${next}`) })
					}),
					(0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Modal, {
						open: confirming,
						onClose: () => {
							setConfirming(false);
						},
						title: t("hint.revealTitle"),
						closeLabel: t("close"),
						description: t("hint.revealBody"),
						footer: (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [(0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Button, {
							variant: "ghost",
							onClick: () => {
								setConfirming(false);
							},
							children: t("close")
						}), (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Button, {
							variant: "primary",
							onClick: () => {
								setConfirming(false);
								request(4, true);
							},
							children: t("hint.revealConfirm")
						})] }),
						children: null
					})
				]
			});
		}
		function Notes({ problemId, initial }) {
			const { api, t } = useLearn();
			const [value, setValue] = (0, react.useState)(initial);
			const timer = (0, react.useRef)(void 0);
			(0, react.useEffect)(() => () => {
				if (timer.current !== void 0) clearTimeout(timer.current);
			}, []);
			return (0, react_jsx_runtime.jsx)("textarea", {
				className: Learn_module_css_default.notes,
				value,
				placeholder: t("notes.placeholder"),
				"aria-label": t("ws.notes"),
				onChange: (event) => {
					const next = event.target.value;
					setValue(next);
					if (timer.current !== void 0) clearTimeout(timer.current);
					timer.current = setTimeout(() => {
						api.saveNote(problemId, next);
					}, 700);
				}
			});
		}
		function History({ attempts, onRestore }) {
			const { t, locale } = useLearn();
			if (attempts.length === 0) return (0, react_jsx_runtime.jsx)("p", {
				className: Learn_module_css_default.muted,
				children: t("history.empty")
			});
			return (0, react_jsx_runtime.jsx)("ul", {
				className: Learn_module_css_default.list,
				children: attempts.map((attempt) => (0, react_jsx_runtime.jsxs)("li", {
					className: Learn_module_css_default.listRow,
					children: [
						(0, react_jsx_runtime.jsx)("span", { children: attempt.kind === "submit" ? t("ws.submit") : t("ws.run") }),
						attempt.verdict !== void 0 && (0, react_jsx_runtime.jsx)(VerdictLabel, { kind: attempt.verdict.kind }),
						(0, react_jsx_runtime.jsx)(Chip, { children: attempt.language }),
						(0, react_jsx_runtime.jsx)(Chip, {
							tone: "outline",
							children: t(`ws.support.${attempt.support}`)
						}),
						(0, react_jsx_runtime.jsx)("span", {
							className: Learn_module_css_default.muted,
							children: when(attempt.createdAt, locale)
						}),
						(0, react_jsx_runtime.jsx)("span", { className: Learn_module_css_default.spacer }),
						(0, react_jsx_runtime.jsx)("button", {
							type: "button",
							className: Learn_module_css_default.linkButton,
							onClick: () => {
								onRestore(attempt);
							},
							children: t("history.restore")
						})
					]
				}, attempt.id))
			});
		}
		function Result({ attempt }) {
			const { t, locale } = useLearn();
			const verdict = attempt?.verdict;
			if (attempt === void 0 || verdict === void 0) return (0, react_jsx_runtime.jsx)("div", {
				className: Learn_module_css_default.result,
				children: (0, react_jsx_runtime.jsx)("p", {
					className: Learn_module_css_default.muted,
					children: t("ws.noResult")
				})
			});
			return (0, react_jsx_runtime.jsxs)("div", {
				className: Learn_module_css_default.result,
				"aria-live": "polite",
				children: [
					(0, react_jsx_runtime.jsxs)("div", {
						className: Learn_module_css_default.row,
						children: [
							(0, react_jsx_runtime.jsx)(VerdictLabel, { kind: verdict.kind }),
							(0, react_jsx_runtime.jsx)("span", {
								className: Learn_module_css_default.muted,
								children: t("ws.passedCases", {
									passed: verdict.passed,
									total: verdict.total
								})
							}),
							attempt.kind === "submit" && (0, react_jsx_runtime.jsx)(Chip, {
								tone: "outline",
								children: t(`ws.support.${attempt.support}`)
							})
						]
					}),
					verdict.message !== void 0 && verdict.kind !== "wrong-answer" && (0, react_jsx_runtime.jsx)("pre", {
						className: Learn_module_css_default.errorText,
						children: verdict.message
					}),
					(0, react_jsx_runtime.jsx)("p", {
						className: Learn_module_css_default.note,
						children: verdict.coverageNote[locale]
					}),
					verdict.measuredMs !== void 0 && (0, react_jsx_runtime.jsx)("p", {
						className: Learn_module_css_default.muted,
						children: t("ws.measured", { ms: Math.round(verdict.measuredMs) })
					}),
					verdict.failing !== void 0 && verdict.failing.caseId !== "compile" && verdict.failing.caseId !== "module" && (0, react_jsx_runtime.jsxs)("div", {
						className: Learn_module_css_default.case,
						children: [
							(0, react_jsx_runtime.jsx)("strong", { children: t("ws.failingCase", { visibility: t(`ws.visibility.${verdict.failing.visibility}`) }) }),
							(0, react_jsx_runtime.jsxs)("code", {
								className: Learn_module_css_default.mono,
								children: [
									t("ws.input"),
									": ",
									compact(verdict.failing.args)
								]
							}),
							verdict.failing.expected !== void 0 && (0, react_jsx_runtime.jsxs)("code", {
								className: Learn_module_css_default.mono,
								children: [
									t("ws.expected"),
									": ",
									compact(verdict.failing.expected)
								]
							}),
							verdict.failing.actual !== void 0 && (0, react_jsx_runtime.jsxs)("code", {
								className: Learn_module_css_default.mono,
								children: [
									t("ws.output"),
									": ",
									compact(verdict.failing.actual)
								]
							}),
							verdict.failing.error !== void 0 && (0, react_jsx_runtime.jsxs)("code", {
								className: Learn_module_css_default.errorText,
								children: [verdict.failing.error, verdict.failing.line === void 0 ? "" : ` (${t("ws.errorLine", { line: verdict.failing.line })})`]
							})
						]
					}),
					verdict.failing?.line !== void 0 && (verdict.failing.caseId === "compile" || verdict.failing.caseId === "module") && (0, react_jsx_runtime.jsx)("p", {
						className: Learn_module_css_default.errorText,
						children: t("ws.errorLine", { line: verdict.failing.line })
					}),
					verdict.cases?.map((item) => (0, react_jsx_runtime.jsxs)("div", {
						className: Learn_module_css_default.case,
						"data-pass": item.passed,
						children: [
							(0, react_jsx_runtime.jsxs)("div", {
								className: Learn_module_css_default.row,
								children: [
									(0, react_jsx_runtime.jsx)("strong", { children: item.caseId }),
									(0, react_jsx_runtime.jsx)("span", { children: item.passed ? "✓" : "✗" }),
									item.timeMs !== void 0 && (0, react_jsx_runtime.jsx)("span", {
										className: Learn_module_css_default.muted,
										children: t("ws.timeMs", { value: item.timeMs.toFixed(1) })
									})
								]
							}),
							(0, react_jsx_runtime.jsxs)("code", {
								className: Learn_module_css_default.mono,
								children: [
									t("ws.input"),
									": ",
									compact(item.args)
								]
							}),
							item.expected !== void 0 && (0, react_jsx_runtime.jsxs)("code", {
								className: Learn_module_css_default.mono,
								children: [
									t("ws.expected"),
									": ",
									compact(item.expected)
								]
							}),
							item.actual !== void 0 && (0, react_jsx_runtime.jsxs)("code", {
								className: Learn_module_css_default.mono,
								children: [
									t("ws.output"),
									": ",
									compact(item.actual)
								]
							}),
							item.error !== void 0 && (0, react_jsx_runtime.jsx)("code", {
								className: Learn_module_css_default.errorText,
								children: item.error
							}),
							item.stdout !== "" && (0, react_jsx_runtime.jsxs)("details", { children: [(0, react_jsx_runtime.jsx)("summary", { children: t("ws.stdout") }), (0, react_jsx_runtime.jsx)("pre", {
								className: Learn_module_css_default.mono,
								children: item.stdout
							})] })
						]
					}, item.caseId)),
					attempt.kind === "submit" && (0, react_jsx_runtime.jsx)(Assessment, { attempt })
				]
			});
		}
		function Assessment({ attempt }) {
			const { api, t } = useLearn();
			const assessment = attempt.assessment;
			const [explanation, setExplanation] = (0, react.useState)("");
			const [sent, setSent] = (0, react.useState)(false);
			if (assessment === void 0) return null;
			return (0, react_jsx_runtime.jsxs)("div", {
				className: Learn_module_css_default.card,
				children: [
					(0, react_jsx_runtime.jsxs)("div", {
						className: Learn_module_css_default.row,
						children: [(0, react_jsx_runtime.jsx)("strong", { children: t("ws.assessment") }), attempt.judgeMode !== void 0 && (0, react_jsx_runtime.jsx)(Chip, {
							tone: "outline",
							children: t(`ws.judgeMode.${attempt.judgeMode}`)
						})]
					}),
					(0, react_jsx_runtime.jsx)("p", {
						className: Learn_module_css_default.muted,
						children: t("ws.verdictNote")
					}),
					assessment.source === "unavailable" ? (0, react_jsx_runtime.jsx)("p", { children: t("ws.assessmentUnavailable", { reason: assessment.failure ?? assessment.summary }) }) : (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [
						(0, react_jsx_runtime.jsx)(Markdown, { text: assessment.summary }),
						assessment.reasoning !== void 0 && (0, react_jsx_runtime.jsx)(Markdown, { text: assessment.reasoning }),
						assessment.likelyComplexity !== void 0 && (0, react_jsx_runtime.jsx)("p", { children: t("ws.complexity", {
							time: assessment.likelyComplexity.time,
							space: assessment.likelyComplexity.space
						}) }),
						assessment.misconceptions.length > 0 && (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [(0, react_jsx_runtime.jsx)("h4", { children: t("ws.misconceptions") }), (0, react_jsx_runtime.jsx)("ul", { children: assessment.misconceptions.map((item, index) => (0, react_jsx_runtime.jsx)("li", { children: item }, index)) })] }),
						assessment.mistakeTags.length > 0 && (0, react_jsx_runtime.jsx)("p", {
							className: Learn_module_css_default.muted,
							children: t("ws.mistakes", { tags: assessment.mistakeTags.join(", ") })
						}),
						assessment.nextStep !== void 0 && (0, react_jsx_runtime.jsxs)("p", { children: [(0, react_jsx_runtime.jsxs)("strong", { children: [t("ws.nextStep"), ": "] }), assessment.nextStep] }),
						assessment.reflectionQuestion !== void 0 && (0, react_jsx_runtime.jsxs)("div", {
							className: Learn_module_css_default.stack,
							children: [
								(0, react_jsx_runtime.jsxs)("strong", { children: [
									t("ws.reflectionQuestion"),
									": ",
									assessment.reflectionQuestion
								] }),
								(0, react_jsx_runtime.jsx)("textarea", {
									className: Learn_module_css_default.textarea,
									rows: 3,
									value: explanation,
									placeholder: t("ws.explainPlaceholder"),
									onChange: (event) => {
										setExplanation(event.target.value);
									}
								}),
								(0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Button, {
									variant: "outline",
									size: "sm",
									disabled: sent || explanation.trim().length < 10,
									onClick: () => {
										api.tutorSend(attempt.problemId, null, `${assessment.reflectionQuestion ?? ""}\n\n${explanation}`).then(() => {
											setSent(true);
										});
									},
									children: t("ws.explainSend")
								})
							]
						})
					] })
				]
			});
		}
		function ReviewCompletionCard({ itemId, attempt, onDone }) {
			const { api, t, locale } = useLearn();
			const [completion, setCompletion] = (0, react.useState)();
			const [error, setError] = (0, react.useState)();
			const graded = attempt.verdict !== void 0 && attempt.verdict.kind !== "evaluation-unavailable" && attempt.verdict.kind !== "cancelled";
			const complete = (recall) => {
				api.completeReview(itemId, attempt.id, recall).then((result) => {
					setCompletion(result);
					onDone();
				}, (failure) => {
					setError(messageOf(failure));
				});
			};
			if (completion !== void 0) return (0, react_jsx_runtime.jsxs)("div", {
				className: Learn_module_css_default.card,
				"data-tone": "success",
				children: [
					(0, react_jsx_runtime.jsx)("strong", { children: t("review.result", {
						date: completion.nextDueDate,
						days: completion.intervalDays
					}) }),
					(0, react_jsx_runtime.jsx)("p", { children: pick(completion.reason, locale) }),
					completion.duplicate && (0, react_jsx_runtime.jsx)("p", {
						className: Learn_module_css_default.muted,
						children: t("review.duplicate")
					}),
					completion.reveal !== void 0 && (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [
						(0, react_jsx_runtime.jsx)("p", { children: (0, react_jsx_runtime.jsx)("strong", { children: t("ws.parent", { title: pick(completion.reveal.parentTitle, locale) }) }) }),
						(0, react_jsx_runtime.jsx)("h4", { children: t("ws.differences") }),
						(0, react_jsx_runtime.jsx)("ul", { children: completion.reveal.differences.map((item, index) => (0, react_jsx_runtime.jsx)("li", { children: pick(item.description, locale) }, index)) }),
						(0, react_jsx_runtime.jsx)("h4", { children: t("ws.transfer") }),
						(0, react_jsx_runtime.jsx)("p", { children: pick(completion.reveal.transfer, locale) })
					] })
				]
			});
			return (0, react_jsx_runtime.jsxs)("div", {
				className: Learn_module_css_default.card,
				children: [
					(0, react_jsx_runtime.jsx)("strong", { children: t("review.complete") }),
					(0, react_jsx_runtime.jsx)("p", {
						className: Learn_module_css_default.muted,
						children: graded ? t("review.completeHelp") : t("review.needsGraded")
					}),
					(0, react_jsx_runtime.jsx)("div", {
						className: Learn_module_css_default.row,
						role: "group",
						"aria-label": t("review.recall"),
						children: [
							"again",
							"hard",
							"good",
							"easy"
						].map((recall) => (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Button, {
							variant: recall === "good" ? "primary" : "outline",
							size: "sm",
							disabled: !graded,
							onClick: () => {
								complete(recall);
							},
							children: t(`recall.${recall}`)
						}, recall))
					}),
					error !== void 0 && (0, react_jsx_runtime.jsx)("div", {
						className: Learn_module_css_default.errorBox,
						role: "alert",
						children: t("failed", { message: error })
					})
				]
			});
		}
		//#endregion
		//#region lib/types/client/LessonTab.js
		/** Roadmap and staged lessons: motivation, strategy, worked example, check, problem, reflection. */
		const STAGES = [
			"motivation",
			"strategy",
			"example",
			"check",
			"problem",
			"reflection"
		];
		/**
		* Render the roadmap, a lesson, or the lesson's practice workspace.
		* @returns the section.
		*/
		function LessonTab() {
			const { route, navigate, overview } = useLearn();
			const topic = overview.topics.find((item) => item.id === route.topicId);
			if (topic !== void 0 && route.problemId !== void 0) return (0, react_jsx_runtime.jsx)(Workspace, {
				problemId: route.problemId,
				context: "lesson",
				onBack: () => {
					navigate({
						tab: "learn",
						topicId: topic.id
					});
				}
			});
			if (topic !== void 0) return (0, react_jsx_runtime.jsx)(Lesson, { topic });
			return (0, react_jsx_runtime.jsx)(Roadmap, {});
		}
		function Roadmap() {
			const { t, locale, overview, navigate } = useLearn();
			const lessons = new Map(overview.lessons.map((item) => [item.topicId, item]));
			const mastery = new Map(overview.mastery.map((item) => [item.topicId, item]));
			const experienced = overview.settings.experience === "experienced";
			const titleOf = (id) => pick(overview.topics.find((item) => item.id === id)?.title ?? {
				zh: id,
				en: id
			}, locale);
			return (0, react_jsx_runtime.jsxs)("div", {
				className: Learn_module_css_default.stack,
				children: [(0, react_jsx_runtime.jsx)("h2", { children: t("learn.heading") }), (0, react_jsx_runtime.jsx)("ol", {
					className: Learn_module_css_default.roadmap,
					children: overview.topics.map((topic) => {
						const progress = lessons.get(topic.id);
						const level = mastery.get(topic.id);
						const locked = !experienced && topic.prerequisites.some((item) => lessons.get(item)?.stage !== "complete");
						return (0, react_jsx_runtime.jsxs)("li", {
							className: `${Learn_module_css_default.card ?? ""} ${Learn_module_css_default.topicCard ?? ""}`,
							"data-locked": locked,
							children: [
								(0, react_jsx_runtime.jsxs)("div", {
									className: Learn_module_css_default.row,
									children: [
										(0, react_jsx_runtime.jsx)("span", {
											className: Learn_module_css_default.topicOrder,
											children: topic.order
										}),
										(0, react_jsx_runtime.jsx)("strong", {
											className: Learn_module_css_default.cardTitle,
											children: pick(topic.title, locale)
										}),
										(0, react_jsx_runtime.jsx)("span", { className: Learn_module_css_default.spacer }),
										(0, react_jsx_runtime.jsx)("span", {
											className: Learn_module_css_default.level,
											"data-level": level?.level ?? "not-started",
											children: t(`level.${level?.level ?? "not-started"}`)
										})
									]
								}),
								(0, react_jsx_runtime.jsx)("p", { children: pick(topic.summary, locale) }),
								(0, react_jsx_runtime.jsx)("div", {
									className: Learn_module_css_default.meter,
									children: (0, react_jsx_runtime.jsx)("div", {
										className: Learn_module_css_default.meterFill,
										style: { width: `${String(level?.score ?? 0)}%` }
									})
								}),
								(0, react_jsx_runtime.jsxs)("div", {
									className: Learn_module_css_default.row,
									children: [
										topic.prerequisites.length > 0 && (0, react_jsx_runtime.jsx)("span", {
											className: Learn_module_css_default.muted,
											children: t("learn.prerequisites", { list: topic.prerequisites.map(titleOf).join(", ") })
										}),
										(0, react_jsx_runtime.jsx)("span", {
											className: Learn_module_css_default.muted,
											children: t("learn.problems", { count: topic.problems.length })
										}),
										(0, react_jsx_runtime.jsx)("span", {
											className: Learn_module_css_default.muted,
											children: t(`stage.${progress?.stage ?? "motivation"}`)
										}),
										(0, react_jsx_runtime.jsx)("span", { className: Learn_module_css_default.spacer }),
										(0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Button, {
											variant: locked ? "ghost" : "outline",
											size: "sm",
											disabled: locked,
											title: locked ? t("learn.locked") : void 0,
											onClick: () => {
												navigate({
													tab: "learn",
													topicId: topic.id
												});
											},
											children: t("learn.open")
										})
									]
								}),
								locked && (0, react_jsx_runtime.jsx)("p", {
									className: Learn_module_css_default.muted,
									children: t("learn.locked")
								})
							]
						}, topic.id);
					})
				})]
			});
		}
		function Lesson({ topic }) {
			const { api, t, locale, overview, navigate, refreshOverview } = useLearn();
			const saved = overview.lessons.find((item) => item.topicId === topic.id);
			const [progress, setProgress] = (0, react.useState)(saved);
			const [viewing, setViewing] = (0, react.useState)(saved === void 0 || saved.stage === "complete" ? "motivation" : saved.stage);
			const [answers, setAnswers] = (0, react.useState)(saved?.checkAnswers ?? {});
			const [correct, setCorrect] = (0, react.useState)({});
			const [reflection, setReflection] = (0, react.useState)(saved?.reflection ?? "");
			const [busy, setBusy] = (0, react.useState)(false);
			const [error, setError] = (0, react.useState)();
			const [notice, setNotice] = (0, react.useState)();
			const lesson = topic.lesson;
			const reached = STAGES.indexOf(progress?.stage === "complete" ? "reflection" : progress?.stage ?? "motivation");
			const index = STAGES.indexOf(viewing);
			const go = (stage) => {
				setError(void 0);
				if (STAGES.indexOf(stage) <= reached || progress?.stage === "complete") {
					setViewing(stage);
					return;
				}
				setBusy(true);
				api.lesson(topic.id, stage, answers).then((result) => {
					setProgress(result.progress);
					setCorrect(result.correct);
					setViewing(stage);
					refreshOverview();
				}, (failure) => {
					setError(messageOf(failure));
				}).finally(() => {
					setBusy(false);
				});
			};
			const checkAnswers = () => {
				setBusy(true);
				api.lesson(topic.id, "check", answers).then((result) => {
					setProgress(result.progress);
					setCorrect(result.correct);
				}, (failure) => {
					setError(messageOf(failure));
				}).finally(() => {
					setBusy(false);
				});
			};
			const skip = () => {
				setBusy(true);
				api.skipLesson(topic.id, answers).then((result) => {
					setCorrect(result.correct);
					if (result.progress !== void 0) {
						setProgress(result.progress);
						setNotice(t("lesson.skipped"));
						refreshOverview();
					} else setNotice(t("lesson.skipFailed"));
				}, (failure) => {
					setError(messageOf(failure));
				}).finally(() => {
					setBusy(false);
				});
			};
			const reflect = () => {
				setBusy(true);
				api.reflect(topic.id, reflection, AbortSignal.timeout(18e4)).then((result) => {
					setProgress(result);
					refreshOverview();
				}, (failure) => {
					setError(messageOf(failure));
				}).finally(() => {
					setBusy(false);
				});
			};
			const practice = overview.problems.find((item) => item.id === lesson.practiceProblem);
			return (0, react_jsx_runtime.jsxs)("div", {
				className: Learn_module_css_default.lesson,
				children: [
					(0, react_jsx_runtime.jsxs)("div", {
						className: Learn_module_css_default.row,
						children: [
							(0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Button, {
								variant: "ghost",
								size: "sm",
								onClick: () => {
									navigate({ tab: "learn" });
								},
								children: t("learn.back")
							}),
							(0, react_jsx_runtime.jsx)("h2", {
								className: Learn_module_css_default.problemTitle,
								children: pick(topic.title, locale)
							}),
							progress?.stage === "complete" && (0, react_jsx_runtime.jsx)("span", {
								className: Learn_module_css_default.level,
								"data-level": "proficient",
								children: t("lesson.completed")
							})
						]
					}),
					(0, react_jsx_runtime.jsx)("nav", {
						className: Learn_module_css_default.stages,
						"aria-label": t("learn.heading"),
						children: STAGES.map((stage, position) => (0, react_jsx_runtime.jsxs)("button", {
							type: "button",
							className: Learn_module_css_default.stage,
							"aria-current": stage === viewing ? "step" : void 0,
							"data-done": position < reached || progress?.stage === "complete",
							disabled: position > reached + 1 && progress?.stage !== "complete",
							onClick: () => {
								go(stage);
							},
							children: [
								position + 1,
								". ",
								t(`stage.${stage}`)
							]
						}, stage))
					}),
					(0, react_jsx_runtime.jsxs)("div", {
						className: Learn_module_css_default.lessonBody,
						children: [
							viewing === "motivation" && (0, react_jsx_runtime.jsx)(Markdown, { text: pick(lesson.motivation, locale) }),
							viewing === "strategy" && (0, react_jsx_runtime.jsx)(Markdown, { text: pick(lesson.strategy, locale) }),
							viewing === "example" && (0, react_jsx_runtime.jsxs)("div", {
								className: Learn_module_css_default.stack,
								children: [
									(0, react_jsx_runtime.jsx)("h3", { children: pick(lesson.example.title, locale) }),
									(0, react_jsx_runtime.jsx)(Markdown, { text: pick(lesson.example.body, locale) }),
									(0, react_jsx_runtime.jsx)("div", {
										className: Learn_module_css_default.tableWrap,
										children: (0, react_jsx_runtime.jsxs)("table", {
											className: Learn_module_css_default.table,
											children: [
												(0, react_jsx_runtime.jsx)("caption", { children: t("lesson.traceTitle") }),
												(0, react_jsx_runtime.jsx)("thead", { children: (0, react_jsx_runtime.jsxs)("tr", { children: [lesson.example.traceColumns.map((column) => (0, react_jsx_runtime.jsx)("th", {
													scope: "col",
													children: column
												}, column)), (0, react_jsx_runtime.jsx)("th", { scope: "col" })] }) }),
												(0, react_jsx_runtime.jsx)("tbody", { children: lesson.example.trace.map((step, row) => (0, react_jsx_runtime.jsxs)("tr", { children: [lesson.example.traceColumns.map((column) => (0, react_jsx_runtime.jsx)("td", { children: (0, react_jsx_runtime.jsx)("code", { children: step.state[column] }) }, column)), (0, react_jsx_runtime.jsx)("td", { children: pick(step.note, locale) })] }, row)) })
											]
										})
									})
								]
							}),
							viewing === "check" && (0, react_jsx_runtime.jsxs)("div", {
								className: Learn_module_css_default.stack,
								children: [
									lesson.check.map((question) => (0, react_jsx_runtime.jsxs)("fieldset", {
										className: Learn_module_css_default.card,
										children: [
											(0, react_jsx_runtime.jsx)("legend", {
												className: Learn_module_css_default.cardTitle,
												children: pick(question.prompt, locale)
											}),
											question.options.map((option, choice) => (0, react_jsx_runtime.jsxs)("label", {
												className: Learn_module_css_default.choice,
												children: [(0, react_jsx_runtime.jsx)("input", {
													type: "radio",
													name: question.id,
													checked: answers[question.id] === choice,
													onChange: () => {
														setAnswers((current) => ({
															...current,
															[question.id]: choice
														}));
													}
												}), (0, react_jsx_runtime.jsx)("span", { children: pick(option, locale) })]
											}, choice)),
											correct[question.id] !== void 0 && (0, react_jsx_runtime.jsxs)("p", {
												className: correct[question.id] === true ? Learn_module_css_default.success : Learn_module_css_default.errorText,
												children: [correct[question.id] === true ? t("lesson.correct") : t("lesson.incorrect"), correct[question.id] === true && (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [" · ", pick(question.explanation, locale)] })]
											})
										]
									}, question.id)),
									(0, react_jsx_runtime.jsx)("p", {
										className: Learn_module_css_default.muted,
										children: t("lesson.checkAll")
									}),
									(0, react_jsx_runtime.jsxs)("div", {
										className: Learn_module_css_default.row,
										children: [
											(0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Button, {
												variant: "outline",
												disabled: busy,
												onClick: checkAnswers,
												children: t("lesson.checkSubmit")
											}),
											(0, react_jsx_runtime.jsx)("span", { className: Learn_module_css_default.spacer }),
											(0, react_jsx_runtime.jsx)("span", {
												className: Learn_module_css_default.muted,
												children: t("lesson.skipHelp")
											}),
											(0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Button, {
												variant: "ghost",
												disabled: busy,
												onClick: skip,
												children: t("lesson.skip")
											})
										]
									})
								]
							}),
							viewing === "problem" && practice !== void 0 && (0, react_jsx_runtime.jsxs)("div", {
								className: Learn_module_css_default.stack,
								children: [
									(0, react_jsx_runtime.jsx)("p", { children: progress?.stage === "reflection" || progress?.stage === "complete" ? t("lesson.problemPassed") : t("lesson.problemIntro") }),
									(0, react_jsx_runtime.jsxs)("p", {
										className: Learn_module_css_default.cardTitle,
										children: [practice.leetcode !== void 0 && `${String(practice.leetcode.frontendId)}. `, pick(practice.title, locale)]
									}),
									(0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Button, {
										variant: "primary",
										onClick: () => {
											navigate({
												tab: "learn",
												topicId: topic.id,
												problemId: practice.id,
												mode: "lesson"
											});
										},
										children: t("lesson.openProblem")
									})
								]
							}),
							viewing === "reflection" && (0, react_jsx_runtime.jsxs)("div", {
								className: Learn_module_css_default.stack,
								children: [
									(0, react_jsx_runtime.jsx)(Markdown, { text: pick(lesson.reflectionPrompt, locale) }),
									(0, react_jsx_runtime.jsx)("textarea", {
										className: Learn_module_css_default.textarea,
										rows: 5,
										value: reflection,
										placeholder: t("lesson.reflectionPlaceholder"),
										onChange: (event) => {
											setReflection(event.target.value);
										}
									}),
									(0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Button, {
										variant: "primary",
										disabled: busy || reflection.trim().length < 10,
										onClick: reflect,
										children: t("lesson.reflectionSubmit")
									}),
									progress?.stage === "complete" && progress.reflection !== void 0 && (0, react_jsx_runtime.jsxs)("div", {
										className: Learn_module_css_default.card,
										children: [(0, react_jsx_runtime.jsx)("strong", { children: t("lesson.feedback") }), progress.reflectionFeedback === void 0 ? (0, react_jsx_runtime.jsx)("p", {
											className: Learn_module_css_default.muted,
											children: t("lesson.feedbackUnavailable")
										}) : (0, react_jsx_runtime.jsx)(Markdown, { text: progress.reflectionFeedback })]
									})
								]
							})
						]
					}),
					notice !== void 0 && (0, react_jsx_runtime.jsx)("p", {
						className: Learn_module_css_default.note,
						role: "status",
						children: notice
					}),
					error !== void 0 && (0, react_jsx_runtime.jsx)("div", {
						className: Learn_module_css_default.errorBox,
						role: "alert",
						children: t("failed", { message: error })
					}),
					(0, react_jsx_runtime.jsxs)("div", {
						className: Learn_module_css_default.row,
						children: [
							(0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Button, {
								variant: "ghost",
								disabled: index === 0,
								onClick: () => {
									const previous = STAGES[index - 1];
									if (previous !== void 0) setViewing(previous);
								},
								children: t("lesson.previous")
							}),
							(0, react_jsx_runtime.jsx)("span", { className: Learn_module_css_default.spacer }),
							index < STAGES.length - 1 && (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Button, {
								variant: "primary",
								disabled: busy,
								onClick: () => {
									const next = STAGES[index + 1];
									if (next !== void 0) go(next);
								},
								children: t("lesson.next")
							})
						]
					}),
					(0, react_jsx_runtime.jsxs)("details", {
						className: Learn_module_css_default.card,
						children: [(0, react_jsx_runtime.jsx)("summary", { children: t("ws.tutor") }), (0, react_jsx_runtime.jsx)(TutorPane, {
							topicId: topic.id,
							initial: []
						})]
					})
				]
			});
		}
		//#endregion
		//#region lib/types/client/PracticeTab.js
		/** Problem catalog with search and filters, the import dialog, and the workspace. */
		/**
		* Render the catalog or the selected workspace.
		* @returns the section.
		*/
		function PracticeTab() {
			const { route, navigate } = useLearn();
			if (route.problemId !== void 0) return (0, react_jsx_runtime.jsx)(Workspace, {
				problemId: route.problemId,
				context: route.mode ?? "practice",
				...route.reviewItemId === void 0 ? {} : { reviewItemId: route.reviewItemId },
				onBack: () => {
					navigate({ tab: "practice" });
				}
			});
			return (0, react_jsx_runtime.jsx)(Catalog, {});
		}
		function Catalog() {
			const { t, locale, overview, navigate } = useLearn();
			const [query, setQuery] = (0, react.useState)("");
			const [topic, setTopic] = (0, react.useState)("all");
			const [difficulty, setDifficulty] = (0, react.useState)("all");
			const [status, setStatus] = (0, react.useState)("all");
			const [importing, setImporting] = (0, react.useState)(false);
			const rows = (0, react.useMemo)(() => {
				const needle = query.trim().toLowerCase();
				return overview.problems.filter((problem) => (topic === "all" || problem.topics.includes(topic)) && (difficulty === "all" || problem.difficulty === difficulty) && (status === "all" || problem.status === status) && (needle === "" || pick(problem.title, locale).toLowerCase().includes(needle) || problem.title.en.toLowerCase().includes(needle) || String(problem.leetcode?.frontendId ?? "") === needle || problem.leetcode?.tags.some((tag) => tag.toLowerCase().includes(needle)) === true));
			}, [
				overview.problems,
				query,
				topic,
				difficulty,
				status,
				locale
			]);
			return (0, react_jsx_runtime.jsxs)("div", {
				className: Learn_module_css_default.stack,
				children: [
					(0, react_jsx_runtime.jsxs)("div", {
						className: Learn_module_css_default.filters,
						children: [
							(0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Input, {
								className: Learn_module_css_default.search ?? "",
								value: query,
								placeholder: t("practice.search"),
								"aria-label": t("practice.search"),
								onChange: (event) => {
									setQuery(event.target.value);
								}
							}),
							(0, react_jsx_runtime.jsxs)("select", {
								className: Learn_module_css_default.select,
								"aria-label": t("practice.topic"),
								value: topic,
								onChange: (event) => {
									setTopic(event.target.value);
								},
								children: [(0, react_jsx_runtime.jsxs)("option", {
									value: "all",
									children: [
										t("practice.topic"),
										": ",
										t("practice.all")
									]
								}), overview.topics.map((item) => (0, react_jsx_runtime.jsx)("option", {
									value: item.id,
									children: pick(item.title, locale)
								}, item.id))]
							}),
							(0, react_jsx_runtime.jsxs)("select", {
								className: Learn_module_css_default.select,
								"aria-label": t("practice.difficulty"),
								value: difficulty,
								onChange: (event) => {
									setDifficulty(event.target.value);
								},
								children: [(0, react_jsx_runtime.jsxs)("option", {
									value: "all",
									children: [
										t("practice.difficulty"),
										": ",
										t("practice.all")
									]
								}), [
									"easy",
									"medium",
									"hard"
								].map((item) => (0, react_jsx_runtime.jsx)("option", {
									value: item,
									children: t(`difficulty.${item}`)
								}, item))]
							}),
							(0, react_jsx_runtime.jsxs)("select", {
								className: Learn_module_css_default.select,
								"aria-label": t("practice.status"),
								value: status,
								onChange: (event) => {
									setStatus(event.target.value);
								},
								children: [(0, react_jsx_runtime.jsxs)("option", {
									value: "all",
									children: [
										t("practice.status"),
										": ",
										t("practice.all")
									]
								}), [
									"new",
									"attempted",
									"solved-with-help",
									"solved"
								].map((item) => (0, react_jsx_runtime.jsx)("option", {
									value: item,
									children: t(`status.${item}`)
								}, item))]
							}),
							(0, react_jsx_runtime.jsx)("span", { className: Learn_module_css_default.spacer }),
							(0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Button, {
								variant: "outline",
								size: "sm",
								onClick: () => {
									setImporting(true);
								},
								children: t("practice.import")
							})
						]
					}),
					rows.length === 0 ? (0, react_jsx_runtime.jsx)("p", {
						className: Learn_module_css_default.muted,
						children: t("practice.empty")
					}) : (0, react_jsx_runtime.jsx)("div", {
						className: Learn_module_css_default.tableWrap,
						children: (0, react_jsx_runtime.jsxs)("table", {
							className: Learn_module_css_default.table,
							children: [(0, react_jsx_runtime.jsx)("thead", { children: (0, react_jsx_runtime.jsxs)("tr", { children: [
								(0, react_jsx_runtime.jsx)("th", {
									scope: "col",
									children: "#"
								}),
								(0, react_jsx_runtime.jsx)("th", {
									scope: "col",
									children: t("ws.description")
								}),
								(0, react_jsx_runtime.jsx)("th", {
									scope: "col",
									children: t("practice.topic")
								}),
								(0, react_jsx_runtime.jsx)("th", {
									scope: "col",
									children: t("practice.difficulty")
								}),
								(0, react_jsx_runtime.jsx)("th", {
									scope: "col",
									children: t("practice.status")
								})
							] }) }), (0, react_jsx_runtime.jsx)("tbody", { children: rows.map((problem) => (0, react_jsx_runtime.jsxs)("tr", {
								className: Learn_module_css_default.clickRow,
								onClick: () => {
									navigate({
										tab: "practice",
										problemId: problem.id,
										mode: "practice"
									});
								},
								children: [
									(0, react_jsx_runtime.jsx)("td", {
										className: Learn_module_css_default.muted,
										children: problem.leetcode?.frontendId ?? "—"
									}),
									(0, react_jsx_runtime.jsxs)("td", { children: [(0, react_jsx_runtime.jsx)("button", {
										type: "button",
										className: Learn_module_css_default.problemLink,
										onClick: (event) => {
											event.stopPropagation();
											navigate({
												tab: "practice",
												problemId: problem.id,
												mode: "practice"
											});
										},
										children: pick(problem.title, locale)
									}), problem.kind !== "leetcode" && (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [" ", (0, react_jsx_runtime.jsx)(Chip, {
										tone: "outline",
										children: t(`kind.${problem.kind}`)
									})] })] }),
									(0, react_jsx_runtime.jsx)("td", { children: problem.topics.map((id) => pick(overview.topics.find((item) => item.id === id)?.title ?? {
										zh: id,
										en: id
									}, locale).split(/[:：]/)[0]).join(", ") }),
									(0, react_jsx_runtime.jsx)("td", { children: (0, react_jsx_runtime.jsx)(DifficultyBadge, { difficulty: problem.difficulty }) }),
									(0, react_jsx_runtime.jsx)("td", { children: (0, react_jsx_runtime.jsx)("span", {
										className: Learn_module_css_default.status,
										"data-status": problem.status,
										children: t(`status.${problem.status}`)
									}) })
								]
							}, problem.id)) })]
						})
					}),
					(0, react_jsx_runtime.jsx)(ImportDialog, {
						open: importing,
						onClose: () => {
							setImporting(false);
						}
					})
				]
			});
		}
		function ImportDialog({ open, onClose }) {
			const { api, t, refreshOverview } = useLearn();
			const [spec, setSpec] = (0, react.useState)("");
			const [busy, setBusy] = (0, react.useState)(false);
			const [result, setResult] = (0, react.useState)();
			const [error, setError] = (0, react.useState)();
			return (0, react_jsx_runtime.jsxs)(_deepseek_ai_dsh_client_ui_primitives.Modal, {
				open,
				onClose,
				title: t("practice.import"),
				closeLabel: t("close"),
				description: t("practice.importHelp"),
				footer: (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [(0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Button, {
					variant: "ghost",
					onClick: onClose,
					children: t("close")
				}), (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Button, {
					variant: "primary",
					disabled: busy || spec.trim() === "",
					onClick: () => {
						setBusy(true);
						setError(void 0);
						api.importProblem(spec, AbortSignal.timeout(3e5)).then((record) => {
							setResult(record);
							refreshOverview();
						}, (failure) => {
							setError(messageOf(failure));
						}).finally(() => {
							setBusy(false);
						});
					},
					children: t("practice.importSubmit")
				})] }),
				children: [
					(0, react_jsx_runtime.jsx)("textarea", {
						className: Learn_module_css_default.codeArea,
						rows: 14,
						value: spec,
						onChange: (event) => {
							setSpec(event.target.value);
						},
						"aria-label": t("practice.import"),
						spellCheck: false
					}),
					busy && (0, react_jsx_runtime.jsx)("p", {
						className: Learn_module_css_default.muted,
						children: t("review.generating")
					}),
					result !== void 0 && (0, react_jsx_runtime.jsx)(ValidationReport, { record: result }),
					error !== void 0 && (0, react_jsx_runtime.jsx)("div", {
						className: Learn_module_css_default.errorBox,
						role: "alert",
						children: t("failed", { message: error })
					})
				]
			});
		}
		/**
		* Validation checks of a stored candidate.
		* @param props - record.
		* @returns the report.
		*/
		function ValidationReport({ record }) {
			const { t, locale } = useLearn();
			return (0, react_jsx_runtime.jsxs)("div", {
				className: Learn_module_css_default.card,
				children: [(0, react_jsx_runtime.jsxs)("div", {
					className: Learn_module_css_default.row,
					children: [(0, react_jsx_runtime.jsx)("strong", { children: pick(record.title, locale) }), (0, react_jsx_runtime.jsx)(Chip, {
						tone: record.status === "validated" ? "success" : "outline",
						children: t(record.status === "validated" ? "review.validated" : "review.quarantined")
					})]
				}), (0, react_jsx_runtime.jsx)("ul", {
					className: Learn_module_css_default.checks,
					children: record.validation.checks.map((check, index) => (0, react_jsx_runtime.jsxs)("li", {
						"data-ok": check.ok,
						children: [
							(0, react_jsx_runtime.jsxs)("strong", { children: [
								check.ok ? "✓" : "✗",
								" ",
								check.name
							] }),
							" ",
							check.detail
						]
					}, index))
				})]
			});
		}
		//#endregion
		//#region ../../util/crypto/src/index.ts
		/**
		* Random v4 UUID, minted from `crypto.getRandomValues`.
		* @returns the UUID string.
		*/
		function randomUUID() {
			const bytes = globalThis.crypto.getRandomValues(new Uint8Array(16));
			const hex = Array.from(bytes, (byte, index) => {
				return (index === 6 ? byte & 15 | 64 : index === 8 ? byte & 63 | 128 : byte).toString(16).padStart(2, "0");
			}).join("");
			return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
		}
		//#endregion
		//#region lib/types/client/ReviewTab.js
		/** Review: today's variant queue, upcoming items, snooze/reschedule, generation, and the variant library. */
		/**
		* Render the queue or the review workspace.
		* @returns the section.
		*/
		function ReviewTab() {
			const { route, navigate } = useLearn();
			if (route.problemId !== void 0 && route.reviewItemId !== void 0) return (0, react_jsx_runtime.jsx)(Workspace, {
				problemId: route.problemId,
				context: "review",
				reviewItemId: route.reviewItemId,
				onBack: () => {
					navigate({ tab: "review" });
				}
			});
			return (0, react_jsx_runtime.jsx)(Queue, {});
		}
		function Queue() {
			const { api, t } = useLearn();
			const [key, setKey] = (0, react.useState)(0);
			const queue = useAsync(() => api.reviewQueue(), String(key));
			const variants = useAsync(() => api.variants(), String(key));
			const refresh = () => {
				setKey((value) => value + 1);
			};
			return (0, react_jsx_runtime.jsx)(Loaded, {
				state: queue,
				t,
				children: (data) => (0, react_jsx_runtime.jsxs)("div", {
					className: Learn_module_css_default.stack,
					children: [
						(0, react_jsx_runtime.jsx)("h2", { children: t("review.heading") }),
						(0, react_jsx_runtime.jsxs)("p", {
							className: Learn_module_css_default.muted,
							children: [
								t("review.summary", {
									due: data.due.length,
									limit: data.dailyLimit,
									done: data.completedToday
								}),
								" · ",
								data.today,
								" (",
								data.timezone,
								")"
							]
						}),
						data.deferred > 0 && (0, react_jsx_runtime.jsx)("p", {
							className: Learn_module_css_default.note,
							children: t("review.deferred", { count: data.deferred })
						}),
						data.due.length === 0 && (0, react_jsx_runtime.jsx)("p", {
							className: Learn_module_css_default.muted,
							children: t("review.empty")
						}),
						data.due.map((entry) => (0, react_jsx_runtime.jsx)(Entry, {
							entry,
							due: true,
							onChanged: refresh
						}, entry.itemId)),
						(0, react_jsx_runtime.jsx)("h3", { children: t("review.upcoming") }),
						data.upcoming.length === 0 && (0, react_jsx_runtime.jsx)("p", {
							className: Learn_module_css_default.muted,
							children: t("review.noUpcoming")
						}),
						data.upcoming.map((entry) => (0, react_jsx_runtime.jsx)(Entry, {
							entry,
							due: false,
							onChanged: refresh
						}, entry.itemId)),
						(0, react_jsx_runtime.jsxs)("details", {
							className: Learn_module_css_default.card,
							children: [(0, react_jsx_runtime.jsx)("summary", { children: t("review.variants") }), variants.data?.map((record) => (0, react_jsx_runtime.jsx)(ValidationReport, { record }, record.id))]
						})
					]
				})
			});
		}
		function Entry({ entry, due, onChanged }) {
			const { api, t, locale, overview, navigate } = useLearn();
			const [busy, setBusy] = (0, react.useState)(false);
			const [message, setMessage] = (0, react.useState)();
			const [date, setDate] = (0, react.useState)(entry.dueDate);
			const topic = overview.topics.find((item) => item.id === entry.topicId);
			const variantId = entry.variantId;
			const move = (target) => {
				setBusy(true);
				api.moveReview(entry.itemId, target, randomUUID()).then(onChanged, (failure) => {
					setMessage(t("failed", { message: messageOf(failure) }));
				}).finally(() => {
					setBusy(false);
				});
			};
			const generate = () => {
				setBusy(true);
				setMessage(t("review.generating"));
				api.generateVariant(entry.parentProblemId, AbortSignal.timeout(6e5)).then((result) => {
					setMessage(t("review.generateResult", { message: result.message }));
					onChanged();
				}, (failure) => {
					setMessage(t("failed", { message: messageOf(failure) }));
				}).finally(() => {
					setBusy(false);
				});
			};
			return (0, react_jsx_runtime.jsxs)("div", {
				className: Learn_module_css_default.card,
				children: [
					(0, react_jsx_runtime.jsxs)("div", {
						className: Learn_module_css_default.row,
						children: [
							(0, react_jsx_runtime.jsx)("strong", {
								className: Learn_module_css_default.cardTitle,
								children: topic === void 0 ? entry.topicId : pick(topic.title, locale)
							}),
							entry.variantOrigin !== void 0 && (0, react_jsx_runtime.jsx)(Chip, {
								tone: "outline",
								children: t(`review.origin.${entry.variantOrigin}`)
							}),
							(0, react_jsx_runtime.jsx)("span", { className: Learn_module_css_default.spacer }),
							(0, react_jsx_runtime.jsx)("span", {
								className: Learn_module_css_default.muted,
								children: due && entry.overdueDays > 0 ? t("review.overdue", { days: entry.overdueDays }) : t("review.due", { date: entry.dueDate })
							})
						]
					}),
					(0, react_jsx_runtime.jsx)("div", {
						className: Learn_module_css_default.row,
						children: (0, react_jsx_runtime.jsxs)("span", {
							className: Learn_module_css_default.muted,
							children: [
								t("review.estimate", { minutes: entry.estimatedMinutes }),
								" · ",
								t("review.interval", { days: entry.intervalDays })
							]
						})
					}),
					entry.lastReason !== void 0 && (0, react_jsx_runtime.jsx)("p", {
						className: Learn_module_css_default.muted,
						children: pick(entry.lastReason, locale)
					}),
					(0, react_jsx_runtime.jsxs)("div", {
						className: Learn_module_css_default.row,
						children: [
							due && (variantId === void 0 ? (0, react_jsx_runtime.jsx)("span", {
								className: Learn_module_css_default.muted,
								children: t("review.noVariant")
							}) : (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Button, {
								variant: "primary",
								size: "sm",
								onClick: () => {
									navigate({
										tab: "review",
										problemId: variantId,
										reviewItemId: entry.itemId,
										mode: "review"
									});
								},
								children: t("review.start")
							})),
							(0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Button, {
								variant: "ghost",
								size: "sm",
								disabled: busy,
								onClick: () => {
									move({ days: 1 });
								},
								children: t("review.snooze")
							}),
							(0, react_jsx_runtime.jsxs)("label", {
								className: Learn_module_css_default.inline,
								children: [(0, react_jsx_runtime.jsx)("span", {
									className: Learn_module_css_default.muted,
									children: t("review.rescheduleTo")
								}), (0, react_jsx_runtime.jsx)("input", {
									className: Learn_module_css_default.select,
									type: "date",
									value: date,
									onChange: (event) => {
										setDate(event.target.value);
									}
								})]
							}),
							(0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Button, {
								variant: "ghost",
								size: "sm",
								disabled: busy || date === entry.dueDate,
								onClick: () => {
									move({ date });
								},
								children: t("review.reschedule")
							}),
							(0, react_jsx_runtime.jsx)("span", { className: Learn_module_css_default.spacer }),
							overview.tutor.configured && (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Button, {
								variant: "ghost",
								size: "sm",
								disabled: busy,
								onClick: generate,
								children: t("review.generate")
							})
						]
					}),
					message !== void 0 && (0, react_jsx_runtime.jsx)("p", {
						className: Learn_module_css_default.note,
						role: "status",
						children: message
					})
				]
			});
		}
		//#endregion
		//#region lib/types/client/ProgressTab.js
		/** Progress: concept mastery, mistake patterns, review history, and recent submissions. */
		/**
		* Render progress.
		* @returns the section.
		*/
		function ProgressTab() {
			const { api, t, locale, overview } = useLearn();
			const state = useAsync(() => api.progress(), "progress");
			const title = (id) => pick(overview.topics.find((item) => item.id === id)?.title ?? {
				zh: id,
				en: id
			}, locale);
			return (0, react_jsx_runtime.jsx)(Loaded, {
				state,
				t,
				children: (data) => (0, react_jsx_runtime.jsxs)("div", {
					className: Learn_module_css_default.grid,
					children: [
						(0, react_jsx_runtime.jsxs)("section", {
							className: Learn_module_css_default.card,
							"data-span": "wide",
							children: [(0, react_jsx_runtime.jsx)("h3", { children: t("progress.mastery") }), data.mastery.map((item) => (0, react_jsx_runtime.jsxs)("div", {
								className: Learn_module_css_default.masteryRow,
								children: [
									(0, react_jsx_runtime.jsx)("span", {
										className: Learn_module_css_default.masteryName,
										children: title(item.topicId)
									}),
									(0, react_jsx_runtime.jsx)("div", {
										className: Learn_module_css_default.meter,
										role: "meter",
										"aria-valuemin": 0,
										"aria-valuemax": 100,
										"aria-valuenow": item.score,
										"aria-label": title(item.topicId),
										children: (0, react_jsx_runtime.jsx)("div", {
											className: Learn_module_css_default.meterFill,
											style: { width: `${String(item.score)}%` }
										})
									}),
									(0, react_jsx_runtime.jsx)("span", {
										className: Learn_module_css_default.level,
										"data-level": item.level,
										children: t(`level.${item.level}`)
									}),
									(0, react_jsx_runtime.jsx)("span", {
										className: Learn_module_css_default.muted,
										children: t("progress.evidence", {
											independent: item.independentSolves,
											assisted: item.assistedSolves,
											studied: item.studiedSolutions,
											passed: item.reviewsPassed,
											reviews: item.reviewsPassed + item.reviewsFailed
										})
									})
								]
							}, item.topicId))]
						}),
						(0, react_jsx_runtime.jsxs)("section", {
							className: Learn_module_css_default.card,
							children: [(0, react_jsx_runtime.jsx)("h3", { children: t("progress.mistakes") }), data.mistakes.length === 0 ? (0, react_jsx_runtime.jsx)("p", {
								className: Learn_module_css_default.muted,
								children: t("progress.noMistakes")
							}) : (0, react_jsx_runtime.jsx)("ul", {
								className: Learn_module_css_default.list,
								children: data.mistakes.map((item) => (0, react_jsx_runtime.jsxs)("li", {
									className: Learn_module_css_default.listRow,
									children: [
										(0, react_jsx_runtime.jsx)("code", { children: item.tag }),
										(0, react_jsx_runtime.jsx)("span", {
											className: Learn_module_css_default.muted,
											children: t("progress.times", { count: item.count })
										}),
										(0, react_jsx_runtime.jsx)("span", {
											className: Learn_module_css_default.muted,
											children: item.topics.map(title).join(", ")
										})
									]
								}, item.tag))
							})]
						}),
						(0, react_jsx_runtime.jsxs)("section", {
							className: Learn_module_css_default.card,
							children: [(0, react_jsx_runtime.jsx)("h3", { children: t("progress.history") }), data.history.length === 0 ? (0, react_jsx_runtime.jsx)("p", {
								className: Learn_module_css_default.muted,
								children: t("progress.noHistory")
							}) : (0, react_jsx_runtime.jsx)("ul", {
								className: Learn_module_css_default.list,
								children: data.history.map((item, index) => (0, react_jsx_runtime.jsxs)("li", {
									className: Learn_module_css_default.stackRow,
									children: [(0, react_jsx_runtime.jsxs)("span", { children: [
										(0, react_jsx_runtime.jsx)("strong", { children: t(`event.${item.kind}`) }),
										" · ",
										title(item.topicId),
										" · ",
										when(item.createdAt, locale)
									] }), (0, react_jsx_runtime.jsx)("span", {
										className: Learn_module_css_default.muted,
										children: pick(item.reason, locale)
									})]
								}, index))
							})]
						}),
						(0, react_jsx_runtime.jsxs)("section", {
							className: Learn_module_css_default.card,
							"data-span": "wide",
							children: [(0, react_jsx_runtime.jsx)("h3", { children: t("progress.attempts") }), (0, react_jsx_runtime.jsx)("ul", {
								className: Learn_module_css_default.list,
								children: data.attempts.filter((item) => item.kind === "submit").slice(0, 20).map((item) => {
									const problem = overview.problems.find((entry) => entry.id === item.problemId);
									return (0, react_jsx_runtime.jsxs)("li", {
										className: Learn_module_css_default.listRow,
										children: [
											(0, react_jsx_runtime.jsx)("span", { children: problem === void 0 ? item.problemId : pick(problem.title, locale) }),
											item.verdict !== void 0 && (0, react_jsx_runtime.jsx)(VerdictLabel, { kind: item.verdict.kind }),
											(0, react_jsx_runtime.jsx)("span", {
												className: Learn_module_css_default.muted,
												children: t(`ws.support.${item.support}`)
											}),
											(0, react_jsx_runtime.jsx)("span", { className: Learn_module_css_default.spacer }),
											(0, react_jsx_runtime.jsx)("span", {
												className: Learn_module_css_default.muted,
												children: when(item.createdAt, locale)
											})
										]
									}, item.id);
								})
							})]
						})
					]
				})
			});
		}
		//#endregion
		//#region lib/types/client/SettingsTab.js
		/** Settings: learning preferences, tutor model, runner, reminder email, and data controls. */
		/**
		* Render settings.
		* @returns the section.
		*/
		function SettingsTab() {
			return (0, react_jsx_runtime.jsxs)("div", {
				className: Learn_module_css_default.grid,
				children: [
					(0, react_jsx_runtime.jsx)(Preferences, {}),
					(0, react_jsx_runtime.jsx)(Status, {}),
					(0, react_jsx_runtime.jsx)(Email, {}),
					(0, react_jsx_runtime.jsx)(Data, {})
				]
			});
		}
		function Preferences() {
			const { api, t, overview, refreshOverview } = useLearn();
			const [draft, setDraft] = (0, react.useState)(overview.settings);
			const [ladder, setLadder] = (0, react.useState)(overview.settings.reviewLadderDays.join(", "));
			const [state, setState] = (0, react.useState)();
			const save = () => {
				const days = ladder.split(",").map((item) => Number(item.trim())).filter((item) => Number.isFinite(item));
				api.updateSettings({
					...draft,
					reviewLadderDays: days
				}).then(() => {
					setState(t("settings.saved"));
					refreshOverview();
				}, (failure) => {
					setState(t("failed", { message: messageOf(failure) }));
				});
			};
			const set = (key, value) => {
				setDraft((current) => ({
					...current,
					[key]: value
				}));
			};
			return (0, react_jsx_runtime.jsxs)("section", {
				className: Learn_module_css_default.card,
				children: [
					(0, react_jsx_runtime.jsx)("h3", { children: t("settings.learner") }),
					(0, react_jsx_runtime.jsxs)("div", {
						className: Learn_module_css_default.form,
						children: [
							(0, react_jsx_runtime.jsxs)("label", { children: [t("settings.locale"), (0, react_jsx_runtime.jsxs)("select", {
								className: Learn_module_css_default.select,
								value: draft.locale,
								onChange: (event) => {
									set("locale", event.target.value === "en" ? "en" : "zh");
								},
								children: [(0, react_jsx_runtime.jsx)("option", {
									value: "zh",
									children: t("settings.locale.zh")
								}), (0, react_jsx_runtime.jsx)("option", {
									value: "en",
									children: t("settings.locale.en")
								})]
							})] }),
							(0, react_jsx_runtime.jsxs)("label", { children: [t("settings.timezone"), (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Input, {
								value: draft.timezone,
								onChange: (event) => {
									set("timezone", event.target.value);
								}
							})] }),
							(0, react_jsx_runtime.jsxs)("label", { children: [t("settings.experience"), (0, react_jsx_runtime.jsx)("select", {
								className: Learn_module_css_default.select,
								value: draft.experience,
								onChange: (event) => {
									set("experience", event.target.value);
								},
								children: [
									"new",
									"some",
									"experienced"
								].map((item) => (0, react_jsx_runtime.jsx)("option", {
									value: item,
									children: t(`experience.${item}`)
								}, item))
							})] }),
							(0, react_jsx_runtime.jsxs)("label", { children: [t("settings.language"), (0, react_jsx_runtime.jsx)("select", {
								className: Learn_module_css_default.select,
								value: draft.preferredLanguage,
								onChange: (event) => {
									set("preferredLanguage", event.target.value);
								},
								children: overview.languages.map((item) => (0, react_jsx_runtime.jsx)("option", {
									value: item.language,
									children: item.label
								}, item.language))
							})] }),
							(0, react_jsx_runtime.jsxs)("label", { children: [t("settings.dailyGoal"), (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Input, {
								type: "number",
								min: 5,
								max: 600,
								value: draft.dailyGoalMinutes,
								onChange: (event) => {
									set("dailyGoalMinutes", Number(event.target.value));
								}
							})] }),
							(0, react_jsx_runtime.jsxs)("label", { children: [t("settings.reviewLimit"), (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Input, {
								type: "number",
								min: 1,
								max: 50,
								value: draft.reviewDailyLimit,
								onChange: (event) => {
									set("reviewDailyLimit", Number(event.target.value));
								}
							})] }),
							(0, react_jsx_runtime.jsxs)("label", { children: [t("settings.ladder"), (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Input, {
								value: ladder,
								onChange: (event) => {
									setLadder(event.target.value);
								}
							})] })
						]
					}),
					(0, react_jsx_runtime.jsxs)("div", {
						className: Learn_module_css_default.row,
						children: [(0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Button, {
							variant: "primary",
							onClick: save,
							children: t("settings.save")
						}), state !== void 0 && (0, react_jsx_runtime.jsx)("span", {
							className: Learn_module_css_default.muted,
							role: "status",
							children: state
						})]
					})
				]
			});
		}
		function Status() {
			const { api, t, overview, refreshOverview } = useLearn();
			const [runner, setRunner] = (0, react.useState)(overview.runner);
			const [busy, setBusy] = (0, react.useState)();
			const [error, setError] = (0, react.useState)();
			const refresh = () => {
				setBusy("refresh");
				api.runnerStatus(true).then((status) => {
					setRunner(status);
					refreshOverview();
				}, (failure) => {
					setError(messageOf(failure));
				}).finally(() => {
					setBusy(void 0);
				});
			};
			const prepare = (language) => {
				setBusy(language);
				api.prepareRunner(language, AbortSignal.timeout(9e5)).then((status) => {
					setRunner(status);
					refreshOverview();
				}, (failure) => {
					setError(messageOf(failure));
				}).finally(() => {
					setBusy(void 0);
				});
			};
			return (0, react_jsx_runtime.jsxs)("section", {
				className: Learn_module_css_default.card,
				children: [
					(0, react_jsx_runtime.jsx)("h3", { children: t("settings.model") }),
					overview.tutor.configured ? (0, react_jsx_runtime.jsx)("p", { children: t("settings.modelConfigured", { model: `${overview.tutor.provider ?? ""}/${overview.tutor.model ?? ""}` }) }) : (0, react_jsx_runtime.jsx)("p", {
						className: Learn_module_css_default.note,
						children: t("settings.modelMissing")
					}),
					overview.tutor.lastFailure !== void 0 && overview.tutor.configured && (0, react_jsx_runtime.jsx)("p", {
						className: Learn_module_css_default.errorText,
						children: t("settings.modelFailure", { error: overview.tutor.lastFailure })
					}),
					(0, react_jsx_runtime.jsx)("h3", { children: t("settings.runner") }),
					(0, react_jsx_runtime.jsx)("p", { children: runner.available ? t("settings.runnerReady", { backend: runner.backend }) : t("settings.runnerMissing", { reason: runner.reason ?? "" }) }),
					(0, react_jsx_runtime.jsx)("ul", {
						className: Learn_module_css_default.list,
						children: runner.languages.map((item) => (0, react_jsx_runtime.jsxs)("li", {
							className: Learn_module_css_default.listRow,
							children: [
								(0, react_jsx_runtime.jsx)("span", { children: t("settings.runnerLanguage", {
									language: item.language,
									state: item.available ? t("settings.ready") : t("settings.notReady")
								}) }),
								(0, react_jsx_runtime.jsx)("code", {
									className: Learn_module_css_default.muted,
									children: item.image
								}),
								(0, react_jsx_runtime.jsx)("span", { className: Learn_module_css_default.spacer }),
								!item.available && runner.reason === void 0 && (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Button, {
									size: "sm",
									variant: "outline",
									disabled: busy !== void 0,
									onClick: () => {
										prepare(item.language);
									},
									children: busy === item.language ? t("loading") : t("settings.prepare")
								})
							]
						}, item.language))
					}),
					(0, react_jsx_runtime.jsx)("p", {
						className: Learn_module_css_default.muted,
						children: t("settings.isolation")
					}),
					(0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Button, {
						size: "sm",
						variant: "ghost",
						disabled: busy !== void 0,
						onClick: refresh,
						children: t("settings.refresh")
					}),
					error !== void 0 && (0, react_jsx_runtime.jsx)("div", {
						className: Learn_module_css_default.errorBox,
						role: "alert",
						children: t("failed", { message: error })
					})
				]
			});
		}
		function Email() {
			const { api, t, locale } = useLearn();
			const [key, setKey] = (0, react.useState)(0);
			const settings = useAsync(() => api.emailSettings(), String(key));
			const jobs = useAsync(() => api.emailJobs(), String(key));
			const [address, setAddress] = (0, react.useState)("");
			const [code, setCode] = (0, react.useState)("");
			const [error, setError] = (0, react.useState)();
			const [preview, setPreview] = (0, react.useState)();
			const reasonText = (reason) => {
				const key = {
					"no reviews due": "email.reason.noReviews",
					"opted out": "email.reason.optedOut",
					"paused": "email.reason.paused",
					"no verified address": "email.reason.unverified",
					"address changed": "email.reason.addressChanged"
				}[reason];
				if (key !== void 0) return t(key);
				return reason.startsWith("stale") ? t("email.reason.stale") : reason.startsWith("superseded") ? t("email.reason.superseded") : reason;
			};
			const refresh = () => {
				setKey((value) => value + 1);
			};
			const act = (operation) => {
				setError(void 0);
				operation.then(() => {
					refresh();
				}, (failure) => {
					setError(messageOf(failure));
				});
			};
			return (0, react_jsx_runtime.jsxs)("section", {
				className: Learn_module_css_default.card,
				"data-span": "wide",
				children: [
					(0, react_jsx_runtime.jsx)("h3", { children: t("settings.email") }),
					(0, react_jsx_runtime.jsx)(Loaded, {
						state: settings,
						t,
						children: (view) => (0, react_jsx_runtime.jsxs)("div", {
							className: Learn_module_css_default.stack,
							children: [
								(0, react_jsx_runtime.jsxs)("p", {
									className: Learn_module_css_default.note,
									children: [
										view.transport === "capture" || !view.liveSending ? t("email.transport.capture") : t("email.transport.smtp"),
										" ",
										t("email.runtime")
									]
								}),
								(0, react_jsx_runtime.jsxs)("div", {
									className: Learn_module_css_default.row,
									children: [
										(0, react_jsx_runtime.jsxs)("label", {
											className: Learn_module_css_default.inline,
											children: [t("email.address"), (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Input, {
												type: "email",
												value: address === "" ? view.address ?? "" : address,
												onChange: (event) => {
													setAddress(event.target.value);
												}
											})]
										}),
										(0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Button, {
											variant: "outline",
											size: "sm",
											onClick: () => {
												act(api.setEmailAddress(address === "" ? view.address ?? "" : address));
											},
											children: t("email.setAddress")
										}),
										view.address !== void 0 && (0, react_jsx_runtime.jsx)(Chip, {
											tone: view.verified ? "success" : "outline",
											children: view.verified ? t("email.verified") : t("email.unverified")
										})
									]
								}),
								view.verificationPending && (0, react_jsx_runtime.jsxs)("div", {
									className: Learn_module_css_default.row,
									children: [
										(0, react_jsx_runtime.jsx)("span", {
											className: Learn_module_css_default.muted,
											children: t("email.pending")
										}),
										(0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Input, {
											inputMode: "numeric",
											maxLength: 6,
											value: code,
											placeholder: t("email.code"),
											"aria-label": t("email.code"),
											onChange: (event) => {
												setCode(event.target.value);
											}
										}),
										(0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Button, {
											variant: "primary",
											size: "sm",
											disabled: code.length !== 6,
											onClick: () => {
												act(api.verifyEmail(code));
											},
											children: t("email.verify")
										})
									]
								}),
								(0, react_jsx_runtime.jsxs)("div", {
									className: Learn_module_css_default.row,
									children: [
										(0, react_jsx_runtime.jsxs)("span", {
											className: Learn_module_css_default.inline,
											children: [(0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Switch, {
												checked: view.optIn,
												disabled: !view.verified,
												onChange: (value) => {
													act(api.emailPreferences({ optIn: value }));
												},
												label: t("email.optIn")
											}), t("email.optIn")]
										}),
										(0, react_jsx_runtime.jsxs)("span", {
											className: Learn_module_css_default.inline,
											children: [(0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Switch, {
												checked: view.paused,
												disabled: !view.optIn,
												onChange: (value) => {
													act(api.emailPreferences({ paused: value }));
												},
												label: t("email.pause")
											}), t("email.pause")]
										}),
										(0, react_jsx_runtime.jsxs)("label", {
											className: Learn_module_css_default.inline,
											children: [t("email.hour"), (0, react_jsx_runtime.jsx)("select", {
												className: Learn_module_css_default.select,
												value: view.deliveryHour,
												onChange: (event) => {
													act(api.emailPreferences({ deliveryHour: Number(event.target.value) }));
												},
												children: Array.from({ length: 24 }, (_value, hour) => (0, react_jsx_runtime.jsxs)("option", {
													value: hour,
													children: [String(hour).padStart(2, "0"), ":00"]
												}, hour))
											})]
										})
									]
								}),
								(0, react_jsx_runtime.jsxs)("div", {
									className: Learn_module_css_default.row,
									children: [(0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Button, {
										variant: "outline",
										size: "sm",
										disabled: !view.verified,
										onClick: () => {
											act(api.testEmail());
										},
										children: t("email.test")
									}), (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Button, {
										variant: "ghost",
										size: "sm",
										onClick: () => {
											act(api.runReminders());
										},
										children: t("email.runNow")
									})]
								})
							]
						})
					}),
					error !== void 0 && (0, react_jsx_runtime.jsx)("div", {
						className: Learn_module_css_default.errorBox,
						role: "alert",
						children: t("failed", { message: error })
					}),
					(0, react_jsx_runtime.jsx)("h4", { children: t("email.jobs") }),
					(jobs.data ?? []).length === 0 ? (0, react_jsx_runtime.jsx)("p", {
						className: Learn_module_css_default.muted,
						children: t("email.noJobs")
					}) : (0, react_jsx_runtime.jsx)("ul", {
						className: Learn_module_css_default.list,
						children: (jobs.data ?? []).map((job) => (0, react_jsx_runtime.jsxs)("li", {
							className: Learn_module_css_default.listRow,
							children: [
								(0, react_jsx_runtime.jsx)(Chip, { children: t(`email.kind.${job.kind}`) }),
								(0, react_jsx_runtime.jsx)("span", { children: t(`email.status.${job.status}`) }),
								job.reason !== void 0 && (0, react_jsx_runtime.jsx)("span", {
									className: Learn_module_css_default.muted,
									children: reasonText(job.reason)
								}),
								job.lastError !== void 0 && (0, react_jsx_runtime.jsx)("span", {
									className: Learn_module_css_default.errorText,
									children: job.lastError
								}),
								(0, react_jsx_runtime.jsx)("span", { className: Learn_module_css_default.spacer }),
								(0, react_jsx_runtime.jsx)("span", {
									className: Learn_module_css_default.muted,
									children: when(job.updatedAt, locale)
								}),
								job.previewSubject !== void 0 && (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Button, {
									size: "sm",
									variant: "ghost",
									onClick: () => {
										api.emailPreview(job.id).then(setPreview, (failure) => {
											setError(messageOf(failure));
										});
									},
									children: t("email.preview")
								})
							]
						}, job.id))
					}),
					(0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Modal, {
						open: preview !== void 0,
						onClose: () => {
							setPreview(void 0);
						},
						title: t("email.previewTitle"),
						closeLabel: t("close"),
						...preview === void 0 ? {} : { description: `${preview.to} · ${preview.subject} · ${t(`email.status.${preview.status}`)}` },
						children: preview !== void 0 && (0, react_jsx_runtime.jsx)("iframe", {
							className: Learn_module_css_default.previewFrame,
							title: preview.subject,
							sandbox: "",
							srcDoc: preview.html
						})
					})
				]
			});
		}
		function Data() {
			const { api, t, refreshOverview } = useLearn();
			const [exported, setExported] = (0, react.useState)();
			const [resetting, setResetting] = (0, react.useState)(false);
			const [confirm, setConfirm] = (0, react.useState)("");
			const [error, setError] = (0, react.useState)();
			return (0, react_jsx_runtime.jsxs)("section", {
				className: Learn_module_css_default.card,
				children: [
					(0, react_jsx_runtime.jsx)("h3", { children: t("settings.data") }),
					(0, react_jsx_runtime.jsxs)("div", {
						className: Learn_module_css_default.row,
						children: [(0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Button, {
							variant: "outline",
							size: "sm",
							onClick: () => {
								api.exportData().then((data) => {
									setExported(JSON.stringify(data, null, 2));
								}, (failure) => {
									setError(messageOf(failure));
								});
							},
							children: t("data.export")
						}), (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Button, {
							variant: "ghost",
							size: "sm",
							onClick: () => {
								setResetting(true);
							},
							children: t("data.reset")
						})]
					}),
					exported !== void 0 && (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [(0, react_jsx_runtime.jsx)("p", {
						className: Learn_module_css_default.muted,
						children: t("data.exported")
					}), (0, react_jsx_runtime.jsx)("textarea", {
						className: Learn_module_css_default.codeArea,
						rows: 8,
						readOnly: true,
						value: exported,
						"aria-label": t("data.export")
					})] }),
					error !== void 0 && (0, react_jsx_runtime.jsx)("div", {
						className: Learn_module_css_default.errorBox,
						role: "alert",
						children: t("failed", { message: error })
					}),
					(0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Modal, {
						open: resetting,
						onClose: () => {
							setResetting(false);
						},
						title: t("data.reset"),
						closeLabel: t("close"),
						description: t("data.resetBody"),
						footer: (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [(0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Button, {
							variant: "ghost",
							onClick: () => {
								setResetting(false);
							},
							children: t("close")
						}), (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Button, {
							variant: "primary",
							disabled: confirm !== "RESET",
							onClick: () => {
								api.resetData(confirm).then(() => {
									setResetting(false);
									setConfirm("");
									refreshOverview();
								}, (failure) => {
									setError(messageOf(failure));
								});
							},
							children: t("data.resetConfirm")
						})] }),
						children: (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Input, {
							value: confirm,
							onChange: (event) => {
								setConfirm(event.target.value);
							},
							"aria-label": t("data.reset"),
							"data-modal-autofocus": true
						})
					})
				]
			});
		}
		//#endregion
		//#region lib/types/client/LearnPage.js
		/** The Learn main panel: section tabs, availability banners, and the active section. */
		const ORDER = [
			"today",
			"learn",
			"practice",
			"review",
			"progress",
			"settings"
		];
		/**
		* Render the Learn page.
		* @param props - injected actions, route hook, and translator.
		* @returns the page.
		*/
		function LearnPage({ api, useRoute, navigate, setOpen, t }) {
			const route = useRoute((value) => value);
			(0, react.useEffect)(() => {
				setOpen(true);
				return () => {
					setOpen(false);
				};
			}, [setOpen]);
			const [overviewKey, setOverviewKey] = (0, react.useState)(0);
			const overview = useAsync(() => api.overview(), String(overviewKey));
			const refreshOverview = (0, react.useCallback)(() => {
				setOverviewKey((value) => value + 1);
			}, []);
			const items = (0, react.useMemo)(() => ORDER.map((tab) => ({
				value: tab,
				label: t(`tab.${tab}`),
				id: `learn-tab-${tab}`,
				panelId: "learn-panel"
			})), [t]);
			return (0, react_jsx_runtime.jsxs)("div", {
				className: Learn_module_css_default.page,
				children: [(0, react_jsx_runtime.jsxs)("header", {
					className: Learn_module_css_default.header,
					children: [(0, react_jsx_runtime.jsx)("h1", {
						className: Learn_module_css_default.title,
						children: t("title")
					}), (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.SegmentedTabs, {
						items,
						value: route.tab,
						onChange: (tab) => {
							navigate({ tab });
						},
						label: t("tabs")
					})]
				}), (0, react_jsx_runtime.jsx)(Loaded, {
					state: overview,
					t,
					children: (data) => {
						const env = {
							api,
							t,
							route,
							navigate,
							overview: data,
							refreshOverview,
							locale: data.settings.locale
						};
						return (0, react_jsx_runtime.jsxs)(LearnEnvContext.Provider, {
							value: env,
							children: [
								!data.runner.available && (0, react_jsx_runtime.jsxs)("div", {
									className: Learn_module_css_default.banner,
									"data-tone": "warn",
									role: "status",
									children: [(0, react_jsx_runtime.jsx)("span", { children: t("banner.runner", { reason: data.runner.reason ?? data.runner.languages.find((item) => !item.available)?.reason ?? "" }) }), (0, react_jsx_runtime.jsx)("button", {
										type: "button",
										className: Learn_module_css_default.linkButton,
										onClick: () => {
											navigate({ tab: "settings" });
										},
										children: t("banner.runnerAction")
									})]
								}),
								!data.tutor.configured && (0, react_jsx_runtime.jsx)("div", {
									className: Learn_module_css_default.banner,
									"data-tone": "info",
									role: "status",
									children: t("banner.tutor")
								}),
								(0, react_jsx_runtime.jsxs)("main", {
									id: "learn-panel",
									className: Learn_module_css_default.body,
									role: "tabpanel",
									"aria-labelledby": `learn-tab-${route.tab}`,
									children: [
										route.tab === "today" && (0, react_jsx_runtime.jsx)(TodayTab, {}),
										route.tab === "learn" && (0, react_jsx_runtime.jsx)(LessonTab, {}),
										route.tab === "practice" && (0, react_jsx_runtime.jsx)(PracticeTab, {}),
										route.tab === "review" && (0, react_jsx_runtime.jsx)(ReviewTab, {}),
										route.tab === "progress" && (0, react_jsx_runtime.jsx)(ProgressTab, {}),
										route.tab === "settings" && (0, react_jsx_runtime.jsx)(SettingsTab, {})
									]
								})
							]
						});
					}
				})]
			});
		}
		//#endregion
		//#region lib/types/client/locales.js
		/** Dictionary namespace of every Learn surface. */
		const NS = "learn";
		/** Chinese dictionary and key source. */
		const zh = {
			title: "学习",
			"tab.today": "今日",
			"tab.learn": "课程",
			"tab.practice": "练习",
			"tab.review": "复习",
			"tab.progress": "进度",
			"tab.settings": "设置",
			tabs: "Learn 页面",
			loading: "正在加载…",
			retry: "重试",
			close: "关闭",
			copy: "复制",
			copied: "已复制",
			footnotes: "脚注",
			failed: "操作失败：{message}",
			"banner.runner": "代码评测暂不可用：{reason}",
			"banner.runnerAction": "前往设置",
			"banner.tutor": "导师模型不可用，提示将使用课程自带内容，评测仅给出确定性结果。",
			"today.heading": "今天",
			"today.nextLesson": "下一课",
			"today.continue": "继续学习",
			"today.start": "开始",
			"today.allLessons": "所有课程都已完成，可以到练习页挑战更多题目。",
			"today.reviews": "待复习",
			"today.reviewsValue": "{due} 个待完成 · 今日已完成 {done}/{limit}",
			"today.reviewNow": "开始复习",
			"today.noReviews": "今天没有到期的复习。",
			"today.goal": "每日目标",
			"today.goalValue": "约 {minutes} / {goal} 分钟（按练习次数估算）",
			"today.nextProblem": "推荐练习",
			"today.recent": "最近活动",
			"today.empty": "还没有活动记录。",
			"learn.heading": "课程路线",
			"learn.prerequisites": "先修：{list}",
			"learn.locked": "先完成先修课程（或在设置中选择“有经验”以解锁全部课程）",
			"learn.problems": "{count} 道题",
			"learn.open": "打开课程",
			"learn.back": "返回路线",
			"stage.motivation": "动机",
			"stage.strategy": "方法",
			"stage.example": "例子",
			"stage.check": "理解检查",
			"stage.problem": "实战题",
			"stage.reflection": "复盘",
			"stage.complete": "已完成",
			"lesson.next": "下一步",
			"lesson.previous": "上一步",
			"lesson.checkSubmit": "提交答案",
			"lesson.correct": "回答正确",
			"lesson.incorrect": "还不对，再想想",
			"lesson.checkAll": "答对全部问题后才能进入实战题。",
			"lesson.problemIntro": "现在用真实题目练习刚学到的方法。通过本地测试后回来写复盘。",
			"lesson.openProblem": "打开实战题",
			"lesson.problemPassed": "实战题已通过本地测试，可以写复盘了。",
			"lesson.reflectionPlaceholder": "用自己的话解释你的方法……",
			"lesson.reflectionSubmit": "提交复盘",
			"lesson.feedback": "导师反馈",
			"lesson.feedbackUnavailable": "复盘已保存。导师模型不可用，暂时没有反馈。",
			"lesson.skip": "诊断跳过",
			"lesson.skipHelp": "已经熟悉这个主题？一次答对全部理解检查即可直接完成本课。",
			"lesson.skipFailed": "有题目答错，本课保持未完成。",
			"lesson.skipped": "已通过诊断跳过本课。",
			"lesson.completed": "本课已完成",
			"lesson.traceTitle": "逐步追踪",
			"practice.search": "搜索题目、编号或标签",
			"practice.all": "全部",
			"practice.topic": "主题",
			"practice.difficulty": "难度",
			"practice.status": "状态",
			"practice.empty": "没有符合条件的题目。",
			"practice.import": "导入题目",
			"practice.importHelp": "粘贴题目规格（JSON）。导入的题目和生成的变体使用同一套校验：参考解、暴力解对拍、变异体与边界用例。",
			"practice.importSubmit": "校验并导入",
			"practice.importResult": "导入结果：{status}",
			"difficulty.easy": "简单",
			"difficulty.medium": "中等",
			"difficulty.hard": "困难",
			"status.new": "未开始",
			"status.attempted": "尝试过",
			"status.solved-with-help": "在帮助下解出",
			"status.solved": "独立解出",
			"kind.leetcode": "LeetCode 真题",
			"kind.original": "原创练习",
			"kind.variant": "变体",
			"kind.imported": "导入",
			"ws.back": "返回",
			"ws.description": "题目",
			"ws.tutor": "导师",
			"ws.hints": "提示",
			"ws.notes": "笔记",
			"ws.history": "记录",
			"ws.officialLink": "在 LeetCode 查看官方题面",
			"ws.summaryNote": "这是为本课程写的原创简述；官方题面以 LeetCode 为准。",
			"ws.constraints": "约束",
			"ws.examples": "本地示例",
			"ws.example": "示例 {id}",
			"ws.hiddenCases": "提交时还会运行 {count} 个隐藏的边界、随机和大规模用例。",
			"ws.verified": "元数据已于 {date} 核对",
			"ws.origin.authored": "课程作者编写",
			"ws.origin.generated": "模型生成并经过校验",
			"ws.origin.imported": "导入并经过校验",
			"ws.variantHidden": "这道复习题与某道学过的题目相关；完成后会揭示它们的关系。",
			"ws.transfer": "迁移说明",
			"ws.differences": "与原题的不同",
			"ws.parent": "原题：{title}",
			"ws.language": "语言",
			"ws.code": "代码编辑器",
			"ws.timeMs": "{value} 毫秒",
			"ws.run": "运行",
			"ws.submit": "提交",
			"ws.running": "运行中…",
			"ws.judging": "评测中…（{seconds} 秒）",
			"ws.cancel": "取消",
			"ws.saved": "草稿已保存 {time}",
			"ws.saving": "保存中…",
			"ws.saveFailed": "草稿保存失败",
			"ws.reset": "重置代码",
			"ws.resetConfirm": "确认重置为初始代码？",
			"ws.custom": "自定义输入",
			"ws.customHelp": "每行一个 JSON 参数数组，例如 [[1, 2, 3], 4]",
			"ws.customInvalid": "第 {line} 行不是合法的 JSON 数组",
			"ws.results": "结果",
			"ws.noResult": "运行或提交后在这里查看结果。",
			"ws.input": "输入",
			"ws.expected": "期望",
			"ws.output": "输出",
			"ws.stdout": "打印输出",
			"ws.errorLine": "第 {line} 行",
			"ws.passedCases": "{passed}/{total} 个用例通过",
			"ws.measured": "容器内实测运行时间合计 {ms} ms（不同机器差异较大）",
			"ws.failingCase": "失败用例（{visibility}）",
			"ws.visibility.example": "示例",
			"ws.visibility.custom": "自定义",
			"ws.visibility.hidden": "隐藏用例",
			"ws.assessment": "导师评估",
			"ws.assessmentUnavailable": "导师评估不可用：{reason}",
			"ws.verdictNote": "结论只来自测试执行结果，导师评估不会改变它。",
			"ws.complexity": "复杂度（估计）：时间 {time}，空间 {space}",
			"ws.misconceptions": "可能的误区",
			"ws.nextStep": "下一步",
			"ws.reflectionQuestion": "请解释一下",
			"ws.explainPlaceholder": "简要说明你的思路，发送给导师……",
			"ws.explainSend": "发送说明",
			"ws.judgeMode.agent": "评测由导师 Agent 发起，结果来自隔离执行",
			"ws.judgeMode.deterministic-fallback": "确定性评测（导师不可用）",
			"ws.support.independent": "独立完成",
			"ws.support.with-hints": "使用了提示",
			"ws.support.studied-solution": "查看过解答",
			"ws.mistakes": "错误类型：{tags}",
			"verdict.passed-local-tests": "通过本地测试",
			"verdict.wrong-answer": "答案错误",
			"verdict.compile-error": "编译 / 语法错误",
			"verdict.runtime-error": "运行时错误",
			"verdict.time-limit-exceeded": "超出时间限制",
			"verdict.memory-limit-exceeded": "超出内存限制",
			"verdict.output-limit-exceeded": "超出输出限制",
			"verdict.evaluation-unavailable": "无法评测",
			"verdict.cancelled": "已取消",
			"hint.level1": "第 1 级：方向",
			"hint.level2": "第 2 级：关键观察",
			"hint.level3": "第 3 级：算法提纲",
			"hint.level4": "第 4 级：查看解答",
			"hint.request": "获取{level}",
			"hint.revealTitle": "确定查看完整解答吗？",
			"hint.revealBody": "查看解答会被记录，这道题之后只计为“查看过解答”，复习间隔也会缩短。建议先尝试前三级提示。",
			"hint.revealConfirm": "查看解答",
			"hint.none": "还没有使用提示。每次只给一个提示，按顺序逐级获取。",
			"hint.source.authored": "课程内容",
			"hint.source.tutor": "导师",
			"hint.loading": "正在生成提示…",
			"notes.placeholder": "记录你的思路、易错点……（自动保存）",
			"history.empty": "还没有运行或提交记录。",
			"history.restore": "载入这次的代码",
			"tutor.placeholder": "向导师提问，比如“为什么要先查询再插入？”",
			"tutor.send": "发送",
			"tutor.stop": "停止",
			"tutor.empty": "导师会结合题目、你的代码和最近的运行结果回答。它不会直接给出完整答案。",
			"tutor.failed": "导师回复失败：{error}",
			"tutor.interrupted": "回复已中断",
			"tutor.you": "你",
			"tutor.name": "导师",
			"review.heading": "今日复习",
			"review.summary": "今天到期 {due} 个 · 每日上限 {limit} · 已完成 {done}",
			"review.deferred": "另有 {count} 个逾期复习超出今日上限，会顺延到之后几天。",
			"review.empty": "今天没有需要复习的内容。",
			"review.upcoming": "即将到期",
			"review.noUpcoming": "还没有安排复习。提交一道练习题后会自动加入复习计划。",
			"review.start": "开始复习",
			"review.estimate": "约 {minutes} 分钟",
			"review.overdue": "逾期 {days} 天",
			"review.due": "{date} 到期",
			"review.interval": "当前间隔 {days} 天",
			"review.snooze": "推迟 1 天",
			"review.reschedule": "改期",
			"review.rescheduleTo": "改到",
			"review.noVariant": "暂时没有可用的已校验变体",
			"review.origin.authored": "课程变体",
			"review.origin.generated": "生成的变体",
			"review.origin.imported": "导入题目",
			"review.complete": "完成复习",
			"review.completeHelp": "提交后，请评价你回忆这个思路的难易程度，然后完成复习。",
			"review.recall": "回忆难度",
			"recall.again": "需要重来",
			"recall.hard": "有点吃力",
			"recall.good": "正常",
			"recall.easy": "很轻松",
			"review.result": "下次复习：{date}（间隔 {days} 天）",
			"review.duplicate": "这次复习已经记录过，没有重复调整计划。",
			"review.generate": "生成新变体",
			"review.generating": "正在生成并校验变体…",
			"review.generateResult": "{message}",
			"review.variants": "变体库",
			"review.validated": "已校验",
			"review.quarantined": "已隔离",
			"review.checks": "校验项",
			"review.needsGraded": "需要先提交并得到确定的评测结果。",
			"progress.mastery": "概念掌握度",
			"progress.mistakes": "常见错误",
			"progress.noMistakes": "还没有记录到错误类型。",
			"progress.history": "复习历史",
			"progress.noHistory": "还没有复习记录。",
			"progress.attempts": "最近提交",
			"progress.evidence": "独立 {independent} · 提示 {assisted} · 看解答 {studied} · 复习通过 {passed}/{reviews}",
			"level.not-started": "未开始",
			"level.learning": "学习中",
			"level.practicing": "练习中",
			"level.proficient": "熟练",
			"level.mastered": "已掌握",
			"event.created": "加入复习",
			"event.completed": "完成复习",
			"event.snoozed": "推迟",
			"event.rescheduled": "改期",
			"progress.times": "{count} 次",
			"settings.learner": "学习偏好",
			"settings.locale": "讲解语言",
			"settings.locale.zh": "中文",
			"settings.locale.en": "English",
			"settings.timezone": "时区",
			"settings.experience": "经验",
			"experience.new": "新手",
			"experience.some": "有一些基础",
			"experience.experienced": "有经验（解锁全部课程）",
			"settings.language": "默认编程语言",
			"settings.dailyGoal": "每日目标（分钟）",
			"settings.reviewLimit": "每日复习上限",
			"settings.ladder": "复习间隔（天，逗号分隔）",
			"settings.save": "保存",
			"settings.saved": "已保存",
			"settings.model": "导师模型",
			"settings.modelConfigured": "使用 DSH 默认模型：{model}",
			"settings.modelMissing": "未配置默认模型。在 DSH 设置中配置模型后即可使用导师与 AI 评估。",
			"settings.modelFailure": "最近一次失败：{error}",
			"settings.runner": "代码评测环境",
			"settings.runnerReady": "{backend} 可用",
			"settings.runnerMissing": "不可用：{reason}",
			"settings.runnerLanguage": "{language}：{state}",
			"settings.ready": "就绪",
			"settings.notReady": "未就绪",
			"settings.prepare": "下载镜像",
			"settings.refresh": "重新检测",
			"settings.isolation": "提交的代码在 Docker 容器中运行：无网络、只读文件系统、非 root 用户、限制 CPU / 内存 / 进程数，且不继承任何密钥。",
			"settings.email": "复习提醒邮件",
			"email.address": "邮箱地址",
			"email.setAddress": "发送验证码",
			"email.verified": "已验证",
			"email.unverified": "未验证",
			"email.pending": "验证码已发送，请查收后输入。",
			"email.code": "6 位验证码",
			"email.verify": "验证",
			"email.optIn": "每天发送到期复习摘要",
			"email.pause": "暂停提醒",
			"email.hour": "发送时间（本地时区，整点）",
			"email.test": "发送测试邮件",
			"email.runNow": "立即处理邮件队列",
			"email.transport.capture": "开发预览模式：邮件只写入本地预览，不会真正发送。",
			"email.transport.smtp": "实时发送：通过已授权的 SMTP 服务发送。",
			"email.runtime": "提醒只会在 DSH 运行时发送；错过的提醒最多在当天补发一次。",
			"email.jobs": "邮件记录",
			"email.noJobs": "还没有邮件记录。",
			"email.reason.noReviews": "今天没有到期复习",
			"email.reason.optedOut": "已关闭提醒",
			"email.reason.paused": "提醒已暂停",
			"email.reason.unverified": "邮箱未验证",
			"email.reason.addressChanged": "邮箱地址已更改",
			"email.reason.stale": "已过期（不补发往日摘要）",
			"email.reason.superseded": "已被新的验证请求取代",
			"email.preview": "预览",
			"email.previewTitle": "邮件预览",
			"email.kind.digest": "复习摘要",
			"email.kind.verification": "验证码",
			"email.kind.test": "测试",
			"email.status.queued": "排队中",
			"email.status.sending": "发送中",
			"email.status.sent": "已发送",
			"email.status.captured": "已生成预览（未发送）",
			"email.status.skipped": "已跳过",
			"email.status.cancelled": "已取消",
			"email.status.failed": "失败",
			"settings.data": "数据",
			"data.export": "导出学习数据",
			"data.reset": "清空学习数据",
			"data.resetBody": "这会删除你的进度、代码草稿、提交、复习计划和提醒设置，且无法恢复。输入 RESET 确认。",
			"data.resetConfirm": "确认清空",
			"data.exported": "已导出到下方文本框，可复制保存。"
		};
		/** English dictionary with the same complete key set. */
		const en = {
			title: "Learn",
			"tab.today": "Today",
			"tab.learn": "Learn",
			"tab.practice": "Practice",
			"tab.review": "Review",
			"tab.progress": "Progress",
			"tab.settings": "Settings",
			tabs: "Learn sections",
			loading: "Loading…",
			retry: "Retry",
			close: "Close",
			copy: "Copy",
			copied: "Copied",
			footnotes: "Footnotes",
			failed: "Something went wrong: {message}",
			"banner.runner": "Code evaluation is unavailable: {reason}",
			"banner.runnerAction": "Open settings",
			"banner.tutor": "The tutor model is unavailable. Hints use authored lesson content and judging returns deterministic results only.",
			"today.heading": "Today",
			"today.nextLesson": "Next lesson",
			"today.continue": "Continue",
			"today.start": "Start",
			"today.allLessons": "Every lesson is complete. Head to Practice for more problems.",
			"today.reviews": "Reviews",
			"today.reviewsValue": "{due} due · {done}/{limit} done today",
			"today.reviewNow": "Start reviewing",
			"today.noReviews": "No reviews are due today.",
			"today.goal": "Daily goal",
			"today.goalValue": "About {minutes} / {goal} minutes (estimated from practice activity)",
			"today.nextProblem": "Suggested problem",
			"today.recent": "Recent activity",
			"today.empty": "No activity yet.",
			"learn.heading": "Roadmap",
			"learn.prerequisites": "Prerequisites: {list}",
			"learn.locked": "Finish the prerequisites first (or choose \"experienced\" in settings to unlock every lesson)",
			"learn.problems": "{count} problems",
			"learn.open": "Open lesson",
			"learn.back": "Back to roadmap",
			"stage.motivation": "Motivation",
			"stage.strategy": "Strategy",
			"stage.example": "Example",
			"stage.check": "Check",
			"stage.problem": "Problem",
			"stage.reflection": "Reflection",
			"stage.complete": "Complete",
			"lesson.next": "Next",
			"lesson.previous": "Previous",
			"lesson.checkSubmit": "Check answers",
			"lesson.correct": "Correct",
			"lesson.incorrect": "Not yet; think again",
			"lesson.checkAll": "Answer every question correctly to unlock the problem.",
			"lesson.problemIntro": "Apply the technique to an authentic problem. Come back for the reflection once it passes the local tests.",
			"lesson.openProblem": "Open the problem",
			"lesson.problemPassed": "The problem passed the local tests. Write your reflection.",
			"lesson.reflectionPlaceholder": "Explain your approach in your own words…",
			"lesson.reflectionSubmit": "Submit reflection",
			"lesson.feedback": "Tutor feedback",
			"lesson.feedbackUnavailable": "Reflection saved. The tutor model is unavailable, so there is no feedback yet.",
			"lesson.skip": "Diagnostic skip",
			"lesson.skipHelp": "Already familiar with this topic? Answer every check correctly at once to complete the lesson.",
			"lesson.skipFailed": "Some answers are wrong; the lesson stays open.",
			"lesson.skipped": "Lesson completed through the diagnostic.",
			"lesson.completed": "Lesson complete",
			"lesson.traceTitle": "Step-by-step trace",
			"practice.search": "Search by title, number, or tag",
			"practice.all": "All",
			"practice.topic": "Topic",
			"practice.difficulty": "Difficulty",
			"practice.status": "Status",
			"practice.empty": "No problems match the filters.",
			"practice.import": "Import a problem",
			"practice.importHelp": "Paste a problem specification (JSON). Imports go through the same validation as generated variants: reference, brute-force differential testing, mutants, and boundary cases.",
			"practice.importSubmit": "Validate and import",
			"practice.importResult": "Import result: {status}",
			"difficulty.easy": "Easy",
			"difficulty.medium": "Medium",
			"difficulty.hard": "Hard",
			"status.new": "Not started",
			"status.attempted": "Attempted",
			"status.solved-with-help": "Solved with help",
			"status.solved": "Solved independently",
			"kind.leetcode": "LeetCode",
			"kind.original": "Original exercise",
			"kind.variant": "Variant",
			"kind.imported": "Imported",
			"ws.back": "Back",
			"ws.description": "Problem",
			"ws.tutor": "Tutor",
			"ws.hints": "Hints",
			"ws.notes": "Notes",
			"ws.history": "History",
			"ws.officialLink": "Official statement on LeetCode",
			"ws.summaryNote": "This is an original summary written for Learn; LeetCode hosts the official statement.",
			"ws.constraints": "Constraints",
			"ws.examples": "Local examples",
			"ws.example": "Example {id}",
			"ws.hiddenCases": "Submit also runs {count} hidden boundary, random, and large cases.",
			"ws.verified": "Metadata checked on {date}",
			"ws.origin.authored": "Authored for the curriculum",
			"ws.origin.generated": "Generated by a model and validated",
			"ws.origin.imported": "Imported and validated",
			"ws.variantHidden": "This review exercise is related to a problem you studied; the connection is revealed after you finish.",
			"ws.transfer": "What transferred",
			"ws.differences": "What changed from the original",
			"ws.parent": "Original problem: {title}",
			"ws.language": "Language",
			"ws.code": "Code editor",
			"ws.timeMs": "{value} ms",
			"ws.run": "Run",
			"ws.submit": "Submit",
			"ws.running": "Running…",
			"ws.judging": "Judging… ({seconds}s)",
			"ws.cancel": "Cancel",
			"ws.saved": "Draft saved {time}",
			"ws.saving": "Saving…",
			"ws.saveFailed": "Draft not saved",
			"ws.reset": "Reset code",
			"ws.resetConfirm": "Reset to the starter code?",
			"ws.custom": "Custom input",
			"ws.customHelp": "One JSON argument array per line, for example [[1, 2, 3], 4]",
			"ws.customInvalid": "Line {line} is not a JSON array",
			"ws.results": "Results",
			"ws.noResult": "Run or submit to see results here.",
			"ws.input": "Input",
			"ws.expected": "Expected",
			"ws.output": "Output",
			"ws.stdout": "Printed output",
			"ws.errorLine": "line {line}",
			"ws.passedCases": "{passed}/{total} cases passed",
			"ws.measured": "Measured in-container run time: {ms} ms total (varies by machine)",
			"ws.failingCase": "Failing case ({visibility})",
			"ws.visibility.example": "example",
			"ws.visibility.custom": "custom",
			"ws.visibility.hidden": "hidden case",
			"ws.assessment": "Tutor assessment",
			"ws.assessmentUnavailable": "Tutor assessment unavailable: {reason}",
			"ws.verdictNote": "The verdict comes only from test execution; the tutor assessment cannot change it.",
			"ws.complexity": "Complexity (estimated): time {time}, space {space}",
			"ws.misconceptions": "Possible misconceptions",
			"ws.nextStep": "Next step",
			"ws.reflectionQuestion": "Explain",
			"ws.explainPlaceholder": "Briefly explain your approach to the tutor…",
			"ws.explainSend": "Send explanation",
			"ws.judgeMode.agent": "Judged by the tutor agent through isolated execution",
			"ws.judgeMode.deterministic-fallback": "Deterministic judging (tutor unavailable)",
			"ws.support.independent": "Independent",
			"ws.support.with-hints": "Used hints",
			"ws.support.studied-solution": "Studied the solution",
			"ws.mistakes": "Mistake types: {tags}",
			"verdict.passed-local-tests": "Passed local tests",
			"verdict.wrong-answer": "Wrong Answer",
			"verdict.compile-error": "Compile / Syntax Error",
			"verdict.runtime-error": "Runtime Error",
			"verdict.time-limit-exceeded": "Time Limit Exceeded",
			"verdict.memory-limit-exceeded": "Memory Limit Exceeded",
			"verdict.output-limit-exceeded": "Output Limit Exceeded",
			"verdict.evaluation-unavailable": "Evaluation Unavailable",
			"verdict.cancelled": "Cancelled",
			"hint.level1": "Level 1: direction",
			"hint.level2": "Level 2: key observation",
			"hint.level3": "Level 3: outline",
			"hint.level4": "Level 4: solution",
			"hint.request": "Get {level}",
			"hint.revealTitle": "Show the full solution?",
			"hint.revealBody": "Viewing the solution is recorded: this problem then counts as \"studied the solution\" and its review interval shortens. Try the first three hints first.",
			"hint.revealConfirm": "Show solution",
			"hint.none": "No hints yet. Hints come one at a time, in order.",
			"hint.source.authored": "Lesson content",
			"hint.source.tutor": "Tutor",
			"hint.loading": "Preparing a hint…",
			"notes.placeholder": "Notes on your approach and pitfalls… (saved automatically)",
			"history.empty": "No runs or submissions yet.",
			"history.restore": "Load this code",
			"tutor.placeholder": "Ask the tutor, for example \"why query before inserting?\"",
			"tutor.send": "Send",
			"tutor.stop": "Stop",
			"tutor.empty": "The tutor answers from the problem, your code, and your latest results. It will not hand you a complete solution.",
			"tutor.failed": "Tutor reply failed: {error}",
			"tutor.interrupted": "Reply interrupted",
			"tutor.you": "You",
			"tutor.name": "Tutor",
			"review.heading": "Reviews today",
			"review.summary": "{due} due today · daily limit {limit} · {done} done",
			"review.deferred": "{count} more overdue reviews exceed today's limit and carry over to the next days.",
			"review.empty": "Nothing to review today.",
			"review.upcoming": "Upcoming",
			"review.noUpcoming": "No reviews scheduled yet. Submitting a practice problem adds it to the plan.",
			"review.start": "Start review",
			"review.estimate": "About {minutes} min",
			"review.overdue": "{days} days overdue",
			"review.due": "Due {date}",
			"review.interval": "Current interval {days} days",
			"review.snooze": "Snooze 1 day",
			"review.reschedule": "Reschedule",
			"review.rescheduleTo": "Move to",
			"review.noVariant": "No validated variant is available yet",
			"review.origin.authored": "Curriculum variant",
			"review.origin.generated": "Generated variant",
			"review.origin.imported": "Imported problem",
			"review.complete": "Complete review",
			"review.completeHelp": "After submitting, rate how hard it was to recall the idea, then complete the review.",
			"review.recall": "Recall",
			"recall.again": "Again",
			"recall.hard": "Hard",
			"recall.good": "Good",
			"recall.easy": "Easy",
			"review.result": "Next review: {date} (in {days} days)",
			"review.duplicate": "This review was already recorded; the plan was not changed twice.",
			"review.generate": "Generate a new variant",
			"review.generating": "Generating and validating a variant…",
			"review.generateResult": "{message}",
			"review.variants": "Variant library",
			"review.validated": "Validated",
			"review.quarantined": "Quarantined",
			"review.checks": "Checks",
			"review.needsGraded": "Submit first and get a graded result.",
			"progress.mastery": "Concept mastery",
			"progress.mistakes": "Mistake patterns",
			"progress.noMistakes": "No mistake types recorded yet.",
			"progress.history": "Review history",
			"progress.noHistory": "No reviews yet.",
			"progress.attempts": "Recent submissions",
			"progress.evidence": "Independent {independent} · hints {assisted} · solution {studied} · reviews passed {passed}/{reviews}",
			"level.not-started": "Not started",
			"level.learning": "Learning",
			"level.practicing": "Practicing",
			"level.proficient": "Proficient",
			"level.mastered": "Mastered",
			"event.created": "Added to reviews",
			"event.completed": "Review completed",
			"event.snoozed": "Snoozed",
			"event.rescheduled": "Rescheduled",
			"progress.times": "{count}×",
			"settings.learner": "Learning preferences",
			"settings.locale": "Explanation language",
			"settings.locale.zh": "中文",
			"settings.locale.en": "English",
			"settings.timezone": "Time zone",
			"settings.experience": "Experience",
			"experience.new": "New",
			"experience.some": "Some background",
			"experience.experienced": "Experienced (unlock every lesson)",
			"settings.language": "Default programming language",
			"settings.dailyGoal": "Daily goal (minutes)",
			"settings.reviewLimit": "Daily review limit",
			"settings.ladder": "Review intervals (days, comma-separated)",
			"settings.save": "Save",
			"settings.saved": "Saved",
			"settings.model": "Tutor model",
			"settings.modelConfigured": "Using the DSH default model: {model}",
			"settings.modelMissing": "No default model is configured. Configure one in DSH settings to enable the tutor and AI assessment.",
			"settings.modelFailure": "Last failure: {error}",
			"settings.runner": "Code evaluation",
			"settings.runnerReady": "{backend} available",
			"settings.runnerMissing": "Unavailable: {reason}",
			"settings.runnerLanguage": "{language}: {state}",
			"settings.ready": "ready",
			"settings.notReady": "not ready",
			"settings.prepare": "Download image",
			"settings.refresh": "Check again",
			"settings.isolation": "Submitted code runs in a Docker container with no network, a read-only file system, an unprivileged user, CPU/memory/process limits, and no inherited secrets.",
			"settings.email": "Review reminder email",
			"email.address": "Email address",
			"email.setAddress": "Send verification code",
			"email.verified": "Verified",
			"email.unverified": "Not verified",
			"email.pending": "A code was sent; enter it below.",
			"email.code": "6-digit code",
			"email.verify": "Verify",
			"email.optIn": "Send a daily digest of due reviews",
			"email.pause": "Pause reminders",
			"email.hour": "Delivery time (local, on the hour)",
			"email.test": "Send a test email",
			"email.runNow": "Process the email queue now",
			"email.transport.capture": "Development preview: messages are written to local previews and never sent.",
			"email.transport.smtp": "Live sending through the authorized SMTP service.",
			"email.runtime": "Reminders are sent only while DSH is running; a missed reminder is sent at most once later the same day.",
			"email.jobs": "Email log",
			"email.noJobs": "No email yet.",
			"email.reason.noReviews": "No reviews due today",
			"email.reason.optedOut": "Reminders turned off",
			"email.reason.paused": "Reminders paused",
			"email.reason.unverified": "Address not verified",
			"email.reason.addressChanged": "Address changed",
			"email.reason.stale": "Stale (past digests are never backfilled)",
			"email.reason.superseded": "Replaced by a newer verification",
			"email.preview": "Preview",
			"email.previewTitle": "Email preview",
			"email.kind.digest": "Digest",
			"email.kind.verification": "Verification",
			"email.kind.test": "Test",
			"email.status.queued": "Queued",
			"email.status.sending": "Sending",
			"email.status.sent": "Sent",
			"email.status.captured": "Preview captured (not sent)",
			"email.status.skipped": "Skipped",
			"email.status.cancelled": "Cancelled",
			"email.status.failed": "Failed",
			"settings.data": "Data",
			"data.export": "Export learning data",
			"data.reset": "Reset learning data",
			"data.resetBody": "This deletes your progress, drafts, submissions, review plan, and reminder settings and cannot be undone. Type RESET to confirm.",
			"data.resetConfirm": "Reset",
			"data.exported": "Exported to the box below; copy it to keep it."
		};
		//#endregion
		//#region lib/types/client/route.js
		/** Persisted Learn navigation, so a refresh resumes the same tab, lesson, or workspace. */
		const TAB_IDS = [
			"today",
			"learn",
			"practice",
			"review",
			"progress",
			"settings"
		];
		/**
		* Parse a `#learn/<tab>` deep link.
		* @param hash - `location.hash`.
		* @returns the route, or undefined for other hashes.
		*/
		function routeFromHash(hash) {
			const match = /^#learn(?:\/([a-z]+))?$/.exec(hash);
			if (match === null) return void 0;
			return { tab: TAB_IDS.find((item) => item === match[1]) ?? "today" };
		}
		/**
		* Create the persisted route store.
		* @returns the store, starting at Today when nothing was saved.
		*/
		function createRouteStore() {
			return (0, _deepseek_ai_dsh_client_store.createSnapshotStore)({ tab: "today" }, { persist: { name: "dsh.learn.route" } });
		}
		//#endregion
		//#region lib/types/client/mount.js
		/** Services the Learn page needs. */
		const inject = [
			"remote",
			"slots",
			"locale",
			"layout"
		];
		/** Main panel id of the Learn page. */
		const LEARN_PANEL = "learn";
		function registerUi(ctx) {
			ctx.effect(() => ctx.locale.register(NS, {
				zh,
				en
			}), "learn: dictionaries");
			const t = ctx.locale.bind(NS);
			const route = createRouteStore();
			const api = createLearnApi(ctx);
			const navigate = (next) => {
				route.set({
					...next,
					open: true
				});
			};
			const setOpen = (open) => {
				if (route.getSnapshot().open !== open) route.set({
					...route.getSnapshot(),
					open
				});
			};
			const select = () => {
				try {
					ctx.layout.selectPanel(LEARN_PANEL);
				} catch (error) {
					ctx.logger.warn(`learn: could not open the Learn panel: ${error instanceof Error ? error.message : String(error)}`);
				}
			};
			const openFromHash = () => {
				const linked = routeFromHash(window.location.hash);
				if (linked === void 0) return false;
				navigate(linked);
				select();
				return true;
			};
			ctx.effect(() => {
				const onHash = () => {
					openFromHash();
				};
				window.addEventListener("hashchange", onHash);
				return () => {
					window.removeEventListener("hashchange", onHash);
				};
			}, "learn: deep links");
			ctx.slots.inject("main", () => ctx.slots.register({
				name: "main",
				key: LEARN_PANEL,
				locale: NS,
				inject: () => ({
					api,
					hooks: { route },
					navigate,
					setOpen
				})
			}, LearnPage));
			ctx.slots.inject("sidebar.panellist", () => ctx.slots.register({
				name: "sidebar.panellist",
				id: LEARN_PANEL,
				order: 15,
				locale: NS,
				label: () => t("title")
			}, LearnIcon));
			const restore = setTimeout(() => {
				if (!openFromHash() && route.getSnapshot().open === true) select();
			}, 0);
			ctx.effect(() => () => {
				clearTimeout(restore);
			}, "learn: restore panel");
		}
		/**
		* Mount the experimental namespace and the page together.
		* @param ctx - Client runtime.
		* @param contribution - generated Learn Remote definitions.
		* @returns disposer joining UI and Remote withdrawal.
		*/
		async function mountLearn(ctx, contribution) {
			const disposeRemote = await ctx.remote.$mount(contribution);
			const ui = ctx.inject([
				"remote.learn",
				"slots",
				"locale",
				"layout"
			], registerUi);
			try {
				await ui;
			} catch (error) {
				await ui.dispose();
				await disposeRemote();
				throw error;
			}
			return async () => {
				await ui.dispose();
				await disposeRemote();
			};
		}
		//#endregion
		//#region lib/types/client/index.js
		/**
		* Activate the Learn page.
		* @param ctx - Client runtime.
		* @returns complete UI and Remote disposer.
		*/
		async function apply(ctx) {
			return await mountLearn(ctx, TYPERT_REMOTE);
		}
		//#endregion
		exports.apply = apply;
		exports.inject = inject;
		return module.exports;
	}
});

//# sourceMappingURL=client.js.map