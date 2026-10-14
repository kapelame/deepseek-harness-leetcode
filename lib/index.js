import z from "@deepseek-ai/schemastery";
import { Remote, RemoteError, TypertRemoteService } from "@deepseek-ai/dsh-typert-protocol";
import { LearnError, OWNER_LEARNER } from "./service.js";
//#region lib/types/index.js
var __runInitializers = function(thisArg, initializers, value) {
	var useValue = arguments.length > 2;
	for (var i = 0; i < initializers.length; i++) value = useValue ? initializers[i].call(thisArg, value) : initializers[i].call(thisArg);
	return useValue ? value : void 0;
};
var __esDecorate = function(ctor, descriptorIn, decorators, contextIn, initializers, extraInitializers) {
	function accept(f) {
		if (f !== void 0 && typeof f !== "function") throw new TypeError("Function expected");
		return f;
	}
	var kind = contextIn.kind, key = kind === "getter" ? "get" : kind === "setter" ? "set" : "value";
	var target = !descriptorIn && ctor ? contextIn["static"] ? ctor : ctor.prototype : null;
	var descriptor = descriptorIn || (target ? Object.getOwnPropertyDescriptor(target, contextIn.name) : {});
	var _, done = false;
	for (var i = decorators.length - 1; i >= 0; i--) {
		var context = {};
		for (var p in contextIn) context[p] = p === "access" ? {} : contextIn[p];
		for (var p in contextIn.access) context.access[p] = contextIn.access[p];
		context.addInitializer = function(f) {
			if (done) throw new TypeError("Cannot add initializers after decoration has completed");
			extraInitializers.push(accept(f || null));
		};
		var result = (0, decorators[i])(kind === "accessor" ? {
			get: descriptor.get,
			set: descriptor.set
		} : descriptor[key], context);
		if (kind === "accessor") {
			if (result === void 0) continue;
			if (result === null || typeof result !== "object") throw new TypeError("Object expected");
			if (_ = accept(result.get)) descriptor.get = _;
			if (_ = accept(result.set)) descriptor.set = _;
			if (_ = accept(result.init)) initializers.unshift(_);
		} else if (_ = accept(result)) if (kind === "field") initializers.unshift(_);
		else descriptor[key] = _;
	}
	if (target) Object.defineProperty(target, contextIn.name, descriptor);
	done = true;
};
function remote(operation) {
	try {
		return operation();
	} catch (error) {
		throw toRemote(error);
	}
}
async function remoteAsync(operation) {
	try {
		return await operation();
	} catch (error) {
		throw toRemote(error);
	}
}
const CODES = {
	"not-found": "learn/not-found",
	"invalid": "learn/invalid",
	"conflict": "learn/conflict",
	"unavailable": "learn/unavailable"
};
function toRemote(error) {
	if (error instanceof LearnError) return new RemoteError(CODES[error.code], error.message, { reason: error.message });
	return error;
}
let LearnController = (() => {
	let _classSuper = TypertRemoteService;
	let _instanceExtraInitializers = [];
	let _overview_decorators;
	let _today_decorators;
	let _updateSettings_decorators;
	let _lesson_decorators;
	let _skipLesson_decorators;
	let _reflect_decorators;
	let _workspace_decorators;
	let _saveDraft_decorators;
	let _saveNote_decorators;
	let _run_decorators;
	let _submit_decorators;
	let _hint_decorators;
	let _tutorSend_decorators;
	let _tutorCancel_decorators;
	let _tutorFollow_decorators;
	let _reviewQueue_decorators;
	let _completeReview_decorators;
	let _moveReview_decorators;
	let _generateVariant_decorators;
	let _variants_decorators;
	let _importProblem_decorators;
	let _progress_decorators;
	let _runnerStatus_decorators;
	let _prepareRunner_decorators;
	let _emailSettings_decorators;
	let _setEmailAddress_decorators;
	let _verifyEmail_decorators;
	let _emailPreferences_decorators;
	let _testEmail_decorators;
	let _emailJobs_decorators;
	let _emailPreview_decorators;
	let _runReminders_decorators;
	let _exportData_decorators;
	let _resetData_decorators;
	return class LearnController extends _classSuper {
		static {
			const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
			_overview_decorators = [Remote];
			_today_decorators = [Remote];
			_updateSettings_decorators = [Remote];
			_lesson_decorators = [Remote];
			_skipLesson_decorators = [Remote];
			_reflect_decorators = [Remote];
			_workspace_decorators = [Remote];
			_saveDraft_decorators = [Remote];
			_saveNote_decorators = [Remote];
			_run_decorators = [Remote];
			_submit_decorators = [Remote];
			_hint_decorators = [Remote];
			_tutorSend_decorators = [Remote];
			_tutorCancel_decorators = [Remote];
			_tutorFollow_decorators = [Remote({ mode: "stream" })];
			_reviewQueue_decorators = [Remote];
			_completeReview_decorators = [Remote];
			_moveReview_decorators = [Remote];
			_generateVariant_decorators = [Remote];
			_variants_decorators = [Remote];
			_importProblem_decorators = [Remote];
			_progress_decorators = [Remote];
			_runnerStatus_decorators = [Remote];
			_prepareRunner_decorators = [Remote];
			_emailSettings_decorators = [Remote];
			_setEmailAddress_decorators = [Remote];
			_verifyEmail_decorators = [Remote];
			_emailPreferences_decorators = [Remote];
			_testEmail_decorators = [Remote];
			_emailJobs_decorators = [Remote];
			_emailPreview_decorators = [Remote];
			_runReminders_decorators = [Remote];
			_exportData_decorators = [Remote];
			_resetData_decorators = [Remote];
			__esDecorate(this, null, _overview_decorators, {
				kind: "method",
				name: "overview",
				static: false,
				private: false,
				access: {
					has: (obj) => "overview" in obj,
					get: (obj) => obj.overview
				},
				metadata: _metadata
			}, null, _instanceExtraInitializers);
			__esDecorate(this, null, _today_decorators, {
				kind: "method",
				name: "today",
				static: false,
				private: false,
				access: {
					has: (obj) => "today" in obj,
					get: (obj) => obj.today
				},
				metadata: _metadata
			}, null, _instanceExtraInitializers);
			__esDecorate(this, null, _updateSettings_decorators, {
				kind: "method",
				name: "updateSettings",
				static: false,
				private: false,
				access: {
					has: (obj) => "updateSettings" in obj,
					get: (obj) => obj.updateSettings
				},
				metadata: _metadata
			}, null, _instanceExtraInitializers);
			__esDecorate(this, null, _lesson_decorators, {
				kind: "method",
				name: "lesson",
				static: false,
				private: false,
				access: {
					has: (obj) => "lesson" in obj,
					get: (obj) => obj.lesson
				},
				metadata: _metadata
			}, null, _instanceExtraInitializers);
			__esDecorate(this, null, _skipLesson_decorators, {
				kind: "method",
				name: "skipLesson",
				static: false,
				private: false,
				access: {
					has: (obj) => "skipLesson" in obj,
					get: (obj) => obj.skipLesson
				},
				metadata: _metadata
			}, null, _instanceExtraInitializers);
			__esDecorate(this, null, _reflect_decorators, {
				kind: "method",
				name: "reflect",
				static: false,
				private: false,
				access: {
					has: (obj) => "reflect" in obj,
					get: (obj) => obj.reflect
				},
				metadata: _metadata
			}, null, _instanceExtraInitializers);
			__esDecorate(this, null, _workspace_decorators, {
				kind: "method",
				name: "workspace",
				static: false,
				private: false,
				access: {
					has: (obj) => "workspace" in obj,
					get: (obj) => obj.workspace
				},
				metadata: _metadata
			}, null, _instanceExtraInitializers);
			__esDecorate(this, null, _saveDraft_decorators, {
				kind: "method",
				name: "saveDraft",
				static: false,
				private: false,
				access: {
					has: (obj) => "saveDraft" in obj,
					get: (obj) => obj.saveDraft
				},
				metadata: _metadata
			}, null, _instanceExtraInitializers);
			__esDecorate(this, null, _saveNote_decorators, {
				kind: "method",
				name: "saveNote",
				static: false,
				private: false,
				access: {
					has: (obj) => "saveNote" in obj,
					get: (obj) => obj.saveNote
				},
				metadata: _metadata
			}, null, _instanceExtraInitializers);
			__esDecorate(this, null, _run_decorators, {
				kind: "method",
				name: "run",
				static: false,
				private: false,
				access: {
					has: (obj) => "run" in obj,
					get: (obj) => obj.run
				},
				metadata: _metadata
			}, null, _instanceExtraInitializers);
			__esDecorate(this, null, _submit_decorators, {
				kind: "method",
				name: "submit",
				static: false,
				private: false,
				access: {
					has: (obj) => "submit" in obj,
					get: (obj) => obj.submit
				},
				metadata: _metadata
			}, null, _instanceExtraInitializers);
			__esDecorate(this, null, _hint_decorators, {
				kind: "method",
				name: "hint",
				static: false,
				private: false,
				access: {
					has: (obj) => "hint" in obj,
					get: (obj) => obj.hint
				},
				metadata: _metadata
			}, null, _instanceExtraInitializers);
			__esDecorate(this, null, _tutorSend_decorators, {
				kind: "method",
				name: "tutorSend",
				static: false,
				private: false,
				access: {
					has: (obj) => "tutorSend" in obj,
					get: (obj) => obj.tutorSend
				},
				metadata: _metadata
			}, null, _instanceExtraInitializers);
			__esDecorate(this, null, _tutorCancel_decorators, {
				kind: "method",
				name: "tutorCancel",
				static: false,
				private: false,
				access: {
					has: (obj) => "tutorCancel" in obj,
					get: (obj) => obj.tutorCancel
				},
				metadata: _metadata
			}, null, _instanceExtraInitializers);
			__esDecorate(this, null, _tutorFollow_decorators, {
				kind: "method",
				name: "tutorFollow",
				static: false,
				private: false,
				access: {
					has: (obj) => "tutorFollow" in obj,
					get: (obj) => obj.tutorFollow
				},
				metadata: _metadata
			}, null, _instanceExtraInitializers);
			__esDecorate(this, null, _reviewQueue_decorators, {
				kind: "method",
				name: "reviewQueue",
				static: false,
				private: false,
				access: {
					has: (obj) => "reviewQueue" in obj,
					get: (obj) => obj.reviewQueue
				},
				metadata: _metadata
			}, null, _instanceExtraInitializers);
			__esDecorate(this, null, _completeReview_decorators, {
				kind: "method",
				name: "completeReview",
				static: false,
				private: false,
				access: {
					has: (obj) => "completeReview" in obj,
					get: (obj) => obj.completeReview
				},
				metadata: _metadata
			}, null, _instanceExtraInitializers);
			__esDecorate(this, null, _moveReview_decorators, {
				kind: "method",
				name: "moveReview",
				static: false,
				private: false,
				access: {
					has: (obj) => "moveReview" in obj,
					get: (obj) => obj.moveReview
				},
				metadata: _metadata
			}, null, _instanceExtraInitializers);
			__esDecorate(this, null, _generateVariant_decorators, {
				kind: "method",
				name: "generateVariant",
				static: false,
				private: false,
				access: {
					has: (obj) => "generateVariant" in obj,
					get: (obj) => obj.generateVariant
				},
				metadata: _metadata
			}, null, _instanceExtraInitializers);
			__esDecorate(this, null, _variants_decorators, {
				kind: "method",
				name: "variants",
				static: false,
				private: false,
				access: {
					has: (obj) => "variants" in obj,
					get: (obj) => obj.variants
				},
				metadata: _metadata
			}, null, _instanceExtraInitializers);
			__esDecorate(this, null, _importProblem_decorators, {
				kind: "method",
				name: "importProblem",
				static: false,
				private: false,
				access: {
					has: (obj) => "importProblem" in obj,
					get: (obj) => obj.importProblem
				},
				metadata: _metadata
			}, null, _instanceExtraInitializers);
			__esDecorate(this, null, _progress_decorators, {
				kind: "method",
				name: "progress",
				static: false,
				private: false,
				access: {
					has: (obj) => "progress" in obj,
					get: (obj) => obj.progress
				},
				metadata: _metadata
			}, null, _instanceExtraInitializers);
			__esDecorate(this, null, _runnerStatus_decorators, {
				kind: "method",
				name: "runnerStatus",
				static: false,
				private: false,
				access: {
					has: (obj) => "runnerStatus" in obj,
					get: (obj) => obj.runnerStatus
				},
				metadata: _metadata
			}, null, _instanceExtraInitializers);
			__esDecorate(this, null, _prepareRunner_decorators, {
				kind: "method",
				name: "prepareRunner",
				static: false,
				private: false,
				access: {
					has: (obj) => "prepareRunner" in obj,
					get: (obj) => obj.prepareRunner
				},
				metadata: _metadata
			}, null, _instanceExtraInitializers);
			__esDecorate(this, null, _emailSettings_decorators, {
				kind: "method",
				name: "emailSettings",
				static: false,
				private: false,
				access: {
					has: (obj) => "emailSettings" in obj,
					get: (obj) => obj.emailSettings
				},
				metadata: _metadata
			}, null, _instanceExtraInitializers);
			__esDecorate(this, null, _setEmailAddress_decorators, {
				kind: "method",
				name: "setEmailAddress",
				static: false,
				private: false,
				access: {
					has: (obj) => "setEmailAddress" in obj,
					get: (obj) => obj.setEmailAddress
				},
				metadata: _metadata
			}, null, _instanceExtraInitializers);
			__esDecorate(this, null, _verifyEmail_decorators, {
				kind: "method",
				name: "verifyEmail",
				static: false,
				private: false,
				access: {
					has: (obj) => "verifyEmail" in obj,
					get: (obj) => obj.verifyEmail
				},
				metadata: _metadata
			}, null, _instanceExtraInitializers);
			__esDecorate(this, null, _emailPreferences_decorators, {
				kind: "method",
				name: "emailPreferences",
				static: false,
				private: false,
				access: {
					has: (obj) => "emailPreferences" in obj,
					get: (obj) => obj.emailPreferences
				},
				metadata: _metadata
			}, null, _instanceExtraInitializers);
			__esDecorate(this, null, _testEmail_decorators, {
				kind: "method",
				name: "testEmail",
				static: false,
				private: false,
				access: {
					has: (obj) => "testEmail" in obj,
					get: (obj) => obj.testEmail
				},
				metadata: _metadata
			}, null, _instanceExtraInitializers);
			__esDecorate(this, null, _emailJobs_decorators, {
				kind: "method",
				name: "emailJobs",
				static: false,
				private: false,
				access: {
					has: (obj) => "emailJobs" in obj,
					get: (obj) => obj.emailJobs
				},
				metadata: _metadata
			}, null, _instanceExtraInitializers);
			__esDecorate(this, null, _emailPreview_decorators, {
				kind: "method",
				name: "emailPreview",
				static: false,
				private: false,
				access: {
					has: (obj) => "emailPreview" in obj,
					get: (obj) => obj.emailPreview
				},
				metadata: _metadata
			}, null, _instanceExtraInitializers);
			__esDecorate(this, null, _runReminders_decorators, {
				kind: "method",
				name: "runReminders",
				static: false,
				private: false,
				access: {
					has: (obj) => "runReminders" in obj,
					get: (obj) => obj.runReminders
				},
				metadata: _metadata
			}, null, _instanceExtraInitializers);
			__esDecorate(this, null, _exportData_decorators, {
				kind: "method",
				name: "exportData",
				static: false,
				private: false,
				access: {
					has: (obj) => "exportData" in obj,
					get: (obj) => obj.exportData
				},
				metadata: _metadata
			}, null, _instanceExtraInitializers);
			__esDecorate(this, null, _resetData_decorators, {
				kind: "method",
				name: "resetData",
				static: false,
				private: false,
				access: {
					has: (obj) => "resetData" in obj,
					get: (obj) => obj.resetData
				},
				metadata: _metadata
			}, null, _instanceExtraInitializers);
			if (_metadata) Object.defineProperty(this, Symbol.metadata, {
				enumerable: true,
				configurable: true,
				writable: true,
				value: _metadata
			});
		}
		config = __runInitializers(this, _instanceExtraInitializers);
		static inject = ["learn", "typert"];
		static Config = z.object({ maxImportChars: z.natural().min(1024).default(2e5) });
		constructor(ctx, config) {
			super(ctx, "learnController", { namespace: "learn" });
			this.config = config;
		}
		/**
		* Bootstrap snapshot of the Learn page.
		* @returns curriculum, settings, progress, catalog, runner, and tutor status.
		*/
		overview() {
			return remoteAsync(() => this.ctx.learn.overview(OWNER_LEARNER));
		}
		/**
		* Today dashboard.
		* @returns the dashboard projection.
		*/
		today() {
			return remote(() => this.ctx.learn.todayView(OWNER_LEARNER));
		}
		/**
		* Update learner settings.
		* @param patch - changed fields.
		* @returns merged settings.
		*/
		updateSettings(patch) {
			return remote(() => this.ctx.learn.updateSettings(OWNER_LEARNER, patch));
		}
		/**
		* Move a lesson to a stage, recording check answers.
		* @param topicId - topic.
		* @param stage - target stage.
		* @param answers - check answers by question id.
		* @returns progress and per-question correctness.
		*/
		lesson(topicId, stage, answers) {
			return remote(() => this.ctx.learn.lesson(OWNER_LEARNER, topicId, stage, answers));
		}
		/**
		* Diagnostic skip of a lesson.
		* @param topicId - topic.
		* @param answers - answers to every check.
		* @returns progress when every answer is correct, and per-question correctness.
		*/
		skipLesson(topicId, answers) {
			return remote(() => this.ctx.learn.skipLesson(OWNER_LEARNER, topicId, answers));
		}
		/**
		* Store a lesson reflection.
		* @param topicId - topic.
		* @param text - reflection.
		* @param signal - cancellation.
		* @returns updated progress.
		*/
		reflect(topicId, text, signal) {
			return remoteAsync(() => this.ctx.learn.reflect(OWNER_LEARNER, topicId, text, signal));
		}
		/**
		* Workspace state of one exercise.
		* @param problemId - problem.
		* @returns problem, drafts, attempts, hints, and tutor thread.
		*/
		workspace(problemId) {
			return remote(() => this.ctx.learn.workspace(OWNER_LEARNER, problemId));
		}
		/**
		* Persist a draft.
		* @param problemId - problem.
		* @param language - language.
		* @param code - code.
		* @returns save time.
		*/
		saveDraft(problemId, language, code) {
			return remote(() => this.ctx.learn.saveDraft(OWNER_LEARNER, problemId, language, code));
		}
		/**
		* Persist notes.
		* @param problemId - problem.
		* @param body - notes.
		* @returns save time.
		*/
		saveNote(problemId, body) {
			return remote(() => this.ctx.learn.saveNote(OWNER_LEARNER, problemId, body));
		}
		/**
		* Run examples and custom inputs.
		* @param problemId - problem.
		* @param language - language.
		* @param code - code.
		* @param customInputs - argument lists.
		* @param signal - cancellation.
		* @returns the settled run.
		*/
		run(problemId, language, code, customInputs, signal) {
			return remoteAsync(() => this.ctx.learn.run(OWNER_LEARNER, {
				problemId,
				language,
				code,
				customInputs
			}, signal));
		}
		/**
		* Submit against the frozen suite.
		* @param problemId - problem.
		* @param language - language.
		* @param code - code.
		* @param context - practice, lesson, or review.
		* @param reviewItemId - review item for review submissions.
		* @param signal - cancellation.
		* @returns the settled attempt.
		*/
		submit(problemId, language, code, context, reviewItemId, signal) {
			return remoteAsync(() => this.ctx.learn.submit(OWNER_LEARNER, {
				problemId,
				language,
				code,
				context,
				...reviewItemId === null ? {} : { reviewItemId }
			}, signal));
		}
		/**
		* Request the next hint.
		* @param problemId - problem.
		* @param level - hint level.
		* @param confirmReveal - confirmation for the solution.
		* @param signal - cancellation.
		* @returns the hint.
		*/
		hint(problemId, level, confirmReveal, signal) {
			return remoteAsync(() => this.ctx.learn.hint(OWNER_LEARNER, problemId, level, confirmReveal, signal));
		}
		/**
		* Send a tutor message; the reply streams through `tutorFollow`.
		* @param problemId - problem subject, or null.
		* @param topicId - topic subject, or null.
		* @param text - message.
		* @returns thread and pending reply ids.
		*/
		tutorSend(problemId, topicId, text) {
			return remote(() => this.ctx.learn.tutorSend(OWNER_LEARNER, {
				...problemId === null ? {} : { problemId },
				...topicId === null ? {} : { topicId }
			}, text));
		}
		/**
		* Cancel the active tutor reply.
		* @param threadId - thread.
		*/
		tutorCancel(threadId) {
			remote(() => {
				this.ctx.learn.tutorCancel(OWNER_LEARNER, threadId);
			});
		}
		/**
		* Follow a tutor thread.
		* @param threadId - thread.
		* @param signal - observation lifetime.
		* @returns a snapshot, then progress and settled frames.
		*/
		async *tutorFollow(threadId, signal) {
			try {
				for await (const frame of this.ctx.learn.tutorFollow(OWNER_LEARNER, threadId, signal)) yield frame;
			} catch (error) {
				throw toRemote(error);
			}
		}
		/**
		* Today's review queue.
		* @returns queue with assigned variants.
		*/
		reviewQueue() {
			return remote(() => this.ctx.learn.reviewQueue(OWNER_LEARNER));
		}
		/**
		* Complete a review cycle.
		* @param itemId - review item.
		* @param attemptId - graded review submission.
		* @param recall - self-rated recall, or null.
		* @returns the schedule change and transfer explanation.
		*/
		completeReview(itemId, attemptId, recall) {
			return remote(() => this.ctx.learn.completeReview(OWNER_LEARNER, itemId, attemptId, recall ?? void 0));
		}
		/**
		* Snooze or reschedule a review.
		* @param itemId - review item.
		* @param target - days from today or an explicit date.
		* @param requestKey - client idempotency key.
		* @returns the new due date.
		*/
		moveReview(itemId, target, requestKey) {
			return remote(() => this.ctx.learn.moveReview(OWNER_LEARNER, itemId, target, requestKey));
		}
		/**
		* Generate a validated variant with the variant agent.
		* @param parentId - parent problem.
		* @param signal - cancellation.
		* @returns the generation outcome.
		*/
		generateVariant(parentId, signal) {
			return remoteAsync(() => this.ctx.learn.generateVariant(OWNER_LEARNER, parentId, signal));
		}
		/**
		* Stored variants and imports with validation results.
		* @returns records, newest first.
		*/
		variants() {
			return remote(() => this.ctx.learn.variantRecords(OWNER_LEARNER));
		}
		/**
		* Import a problem specification through the same validation as variants.
		* @param specJson - specification JSON text.
		* @param signal - cancellation.
		* @returns the stored record.
		*/
		importProblem(specJson, signal) {
			return remoteAsync(async () => {
				if (specJson.length > this.config.maxImportChars) throw new LearnError("invalid", `The specification exceeds ${String(this.config.maxImportChars)} characters`);
				let spec;
				try {
					spec = JSON.parse(specJson);
				} catch (error) {
					throw new LearnError("invalid", `The specification is not valid JSON: ${error instanceof Error ? error.message : String(error)}`);
				}
				return await this.ctx.learn.importProblem(OWNER_LEARNER, spec, signal);
			});
		}
		/**
		* Progress page projection.
		* @returns mastery, mistakes, history, and attempts.
		*/
		progress() {
			return remote(() => this.ctx.learn.progressView(OWNER_LEARNER));
		}
		/**
		* Runner availability.
		* @param refresh - probe again.
		* @returns runner status.
		*/
		runnerStatus(refresh) {
			return remoteAsync(() => this.ctx.learn.runnerStatus(refresh));
		}
		/**
		* Fetch a runner image.
		* @param language - language.
		* @param signal - cancellation.
		* @returns refreshed status.
		*/
		prepareRunner(language, signal) {
			return remoteAsync(() => this.ctx.learn.prepareRunner(language, signal));
		}
		/**
		* Email settings.
		* @returns settings without secrets.
		*/
		emailSettings() {
			return remote(() => this.ctx.learn.emailSettings(OWNER_LEARNER));
		}
		/**
		* Bind an address and send its verification message.
		* @param address - email address.
		* @returns settings.
		*/
		setEmailAddress(address) {
			return remote(() => this.ctx.learn.setEmailAddress(OWNER_LEARNER, address));
		}
		/**
		* Verify the pending address.
		* @param code - emailed code.
		* @returns settings.
		*/
		verifyEmail(code) {
			return remote(() => this.ctx.learn.verifyEmail(OWNER_LEARNER, code));
		}
		/**
		* Change reminder preferences.
		* @param patch - changed fields.
		* @returns settings.
		*/
		emailPreferences(patch) {
			return remote(() => this.ctx.learn.emailPreferences(OWNER_LEARNER, patch));
		}
		/**
		* Queue a test email.
		* @returns the job.
		*/
		testEmail() {
			return remote(() => this.ctx.learn.testEmail(OWNER_LEARNER));
		}
		/**
		* Recent email jobs.
		* @returns jobs, newest first.
		*/
		emailJobs() {
			return remote(() => this.ctx.learn.emailJobs(OWNER_LEARNER));
		}
		/**
		* Rendered message of a job.
		* @param jobId - job.
		* @returns the exact message.
		*/
		emailPreview(jobId) {
			return remote(() => this.ctx.learn.emailPreview(OWNER_LEARNER, jobId));
		}
		/**
		* Run the reminder worker once.
		* @returns after the tick settles.
		*/
		runReminders() {
			return remoteAsync(() => this.ctx.learn.runReminders());
		}
		/**
		* Export learner data.
		* @returns the export bundle.
		*/
		exportData() {
			return remote(() => this.ctx.learn.exportData(OWNER_LEARNER));
		}
		/**
		* Delete learner data after confirmation.
		* @param confirmation - must be `RESET`.
		*/
		resetData(confirmation) {
			remote(() => {
				this.ctx.learn.resetData(OWNER_LEARNER, confirmation);
			});
		}
	};
})();
//#endregion
export { LearnController as default };
